import React from 'react';
import { PageView } from '../types';
import { User } from 'firebase/auth';
import { AdminDashboard } from './AdminDashboard';

interface AdminPageProps {
  onNavigate: (view: PageView) => void;
  authUser: User | null;
  isAdmin: boolean;
}

export const AdminPage: React.FC<AdminPageProps> = (props) => {
  return <AdminDashboard {...props} />;
};

export { AdminDashboard };
