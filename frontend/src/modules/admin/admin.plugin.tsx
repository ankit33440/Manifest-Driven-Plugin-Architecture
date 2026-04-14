import { componentRegistry } from '../../core/component-registry';
import AdminDashboard from './components/AdminDashboard';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAuditPage from './pages/AdminAuditPage';

export default function register() {
  componentRegistry.register('AdminDashboard', AdminDashboard);
  componentRegistry.register('AdminDashboardPage', AdminDashboardPage);
  componentRegistry.register('AdminUsersPage', AdminUsersPage);
  componentRegistry.register('AdminAuditPage', AdminAuditPage);
}
