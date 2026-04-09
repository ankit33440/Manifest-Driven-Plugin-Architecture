import ProjectListPage from './pages/ProjectListPage';
import ProjectCreatePage from './pages/ProjectCreatePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectStatsWidget from './components/ProjectStatsWidget';
import { componentRegistry } from '../../core/component-registry';

export default function register() {
  componentRegistry.register('ProjectListPage', ProjectListPage);
  componentRegistry.register('ProjectCreatePage', ProjectCreatePage);
  componentRegistry.register('ProjectDetailPage', ProjectDetailPage);
  componentRegistry.register('ProjectStatsWidget', ProjectStatsWidget);
}
