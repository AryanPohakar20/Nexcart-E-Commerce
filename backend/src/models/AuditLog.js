// src/models/AuditLog.js
// Immutable record of every significant admin action on the platform.

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    // Who performed the action
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminName: {
      type: String,
      trim: true,
      default: '',
    },

    // What happened
    action: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      // e.g. SUSPEND_USER, BLOCK_USER, ACTIVATE_USER, UPDATE_USER,
      //      SUSPEND_SELLER, BLOCK_SELLER, DELETE_SELLER, UPDATE_SELLER,
      //      DELETE_USER, UNBLOCK_USER
    },

    // Which area of the admin panel
    module: {
      type: String,
      required: true,
      trim: true,
      enum: ['Users', 'Sellers', 'Products', 'Categories', 'Orders', 'Verification', 'Settings', 'Reports', 'System', 'Imports', 'Bulk', 'Analytics', 'Notifications', 'Export', 'Roles'],
    },

    // Human-readable description of the target entity
    target: {
      type: String,
      trim: true,
      default: '',
    },

    // Reference to the document that was acted upon
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Model name of the target document (for polymorphic reference)
    targetModel: {
      type: String,
      default: null,
    },

    // Extra context / reason supplied by the admin
    remarks: {
      type: String,
      trim: true,
      default: '',
    },

    // IP address of the admin who performed the action
    ipAddress: {
      type: String,
      default: null,
    },

    // Whether the operation ultimately succeeded or failed
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
  },
  {
    timestamps: true, // createdAt = action timestamp
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
auditLogSchema.index({ admin: 1, createdAt: -1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ targetId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
