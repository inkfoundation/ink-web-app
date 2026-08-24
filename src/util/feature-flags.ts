/**
 * Change the value here to enable/disable a feature flag.
 * You can then use `OnlyWithFeatureFlag`
 */
export const hardcodedFeatureFlags = {
  morpheus: false,
  experimental: false,
  mainnet: true,
  prefillAppSubmission: false,
  publicRepo: false,
  fakeEvents: 0,
  grantsSection: false,
  walletColumn: false,
};

export type FeatureFlagKey = keyof typeof hardcodedFeatureFlags;

export function getFeatureFlags() {
  return {
    ...hardcodedFeatureFlags,
  };
}
