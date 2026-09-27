import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import prisma from '../config/database.js';

/**
 * License Validation & Cloud Heartbeat Service
 * 
 * Handles the split between local offline operation and cloud-based
 * subscription verification. The desktop app works locally with SQLite,
 * but periodically validates the license against the cloud server.
 */

const LEASE_FILE_NAME = 'license_lease.enc';
const ENCRYPTION_KEY = 'cargo-lease-encryption-key-2026!'; // 32 chars for AES-256

/**
 * Get the license lease file path.
 */
function getLeaseFilePath() {
  const dataDir = process.env.ELECTRON_DATA_DIR ||
    path.join(process.env.HOME || process.env.USERPROFILE || '.', '.cargo-license');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, LEASE_FILE_NAME);
}

/**
 * Encrypt a lease payload.
 */
function encryptLease(data) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt a lease payload.
 */
function decryptLease(encryptedStr) {
  try {
    const [ivHex, encrypted] = encryptedStr.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

/**
 * Save the license lease to an encrypted local file.
 */
export function saveLease(leaseData) {
  const leaseFilePath = getLeaseFilePath();
  const encrypted = encryptLease(leaseData);
  fs.writeFileSync(leaseFilePath, encrypted, 'utf-8');
}

/**
 * Load the license lease from the encrypted local file.
 */
export function loadLease() {
  const leaseFilePath = getLeaseFilePath();
  if (!fs.existsSync(leaseFilePath)) {
    return null;
  }
  const content = fs.readFileSync(leaseFilePath, 'utf-8');
  return decryptLease(content);
}

/**
 * Delete the local lease file (on deactivation).
 */
export function clearLease() {
  const leaseFilePath = getLeaseFilePath();
  if (fs.existsSync(leaseFilePath)) {
    fs.unlinkSync(leaseFilePath);
  }
}

/**
 * Validate the current license status.
 * Checks the local lease token first, then optionally attempts a cloud heartbeat.
 */
export async function getLicenseStatus() {
  const lease = loadLease();

  if (!lease) {
    return {
      status: 'NOT_ACTIVATED',
      message: 'No license activated on this device. Please enter your license key.',
      isValid: false,
      isOffline: true,
    };
  }

  const now = new Date();
  const leaseExpiry = new Date(lease.leaseExpiresAt);
  const subscriptionExpiry = new Date(lease.subscriptionExpiresAt);
  const leaseValid = leaseExpiry > now;
  const subscriptionValid = subscriptionExpiry > now;

  // Calculate days remaining
  const subDaysRemaining = Math.ceil((subscriptionExpiry - now) / (1000 * 60 * 60 * 24));
  const leaseDaysRemaining = Math.ceil((leaseExpiry - now) / (1000 * 60 * 60 * 24));

  if (!leaseValid) {
    return {
      status: 'LEASE_EXPIRED',
      message: 'Offline lease expired. Please connect to the internet to renew your license.',
      isValid: false,
      isOffline: true,
      plan: lease.plan,
      licenseKey: lease.licenseKey,
    };
  }

  if (!subscriptionValid) {
    return {
      status: 'SUBSCRIPTION_EXPIRED',
      message: `Your subscription expired on ${subscriptionExpiry.toLocaleDateString('en-IN')}. App is in read-only mode.`,
      isValid: false,
      isOffline: false,
      plan: lease.plan,
      licenseKey: lease.licenseKey,
      expiresAt: lease.subscriptionExpiresAt,
      daysRemaining: subDaysRemaining,
    };
  }

  return {
    status: 'ACTIVE',
    message: 'License is active and valid.',
    isValid: true,
    isOffline: !lease.lastCloudCheck || (now - new Date(lease.lastCloudCheck)) > 24 * 60 * 60 * 1000,
    plan: lease.plan,
    licenseKey: lease.licenseKey,
    expiresAt: lease.subscriptionExpiresAt,
    daysRemaining: subDaysRemaining,
    leaseDaysRemaining,
    machineId: lease.machineId,
    deviceName: lease.deviceName,
    activatedAt: lease.activatedAt,
  };
}

/**
 * Activate a license key on this device.
 * In standalone mode (no cloud), this validates locally against the database.
 */
export async function activateLicense(licenseKey, machineId, deviceName, osPlatform) {
  // Find the user with this license key in the local SQLite database
  const user = await prisma.user.findFirst({
    where: { licenseKey: licenseKey.toUpperCase() },
  });

  if (!user) {
    throw new Error('Invalid license key. Please check and try again.');
  }

  if (!user.isActive || user.subscriptionStatus === 'CANCELLED' || user.subscriptionStatus === 'INACTIVE') {
    throw new Error('This license has been suspended. Please contact your administrator.');
  }

  // Check subscription expiry
  if (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) {
    throw new Error(`Subscription expired on ${new Date(user.subscriptionExpiresAt).toLocaleDateString('en-IN')}. Please renew.`);
  }

  // Check seat limit
  const activeSeats = await prisma.deviceSeat.count({
    where: { userId: user.id, isActive: true },
  });

  const existingSeat = await prisma.deviceSeat.findFirst({
    where: { userId: user.id, machineId },
  });

  if (!existingSeat && activeSeats >= (user.maxSeats || 1)) {
    throw new Error(`Seat limit reached (${activeSeats}/${user.maxSeats || 1} devices active). Contact your administrator to upgrade or release a seat.`);
  }

  // Register or update the device seat
  await prisma.deviceSeat.upsert({
    where: { userId_machineId: { userId: user.id, machineId } },
    update: {
      deviceName,
      osPlatform,
      lastActiveAt: new Date(),
      isActive: true,
    },
    create: {
      userId: user.id,
      machineId,
      deviceName,
      osPlatform,
    },
  });

  // Create and save the lease token (valid for 14 days offline)
  const gracePeriodDays = 14;
  const leaseExpiry = new Date();
  leaseExpiry.setDate(leaseExpiry.getDate() + gracePeriodDays);

  const leaseData = {
    licenseKey: user.licenseKey,
    userId: user.id,
    plan: user.subscriptionPlan,
    machineId,
    deviceName,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    leaseExpiresAt: leaseExpiry.toISOString(),
    gracePeriodDays,
    activatedAt: new Date().toISOString(),
    lastCloudCheck: new Date().toISOString(),
  };

  saveLease(leaseData);

  return {
    status: 'ACTIVATED',
    message: `License activated successfully! Plan: ${user.subscriptionPlan}`,
    plan: user.subscriptionPlan,
    expiresAt: user.subscriptionExpiresAt,
    gracePeriodDays,
    seatsUsed: activeSeats + (existingSeat ? 0 : 1),
    maxSeats: user.maxSeats || 1,
  };
}

/**
 * Deactivate this device and release the seat.
 */
export async function deactivateLicense(machineId) {
  const lease = loadLease();
  if (!lease) {
    throw new Error('No license is activated on this device.');
  }

  // Deactivate the seat in database
  try {
    await prisma.deviceSeat.updateMany({
      where: { machineId, userId: lease.userId },
      data: { isActive: false },
    });
  } catch {
    // Seat may not exist
  }

  // Clear local lease
  clearLease();

  return {
    status: 'DEACTIVATED',
    message: 'License deactivated. This device seat has been released.',
  };
}
