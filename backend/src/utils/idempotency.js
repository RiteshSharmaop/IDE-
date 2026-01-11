// src/utils/idempotency.js

const crypto = require("crypto");
const NotificationDeletion = require("../models/NotificationDeletion");

/**
 * Generate idempotency key from deletion request
 * @param {string} userId
 * @param {string[]} notificationIds
 * @returns {string} idempotency key
 */
function generateIdempotencyKey(userId, notificationIds) {
  const sorted = [...notificationIds].sort().join(",");
  return crypto
    .createHash("sha256")
    .update(`${userId}:${sorted}`)
    .digest("hex");
}

/**
 * Check if deletion request is idempotent
 * Returns existing record if already processed
 * @param {string} idempotencyKey
 * @returns {object|null}
 */
async function checkIdempotency(idempotencyKey) {
  return await NotificationDeletion.findOne({ idempotencyKey }).lean();
}

/**
 * Create idempotency record
 * @param {object} data
 * @returns {object}
 */
async function createIdempotencyRecord(data) {
  const record = new NotificationDeletion(data);
  return await record.save();
}

/**
 * Update idempotency record status
 * @param {string} idempotencyKey
 * @param {object} updates
 * @returns {object}
 */
async function updateIdempotencyRecord(idempotencyKey, updates) {
  return await NotificationDeletion.findOneAndUpdate(
    { idempotencyKey },
    updates,
    { new: true }
  );
}

module.exports = {
  generateIdempotencyKey,
  checkIdempotency,
  createIdempotencyRecord,
  updateIdempotencyRecord,
};
