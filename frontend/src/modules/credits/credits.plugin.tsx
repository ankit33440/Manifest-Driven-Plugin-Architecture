import CreditListPage from './pages/CreditListPage';
import CreditDetailPage from './pages/CreditDetailPage';
import CreditStatsWidget from './components/CreditStatsWidget';
import { componentRegistry } from '../../core/component-registry';

export default function register() {
  componentRegistry.register('CreditListPage', CreditListPage);
  componentRegistry.register('CreditDetailPage', CreditDetailPage);
  componentRegistry.register('CreditStatsWidget', CreditStatsWidget);
}
