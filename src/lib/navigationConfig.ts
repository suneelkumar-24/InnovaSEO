import {
  Compass,
  Target,
  Radio,
  GitCompare,
  Store,
  Globe,
  Bookmark,
  Settings,
  ShieldCheck,
  Zap,
  Layers,
  Activity,
  FileCheck2,
  Search,
  Sparkles,
  TrendingUp,
  Cpu,
  BarChart3,
  Flame,
  FileSpreadsheet,
  KeyRound,
  Sliders,
  FolderLock,
  Workflow,
  ShieldAlert,
  Server,
  Download,
  BookOpen,
  DollarSign,
  LayoutDashboard,
  History,
  type LucideIcon,
} from 'lucide-react';

export interface SubNavItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'purple' | 'amber' | 'emerald' | 'blue' | 'rose';
  isExternal?: boolean;
  description?: string;
}

export interface SubNavSection {
  title: string;
  items: SubNavItem[];
}

export interface PrimaryModule {
  id: string;
  name: string;
  shortLabel: string;
  icon: LucideIcon;
  baseHref: string;
  description: string;
  isUpcoming?: boolean;
  sections: SubNavSection[];
}

export const NAVIGATION_MODULES: PrimaryModule[] = [
  {
    id: 'niche-hunter',
    name: 'Niche Hunter Suite',
    shortLabel: 'Hunter',
    icon: Target,
    baseHref: '/dashboard',
    description: 'Complete micro-niche discovery, 12-point checklist audit, DR 0-5 anomaly hunter, SERP vulnerability, and monetization blueprints.',
    sections: [
      {
        title: 'DASHBOARD & OVERVIEW',
        items: [
          {
            id: 'dashboard',
            title: 'Overview Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            description: 'Live SEBT-NEXT scores, health overview, and top opportunities',
          },
        ],
      },
      {
        title: 'NICHE DISCOVERY & RESEARCH',
        items: [
          {
            id: 'hunter-studio',
            title: 'Hunter Studio (New Run)',
            href: '/research/new',
            icon: Sparkles,
            badge: 'AI 2.0',
            badgeColor: 'purple',
            description: 'Full 15-phase micro-niche discovery & live SERP audit',
          },
          {
            id: 'checklist-12',
            title: '12-Point Checklist Hub',
            href: '/checklist',
            icon: FileCheck2,
            badge: 'Master',
            badgeColor: 'emerald',
            description: '12-point viability checklist & young domain benchmarks',
          },
          {
            id: 'anomaly-scanner',
            title: 'DR 0-20 Anomaly Hunter',
            href: '/anomalies',
            icon: Flame,
            badge: 'DR < 20',
            badgeColor: 'amber',
            description: 'Target challenger brands and low-DR (0-20) ranking anomalies',
          },
          {
            id: 'autopilot-radar',
            title: 'AI Autopilot Radar',
            href: '/autopilot',
            icon: Radio,
            badge: 'Live',
            badgeColor: 'emerald',
            description: '24/7 background micro-niche scanner & drift tracker',
          },
        ],
      },
      {
        title: 'COMPETITIVE & SERP ANALYSIS',
        items: [
          {
            id: 'compare-matrix',
            title: 'Compare Niches Matrix',
            href: '/compare',
            icon: GitCompare,
            description: 'Side-by-side multi-signal viability comparison',
          },
          {
            id: 'dedicated-detector',
            title: 'Dedicated Site Detector',
            href: '/detector',
            icon: Target,
            badge: '70% Rule',
            badgeColor: 'blue',
            description: 'Detect dedicated micro-niche sites vs generic portals',
          },
        ],
      },
      {
        title: 'MONETIZATION & BLUEPRINTS',
        items: [
          {
            id: 'programmatic-blueprint',
            title: 'Programmatic DB Builder',
            href: '/blueprints?tab=programmatic',
            icon: Layers,
            badge: '500+ URLs',
            badgeColor: 'purple',
            description: 'Specs, menu prices, local dimension programmatic blueprints',
          },
          {
            id: 'high-rpm-calc',
            title: 'Tier 1 RPM Calculator ($30-$52)',
            href: '/blueprints?tab=calculator',
            icon: DollarSign,
            description: 'Calculate monthly revenue at #1, #2, and #3 rankings',
          },
          {
            id: 'marketplace-reverse',
            title: 'Marketplace Exit Blueprints',
            href: '/blueprints?tab=marketplace',
            icon: Store,
            badge: 'Flippa',
            badgeColor: 'rose',
            description: 'Reverse engineer Flippa / Empire Flippers listings',
          },
        ],
      },
      {
        title: 'VAULT & MANAGEMENT',
        items: [
          {
            id: 'saved-vault',
            title: 'Saved Niches Vault',
            href: '/saved',
            icon: Bookmark,
            description: 'Archived profitable niches and saved dossiers',
          },
          {
            id: 'search-history',
            title: 'Search & Discovery History',
            href: '/history',
            icon: History,
            badge: 'Audit',
            badgeColor: 'purple',
            description: 'Audit trail of manual user searches and Auto Hunter radar deductions',
          },
          {
            id: 'settings-api',
            title: 'Settings & AI APIs',
            href: '/settings',
            icon: Settings,
            description: 'AI Keys (Gemini/Claude), Moz API, SEBT-NEXT weights',
          },
          {
            id: 'admin-center',
            title: 'Admin Control',
            href: '/admin',
            icon: ShieldCheck,
            badge: 'Root',
            badgeColor: 'rose',
            description: 'System-level telemetry and database logs',
          },
        ],
      },
    ],
  },
  {
    id: 'domain-scout',
    name: 'Domain Scout & WHOIS',
    shortLabel: 'Domains',
    icon: Globe,
    baseHref: '#',
    isUpcoming: true,
    description: 'Instant domain availability, WHOIS lookup, and DNS verification via Hostinger MCP tools.',
    sections: [
      {
        title: 'DOMAIN TOOLS (UPCOMING)',
        items: [
          {
            id: 'domain-suggestions',
            title: 'AI Domain Name Generator',
            href: '/settings',
            icon: Sparkles,
            badge: 'Soon',
            badgeColor: 'purple',
            description: 'Generate high-brandable micro-niche domain names',
          },
          {
            id: 'domain-availability',
            title: 'Hostinger WHOIS & Verification',
            href: '/settings',
            icon: Globe,
            badge: 'Soon',
            badgeColor: 'blue',
            description: 'Check domain status and nameservers in real-time',
          },
        ],
      },
    ],
  },
  {
    id: 'content-ai',
    name: 'AI Content & Silo Writer',
    shortLabel: 'Content',
    icon: BookOpen,
    baseHref: '#',
    isUpcoming: true,
    description: 'Auto-generate 30-50 topical authority cluster articles and programmatic data tables.',
    sections: [
      {
        title: 'CONTENT PIPELINE (UPCOMING)',
        items: [
          {
            id: 'cluster-writer',
            title: 'Topical Silo Article Generator',
            href: '/dashboard',
            icon: Layers,
            badge: 'Soon',
            badgeColor: 'amber',
            description: 'Generate 2,500+ word AI-Overview immune articles',
          },
        ],
      },
    ],
  },
  {
    id: 'backlink-spy',
    name: 'Backlink & SERP Spy',
    shortLabel: 'Links',
    icon: Zap,
    baseHref: '#',
    isUpcoming: true,
    description: 'Monitor competitor referring domains, anchor texts, and weak backlink profiles.',
    sections: [
      {
        title: 'LINK INTELLIGENCE (UPCOMING)',
        items: [
          {
            id: 'link-gap',
            title: 'Competitor Backlink Gap',
            href: '/compare',
            icon: Target,
            badge: 'Soon',
            badgeColor: 'blue',
            description: 'Reverse engineer low-DR competitor backlink sources',
          },
        ],
      },
    ],
  },
];
