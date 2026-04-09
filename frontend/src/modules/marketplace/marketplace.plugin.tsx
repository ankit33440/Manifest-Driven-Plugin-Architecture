import MarketplaceListPage from './pages/MarketplaceListPage';
import MarketplaceDetailPage from './pages/MarketplaceDetailPage';
import BuyAction from './components/BuyAction';
import MarketplaceStatsWidget from './components/MarketplaceStatsWidget';
import { componentRegistry } from '../../core/component-registry';

export default function register() {
  componentRegistry.register('MarketplaceListPage', MarketplaceListPage);
  componentRegistry.register('MarketplaceDetailPage', MarketplaceDetailPage);
  componentRegistry.register('BuyAction', BuyAction);
  componentRegistry.register('MarketplaceStatsWidget', MarketplaceStatsWidget);
}
