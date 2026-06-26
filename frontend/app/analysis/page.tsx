'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import { Analytics } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';

export default function AnalysisPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            AI-powered research analysis and insights
          </Typography>

          <Card>
            <CardContent>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                }}
              >
                <Analytics sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Analysis Tools Coming Soon
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Advanced AI-powered analysis features will be available here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </AppLayout>
    </ProtectedRoute>
  );
}
