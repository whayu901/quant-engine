// Single source of truth for Fieldwork QC status -> MUI palette colour.
//   pass -> success | flag/needs_review/review -> warning | reject -> error
//   ineligible -> info | pending/unknown -> default

export type MuiColor =
  | 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'secondary';

export function qcStatusColor(status: string): MuiColor {
  switch (status) {
    case 'pass':
      return 'success';
    case 'flag':
    case 'needs_review':
    case 'review':
      return 'warning';
    case 'reject':
      return 'error';
    case 'ineligible':
      return 'info';
    default:
      return 'default';
  }
}

export function severityColor(severity: string): MuiColor {
  switch (severity) {
    case 'critical':
      return 'error';
    case 'warn':
      return 'warning';
    default:
      return 'info';
  }
}

// Batch lifecycle status colour.
export function batchStatusColor(status: string): MuiColor {
  switch (status) {
    case 'completed':
      return 'success';
    case 'running':
    case 'importing':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
}
