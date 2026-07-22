import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhoneNumber, normalizeAdminRole } from './authUtils.js';

test('normalizePhoneNumber converts international numbers to local format', () => {
  assert.equal(normalizePhoneNumber('+84901234567'), '0901234567');
  assert.equal(normalizePhoneNumber('  +84 901 234 567 '), '0901234567');
  assert.equal(normalizePhoneNumber('0901234567'), '0901234567');
});

test('normalizeAdminRole treats management roles as admin', () => {
  assert.equal(normalizeAdminRole('RootAdmin'), 'admin');
  assert.equal(normalizeAdminRole('StoreManager'), 'admin');
  assert.equal(normalizeAdminRole('gatewaychecker'), 'gatewaychecker');
  assert.equal(normalizeAdminRole('customer'), 'customer');
});
