'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  ToggleButton, ToggleButtonGroup, Button, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, Legend, Tooltip as ReTooltip,
} from 'recharts';
import { CheckCircle, ReportProblem, Block, RateReview, ArrowBack } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import InterviewTable from '@/components/fieldwork/InterviewTable';
import type { MapPoint } from '@/components/fieldwork/InterviewMap';
import { useBatch, useReport, useInterviewers, useInterviews } from '@/lib/hooks/useFieldwork';
import { DEFAULT_GPS_BBOX, type GpsBbox, type QcStatus } from '@/types/fieldwork';

const InterviewMap = dynamic(() => import('@/components/fieldwork/InterviewMap'), {
  ssr: false,
  loading: () => <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>,
});

const STATUS_HEX: Record<string, string> = {
  pass: '#10B981', flag: '#F59E0B', review: '#F59E0B', reject: '#EF4444', pending: '#6B7280',
};

function Shell({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>;
}

function StatCard({ title, value, icon, color, hint }:
  { title: string; value: number; icon: React.ReactElement; color: string; hint?: string }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, mr: 2, display: 'flex',
                     alignItems: 'center', justifyContent: 'center',
                     backgroundColor: `${color}.light`, color: `${color}.main` }}>{icon}</Box>
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
          </Box>
        </Box>
        {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function BatchDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = String(params.batchId);

  const [statusFilter, setStatusFilter] = useState<QcStatus | 'all'>('all');

  const batch = useBatch(batchId);
  const report = useReport(batchId);
  const interviewers = useInterviewers(batchId);
  const interviews = useInterviews(batchId, statusFilter === 'all' ? undefined : statusFilter);

  const bbox: GpsBbox = (batch.data?.rules?.['gps_bbox'] as GpsBbox) ?? DEFAULT_GPS_BBOX;

  const mapPoints: MapPoint[] = useMemo(() => {
    const items = interviews.data?.items ?? [];
    return items
      .filter((iv) => iv.gps_lat != null && iv.gps_lng != null)
      .map((iv) => ({
        lat: iv.gps_lat as number,
        lng: iv.gps_lng as number,
        color: STATUS_HEX[iv.qc_status] ?? '#6B7280',
        label: `${iv.external_id ?? iv.id} · ${iv.interviewer_id ?? ''}`,
      }));
  }, [interviews.data]);

  if (batch.isLoading || report.isLoading) {
    return <Shell><Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={56} /></Box></Shell>;
  }
  if (batch.error || report.error || !report.data) {
    return <Shell><Alert severity="error">Failed to load this batch. Run QC first, then refresh.</Alert></Shell>;
  }

  const r = report.data;
  const byCheck = Object.entries(r.by_check).map(([check, count]) => ({ check, count }));
  const ranked = [...(interviewers.data ?? [])].sort(
    (a, b) => (b.anomaly_score ?? 0) - (a.anomaly_score ?? 0));

  return (
    <Shell>
      <Breadcrumbs sx={{ mb: 1 }}>
        <MuiLink component="button" underline="hover" color="inherit" onClick={() => router.push('/fieldwork-qc')}>
          Fieldwork QC
        </MuiLink>
        <Typography color="text.primary">{batch.data?.name ?? batchId}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{batch.data?.name}</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/fieldwork-qc')}>All batches</Button>
      </Box>

      {/* Independent axes — NOT a partition (reject = fraud ∪ ineligible may overlap). */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 2, mb: 1 }}>
        <StatCard title="Approved" value={r.approved} color="success" icon={<CheckCircle />} hint="qc_status = pass" />
        <StatCard title="Fraud rejected" value={r.fraud_rejected} color="error" icon={<ReportProblem />} hint="fabrication flag" />
        <StatCard title="Ineligible" value={r.ineligible} color="info" icon={<Block />} hint="screen-out, not fraud" />
        <StatCard title="Needs review" value={r.needs_review} color="warning" icon={<RateReview />} hint="warn-only" />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
        {r.interviews_total} interviews. Axes are independent signals (a record can be both fraud and ineligible) — not a 100% pie.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Flags by check</Typography>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCheck} margin={{ left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="check" angle={-35} textAnchor="end" interval={0} height={70} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <ReTooltip />
              <Bar dataKey="count" fill="#0066FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>

        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Approved vs rejected over time</Typography>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={r.trend} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <ReTooltip />
              <Legend />
              <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </Box>

      <Card sx={{ mb: 3 }}><CardContent>
        <Typography variant="h6" gutterBottom>Interviewer anomaly leaderboard</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Interviewer</TableCell>
                <TableCell align="right">Interviews</TableCell>
                <TableCell align="right">Avg duration (s)</TableCell>
                <TableCell align="right">Flag rate</TableCell>
                <TableCell align="right">Anomaly</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranked.map((s, idx) => {
                const a = s.anomaly_score ?? 0;
                const bg = a >= 0.6 ? 'error.light' : a >= 0.3 ? 'warning.light' : undefined;
                return (
                  <TableRow key={s.id ?? s.interviewer_id} sx={{ backgroundColor: bg }}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{s.interviewer_id}</TableCell>
                    <TableCell align="right">{s.n_interviews}</TableCell>
                    <TableCell align="right">{s.avg_duration_sec ?? '—'}</TableCell>
                    <TableCell align="right">{s.flag_rate != null ? `${Math.round(s.flag_rate * 100)}%` : '—'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{a.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent></Card>

      <Card sx={{ mb: 3 }}><CardContent>
        <Typography variant="h6" gutterBottom>Geographic distribution</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Pins coloured by QC status; blue rectangle = sampling area. Pins outside the box are out-of-area.
        </Typography>
        {mapPoints.length > 0
          ? <InterviewMap points={mapPoints} bbox={bbox} height={360} />
          : <Typography variant="body2" color="text.secondary">No GPS captured for this batch.</Typography>}
      </CardContent></Card>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Interviews</Typography>
        <ToggleButtonGroup size="small" exclusive value={statusFilter}
                           onChange={(_e, v) => v && setStatusFilter(v)}>
          {(['all', 'pass', 'flag', 'reject', 'review'] as const).map((s) => (
            <ToggleButton key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      {interviews.isLoading
        ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        : (
          <InterviewTable
            data={interviews.data?.items ?? []}
            onRowClick={(iv) => router.push(`/fieldwork-qc/${batchId}/interviews/${iv.id}`)}
          />
        )}
    </Shell>
  );
}
