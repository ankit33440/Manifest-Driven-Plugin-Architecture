import { componentRegistry } from '../../core/component-registry';
import CertifierDashboard from './components/CertifierDashboard';
import CertifierQueuePage from './pages/CertifierQueuePage';
import CertifierProjectDetailPage from './pages/CertifierProjectDetailPage';

export default function register() {
  componentRegistry.register('CertifierDashboard', CertifierDashboard);
  componentRegistry.register('CertifierQueuePage', CertifierQueuePage);
  componentRegistry.register('CertifierProjectDetailPage', CertifierProjectDetailPage);
}
