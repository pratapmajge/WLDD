import { calculatePayout, calculateAdditionalPayout } from '../utils/payoutCalculator';

describe('Payout Calculator', () => {
  const milestones = [
    { views: 10000, payout: 500 },
    { views: 50000, payout: 2000 },
    { views: 100000, payout: 5000 }
  ];

  describe('calculatePayout', () => {
    it('should return 0 when views are below the first milestone', () => {
      const result = calculatePayout(5000, milestones);
      expect(result).toBe(0);
    });

    it('should return the payout for the first milestone when views match exactly', () => {
      const result = calculatePayout(10000, milestones);
      expect(result).toBe(500);
    });

    it('should return the payout for the first milestone when views are between first and second', () => {
      const result = calculatePayout(25000, milestones);
      expect(result).toBe(500);
    });

    it('should return the payout for the second milestone when views match exactly', () => {
      const result = calculatePayout(50000, milestones);
      expect(result).toBe(2000);
    });

    it('should return the payout for the second milestone when views are between second and third', () => {
      const result = calculatePayout(75000, milestones);
      expect(result).toBe(2000);
    });

    it('should return the payout for the highest milestone when views exceed it', () => {
      const result = calculatePayout(150000, milestones);
      expect(result).toBe(5000);
    });

    it('should return 0 when milestones array is empty', () => {
      const result = calculatePayout(100000, []);
      expect(result).toBe(0);
    });

    it('should return 0 when milestones is null', () => {
      const result = calculatePayout(100000, null as any);
      expect(result).toBe(0);
    });
  });

  describe('calculateAdditionalPayout', () => {
    it('should return 0 when views do not cross any milestone', () => {
      const result = calculateAdditionalPayout(5000, 3000, milestones);
      expect(result).toBe(0);
    });

    it('should return the difference when crossing the first milestone', () => {
      const result = calculateAdditionalPayout(10000, 5000, milestones);
      expect(result).toBe(500);
    });

    it('should return the difference when crossing from first to second milestone', () => {
      const result = calculateAdditionalPayout(50000, 10000, milestones);
      expect(result).toBe(1500);
    });

    it('should return the difference when crossing multiple milestones at once', () => {
      const result = calculateAdditionalPayout(100000, 5000, milestones);
      expect(result).toBe(5000);
    });

    it('should return 0 when views decrease', () => {
      const result = calculateAdditionalPayout(10000, 50000, milestones);
      expect(result).toBe(-1500);
    });

    it('should return 0 when views stay the same', () => {
      const result = calculateAdditionalPayout(10000, 10000, milestones);
      expect(result).toBe(0);
    });
  });
});
