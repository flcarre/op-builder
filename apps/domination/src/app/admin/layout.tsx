'use client';

import { AdminAuthProvider, RequireAuth } from '@/components/AdminAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <RequireAuth>{children}</RequireAuth>
    </AdminAuthProvider>
  );
}
