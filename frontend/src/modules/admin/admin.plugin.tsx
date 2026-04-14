import { componentRegistry } from '../../core/component-registry';
import AdminDashboard from './components/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAuditPage from './pages/AdminAuditPage';

export default function register() {
  componentRegistry.register('AdminDashboard', AdminDashboard);
  componentRegistry.register('AdminUsersPage', AdminUsersPage);
  componentRegistry.register('AdminAuditPage', AdminAuditPage);
}
