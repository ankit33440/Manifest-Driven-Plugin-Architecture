import ReportDashboardPage from './pages/ReportDashboardPage';
import { componentRegistry } from '../../core/component-registry';
import ReportWidgets from './components/ReportWidgets';
// Important: Must be exported as `default`
export default function register() {
  componentRegistry.register('ReportDashboardPage', ReportDashboardPage);
  componentRegistry.register('ReportWidgets', ReportWidgets);
}