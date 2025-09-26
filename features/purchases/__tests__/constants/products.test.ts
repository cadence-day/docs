/**
 * Tests for products constants
 */

import { PRODUCT_IDS, ENTITLEMENT_IDS, SUBSCRIPTION_TIERS } from "../../constants/products";

describe("Products Constants", () => {
  describe("PRODUCT_IDS", () => {
    it("should have correct product identifiers", () => {
      expect(PRODUCT_IDS.SUPPORTER_MONTHLY).toBe("cadence_supporter_monthly");
      expect(PRODUCT_IDS.SUPPORTER_YEARLY).toBe("cadence_supporter_yearly");
      expect(PRODUCT_IDS.PREMIUM_SUPPORTER_MONTHLY).toBe("cadence_premium_supporter_monthly");
      expect(PRODUCT_IDS.FEATURE_SPONSOR_ONETIME).toBe("cadence_feature_sponsor_onetime");
    });

    it("should be readonly object", () => {
      expect(() => {
        // @ts-expect-error - testing readonly behavior
        PRODUCT_IDS.SUPPORTER_MONTHLY = "modified";
      }).toThrow();
    });
  });

  describe("ENTITLEMENT_IDS", () => {
    it("should have correct entitlement identifiers", () => {
      expect(ENTITLEMENT_IDS.SUPPORTER).toBe("supporter");
      expect(ENTITLEMENT_IDS.PREMIUM_SUPPORTER).toBe("premium_supporter");
      expect(ENTITLEMENT_IDS.FEATURE_SPONSOR).toBe("feature_sponsor");
    });
  });

  describe("SUBSCRIPTION_TIERS", () => {
    it("should have free tier configuration", () => {
      const freeTier = SUBSCRIPTION_TIERS.free;

      expect(freeTier.name).toBe("Free Explorer");
      expect(freeTier.price).toBe("Free");
      expect(Array.isArray(freeTier.features)).toBe(true);
      expect(freeTier.features.length).toBeGreaterThan(0);
      expect(freeTier.limits.maxTimeSlices).toBe(48);
      expect(freeTier.limits.aiInsights).toBe(false);
    });

    it("should have supporter tier configuration", () => {
      const supporterTier = SUBSCRIPTION_TIERS.supporter;

      expect(supporterTier.name).toBe("Supporter");
      expect(supporterTier.price).toBe("$4.99/month");
      expect(supporterTier.yearlyPrice).toBe("$50/year");
      expect(Array.isArray(supporterTier.features)).toBe(true);
      expect(supporterTier.features.length).toBeGreaterThan(0);
      expect(supporterTier.limits.maxTimeSlices).toBe(-1); // Unlimited
      expect(supporterTier.limits.aiInsights).toBe(true);
    });

    it("should have premium supporter tier configuration", () => {
      const premiumTier = SUBSCRIPTION_TIERS.premium_supporter;

      expect(premiumTier.name).toBe("Premium Supporter");
      expect(premiumTier.price).toBe("$9.99/month");
      expect(Array.isArray(premiumTier.features)).toBe(true);
      expect(premiumTier.features.length).toBeGreaterThan(0);
      expect(premiumTier.limits.maxTimeSlices).toBe(-1); // Unlimited
      expect(premiumTier.limits.aiInsights).toBe(true);
      expect(premiumTier.limits.exportData).toBe(true);
      expect(premiumTier.limits.betaAccess).toBe(true);
    });

    it("should have feature sponsor tier configuration", () => {
      const sponsorTier = SUBSCRIPTION_TIERS.feature_sponsor;

      expect(sponsorTier.name).toBe("Feature Sponsor");
      expect(sponsorTier.price).toBe("$50 one-time");
      expect(Array.isArray(sponsorTier.features)).toBe(true);
      expect(sponsorTier.features.length).toBeGreaterThan(0);
      expect(sponsorTier.limits.maxTimeSlices).toBe(-1); // Unlimited
      expect(sponsorTier.limits.aiInsights).toBe(true);
      expect(sponsorTier.limits.exportData).toBe(true);
      expect(sponsorTier.limits.betaAccess).toBe(true);
    });

    it("should have consistent tier structure", () => {
      Object.values(SUBSCRIPTION_TIERS).forEach(tier => {
        expect(tier).toHaveProperty("name");
        expect(tier).toHaveProperty("tagline");
        expect(tier).toHaveProperty("price");
        expect(tier).toHaveProperty("features");
        expect(tier).toHaveProperty("limits");
        expect(tier.limits).toHaveProperty("maxTimeSlices");
        expect(tier.limits).toHaveProperty("aiInsights");
        expect(tier.limits).toHaveProperty("exportData");
        expect(tier.limits).toHaveProperty("betaAccess");
        expect(typeof tier.name).toBe("string");
        expect(typeof tier.tagline).toBe("string");
        expect(typeof tier.price).toBe("string");
        expect(Array.isArray(tier.features)).toBe(true);
        expect(typeof tier.limits.maxTimeSlices).toBe("number");
        expect(typeof tier.limits.aiInsights).toBe("boolean");
        expect(typeof tier.limits.exportData).toBe("boolean");
        expect(typeof tier.limits.betaAccess).toBe("boolean");
      });
    });
  });
});