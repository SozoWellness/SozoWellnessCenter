import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getGiveawayAvailability, submitGiveawayEntry, getGiveawayAdmin, administerGiveaway, type GiveawayAdminCommand, type GiveawayEntryInput } from '@workspace/api-client-react';
export type { GiveawayAdminCommand } from '@workspace/api-client-react';
export * from './giveaway-contract';
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const options = { credentials: 'same-origin' as const, cache: 'no-store' as const };
async function friendly<T>(result: Promise<T>): Promise<T> {
  try { return await result; } catch (error) {
    const data = error && typeof error === 'object' && 'data' in error ? error.data : undefined;
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') throw new Error(data.error);
    throw new Error('The service could not confirm this request. Please try again.');
  }
}
export function useGiveawayAvailability() {
  return useQuery({ queryKey: ['giveaway-availability'], queryFn: () => friendly(getGiveawayAvailability(options)), staleTime: 30_000, retry: false, enabled: typeof window !== 'undefined' });
}
export function useEnterGiveaway() {
  return useMutation({ mutationFn: (input: GiveawayEntryInput) => friendly(submitGiveawayEntry(input, options)) });
}
export function useGiveawayAdmin(search: string, page: number) {
  return useQuery({ queryKey: ['giveaway-admin', search, page], queryFn: () => friendly(getGiveawayAdmin({ q: search, page }, options)), retry: false, enabled: typeof window !== 'undefined' });
}
export function useGiveawayAdminCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: GiveawayAdminCommand) => friendly(administerGiveaway(command, options)),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['giveaway-admin'] }); void queryClient.invalidateQueries({ queryKey: ['giveaway-availability'] }); },
  });
}
export function giveawayExportHref(kind: 'entries' | 'emails' | 'winners') {
  return `${base}/api/giveaway-admin?export=${kind}`;
}
export function giveawayAttribution(): GiveawayEntryInput['attribution'] {
  const params = new URLSearchParams(window.location.search);
  const clean = (key: string) => (params.get(key) || '').replace(/[^a-zA-Z0-9 _.-]/g, '').slice(0, 80);
  return { qrSource: clean('qr_source'), utmSource: clean('utm_source'), utmMedium: clean('utm_medium'), utmCampaign: clean('utm_campaign'), utmContent: clean('utm_content') };
}
