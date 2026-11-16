/** Shared public/admin contract. No secrets or administrator identities belong here. */
import type { GiveawayCampaign } from '@workspace/api-client-react';
export type { GiveawayEntryInput, GiveawayEntry, GiveawayDraw, GiveawayAvailability, GiveawayAdminData } from '@workspace/api-client-react';
export type CampaignSettings = GiveawayCampaign;
export const GIVEAWAY_ENTRY_TAG = 'HBOT Giveaway — Nov 20, 2026';
export const WELLNESS_GOALS = ['More Energy', 'Pain Relief', 'Recovery & Healing', 'Stress Relief', 'Heart Health', 'General Wellness', 'Other'] as const;
export type WellnessGoal = typeof WELLNESS_GOALS[number];
export const EMPTY_CAMPAIGN: CampaignSettings = {
  id: 'hyperbaric-giveaway', status: 'draft',
  startsAt: '2026-11-20T14:00:00.000Z', endsAt: '2026-11-20T23:00:00.000Z',
  prizeValue: 2000, rulesApproved: false, rulesVersion: '1',
};
