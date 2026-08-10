// src/services/adminExportService.js
// Universal data export engine supporting CSV, Excel (xlsx), and JSON.

import XLSX from 'xlsx';
import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import AuditLog from '../models/AuditLog.js';
import Report from '../models/Report.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Format flat CSV string from array of objects.
 */
const jsonToCsv = (items) => {
  if (!items || items.length === 0) return '';
  const headers = Object.keys(items[0]);
  const rows = items.map((row) =>
    headers
      .map((fieldName) => {
        let val = row[fieldName];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );
  return [headers.join(','), ...rows].join('\r\n');
};

/**
 * Generate binary Excel buffer using xlsx.
 */
const jsonToExcelBuffer = (items, sheetName = 'Export') => {
  const ws = XLSX.utils.json_to_sheet(items || []);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Export data for any marketplace entity with active filters.
 */
export const exportEntityData = async (entity, format = 'csv', filters = {}, adminUser = null, ipAddress = '') => {
  let rawData = [];
  const normalizedFormat = String(format).toLowerCase();

  switch (entity.toLowerCase()) {
    case 'users': {
      const query = {};
      if (filters.status && filters.status !== 'all') query.status = filters.status;
      if (filters.role && filters.role !== 'all') query.role = filters.role;
      const docs = await User.find(query).lean();
      rawData = docs.map((u) => ({
        ID: u._id.toString(),
        FirstName: u.firstName,
        LastName: u.lastName,
        Email: u.email,
        Phone: u.phone || '',
        Role: u.role,
        Status: u.status,
        RegisteredAt: u.createdAt ? new Date(u.createdAt).toISOString() : '',
      }));
      break;
    }

    case 'sellers': {
      const query = {};
      if (filters.status && filters.status !== 'all') query.status = filters.status;
      const docs = await Seller.find(query).lean();
      rawData = docs.map((s) => ({
        ID: s._id.toString(),
        BusinessName: s.businessName || s.storeName,
        Email: s.email,
        Phone: s.phone || '',
        Status: s.status,
        Level: s.sellerLevel || 'Level 1',
        TotalOrders: s.totalOrders || 0,
        TotalRevenue: s.totalRevenue || 0,
        GST: s.gstNumber || '',
        RegisteredAt: s.createdAt ? new Date(s.createdAt).toISOString() : '',
      }));
      break;
    }

    case 'products': {
      const query = { isDeleted: false };
      if (filters.category && filters.category !== 'all') query.category = filters.category;
      if (filters.status && filters.status !== 'all') query.status = filters.status;
      const docs = await Product.find(query).populate('category', 'name').lean();
      rawData = docs.map((p) => ({
        ID: p._id.toString(),
        Name: p.name,
        SKU: p.sku || '',
        Category: p.category?.name || '',
        Price: p.price,
        Stock: p.stock,
        Status: p.status,
        Rating: p.rating || 0,
        Featured: p.isFeatured ? 'Yes' : 'No',
        CreatedAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
      }));
      break;
    }

    case 'orders': {
      const query = {};
      if (filters.status && filters.status !== 'all') query.orderStatus = filters.status;
      const docs = await Order.find(query).lean();
      rawData = docs.map((o) => ({
        ID: o._id.toString(),
        OrderNumber: o.orderNumber || o._id.toString(),
        TotalAmount: o.totalAmount,
        OrderStatus: o.orderStatus,
        PaymentStatus: o.paymentInfo?.status || '',
        ItemsCount: o.items?.length || 0,
        CreatedAt: o.createdAt ? new Date(o.createdAt).toISOString() : '',
      }));
      break;
    }

    case 'categories': {
      const docs = await Category.find().lean();
      rawData = docs.map((c) => ({
        ID: c._id.toString(),
        Name: c.name,
        Slug: c.slug,
        Active: c.isActive ? 'Yes' : 'No',
        ProductCount: c.productCount || 0,
        CreatedAt: c.createdAt ? new Date(c.createdAt).toISOString() : '',
      }));
      break;
    }

    case 'audit_logs':
    case 'audit-logs':
    case 'auditlogs': {
      const query = {};
      if (filters.module && filters.module !== 'all') query.module = filters.module;
      if (filters.action && filters.action !== 'all') query.action = filters.action;
      const docs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(1000).lean();
      rawData = docs.map((a) => ({
        ID: a._id.toString(),
        AdminName: a.adminName,
        Action: a.action,
        Module: a.module,
        Target: a.target,
        Status: a.status,
        IPAddress: a.ipAddress || '',
        Remarks: a.remarks || '',
        Timestamp: a.createdAt ? new Date(a.createdAt).toISOString() : '',
      }));
      break;
    }

    case 'reports':
    case 'disputes': {
      const docs = await Report.find().sort({ createdAt: -1 }).lean();
      rawData = docs.map((r) => ({
        ReportID: r.reportId,
        Type: r.type,
        Target: r.target,
        Reporter: r.reporter,
        Priority: r.priority,
        Status: r.status,
        Reason: r.reason,
        Date: r.createdAt ? new Date(r.createdAt).toISOString() : '',
      }));
      break;
    }

    default:
      throw new ApiError(400, `Unsupported export entity: '${entity}'`);
  }

  // Audit log export action
  if (adminUser) {
    await auditLogRepo.createAuditLog({
      admin: adminUser._id,
      adminName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || 'Admin',
      action: 'DATA_EXPORT',
      module: 'Export',
      target: `${entity.toUpperCase()} (${normalizedFormat.toUpperCase()})`,
      remarks: `Exported ${rawData.length} records in ${normalizedFormat} format`,
      ipAddress,
      status: 'success',
    });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `nexcart_${entity}_export_${timestamp}`;

  if (normalizedFormat === 'json') {
    return {
      data: JSON.stringify(rawData, null, 2),
      contentType: 'application/json',
      filename: `${filename}.json`,
      isBuffer: false,
    };
  }

  if (normalizedFormat === 'excel' || normalizedFormat === 'xlsx') {
    const buffer = jsonToExcelBuffer(rawData, entity);
    return {
      data: buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `${filename}.xlsx`,
      isBuffer: true,
    };
  }

  // Default to CSV
  const csvString = jsonToCsv(rawData);
  return {
    data: csvString,
    contentType: 'text/csv',
    filename: `${filename}.csv`,
    isBuffer: false,
  };
};
