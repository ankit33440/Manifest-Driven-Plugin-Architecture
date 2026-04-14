import type { LucideIcon } from 'lucide-react';
import {
  ClipboardCheck,
  FolderKanban,
  LifeBuoy,
  Plus,
  Upload,
} from 'lucide-react';

export interface DeveloperQuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export interface DeveloperSupportLink {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const DASHBOARD_SEARCH_PLACEHOLDER =
  'Search projects, issuers, or serial numbers...';

export const DASHBOARD_FOOTER_COPY =
  "© 2026 Nature's Registry • All rights reserved";

export const developerQuickActions: DeveloperQuickAction[] = [
  {
    id: 'register-project',
    label: 'Register New Project',
    description: 'Start a new project submission and invite collaborators.',
    icon: Plus,
    href: '/projects/new',
  },
  {
    id: 'review-drafts',
    label: 'Review Drafts',
    description: 'Continue editing incomplete submissions before verification.',
    icon: ClipboardCheck,
    href: '/projects',
  },
  {
    id: 'bulk-upload',
    label: 'Bulk Upload',
    description: 'Prepare document packages and serial references for import.',
    icon: Upload,
    href: '/projects/new',
  },
];

export const developerSupportLinks: DeveloperSupportLink[] = [
  {
    id: 'registry-guide',
    label: 'Registry guidance',
    description: 'Check required documents and onboarding guidance.',
    icon: FolderKanban,
  },
  {
    id: 'contact-support',
    label: 'Need help?',
    description: 'Contact the registry team for submission support.',
    icon: LifeBuoy,
  },
];
