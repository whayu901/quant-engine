'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Button, Chip, CircularProgress, Alert, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Stack,
} from '@mui/material';
import { Add, Upload, PlayArrow, FactCheck, Search } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import { apiClient } from '@/lib/api-client';
import { useBatches, useCreateBatch, useImportBatch, useRunBatch } from '@/lib/hooks/useFieldwork';
import { batchStatusColor } from '@/components/fieldwork/qcStatus';
import type { FieldworkBatch } from '@/types/fieldwork';

interface ProjectLite { id: string; name: string }

function Shell({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>;
}

export default function FieldworkBatchesPage() {
  const router = useRouter();
  const { data, isLoading, error } = useBatches();
  const createBatch = useCreateBatch();
  const importBatch = useImportBatch();
  const runBatch = useRunBatch();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const importTarget = useRef<string | null>(null);

  // Projects to attach a batch to (best-effort; create still possible via id).
  const { data: projects } = useQuery<ProjectLite[]>({
    queryKey: ['projects', 'lite'],
    queryFn: () => apiClient.get<ProjectLite[]>('/api/projects'),
    retry: false,
  });

  const onCreate = () => {
    if (!name || !projectId) return;
    createBatch.mutate(
      { project_id: projectId, name },
      { onSuccess: () => { setDialogOpen(false); setName(''); setProjectId(''); } },
    );
  };

  const onPickFile = (batchId: string) => {
    importTarget.current = batchId;
    fileInput.current?.click();
  };

  const onFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const batchId = importTarget.current;
    e.target.value = '';
    if (!file || !batchId) return;
    importBatch.mutate(
      { batchId, file },
      { onSuccess: () => runBatch.mutate(batchId) },  // import then analyze
    );
  };

  if (isLoading) {
    return <Shell><Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={56} /></Box></Shell>;
  }
  if (error) {
    return <Shell><Alert severity="error">Failed to load QC batches. Please try again.</Alert></Shell>;
  }

  const batches: FieldworkBatch[] = data?.items ?? [];

  return (
    <Shell>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Fieldwork QC</Typography>
          <Typography variant="body1" color="text.secondary">
            Verify data-collection integrity: interview-happened checks, anti-curbstoning, registrant validation.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>New batch</Button>
      </Box>

      {batches.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <FactCheck sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No QC batches yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a batch, import a fielding file (CSV/XLSX), then run the detectors.
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>New batch</Button>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Interviews</TableCell>
                <TableCell align="right">Flags</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={b.id} hover sx={{ cursor: 'pointer' }}
                          onClick={() => router.push(`/fieldwork-qc/${b.id}`)}>
                  <TableCell sx={{ fontWeight: 600 }}>{b.name}</TableCell>
                  <TableCell sx={{ textTransform: 'uppercase', fontSize: 12 }}>{b.source}</TableCell>
                  <TableCell>
                    <Chip size="small" label={b.status} color={batchStatusColor(b.status)}
                          sx={{ textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell align="right">{b.result_summary?.interviews ?? '—'}</TableCell>
                  <TableCell align="right">{b.result_summary?.flags_total ?? '—'}</TableCell>
                  <TableCell>{new Date(b.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Import CSV/XLSX & run">
                      <IconButton size="small" onClick={() => onPickFile(b.id)}><Upload fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Re-run detectors">
                      <IconButton size="small" onClick={() => runBatch.mutate(b.id)}><PlayArrow fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Open dashboard">
                      <IconButton size="small" onClick={() => router.push(`/fieldwork-qc/${b.id}`)}><Search fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <input ref={fileInput} type="file" accept=".csv,.xlsx,.xls" hidden onChange={onFileChosen} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New QC batch</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Batch name" value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus />
            {projects && projects.length > 0 ? (
              <TextField select label="Project" value={projectId} onChange={(e) => setProjectId(e.target.value)} fullWidth>
                {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </TextField>
            ) : (
              <TextField label="Project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} fullWidth
                         helperText="No project list available — paste a project ID" />
            )}
            {createBatch.isError && <Alert severity="error">Could not create batch.</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onCreate} disabled={!name || !projectId || createBatch.isPending}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Shell>
  );
}
