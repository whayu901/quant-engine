'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Admin Panel
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            System administration and user management
          </Typography>

          <Card>
            <CardContent>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                }}
              >
                <AdminPanelSettings sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Admin Features Coming Soon
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administrative tools and user management will be available here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </AppLayout>
    </ProtectedRoute>
  );
}
