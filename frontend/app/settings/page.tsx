'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Manage your account and application preferences
          </Typography>

          <Card>
            <CardContent>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                }}
              >
                <Settings sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Settings Coming Soon
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  User preferences and account settings will be available here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </AppLayout>
    </ProtectedRoute>
  );
}
