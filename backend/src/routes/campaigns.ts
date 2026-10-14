import { Router } from 'express';
import Campaign from '../models/Campaign';
import { auth, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Create a campaign (brand only)
router.post('/', auth, requireRole('brand'), async (req: AuthRequest, res) => {
  try {
    const { name, platform, totalBudget, milestones } = req.body;

    if (!name || !platform || !totalBudget || !milestones) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['Instagram', 'YouTube'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform. Must be Instagram or YouTube' });
    }

    if (!Array.isArray(milestones) || milestones.length === 0) {
      return res.status(400).json({ error: 'At least one milestone is required' });
    }

    // Validate milestones
    for (const milestone of milestones) {
      if (!milestone.views || !milestone.payout) {
        return res.status(400).json({ error: 'Each milestone must have views and payout' });
      }
      if (milestone.views < 0 || milestone.payout < 0) {
        return res.status(400).json({ error: 'Views and payout must be non-negative' });
      }
    }

    const campaign = new Campaign({
      name,
      platform,
      totalBudget,
      milestones,
      brandId: req.userId,
      spent: 0
    });

    await campaign.save();

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Server error creating campaign' });
  }
});

// Get all campaigns for a brand
router.get('/my-campaigns', auth, requireRole('brand'), async (req: AuthRequest, res) => {
  try {
    const campaigns = await Campaign.find({ brandId: req.userId }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Server error fetching campaigns' });
  }
});

// Get all active campaigns (for creators)
router.get('/active', auth, requireRole('creator'), async (req: AuthRequest, res) => {
  try {
    const campaigns = await Campaign.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error('Get active campaigns error:', error);
    res.status(500).json({ error: 'Server error fetching active campaigns' });
  }
});

// Get single campaign
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Check if user is authorized to view this campaign
    if (req.userRole === 'brand' && campaign.brandId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Server error fetching campaign' });
  }
});

// Update a campaign (brand only)
router.put('/:id', auth, requireRole('brand'), async (req: AuthRequest, res) => {
  try {
    const { name, platform, totalBudget, milestones, isActive } = req.body;

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Check if user owns this campaign
    if (campaign.brandId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate platform if provided
    if (platform && !['Instagram', 'YouTube'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform. Must be Instagram or YouTube' });
    }

    // Validate milestones if provided
    if (milestones) {
      if (!Array.isArray(milestones) || milestones.length === 0) {
        return res.status(400).json({ error: 'At least one milestone is required' });
      }
      for (const milestone of milestones) {
        if (!milestone.views || !milestone.payout) {
          return res.status(400).json({ error: 'Each milestone must have views and payout' });
        }
        if (milestone.views < 0 || milestone.payout < 0) {
          return res.status(400).json({ error: 'Views and payout must be non-negative' });
        }
      }
    }

    // Update campaign
    if (name) campaign.name = name;
    if (platform) campaign.platform = platform;
    if (totalBudget !== undefined) campaign.totalBudget = totalBudget;
    if (milestones) campaign.milestones = milestones;
    if (isActive !== undefined) campaign.isActive = isActive;

    await campaign.save();

    res.json(campaign);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Server error updating campaign' });
  }
});

// Delete a campaign (brand only)
router.delete('/:id', auth, requireRole('brand'), async (req: AuthRequest, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Check if user owns this campaign
    if (campaign.brandId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if campaign has spent money
    if (campaign.spent > 0) {
      return res.status(400).json({ error: 'Cannot delete campaign with spent budget' });
    }

    await Campaign.findByIdAndDelete(req.params.id);

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Server error deleting campaign' });
  }
});

export default router;
