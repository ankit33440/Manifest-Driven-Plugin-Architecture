import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  CreditCard,
  FilePenLine,
  FolderOpen,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

export interface DeveloperSidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  detail: string;
}

export interface ActionItem {
  id: string;
  received: string;
  project: string;
  reference: string;
  issue: string;
  summary: string;
  ctaLabel: string;
  ctaVariant: 'success' | 'neutral';
}

export interface UpdateItem {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
}

export interface LedgerEntry {
  id: string;
  type: string;
  typeTone: 'success' | 'info' | 'danger';
  date: string;
  owner: string;
  buyer: string;
  projectName: string;
  vintage: string;
  quantity: string;
  serialNumber: string;
}

export const dashboardSearchPlaceholder =
  'Search projects, issuers, or serial numbers...';

export const dashboardFooterCopy =
  "© 2026 Nature's Registry • All rights reserved";

export const developerSidebarItems: DeveloperSidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'projects', label: 'Projects', icon: FolderOpen, href: '/projects' },
  { id: 'drafts', label: 'Drafts', icon: FilePenLine },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'ledger', label: 'Ledger', icon: ArrowLeftRight },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const developerStats: DashboardStat[] = [
  {
    id: 'portfolio-credits',
    label: 'Total Portfolio Credits',
    value: '1,284,050',
    detail: '88% Verified',
  },
  {
    id: 'under-verification',
    label: 'Under Verification',
    value: '412,900',
    detail: '3 batches in final audit',
  },
  {
    id: 'retired-credits',
    label: 'Retired Credits',
    value: '444,500',
    detail: 'Permanently Off-set',
  },
];

export const developerActionItems: ActionItem[] = [
  {
    id: 'amazonia-revision',
    received: 'Received: Oct 24, 2023',
    project: 'Amazonia Reforest Alpha',
    reference: '#ARA-992',
    issue: 'Verifier Requested for Revision',
    summary:
      'Verifier identified 14% variance in historical deforestation rates vs PDD submission. Correction required for CO2 calculations.',
    ctaLabel: 'Fix Issue',
    ctaVariant: 'success',
  },
  {
    id: 'patagonia-assign-request',
    received: 'Received: Oct 24, 2023',
    project: 'Patagonian Peatland',
    reference: '#ARA-992',
    issue: 'Assign Request Rejected',
    summary:
      'Verifier rejected the assign request search for another verifier.',
    ctaLabel: 'Search Verifier',
    ctaVariant: 'success',
  },
  {
    id: 'congo-land-tenure',
    received: 'Received: Oct 22, 2023',
    project: 'Congo Basin Peatlands',
    reference: '#CBP-041',
    issue: 'Clarification Requested: Land Tenure',
    summary:
      'Certifier requires additional notarized community consent forms for the North-West buffer zone segment.',
    ctaLabel: 'Respond',
    ctaVariant: 'success',
  },
  {
    id: 'vietnam-doc-update',
    received: 'Received: Oct 19, 2023',
    project: 'Vietnam Coastal Mangroves',
    reference: '#VCM-112',
    issue: 'Documentation Update Required',
    summary:
      "Update the registry's project contact details to match the recent structural changes in your entity registration.",
    ctaLabel: 'View Details',
    ctaVariant: 'neutral',
  },
];

export const developerRecentUpdates: UpdateItem[] = [
  {
    id: 'credit-issued-pacific-blue',
    title: 'Credits Issued',
    summary: '12,400 tCO2e issued to Pacific Blue Kelp SMC',
    timestamp: '5m Ago',
  },
  {
    id: 'credit-issued-kelp',
    title: 'Credits Issued',
    summary: '12,400 tCO2e issued to Pacific Blue Kelp SMC',
    timestamp: '5m Ago',
  },
  {
    id: 'revision-required',
    title: 'Revision Required',
    summary:
      'Non-conformance report issued in Patagonian Peatland Project during verification.',
    timestamp: '10m Ago',
  },
  {
    id: 'credit-issued-amazonia',
    title: 'Credits Issued',
    summary: '50,000 tCO2e issued to Amazonia Reforest Alpha',
    timestamp: '10m Ago',
  },
  {
    id: 'registry-sync',
    title: 'Registry Sync Complete',
    summary:
      'Cross-chain reconciliation with Toucan Protocol completed.',
    timestamp: '1h 30m Ago',
  },
  {
    id: 'new-project',
    title: 'New Project Listed',
    summary: 'New Project: Kolkata Solar & Wind successfully registered',
    timestamp: 'Oct 24, 2023 1 PM',
  },
];

export const developerLedgerEntries: LedgerEntry[] = [
  {
    id: 'entry-1',
    type: 'Credit Issued',
    typeTone: 'success',
    date: 'Oct 24, 2023',
    owner: 'Amazonia Dev',
    buyer: '—',
    projectName: 'Amazonia Reforest Alpha',
    vintage: '2023',
    quantity: '124,000',
    serialNumber: 'LL-BL-AR2-12-45',
  },
  {
    id: 'entry-2',
    type: 'Trade Settlement',
    typeTone: 'info',
    date: 'Oct 22, 2023',
    owner: 'EcoTrust Basin',
    buyer: 'TerraCorp Int.',
    projectName: 'Congo Basin Peatlands',
    vintage: '2022',
    quantity: '45,200',
    serialNumber: 'LL-CB-P3-22-452',
  },
  {
    id: 'entry-3',
    type: 'Retired Credits',
    typeTone: 'danger',
    date: 'Oct 20, 2023',
    owner: 'Global Green',
    buyer: '—',
    projectName: 'Rajasthan Solar Capture',
    vintage: '2021',
    quantity: '8,500',
    serialNumber: 'LL-IN-SOL-21-6385',
  },
  {
    id: 'entry-4',
    type: 'Credit Issued',
    typeTone: 'success',
    date: 'Oct 18, 2023',
    owner: 'VNM Mangrove Org',
    buyer: '—',
    projectName: 'Vietnam Coastal Mangroves',
    vintage: '2023',
    quantity: '52,300',
    serialNumber: 'LL-VN-MAN-23-652',
  },
];
