// Fieldwork QC API service — thin wrapper over apiClient, mirroring the
// class+singleton style of auth-service.ts. All paths are under the backend
// router prefix /api/v1/fieldwork-qc.

import { apiClient } from '@/lib/api-client';
import type {
  FieldworkBatch,
  FieldworkPage,
  Interview,
  InterviewDetail,
  InterviewerScore,
  FieldworkReport,
  QCFlag,
  FlagResolvePayload,
  QcStatus,
} from '@/types/fieldwork';

const BASE = '/api/v1/fieldwork-qc';

class FieldworkService {
  listBatches(params: { project_id?: string; skip?: number; limit?: number } = {}) {
    return apiClient.get<FieldworkPage<FieldworkBatch>>(`${BASE}/batches`, { params });
  }

  getBatch(batchId: string) {
    return apiClient.get<FieldworkBatch>(`${BASE}/batches/${batchId}`);
  }

  createBatch(body: { project_id: string; name: string; source?: string }) {
    return apiClient.post<FieldworkBatch>(`${BASE}/batches`, body);
  }

  importBatch(batchId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post<{ import_job_id: string; batch_id: string; status: string;
      result_summary?: Record<string, unknown>; error?: string }>(
      `${BASE}/batches/${batchId}/import`, form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  }

  runBatch(batchId: string) {
    return apiClient.post<FieldworkBatch>(`${BASE}/batches/${batchId}/run`);
  }

  listInterviews(batchId: string, params: { status?: QcStatus; skip?: number; limit?: number } = {}) {
    return apiClient.get<FieldworkPage<Interview>>(`${BASE}/batches/${batchId}/interviews`, { params });
  }

  getInterview(interviewId: string) {
    return apiClient.get<InterviewDetail>(`${BASE}/interviews/${interviewId}`);
  }

  listInterviewers(batchId: string) {
    return apiClient.get<InterviewerScore[]>(`${BASE}/batches/${batchId}/interviewers`);
  }

  getReport(batchId: string) {
    return apiClient.get<FieldworkReport>(`${BASE}/batches/${batchId}/report`);
  }

  resolveFlag(flagId: string, body: FlagResolvePayload) {
    return apiClient.post<QCFlag>(`${BASE}/flags/${flagId}/resolve`, body);
  }
}

export const fieldworkService = new FieldworkService();
