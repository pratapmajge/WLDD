import { IMilestone } from '../models/Campaign';

/**
 * Calculate payout based on the highest milestone crossed
 * @param views - Current view count
 * @param milestones - Array of milestone objects with views and payout
 * @returns The payout amount for the highest milestone crossed
 */
export const calculatePayout = (views: number, milestones: IMilestone[]): number => {
  if (!milestones || milestones.length === 0) {
    return 0;
  }

  // Find the highest milestone that has been crossed
  let highestPayout = 0;
  for (const milestone of milestones) {
    if (views >= milestone.views) {
      highestPayout = Math.max(highestPayout, milestone.payout);
    }
  }

  return highestPayout;
};

/**
 * Calculate additional payout to be added
 * @param currentViews - Current view count
 * @param previousViews - Previous view count
 * @param milestones - Array of milestone objects
 * @returns The additional payout amount (new payout - previous payout)
 */
export const calculateAdditionalPayout = (
  currentViews: number,
  previousViews: number,
  milestones: IMilestone[]
): number => {
  const newPayout = calculatePayout(currentViews, milestones);
  const previousPayout = calculatePayout(previousViews, milestones);
  return newPayout - previousPayout;
};
