import { Router } from 'express';
import Submission from '../models/Submission';
import Campaign from '../models/Campaign';
import { auth, AuthRequest, requireRole } from '../middleware/auth';
import { calculatePayout, calculateAdditionalPayout } from '../utils/payoutCalculator';

const router = Router();

// Submit a post to a campaign (creator only)
router.post('/', auth, requireRole('creator'), async (req: AuthRequest, res) => {
  try {
    const { campaignId, postLink } = req.body;

    if (!campaignId || !postLink) {
      return res.status(400).json({ error: 'Campaign ID and post link are required' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (!campaign.isActive) {
      return res.status(400).json({ error: 'Campaign is not active' });
    }

    // Check if creator already submitted to this campaign
    const existingSubmission = await Submission.findOne({
      campaignId,
      creatorId: req.userId
    });

    if (existingSubmission) {
      return res.status(400).json({ error: 'You have already submitted to this campaign' });
    }

    const submission = new Submission({
      campaignId,
      creatorId: req.userId,
      postLink,
      views: 0,
      payout: 0,
      previousPayout: 0
    });

    await submission.save();

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit post error:', error);
    res.status(500).json({ error: 'Server error submitting post' });
  }
});

// Get creator's submissions
router.get('/my-submissions', auth, requireRole('creator'), async (req: AuthRequest, res) => {
  try {
    const submissions = await Submission.find({ creatorId: req.userId })
      .populate('campaignId', 'name platform')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Server error fetching submissions' });
  }
});

// Get creator's total earnings
router.get('/my-earnings', auth, requireRole('creator'), async (req: AuthRequest, res) => {
  try {
    const submissions = await Submission.find({ creatorId: req.userId });
    const totalEarnings = submissions.reduce((sum, sub) => sum + sub.payout, 0);
    res.json({ totalEarnings });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Server error fetching earnings' });
  }
});

// Update views for a submission (simulates platform data)
router.patch('/:id/views', async (req, res) => {
  try {
    const { views } = req.body;

    if (typeof views !== 'number' || views < 0) {
      return res.status(400).json({ error: 'Views must be a non-negative number' });
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const campaign = await Campaign.findById(submission.campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Calculate new payout based on current views
    const newPayout = calculatePayout(views, campaign.milestones);
    const additionalPayout = newPayout - submission.previousPayout;

    // Check if campaign has enough budget
    if (additionalPayout > 0) {
      const remainingBudget = campaign.totalBudget - campaign.spent;
      if (additionalPayout > remainingBudget) {
        // Not enough budget - cap the payout to remaining budget
        const cappedPayout = submission.previousPayout + remainingBudget;
        submission.payout = cappedPayout;
        submission.previousPayout = cappedPayout;
        submission.views = views;
        
        // Update campaign spent
        campaign.spent = campaign.totalBudget;
        await campaign.save();
        await submission.save();

        return res.json({
          submission,
          warning: 'Campaign budget exhausted. Payout capped at remaining budget.'
        });
      }

      // Update campaign spent
      campaign.spent += additionalPayout;
      await campaign.save();
    }

    // Update submission
    submission.payout = newPayout;
    submission.previousPayout = newPayout;
    submission.views = views;
    
    // Add to view history
    submission.viewHistory.push({
      views: views,
      payout: newPayout,
      timestamp: new Date()
    });
    
    await submission.save();

    res.json(submission);
  } catch (error) {
    console.error('Update views error:', error);
    res.status(500).json({ error: 'Server error updating views' });
  }
});

// Get view history for a submission (creator only)
router.get('/:id/history', auth, requireRole('creator'), async (req: AuthRequest, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check if user owns this submission
    if (submission.creatorId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(submission.viewHistory || []);
  } catch (error) {
    console.error('Get view history error:', error);
    res.status(500).json({ error: 'Server error fetching view history' });
  }
});

export default router;
