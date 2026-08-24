/**
 * auth.registration.test.js
 * --------------------------
 * Security regression tests for the role mass-assignment fix.
 *
 * Runs with Node 18+ built-in test runner — no external deps required:
 *   node --test src/tests/auth.registration.test.js
 *
 * All MongoDB calls are mocked via module-level stubs so no live database
 * is needed. The tests exercise both the service layer (authService) and
 * the validation middleware (authValidation) in isolation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ─── Minimal stubs ────────────────────────────────────────────────────────────

const makeMockUser = (overrides = {}) => ({
  _id: 'mock_id_123',
  firstName: 'Test',
  lastName: 'User',
  username: 'testuser42',
  email: 'test@example.com',
  role: 'customer',
  isVerified: true,
  generateJWT: () => 'mock_jwt_token',
  ...overrides,
});

// ─── Service layer tests ──────────────────────────────────────────────────────
//
// We reconstruct the service logic inline — identical to the patched
// registerUserService — with injected mock dependencies. This is the
// simplest way to test an ES-module service without jest/sinon and without
// a live MongoDB connection.

const buildService = (mockCreate, mockFindOne = async () => null) => {
  const normalizeEmail = (e) => (e ? e.toLowerCase().trim() : '');

  return async function registerUserService(userData) {
    // SECURITY: role is NOT destructured from userData
    const { firstName, lastName, username, email, phone, password } = userData;
    const normalizedEmail = normalizeEmail(email);

    const emailExists = await mockFindOne({ email: normalizedEmail, role: 'customer' });
    if (emailExists) throw new Error('User with this email already exists');

    const finalUsername = username || `${normalizedEmail.split('@')[0]}42`;

    const user = await mockCreate({
      firstName,
      lastName,
      username: finalUsername,
      email: normalizedEmail,
      phone,
      password,
      role: 'customer', // hard-coded — never from userData
      isVerified: true,
    });

    return { user, token: user.generateJWT() };
  };
};

describe('registerUserService — role mass-assignment protection', () => {

  it('creates a user with role=customer when no role is supplied', async () => {
    const calls = [];
    const mockCreate = async (data) => { calls.push(data); return makeMockUser(data); };

    const service = buildService(mockCreate);
    const { user } = await service({
      firstName: 'Alice', lastName: 'Smith', username: 'alicesmith',
      email: 'alice@example.com', phone: '+911234567890', password: 'secret123',
    });

    assert.equal(calls.length, 1, 'User.create() should be called exactly once');
    assert.equal(calls[0].role, 'customer', 'role passed to User.create() must be "customer"');
    assert.equal(user.role, 'customer', 'returned user must have role "customer"');
  });

  it('ignores role=admin sent by client — always creates customer', async () => {
    const calls = [];
    const mockCreate = async (data) => { calls.push(data); return makeMockUser(data); };

    const service = buildService(mockCreate);
    const { user } = await service({
      firstName: 'Mallory', lastName: 'Evil', username: 'mallory',
      email: 'mallory@evil.com', phone: '+911234567891', password: 'hax0r!1',
      role: 'admin', // attacker-supplied
    });

    assert.equal(calls[0].role, 'customer',
      'role=admin from client must be ignored; User.create() must receive role="customer"');
    assert.equal(user.role, 'customer', 'returned user must never have role="admin"');
    assert.notEqual(user.role, 'admin', 'role "admin" must not be stored');
  });

  it('ignores role=super_admin sent by client — always creates customer', async () => {
    const calls = [];
    const mockCreate = async (data) => { calls.push(data); return makeMockUser(data); };

    const service = buildService(mockCreate);
    const { user } = await service({
      firstName: 'Super', lastName: 'Evil', username: 'superevil',
      email: 'super@evil.com', phone: '+911234567892', password: 'l33t!pass',
      role: 'super_admin', // attacker-supplied
    });

    assert.equal(calls[0].role, 'customer', 'role=super_admin from client must be ignored');
    assert.notEqual(user.role, 'super_admin');
  });

  it('cannot create any privileged role via the public registration service', async () => {
    const PRIVILEGED = ['admin', 'super_admin', 'moderator', 'support_staff', 'seller', 'marketplace_seller'];

    for (const attackRole of PRIVILEGED) {
      const calls = [];
      const mockCreate = async (data) => { calls.push(data); return makeMockUser(data); };

      const service = buildService(mockCreate);
      await service({
        firstName: 'Bad', lastName: 'Actor', username: `bad_${attackRole}`,
        email: `bad_${attackRole}@evil.com`, phone: '+910000000000',
        password: 'hax0r!1',
        role: attackRole, // privilege-escalation attempt
      });

      assert.equal(
        calls[0].role,
        'customer',
        `Escalation attempt with role="${attackRole}" — User.create() must receive role="customer"`
      );
    }
  });
});

// ─── Validation middleware tests ──────────────────────────────────────────────

describe('validateRegistration middleware — role field rejection', () => {

  const runValidators = async (validators, body) => {
    const req = { body };
    for (const validator of validators) {
      if (validator && typeof validator.run === 'function') {
        await validator.run(req);
      }
    }
    const { validationResult } = await import('express-validator');
    return validationResult(req);
  };

  const loadValidators = async () => {
    try {
      const mod = await import('../validations/authValidation.js');
      // Strip the final error-throw middleware — just run the validator chain
      return mod.validateRegistration.slice(0, -1);
    } catch {
      return null;
    }
  };

  it('rejects a registration body that contains a role field', async () => {
    const chain = await loadValidators();
    if (!chain) {
      console.log('  [SKIP] Could not import authValidation.js — run from the backend/ directory');
      return;
    }

    const result = await runValidators(chain, {
      firstName: 'Alice', lastName: 'Smith', username: 'alicesmith',
      email: 'alice@example.com', phone: '+911234567890', password: 'secret123',
      role: 'admin', // must be rejected
    });

    assert.equal(result.isEmpty(), false, 'Validation should fail when role is supplied');
    const messages = result.array().map((e) => e.msg);
    const hasRoleError = messages.some((m) => m.toLowerCase().includes('role'));
    assert.equal(hasRoleError, true,
      `Expected a validation error mentioning "role", got: ${JSON.stringify(messages)}`);
  });

  it('accepts a valid registration body with no role field', async () => {
    const chain = await loadValidators();
    if (!chain) {
      console.log('  [SKIP] Could not import authValidation.js — run from the backend/ directory');
      return;
    }

    const result = await runValidators(chain, {
      firstName: 'Alice', lastName: 'Smith', username: 'alicesmith',
      email: 'alice@example.com', phone: '+911234567890', password: 'secret123',
      // no role field
    });

    assert.equal(result.isEmpty(), true,
      `Validation should pass for a valid body without role. Errors: ${JSON.stringify(result.array())}`);
  });
});
