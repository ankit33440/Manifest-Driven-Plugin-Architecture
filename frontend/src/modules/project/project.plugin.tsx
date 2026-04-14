import { componentRegistry } from '../../core/component-registry';
import ProjectDeveloperDashboard from './components/ProjectDeveloperDashboard';
import ProjectStatsWidget from './components/ProjectStatsWidget';
import ProjectCreatePage from './pages/ProjectCreatePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectListPage from './pages/ProjectListPage';

export default function register() {
  componentRegistry.register('ProjectListPage', ProjectListPage);
  componentRegistry.register('ProjectWizardPage', ProjectCreatePage);
  componentRegistry.register('ProjectDetailPage', ProjectDetailPage);
  componentRegistry.register('ProjectStatsWidget', ProjectStatsWidget);
  componentRegistry.register('ProjectDeveloperDashboard', ProjectDeveloperDashboard);
}
