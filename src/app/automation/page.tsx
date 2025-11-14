'use client';

import AutomationDashboard from '@/components/automation/AutomationDashboard';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AutomationPage() {
  return (
    <ProtectedRoute>
      <AutomationDashboard />
    </ProtectedRoute>
  );
}