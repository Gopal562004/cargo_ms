import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getLicenseStatus,
  activateLicense,
  deactivateLicense,
} from '../services/license.service.js';

const router = Router();

/**
 * GET /api/license/status
 * Get the current license status on this device.
 * Does not require auth (used before login on first launch).
 */
router.get('/status', async (req, res, next) => {
  try {
    const status = await getLicenseStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/license/activate
 * Activate a license key on this device.
 */
router.post('/activate', async (req, res, next) => {
  try {
    const { licenseKey, machineId, deviceName, osPlatform } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ success: false, message: 'License key is required' });
    }
    if (!machineId) {
      return res.status(400).json({ success: false, message: 'Machine ID is required' });
    }

    const result = await activateLicense(licenseKey, machineId, deviceName, osPlatform);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/license/deactivate
 * Deactivate the license on this device and release the seat.
 */
router.post('/deactivate', authenticate, async (req, res, next) => {
  try {
    const { machineId } = req.body;
    if (!machineId) {
      return res.status(400).json({ success: false, message: 'Machine ID is required' });
    }

    const result = await deactivateLicense(machineId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
