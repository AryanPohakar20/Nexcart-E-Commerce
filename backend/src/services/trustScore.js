// src/services/trustScore.js
// Trust Score Service — Foundation Layer
//
// This service is the foundation for the seller trust system.
// Full calculation will be implemented in Phase 2B Part 3 once
// orders, reviews, and verification workflows are in place.
//
// Future scoring factors (planned):
//   +20  Verification status (Verified)
//   +30  Order completion rate (scaled, max 30)
//   +20  Average rating (scaled from 0–5 → 0–20)
//   +10  Response time (< 2 hours = full points)
//   +10  Store age (scaled by months, max 12 months)
//   −10  High return rate (> 10% deduction)
//   max: 100

import logger from '../utils/logger.js';

const MAX_TRUST_SCORE = 100;

// ─── Calculate Trust Score ────────────────────────────────────────────────────

/**
 * Calculate the trust score for a seller.
 * Phase 2B Part 1: Foundation only — applies verification baseline.
 * Full scoring algorithm will be added in Part 3.
 *
 * @param {Object} seller - Mongoose Seller document
 * @returns {number} - Trust score between 0 and 100
 */
export const calculateTrustScore = (seller) => {
  if (!seller) return 0;

  let score = 0;

  // Baseline: verified sellers earn initial credibility points
  if (seller.verificationStatus === 'Verified') {
    score += 20;
  }

  // Future: add order rate, rating, response time, store age here (Part 3)

  return Math.min(Math.round(score), MAX_TRUST_SCORE);
};

// ─── Persist Trust Score ──────────────────────────────────────────────────────

/**
 * Recalculate and persist trust score onto the Seller document.
 * Call this after verification status changes.
 *
 * @param {Object} seller - Mongoose Seller document (must support .save())
 * @returns {Promise<number>} - Updated trust score
 */
export const updateTrustScore = async (seller) => {
  const score = calculateTrustScore(seller);

  if (seller.trustScore !== score) {
    seller.trustScore = score;
    await seller.save();
    logger.info(`Trust score updated for seller ${seller.sellerId}: ${score}`);
  }

  return score;
};

// ─── Get Trust Level ──────────────────────────────────────────────────────────

/**
 * Map a numerical trust score to a named level.
 *
 * @param {number} score
 * @returns {'bronze'|'silver'|'gold'|'platinum'}
 */
export const getTrustLevel = (score) => {
  if (score >= 90) return 'platinum';
  if (score >= 70) return 'gold';
  if (score >= 40) return 'silver';
  return 'bronze';
};
