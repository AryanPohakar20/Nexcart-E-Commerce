// src/services/adminReportsService.js
// Business & Dispute Reporting engine for Admin Governance.

import Report from '../models/Report.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DISPUTE & TRUST REPORTS (Incident Management)
// ═══════════════════════════════════════════════════════════════════════════════

export const getDisputeReports = async (queryParams = {}) => {
  const { page, limit, skip } = parsePagination(queryParams);
  const filter = {};

  if (queryParams.status && queryParams.status !== 'all') {
    filter.status = queryParams.status;
  } else if (queryParams.tab && queryParams.tab !== 'all') {
    filter.status = queryParams.tab;
  }

  if (queryParams.type && queryParams.type !== 'all') {
    filter.type = queryParams.type;
  }

  if (queryParams.priority && queryParams.priority !== 'all') {
    filter.priority = queryParams.priority;
  }

  if (queryParams.search) {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    filter.$or = [
      { reportId: searchRegex },
      { target: searchRegex },
      { reporter: searchRegex },
      { reason: searchRegex },
    ];
  }

  const [reports, total, openCount, resolvedCount, dismissedCount] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Report.countDocuments(filter),
    Report.countDocuments({ status: 'open' }),
    Report.countDocuments({ status: 'resolved' }),
    Report.countDocuments({ status: 'dismissed' }),
  ]);

  const pagination = buildPaginationMeta(total, page, limit);

  return {
    reports,
    pagination,
    counts: {
      all: openCount + resolvedCount + dismissedCount,
      open: openCount,
      resolved: resolvedCount,
      dismissed: dismissedCount,
    },
  };
};

export const getDisputeReportById = async (id) => {
  const report = await Report.findById(id).lean();
  if (!report) {
    throw new ApiError(404, 'Dispute report not found.');
  }
  return report;
};

export const resolveDisputeReport = async (id, payload, adminUser, ipAddress = '') => {
  const { action = 'resolve', remarks = '' } = payload;
  const report = await Report.findById(id);
  if (!report) {
    throw new ApiError(404, 'Dispute report not found.');
  }

  let newStatus = 'resolved';
  if (action === 'dismiss') {
    newStatus = 'dismissed';
  } else if (action === 'resolve' || action === 'ban_entity') {
    newStatus = 'resolved';
  }

  report.status = newStatus;
  report.resolutionAction = action;
  report.adminRemarks = remarks || `Marked as ${newStatus} by admin`;
  report.resolvedBy = adminUser?._id || null;
  report.resolvedAt = new Date();

  await report.save();

  // If action is ban_entity, enact disciplinary suspension
  if (action === 'ban_entity') {
    if (report.targetType === 'Seller' && report.targetId) {
      await Seller.findByIdAndUpdate(report.targetId, { status: 'Suspended' });
    } else if (report.targetType === 'User' && report.targetId) {
      await User.findByIdAndUpdate(report.targetId, { status: 'Suspended' });
    } else if (report.targetType === 'Product' && report.targetId) {
      await Product.findByIdAndUpdate(report.targetId, { isDeleted: true, status: 'Rejected' });
    } else {
      // Find seller by target name if targetId wasn't explicit
      await Seller.findOneAndUpdate(
        { businessName: new RegExp(`^${report.target}$`, 'i') },
        { status: 'Suspended' }
      );
    }
  }

  // Record audit log
  if (adminUser) {
    await auditLogRepo.createAuditLog({
      admin: adminUser._id,
      adminName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || 'Admin',
      action: action === 'ban_entity' ? 'RESOLVE_DISPUTE_BAN' : `RESOLVE_DISPUTE_${action.toUpperCase()}`,
      module: 'Reports',
      target: `${report.reportId} - ${report.target}`,
      targetId: report._id,
      targetModel: 'Report',
      remarks: remarks || `Dispute ${report.reportId} handled with action: ${action}`,
      ipAddress,
      status: 'success',
    });
  }

  return report.toObject();
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. BUSINESS & FINANCIAL REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate comprehensive analytical business reports with comparisons and growth rates.
 */
export const getBusinessReport = async (reportType = 'marketplace', timeframe = 'monthly', query = {}) => {
  const now = new Date();
  let startDate = new Date();

  switch (timeframe) {
    case 'daily':
      startDate.setDate(now.getDate() - 30);
      break;
    case 'weekly':
      startDate.setDate(now.getDate() - 70);
      break;
    case 'yearly':
      startDate.setFullYear(now.getFullYear() - 5);
      break;
    case 'custom':
      if (query.startDate) startDate = new Date(query.startDate);
      break;
    case 'monthly':
    default:
      startDate.setMonth(now.getMonth() - 12);
      break;
  }

  // Prior period start for comparison
  const durationMs = now.getTime() - startDate.getTime();
  const priorStartDate = new Date(startDate.getTime() - durationMs);

  // Revenue Aggregations
  const [currentOrders, priorOrders, totalUsers, totalSellers, totalProducts, totalCategories] = await Promise.all([
    Order.find({ createdAt: { $gte: startDate, $lte: now } }).lean(),
    Order.find({ createdAt: { $gte: priorStartDate, $lt: startDate } }).lean(),
    User.countDocuments({ role: 'customer' }),
    Seller.countDocuments(),
    Product.countDocuments({ isDeleted: false }),
    Category.countDocuments({ isActive: true }),
  ]);

  const currentRevenue = currentOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const priorRevenue = priorOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const currentOrdersCount = currentOrders.length;
  const priorOrdersCount = priorOrders.length;

  const revenueGrowth = priorRevenue > 0 ? (((currentRevenue - priorRevenue) / priorRevenue) * 100).toFixed(1) : '+100.0';
  const orderGrowth = priorOrdersCount > 0 ? (((currentOrdersCount - priorOrdersCount) / priorOrdersCount) * 100).toFixed(1) : '+100.0';

  return {
    reportType,
    timeframe,
    period: {
      start: startDate,
      end: now,
    },
    summary: {
      totalRevenue: currentRevenue,
      totalOrders: currentOrdersCount,
      totalUsers,
      totalSellers,
      totalProducts,
      totalCategories,
      revenueGrowth: `${Number(revenueGrowth) >= 0 ? '+' : ''}${revenueGrowth}%`,
      orderGrowth: `${Number(orderGrowth) >= 0 ? '+' : ''}${orderGrowth}%`,
      averageOrderValue: currentOrdersCount > 0 ? Math.round(currentRevenue / currentOrdersCount) : 0,
    },
    comparison: {
      currentRevenue,
      priorRevenue,
      currentOrders: currentOrdersCount,
      priorOrders: priorOrdersCount,
    },
  };
};
