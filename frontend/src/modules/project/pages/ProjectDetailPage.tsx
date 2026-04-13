import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAuth } from '../../../core/auth/AuthContext';
import { getSectionsFor } from '../../../core/plugin-loader';
import PageLoader from '../../../components/PageLoader';
import ProjectInfo from '../components/ProjectInfo';
import SubmitAction from '../components/SubmitAction';
import ApprovalAction from '../components/ApprovalAction';
import ProjectTimeline from '../components/ProjectTimeline';

const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'project-info': ProjectInfo,
  'submit-action': SubmitAction,
  'approval-action': ApprovalAction,
  'project-timeline': ProjectTimeline,
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/projects/${id}`)
      .then((r) => setProject(r.data))
      .catch(() => setError('Project not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader />;
  if (error || !project) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error || 'Project not found'}</p>
      </div>
    );
  }

  const sections = user ? getSectionsFor('ProjectDetailPage', user.role) : [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{project.name}</h1>

      <div className="space-y-4">
        {sections.map((section) => {
          const SectionComponent = SECTION_COMPONENTS[section.id];
          console.log("Section Component", SectionComponent);
          if (!SectionComponent) return null;
          return (
            <SectionComponent
              key={section.id}
              project={project}
              onUpdate={load}
            />
          );
        })}
      </div>
    </div>
  );
}
