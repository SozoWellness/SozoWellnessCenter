/** Shared public/admin contract. No secrets or administrator identities belong here. */
import type { GiveawayCampaign } from '@workspace/api-client-react';
export type { GiveawayEntryInput, GiveawayEntry, GiveawayDraw, GiveawayAvailability, GiveawayAdminData } from '@workspace/api-client-react';
export type CampaignSettings = GiveawayCampaign;
export const WELLNESS_GOALS = ['More Energy', 'Pain Relief', 'Recovery & Healing', 'Stress Relief', 'Heart Health', 'General Wellness', 'Other'] as const;
export type WellnessGoal = typeof WELLNESS_GOALS[number];
export const EMPTY_CAMPAIGN: CampaignSettings = {
  id: 'hyperbaric-giveaway', status: 'draft', startsAt: '', endsAt: '',
  prizeValue: 0, rulesApproved: false, rulesVersion: '1',
};
