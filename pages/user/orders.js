import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import UserDashboardLayout from '../../components/layout/UserDashboardLayout';

export default function UserOrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth?type=login');
    }
  }, [user, isLoading, router]);

  // Show loading or nothing while checking authentication
  if (isLoading || !user) {
    return null;
  }

  return <UserDashboardLayout initialSection="orders" forceSection="orders" />;
}