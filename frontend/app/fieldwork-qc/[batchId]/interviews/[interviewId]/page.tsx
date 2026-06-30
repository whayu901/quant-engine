'use client';

import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress, Alert, Stack,
  Table, TableBody, TableCell, TableRow, Button, Breadcrumbs, Link as MuiLink,
  Divider, Tooltip,
} from '@mui/material';
import { ArrowBack, OpenInNew, CheckCircle, DoNotDisturb, GraphicEq } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import type { MapPoint } from '@/components/fieldwork/InterviewMap';
import { qcStatusColor, severityColor } from '@/components/fieldwork/qcStatus';
import { useBatch, useInterview, useResolveFlag } from '@/lib/hooks/useFieldwork';
import { DEFAULT_GPS_BBOX, type GpsBbox, type QCFlag } from '@/types/fieldwork';

const InterviewMap = dynamic(() => import('@/components/fieldwork/InterviewMap'), {
  ssr: false,
  loading: () => <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>,
});

function Shell({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>;
}

function pinColorFor(flags: QCFlag[]): string {
  const checks = new Set(flags.filter((f) => f.status !== 'dismissed').map((f) => f.check));
  if (checks.has('gps_out_of_area')) return '#EF4444'; // red
  if (checks.has('gps_identical')) return '#F59E0B';   // amber
  return '#0066FF';                                    // normal
}

export default function InterviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = String(params.batchId);
  const interviewId = String(params.interviewId);

  const batch = useBatch(batchId);
  const { data: iv, isLoading, error } = useInterview(interviewId);
  const resolveFlag = useResolveFlag(interviewId);

  if (isLoading) {
    return <Shell><Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={56} /></Box></Shell>;
  }
  if (error || !iv) {
    return <Shell><Alert severity="error">Failed to load this interview.</Alert></Shell>;
  }

  const bbox: GpsBbox = (batch.data?.rules?.['gps_bbox'] as GpsBbox) ?? DEFAULT_GPS_BBOX;
  const hasGps = iv.gps_lat != null && iv.gps_lng != null;
  const answers = iv.answers ?? {};
  const answerKeys = Object.keys(answers).sort();

  const mapPoints: MapPoint[] = hasGps ? [{
    lat: iv.gps_lat as number, lng: iv.gps_lng as number,
    color: pinColorFor(iv.flags), label: `${iv.external_id ?? iv.id} · ${iv.interviewer_id ?? ''}`,
  }] : [];

  const resolve = (flagId: string, status: 'confirmed' | 'dismissed') =>
    resolveFlag.mutate({ flagId, body: { status } });

  return (
    <Shell>
      <Breadcrumbs sx={{ mb: 1 }}>
        <MuiLink component="button" underline="hover" color="inherit" onClick={() => router.push('/fieldwork-qc')}>Fieldwork QC</MuiLink>
        <MuiLink component="button" underline="hover" color="inherit" onClick={() => router.push(`/fieldwork-qc/${batchId}`)}>
          {batch.data?.name ?? batchId}
        </MuiLink>
        <Typography color="text.primary">{iv.external_id ?? iv.id}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{iv.external_id ?? iv.id}</Typography>
          <Chip label={iv.qc_status} color={qcStatusColor(iv.qc_status)} sx={{ textTransform: 'capitalize' }} />
          {iv.qc_score != null && <Chip variant="outlined" label={`score ${iv.qc_score.toFixed(2)}`} />}
        </Stack>
        <Button startIcon={<ArrowBack />} onClick={() => router.push(`/fieldwork-qc/${batchId}`)}>Back</Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Metadata</Typography>
          <Table size="small"><TableBody>
            <TableRow><TableCell>Interviewer</TableCell><TableCell>{iv.interviewer_id ?? '—'}</TableCell></TableRow>
            <TableRow><TableCell>Respondent ref</TableCell><TableCell>{iv.respondent_ref ?? '—'}</TableCell></TableRow>
            <TableRow><TableCell>Duration (s)</TableCell><TableCell>{iv.duration_sec ?? '—'}</TableCell></TableRow>
            <TableRow><TableCell>Started</TableCell><TableCell>{iv.started_at ?? '—'}</TableCell></TableRow>
            <TableRow>
              <TableCell>GPS</TableCell>
              <TableCell>
                {hasGps ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{iv.gps_lat}, {iv.gps_lng}</span>
                    <Tooltip title="Open in Google Maps">
                      <MuiLink href={`https://www.google.com/maps?q=${iv.gps_lat},${iv.gps_lng}`}
                               target="_blank" rel="noopener" sx={{ display: 'inline-flex' }}>
                        <OpenInNew fontSize="small" />
                      </MuiLink>
                    </Tooltip>
                  </Stack>
                ) : 'No GPS captured'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Audio</TableCell>
              <TableCell>
                {iv.audio_ref ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <code style={{ fontSize: 12 }}>{iv.audio_ref}</code>
                    <Button size="small" variant="outlined" disabled startIcon={<GraphicEq />}>Play</Button>
                    <Typography variant="caption" color="text.secondary">(Phase 5)</Typography>
                  </Stack>
                ) : '—'}
              </TableCell>
            </TableRow>
          </TableBody></Table>
        </CardContent></Card>

        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Location</Typography>
          {hasGps
            ? <InterviewMap points={mapPoints} bbox={bbox} height={300} />
            : <Typography variant="body2" color="text.secondary">No GPS captured for this interview.</Typography>}
        </CardContent></Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Answers</Typography>
          {answerKeys.length === 0 ? <Typography variant="body2" color="text.secondary">No answers.</Typography> : (
            <Table size="small"><TableBody>
              {answerKeys.map((k) => (
                <TableRow key={k}>
                  <TableCell sx={{ width: '40%', color: 'text.secondary' }}>{k}</TableCell>
                  <TableCell>{String((answers as Record<string, unknown>)[k])}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          )}
        </CardContent></Card>

        <Card><CardContent>
          <Typography variant="h6" gutterBottom>QC flags ({iv.flags.length})</Typography>
          {iv.flags.length === 0 ? <Typography variant="body2" color="text.secondary">No flags — clean.</Typography> : (
            <Stack spacing={2}>
              {iv.flags.map((f) => (
                <Box key={f.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2,
                                      opacity: f.status === 'dismissed' ? 0.5 : 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Chip size="small" label={f.check} color={severityColor(f.severity)} />
                    <Typography variant="caption" color="text.secondary">{f.severity}</Typography>
                    {f.status !== 'open' && <Chip size="small" variant="outlined" label={f.status} sx={{ textTransform: 'capitalize' }} />}
                  </Stack>
                  <Box component="pre" sx={{ m: 0, fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                            color: 'text.secondary', maxHeight: 120, overflow: 'auto' }}>
                    {JSON.stringify(f.detail ?? {}, null, 2)}
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" color="success" startIcon={<CheckCircle />}
                            disabled={resolveFlag.isPending} onClick={() => resolve(f.id, 'confirmed')}>Confirm</Button>
                    <Button size="small" variant="outlined" color="warning" startIcon={<DoNotDisturb />}
                            disabled={resolveFlag.isPending} onClick={() => resolve(f.id, 'dismissed')}>Dismiss</Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent></Card>
      </Box>
    </Shell>
  );
}
