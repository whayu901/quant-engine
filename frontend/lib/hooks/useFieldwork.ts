// React Query hooks for the Fieldwork QC module. Query-key convention follows
// the app's array-literal style (e.g. ['fieldwork', 'batches']).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldworkService } from '@/lib/services/fieldwork.service';
import type { FlagResolvePayload, QcStatus } from '@/types/fieldwork';

export const fieldworkKeys = {
  all: ['fieldwork'] as const,
  batches: () => [...fieldworkKeys.all, 'batches'] as const,
  batch: (id: string) => [...fieldworkKeys.all, 'batch', id] as const,
  report: (id: string) => [...fieldworkKeys.all, 'report', id] as const,
  interviewers: (id: string) => [...fieldworkKeys.all, 'interviewers', id] as const,
  interviews: (id: string, status?: QcStatus) =>
    [...fieldworkKeys.all, 'interviews', id, status ?? 'all'] as const,
  interview: (id: string) => [...fieldworkKeys.all, 'interview', id] as const,
};

export function useBatches() {
  return useQuery({
    queryKey: fieldworkKeys.batches(),
    queryFn: () => fieldworkService.listBatches({ limit: 100 }),
  });
}

export function useBatch(batchId: string) {
  return useQuery({
    queryKey: fieldworkKeys.batch(batchId),
    queryFn: () => fieldworkService.getBatch(batchId),
    enabled: !!batchId,
  });
}

export function useReport(batchId: string) {
  return useQuery({
    queryKey: fieldworkKeys.report(batchId),
    queryFn: () => fieldworkService.getReport(batchId),
    enabled: !!batchId,
  });
}

export function useInterviewers(batchId: string) {
  return useQuery({
    queryKey: fieldworkKeys.interviewers(batchId),
    queryFn: () => fieldworkService.listInterviewers(batchId),
    enabled: !!batchId,
  });
}

export function useInterviews(batchId: string, status?: QcStatus) {
  return useQuery({
    queryKey: fieldworkKeys.interviews(batchId, status),
    queryFn: () => fieldworkService.listInterviews(batchId, { status, limit: 100 }),
    enabled: !!batchId,
  });
}

export function useInterview(interviewId: string) {
  return useQuery({
    queryKey: fieldworkKeys.interview(interviewId),
    queryFn: () => fieldworkService.getInterview(interviewId),
    enabled: !!interviewId,
  });
}

export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { project_id: string; name: string; source?: string }) =>
      fieldworkService.createBatch(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: fieldworkKeys.batches() }),
  });
}

export function useImportBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, file }: { batchId: string; file: File }) =>
      fieldworkService.importBatch(batchId, file),
    onSuccess: (_data, { batchId }) => {
      qc.invalidateQueries({ queryKey: fieldworkKeys.batch(batchId) });
      qc.invalidateQueries({ queryKey: fieldworkKeys.batches() });
    },
  });
}

export function useRunBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => fieldworkService.runBatch(batchId),
    onSuccess: () => {
      // A run recomputes flags, statuses, report and interviewer scores.
      qc.invalidateQueries({ queryKey: fieldworkKeys.all });
    },
  });
}

export function useResolveFlag(interviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ flagId, body }: { flagId: string; body: FlagResolvePayload }) =>
      fieldworkService.resolveFlag(flagId, body),
    onSuccess: () => {
      // Re-fetch the interview so its recomputed qc_status is reflected.
      qc.invalidateQueries({ queryKey: fieldworkKeys.interview(interviewId) });
    },
  });
}
