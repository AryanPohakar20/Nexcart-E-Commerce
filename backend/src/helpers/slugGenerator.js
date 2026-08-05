// src/helpers/slugGenerator.js
// Generates URL-safe, unique slugs for seller public profiles.

import Seller from '../models/Seller.js';

// ─── Core Slugify ─────────────────────────────────────────────────────────────

/**
 * Convert any string to a URL-safe slug.
 * "Aryan Pohakar"     → "aryan-pohakar"
 * "Aryan Fashion Store" → "aryan-fashion-store"
 */
export const slugify = (text) => {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // multiple hyphens → single
    .replace(/^-|-$/g, '');          // trim leading/trailing hyphens
};

// ─── Base Slug Generator ──────────────────────────────────────────────────────

/**
 * Determine the base slug string from a seller document.
 * Business sellers  → businessName
 * Individual sellers → fullName
 * Fallback          → accountInfo.displayName
 */
export const generateBaseSlug = (seller) => {
  if (seller.sellerType === 'business' && seller.business?.businessName) {
    return slugify(seller.business.businessName);
  }
  if (seller.individual?.fullName) {
    return slugify(seller.individual.fullName);
  }
  if (seller.accountInfo?.displayName) {
    return slugify(seller.accountInfo.displayName);
  }
  // ultimate fallback
  return `seller-${Date.now()}`;
};

// ─── Uniqueness Enforcement ───────────────────────────────────────────────────

/**
 * Check if a slug is available in the DB. If taken, append -2, -3, etc.
 *
 * @param {string} baseSlug       - The desired slug (already slugified)
 * @param {string|null} skipId    - The current seller's own _id to exclude (for updates)
 * @returns {Promise<string>}     - A guaranteed-unique slug
 */
export const ensureUniqueSlug = async (baseSlug, skipId = null) => {
  if (!baseSlug) return `seller-${Date.now()}`;

  let slug = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (skipId) query._id = { $ne: skipId };

    const existing = await Seller.findOne(query).select('_id').lean();
    if (!existing) return slug;

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
};

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Generate a unique, URL-safe slug for a seller.
 *
 * @param {Object} seller - Mongoose Seller document (or plain object with sellerType + name fields)
 * @returns {Promise<string>}
 */
export const generateUniqueSlug = async (seller) => {
  const base = generateBaseSlug(seller);
  return ensureUniqueSlug(base, seller._id ? String(seller._id) : null);
};
