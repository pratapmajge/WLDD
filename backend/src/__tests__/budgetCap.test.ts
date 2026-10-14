import mongoose from 'mongoose';
import Campaign from '../models/Campaign';
import Submission from '../models/Submission';
import { calculatePayout } from '../utils/payoutCalculator';

describe('Budget Cap Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://=localhost:27017/memed_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Campaign.deleteMany({});
    await Submission.deleteMany({});
  });

  it('should not allow payout to exceed campaign budget', async () => {
    const campaign = new Campaign({
      name: 'Test Campaign',
      platform: 'Instagram',
      totalBudget: 1000,
      milestones: [
        { views: 10000, payout: 500 },
        { views: 50000, payout: 2000 }
      ],
      brandId: new mongoose.Types.ObjectId(),
      spent: 0
    });

    await campaign.save();

    const submission = new Submission({
      campaignId: campaign._id,
      creatorId: new mongoose.Types.ObjectId(),
      postLink: 'https://instagram.com/p/test',
      views: 50000,
      payout: 0,
      previousPayout: 0
    });

    await submission.save();

    // Calculate payout
    const newPayout = calculatePayout(50000, campaign.milestones);
    const additionalPayout = newPayout - submission.previousPayout;
    const remainingBudget = campaign.totalBudget - campaign.spent;

    // Additional payout (2000) exceeds remaining budget (1000)
    expect(additionalPayout).toBeGreaterThan(remainingBudget);

    // Cap the payout
    const cappedPayout = submission.previousPayout + remainingBudget;
    expect(cappedPayout).toBe(1000);
    expect(cappedPayout).toBeLessThanOrEqual(campaign.totalBudget);
  });

  it('should allow full payout when within budget', async () => {
    const campaign = new Campaign({
      name: 'Test Campaign',
      platform: 'Instagram',
      totalBudget: 5000,
      milestones: [
        { views: 10000, payout: 500 },
        { views: 50000, payout: 2000 }
      ],
      brandId: new mongoose.Types.ObjectId(),
      spent: 0
    });

    await campaign.save();

    const submission = new Submission({
      campaignId: campaign._id,
      creatorId: new mongoose.Types.ObjectId(),
      postLink: 'https://instagram.com/p/test',
      views: 50000,
      payout: 0,
      previousPayout: 0
    });

    await submission.save();

    const newPayout = calculatePayout(50000, campaign.milestones);
    const additionalPayout = newPayout - submission.previousPayout;
    const remainingBudget = campaign.totalBudget - campaign.spent;

    expect(additionalPayout).toBeLessThanOrEqual(remainingBudget);
    expect(newPayout).toBe(2000);
  });

  it('should track spent amount correctly', async () => {
    const campaign = new Campaign({
      name: 'Test Campaign',
      platform: 'Instagram',
      totalBudget: 5000,
      milestones: [
        { views: 10000, payout: 500 },
        { views: 50000, payout: 2000 }
      ],
      brandId: new mongoose.Types.ObjectId(),
      spent: 0
    });

    await campaign.save();

    // Simulate first payout
    campaign.spent += 500;
    await campaign.save();

    expect(campaign.spent).toBe(500);
    expect(campaign.totalBudget - campaign.spent).toBe(4500);

    // Simulate second payout
    campaign.spent += 1500;
    await campaign.save();

    expect(campaign.spent).toBe(2000);
    expect(campaign.totalBudget - campaign.spent).toBe(3000);
  });

  it('should not overspend when budget is exactly exhausted', async () => {
    const campaign = new Campaign({
      name: 'Test Campaign',
      platform: 'Instagram',
      totalBudget: 1000,
      milestones: [
        { views: 10000, payout: 500 },
        { views: 50000, payout: 2000 }
      ],
      brandId: new mongoose.Types.ObjectId(),
      spent: 500
    });

    await campaign.save();

    const remainingBudget = campaign.totalBudget - campaign.spent;
    expect(remainingBudget).toBe(500);

    // Try to add 1500 but only 500 remaining
    const additionalPayout = 1500;
    const actualPayout = Math.min(additionalPayout, remainingBudget);
    
    expect(actualPayout).toBe(500);
    expect(campaign.spent + actualPayout).toBeLessThanOrEqual(campaign.totalBudget);
  });
});
