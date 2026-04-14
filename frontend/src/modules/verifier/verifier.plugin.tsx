import { componentRegistry } from '../../core/component-registry';
import VerifierDashboard from './components/VerifierDashboard';
import VerifierQueuePage from './pages/VerifierQueuePage';
import VerifierProjectDetailPage from './pages/VerifierProjectDetailPage';

export default function register() {
  componentRegistry.register('VerifierDashboard', VerifierDashboard);
  componentRegistry.register('VerifierQueuePage', VerifierQueuePage);
  componentRegistry.register('VerifierProjectDetailPage', VerifierProjectDetailPage);
}
