'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Cpu,
  Boxes,
  Trash2,
  Mail,
  User,
  FileText,
  Search,
  ExternalLink,
} from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/components/ui/Toast';

// Layout components
import { Topbar } from '@/components/layout/Topbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Footer } from '@/components/layout/Footer';

// UI components
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Radio } from '@/components/ui/Radio';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Popover } from '@/components/ui/Popover';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal } from '@/components/ui/Modal';
import { Dialog } from '@/components/ui/Dialog';
import { Tabs } from '@/components/ui/Tabs';
import { Accordion } from '@/components/ui/Accordion';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Notification } from '@/components/ui/Notification';
import { Divider } from '@/components/ui/Divider';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  // Sidebar responsive state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Showcase');

  // Interactive showcase states
  const [inputValue, setInputValue] = useState('');
  const [checkedCheckbox, setCheckedCheckbox] = useState(true);
  const [radioValue, setRadioValue] = useState('option-1');
  const [switchValue, setSwitchValue] = useState(false);
  const [selectValue, setSelectValue] = useState('standard');
  const [progressVal, setProgressVal] = useState(65);

  // Modal / Dialog / Overlay toggle states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogConfirming, setIsDialogConfirming] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState('details');
  const [currentPage, setCurrentPage] = useState(2);

  // Chips mock data
  const [chips, setChips] = useState([
    { id: '1', label: 'Autonomous Agents' },
    { id: '2', label: 'Data Processing' },
    { id: '3', label: 'React 19' },
  ]);

  const removeChip = (id: string) => {
    setChips(chips.filter((c) => c.id !== id));
    toast('Chip Removed', 'The item was deleted from the search list.', 'warning');
  };

  const handleDialogConfirm = () => {
    setIsDialogConfirming(true);
    setTimeout(() => {
      setIsDialogConfirming(false);
      setIsDialogOpen(false);
      toast('Operation Successful', 'Workspace resources have been fully cleared.', 'success');
    }, 1500);
  };

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col transition-colors duration-200">
      {/* Topbar navigation & brand */}
      <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Layout Container */}
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem={activeTab}
          onItemSelect={(id) => setActiveTab(id)}
        />

        {/* Content Section */}
        <main className="flex-1 overflow-x-hidden py-6 md:py-10">
          <Container>
            {activeTab === 'Showcase' && (
              <div className="animate-in fade-in space-y-10 duration-300">
                {/* Intro Hero Section */}
                <div className="border-border from-surface to-neutral-light/30 rounded-2xl border bg-gradient-to-tr p-8 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-2">
                      <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                        <Sparkles className="h-3 w-3" />
                        Sprint 2 Complete
                      </div>
                      <h1 className="text-text-primary text-3xl font-extrabold tracking-tight md:text-4xl">
                        AgentOps AI Studio Design System
                      </h1>
                      <p className="text-text-secondary max-w-2xl text-base leading-relaxed">
                        Welcome to our official enterprise Design System playground. This workspace
                        showcases our reusable core components, visual identity, design tokens, and
                        layouts built to match world-class engineering standards.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="primary"
                        onClick={() => window.location.href = '/dashboard'}
                        rightIcon={<ExternalLink className="h-4 w-4" />}
                      >
                        Abrir Agent Studio Workspace
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('Tokens')}
                        rightIcon={<Sliders className="h-4 w-4" />}
                      >
                        Explore Tokens
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Status / Highlights Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <Card interactive onClick={() => setActiveTab('Tokens')}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-text-secondary text-sm font-semibold tracking-wider uppercase">
                        Design Tokens
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-text-primary text-2xl font-bold">12 Categories</p>
                      <p className="text-text-muted mt-1 text-xs">
                        Colors, shadows, typography, borders
                      </p>
                    </CardContent>
                  </Card>

                  <Card interactive onClick={() => setActiveTab('Buttons')}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-text-secondary text-sm font-semibold tracking-wider uppercase">
                        Buttons & Badges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-primary text-2xl font-bold">6 Components</p>
                      <p className="text-text-muted mt-1 text-xs">
                        Buttons, icon buttons, badges, chips, avatars
                      </p>
                    </CardContent>
                  </Card>

                  <Card interactive onClick={() => setActiveTab('Inputs')}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-text-secondary text-sm font-semibold tracking-wider uppercase">
                        Form Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-success text-2xl font-bold">7 Components</p>
                      <p className="text-text-muted mt-1 text-xs">
                        Inputs, switches, checkboxes, custom select
                      </p>
                    </CardContent>
                  </Card>

                  <Card interactive onClick={() => setActiveTab('Overlays')}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-text-secondary text-sm font-semibold tracking-wider uppercase">
                        Overlays & Dialogs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-accent text-2xl font-bold">9 Components</p>
                      <p className="text-text-muted mt-1 text-xs">
                        Modals, dropdowns, popovers, tooltip, dialogs
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Theme System Preview */}
                <Section
                  title="Theme System & Visual Identity"
                  subtitle="Fully dark/light responsive layout. Try switching themes!"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card className="space-y-4 p-6">
                      <h3 className="text-lg font-bold">Theme State Information</h3>
                      <p className="text-text-secondary text-sm">
                        The current active theme is{' '}
                        <strong className="text-primary uppercase">{theme}</strong>. The interface
                        responds seamlessly to system settings as well as manual theme toggle. No
                        colors are hardcoded inside CSS properties or React files; everything is
                        managed using robust CSS variables.
                      </p>
                      <div className="flex gap-4">
                        <Button variant="outline" onClick={toggleTheme}>
                          Toggle Theme ({theme === 'light' ? 'Dark' : 'Light'})
                        </Button>
                      </div>
                    </Card>

                    <Card className="space-y-4 p-6">
                      <h3 className="text-lg font-bold">Accessibility (WCAG) compliance</h3>
                      <p className="text-text-secondary text-sm">
                        Every single button, input, toggle, dropdown menu, and tab is built
                        prioritizing accessibility. Focus indicators are highly visible, inputs have
                        proper labels and helper IDs, keyboard navigation behaves natively, and
                        modals trap focus for superior compatibility.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="success">Accessible Colors</Badge>
                        <Badge variant="primary">Focus Ring Styled</Badge>
                        <Badge variant="outline">ARIA Tagged</Badge>
                      </div>
                    </Card>
                  </div>
                </Section>
              </div>
            )}

            {/* Design Tokens Section */}
            {activeTab === 'Tokens' && (
              <div className="animate-in fade-in space-y-10 duration-300">
                <Breadcrumb items={[{ label: 'Design System' }, { label: 'Design Tokens' }]} />

                <Section
                  title="Design Tokens"
                  subtitle="Premium CSS/Tailwind variables defining the foundational visual identity of AgentOps AI Studio."
                >
                  <div className="space-y-8">
                    {/* Primary Palette */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold">Color Identity Palette</h3>
                      <p className="text-text-muted text-sm">
                        Hover or interact to inspect the system tokens.
                      </p>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        <div className="bg-primary space-y-2 rounded-xl p-4 text-white shadow-sm">
                          <p className="text-sm font-bold">Primary</p>
                          <p className="text-[10px] opacity-80">--primary</p>
                        </div>
                        <div className="bg-secondary dark:text-neutral-dark space-y-2 rounded-xl p-4 text-white shadow-sm">
                          <p className="text-sm font-bold">Secondary</p>
                          <p className="text-[10px] opacity-80">--secondary</p>
                        </div>
                        <div className="bg-accent dark:text-neutral-dark space-y-2 rounded-xl p-4 text-white shadow-sm">
                          <p className="text-sm font-bold">Accent</p>
                          <p className="text-[10px] opacity-80">--accent</p>
                        </div>
                        <div className="bg-success dark:text-neutral-dark space-y-2 rounded-xl p-4 text-white shadow-sm">
                          <p className="text-sm font-bold">Success</p>
                          <p className="text-[10px] opacity-80">--success</p>
                        </div>
                        <div className="bg-warning dark:text-neutral-dark space-y-2 rounded-xl p-4 text-white shadow-sm">
                          <p className="text-sm font-bold">Warning</p>
                          <p className="text-[10px] opacity-80">--warning</p>
                        </div>
                        <div className="bg-danger dark:text-neutral-dark space-y-2 rounded-xl p-4 text-white shadow-sm">
                          <p className="text-sm font-bold">Danger</p>
                          <p className="text-[10px] opacity-80">--danger</p>
                        </div>
                      </div>
                    </div>

                    {/* Neutral & Surfaces */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold">Surfaces & Text Tokens</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="border-border bg-surface rounded-xl border p-4">
                          <p className="text-text-primary text-sm font-bold">Surface Background</p>
                          <p className="text-text-secondary mt-1 text-xs">bg-surface / --surface</p>
                        </div>
                        <div className="border-border bg-card rounded-xl border p-4">
                          <p className="text-text-primary text-sm font-bold">Card Component</p>
                          <p className="text-text-secondary mt-1 text-xs">bg-card / --card</p>
                        </div>
                        <div className="border-border bg-neutral-light rounded-xl border p-4">
                          <p className="text-text-primary text-sm font-bold">Neutral Gray/Light</p>
                          <p className="text-text-secondary mt-1 text-xs">bg-neutral-light</p>
                        </div>
                        <div className="border-border rounded-xl border p-4">
                          <p className="text-text-primary text-sm font-bold">Primary Text State</p>
                          <p className="text-text-secondary mt-0.5 text-xs">Secondary Text State</p>
                          <p className="text-text-muted mt-0.5 text-[11px]">Muted Text State</p>
                        </div>
                      </div>
                    </div>

                    {/* Spacing & Borders */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold">Typography & Border Radius Tokens</h3>
                      <div className="border-border bg-surface rounded-xl border p-6">
                        <div className="space-y-6">
                          <div>
                            <p className="text-text-muted mb-1 text-xs font-bold tracking-wider uppercase">
                              Display Sample
                            </p>
                            <h1 className="text-text-primary text-4xl font-extrabold tracking-tight md:text-5xl">
                              Beautiful Multi-Agent Systems
                            </h1>
                          </div>
                          <Divider />
                          <div>
                            <p className="text-text-muted mb-1 text-xs font-bold tracking-wider uppercase">
                              Heading / Title Sample
                            </p>
                            <h2 className="text-text-primary text-xl font-bold tracking-tight md:text-2xl">
                              Deploy and Orchestrate Models
                            </h2>
                          </div>
                          <Divider />
                          <div>
                            <p className="text-text-muted mb-1 text-xs font-bold tracking-wider uppercase">
                              Interactive Radius tokens
                            </p>
                            <div className="mt-2 flex flex-wrap gap-4">
                              <div className="border-border rounded-sm border px-4 py-2 text-xs">
                                Small (radius-sm)
                              </div>
                              <div className="border-border rounded-md border px-4 py-2 text-xs">
                                Medium (radius-md)
                              </div>
                              <div className="border-border rounded-lg border px-4 py-2 text-xs">
                                Large (radius-lg)
                              </div>
                              <div className="border-border rounded-xl border px-4 py-2 text-xs">
                                XLarge (radius-xl)
                              </div>
                              <div className="border-border rounded-full border px-4 py-2 text-xs">
                                Full (radius-full)
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* Buttons Section */}
            {activeTab === 'Buttons' && (
              <div className="animate-in fade-in space-y-10 duration-300">
                <Breadcrumb items={[{ label: 'Design System' }, { label: 'Buttons & Badges' }]} />

                <Section
                  title="Buttons & Badges Showcase"
                  subtitle="Interactive display of our core control and label tagging components."
                >
                  <div className="space-y-8">
                    {/* Buttons List */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Button Component Variants & Sizes</CardTitle>
                        <CardDescription>
                          Custom button variants supporting loading states, prefixes, suffixes and
                          active click scaling.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                          <Button variant="primary">Primary Action</Button>
                          <Button variant="secondary">Secondary Action</Button>
                          <Button variant="outline">Outline Border</Button>
                          <Button variant="ghost">Ghost Trigger</Button>
                          <Button variant="link">Link button</Button>
                          <Button variant="success">Success</Button>
                          <Button variant="warning">Warning</Button>
                          <Button variant="danger">Danger</Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <Button variant="primary" size="xs">
                            Extra Small
                          </Button>
                          <Button variant="primary" size="sm">
                            Small Action
                          </Button>
                          <Button variant="primary" size="md">
                            Medium Standard
                          </Button>
                          <Button variant="primary" size="lg">
                            Large Hero
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <Button variant="primary" isLoading>
                            Processing Data
                          </Button>
                          <Button variant="outline" leftIcon={<Mail className="h-4 w-4" />}>
                            Email Prefix
                          </Button>
                          <Button
                            variant="secondary"
                            rightIcon={<ExternalLink className="h-4 w-4" />}
                          >
                            Launch Suffix
                          </Button>
                          <Button variant="outline" disabled>
                            Disabled Action
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* IconButtons, Badges & Avatars */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>IconButtons & Badges</CardTitle>
                          <CardDescription>Icon actions and status pill tagging.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-center gap-3">
                            <IconButton variant="outline" aria-label="Mail action">
                              <Mail className="h-4 w-4" />
                            </IconButton>
                            <IconButton variant="primary" aria-label="Add user">
                              <User className="h-4 w-4" />
                            </IconButton>
                            <IconButton variant="success" aria-label="Launch item">
                              <ExternalLink className="h-4 w-4" />
                            </IconButton>
                            <IconButton variant="danger" aria-label="Remove item">
                              <Trash2 className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              variant="outline"
                              isLoading
                              aria-label="Loading icon button"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2.5">
                            <Badge variant="primary">Primary Badge</Badge>
                            <Badge variant="secondary">Secondary Badge</Badge>
                            <Badge variant="outline">Outline Badge</Badge>
                            <Badge variant="success">Active Status</Badge>
                            <Badge variant="warning">Pending Queue</Badge>
                            <Badge variant="danger">Critically Failed</Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            <Badge variant="primary" size="sm">
                              Small Tag
                            </Badge>
                            <Badge variant="secondary" size="md">
                              Medium Pill
                            </Badge>
                            <Badge variant="success" size="lg" pill>
                              Large Full Pill
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Avatars & Dynamic Chips</CardTitle>
                          <CardDescription>
                            Profiles representation and tag dismissible chips.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Avatars */}
                          <div className="flex items-center gap-4">
                            <Avatar size="sm" fallback="SM" />
                            <Avatar
                              size="md"
                              fallback="MD"
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
                            />
                            <Avatar
                              size="lg"
                              fallback="LG"
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop"
                            />
                            <Avatar size="xl" fallback="XL" />
                          </div>

                          {/* Chips */}
                          <div className="flex flex-wrap gap-2">
                            {chips.length > 0 ? (
                              chips.map((chip) => (
                                <Chip
                                  key={chip.id}
                                  variant="primary"
                                  onRemove={() => removeChip(chip.id)}
                                >
                                  {chip.label}
                                </Chip>
                              ))
                            ) : (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() =>
                                  setChips([
                                    { id: '1', label: 'Autonomous Agents' },
                                    { id: '2', label: 'Data Processing' },
                                    { id: '3', label: 'React 19' },
                                  ])
                                }
                              >
                                Reset Chips
                              </Button>
                            )}
                            <Chip
                              variant="success"
                              avatarSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
                            >
                              Online Operator
                            </Chip>
                            <Chip variant="warning">Read-only</Chip>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* Inputs Section */}
            {activeTab === 'Inputs' && (
              <div className="animate-in fade-in space-y-10 duration-300">
                <Breadcrumb items={[{ label: 'Design System' }, { label: 'Inputs & Controls' }]} />

                <Section
                  title="Inputs & Form Controls"
                  subtitle="Pristine, type-safe custom forms. Perfect for user inputs and settings dashboards."
                >
                  <div className="space-y-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Standard Input Fields</CardTitle>
                        <CardDescription>
                          Customizable text forms with support for helper states, error messages,
                          prefix icons and trailing buttons.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Input
                          label="Workspace Email Address"
                          placeholder="name@company.com"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          helperText="We will never share your email address."
                        />

                        <Input
                          label="Server Access Token"
                          placeholder="gsk-xxxxxxxx"
                          error="Your API token has expired. Please refresh it."
                        />

                        <PasswordInput
                          label="Root Account Password"
                          placeholder="Enter secret login"
                        />

                        <Input
                          label="Disabled Identifier"
                          disabled
                          placeholder="Can not click or write"
                          leftElement={<Search className="h-4 w-4" />}
                        />
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Checkboxes & Radios */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Checkboxes, Radios, & Custom Switches</CardTitle>
                          <CardDescription>
                            Beautiful multi-select, single-select, and binary toggle switches.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-3">
                            <Checkbox
                              label="Accept and agree to telemetry reporting"
                              checked={checkedCheckbox}
                              onChange={() => setCheckedCheckbox(!checkedCheckbox)}
                            />
                            <Checkbox
                              label="Force database seed (requires admin privileges)"
                              error="Check is restricted"
                              checked={false}
                              disabled
                            />
                          </div>

                          <Divider />

                          <div className="space-y-3">
                            <Radio
                              name="options"
                              id="option-1"
                              label="Launch model instance in local datacenter"
                              checked={radioValue === 'option-1'}
                              onChange={() => setRadioValue('option-1')}
                            />
                            <Radio
                              name="options"
                              id="option-2"
                              label="Use global decentralized multi-cloud hosting"
                              checked={radioValue === 'option-2'}
                              onChange={() => setRadioValue('option-2')}
                            />
                          </div>

                          <Divider />

                          <div className="flex flex-col gap-3">
                            <Switch
                              label="Enable advanced LLM logging agent"
                              checked={switchValue}
                              onChange={() => setSwitchValue(!switchValue)}
                            />
                            <p className="text-text-muted -mt-2 pl-12 text-xs">
                              {switchValue
                                ? 'LLM logging is ACTIVE. Performance data will stream continuously.'
                                : 'LLM logging is currently suspended.'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Select & Textarea */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Select Menu & Textarea</CardTitle>
                          <CardDescription>
                            Support long texts and dropdown options.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <Select
                            label="Default Processing Model"
                            value={selectValue}
                            onChange={(e) => setSelectValue(e.target.value)}
                            helperText="Choose the foundational AI LLM executor."
                          >
                            <option value="standard">Claude 3.5 Sonnet (Default)</option>
                            <option value="high">GPT-4o Advanced</option>
                            <option value="efficient">Llama 3.1 8B (Local)</option>
                          </Select>

                          <Textarea
                            label="System Prompt Workspace Instructions"
                            placeholder="You are an expert software architect assisting the engineering workspace..."
                            rows={4}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* Overlays Section */}
            {activeTab === 'Overlays' && (
              <div className="animate-in fade-in space-y-10 duration-300">
                <Breadcrumb items={[{ label: 'Design System' }, { label: 'Overlays & Dialogs' }]} />

                <Section
                  title="Overlays & Popup Dialogs"
                  subtitle="Seamless overlay, dialog, modal and tooltip layers with zero visual lag."
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Floating Triggers */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Tooltips, Dropdowns & Popovers</CardTitle>
                        <CardDescription>Interactive hover overlays and popups.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                          {/* Tooltip */}
                          <Tooltip
                            content="Saves changes immediately to the database."
                            position="top"
                          >
                            <Button variant="outline">Hover Tooltip (Top)</Button>
                          </Tooltip>

                          <Tooltip content="Warning: This is destructive." position="right">
                            <Button variant="outline" className="text-danger border-danger/20">
                              Hover Tooltip (Right)
                            </Button>
                          </Tooltip>
                        </div>

                        <Divider />

                        <div className="flex flex-wrap items-center gap-4">
                          {/* Dropdown Menu */}
                          <DropdownMenu
                            trigger={<Button variant="primary">Manage Actions</Button>}
                            items={[
                              {
                                label: 'View Configuration',
                                icon: <FileText className="h-4 w-4" />,
                                onClick: () => toast('View Config', 'Reading settings...', 'info'),
                              },
                              {
                                label: 'Optimize System',
                                icon: <Cpu className="h-4 w-4" />,
                                onClick: () =>
                                  toast('Optimizing', 'Allocating memory...', 'success'),
                              },
                              {
                                label: 'Delete Instance',
                                icon: <Trash2 className="h-4 w-4" />,
                                danger: true,
                                onClick: () => setIsDialogOpen(true),
                              },
                            ]}
                          />

                          {/* Popover */}
                          <Popover
                            trigger={<Button variant="secondary">Quick Profile</Button>}
                            align="center"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar
                                  fallback="JD"
                                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
                                  size="sm"
                                />
                                <div>
                                  <p className="text-sm font-bold">Jane Doe</p>
                                  <p className="text-text-muted text-xs">Lead Platform Developer</p>
                                </div>
                              </div>
                              <p className="text-text-secondary text-xs leading-normal">
                                Active workspace: <strong>agentops-pro</strong>. Access key expires
                                in 12 days.
                              </p>
                              <Button
                                variant="primary"
                                size="xs"
                                className="w-full"
                                onClick={() =>
                                  toast('Redirecting', 'Navigating to account details...', 'info')
                                }
                              >
                                Edit Profile
                              </Button>
                            </div>
                          </Popover>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Modal & Dialog Triggers */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Modals & Confirmation Dialogs</CardTitle>
                        <CardDescription>
                          Strict keyboard trapped and responsive overlay viewports.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-text-secondary text-sm">
                          Test fully functional modals and transactional confirmation dialogs. They
                          automatically disable body scroll, listen for the escape key, and conform
                          to the modern visual aesthetic.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                            Open Modal Content
                          </Button>
                          <Button variant="danger" onClick={() => setIsDialogOpen(true)}>
                            Confirm Destructive Action
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Navigation Components inside Page */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Interactive Navigation & Accordion Components</CardTitle>
                        <CardDescription>
                          Tabs, Breadcrumbs, Pagination, and Collapsible Accordions.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Interactive Tabs */}
                        <Tabs
                          activeTabId={activeDemoTab}
                          onChange={(id) => setActiveDemoTab(id)}
                          tabs={[
                            {
                              id: 'details',
                              label: 'Instance Details',
                              content: (
                                <p className="text-text-secondary bg-neutral-light/30 border-border/40 rounded-xl border p-4 text-sm">
                                  Model type: Sonnet 3.5. Context limit: 200,000 tokens. Current
                                  throughput: 84 tokens/sec.
                                </p>
                              ),
                            },
                            {
                              id: 'logs',
                              label: 'Recent Audit Logs',
                              content: (
                                <p className="text-text-secondary bg-neutral-light/30 border-border/40 rounded-xl border p-4 text-sm">
                                  12:34:55 - User authenticated.
                                  <br />
                                  12:35:12 - Database seed executed successfully.
                                  <br />
                                  12:35:45 - Model inference initialized.
                                </p>
                              ),
                            },
                            {
                              id: 'billing',
                              label: 'Billing Settings',
                              disabled: true,
                              content: null,
                            },
                          ]}
                        />

                        <Divider />

                        {/* Accordion collapsible */}
                        <Accordion
                          items={[
                            {
                              id: 'faq-1',
                              title:
                                'How does AgentOps AI Studio guarantee high-speed token generation?',
                              content:
                                'We integrate deep hardware-acceleration layers alongside custom execution queues to priority-route requests natively, achieving up to 3x higher throughput compared to standard LLM clients.',
                            },
                            {
                              id: 'faq-2',
                              title: 'Are the database integrations fully secure?',
                              content:
                                'Yes. All data connectors use zero-knowledge local proxy tunnels. Your databases never connect to public endpoints, complying with top-tier enterprise compliance requirements.',
                            },
                          ]}
                        />

                        <Divider />

                        {/* Interactive Pagination */}
                        <div className="flex flex-col items-center justify-center gap-2">
                          <p className="text-text-muted text-xs">
                            Interactive Pagination Component
                          </p>
                          <Pagination
                            currentPage={currentPage}
                            totalPages={12}
                            onPageChange={(page) => {
                              setCurrentPage(page);
                              toast('Page Changed', `Navigated to catalog page ${page}.`, 'info');
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </Section>
              </div>
            )}

            {/* Status Section */}
            {activeTab === 'Status' && (
              <div className="animate-in fade-in space-y-10 duration-300">
                <Breadcrumb
                  items={[{ label: 'Design System' }, { label: 'Status & Indicators' }]}
                />

                <Section
                  title="Status & Loading Indicators"
                  subtitle="Aesthetic loading spinners, linear progress meters, skeletons, and status placeholders."
                >
                  <div className="space-y-8">
                    {/* Spinners & Progress */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Spinners & Skeletons</CardTitle>
                          <CardDescription>
                            Used to communicate pending async states.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-center gap-6">
                            <LoadingSpinner size="xs" />
                            <LoadingSpinner size="sm" />
                            <LoadingSpinner size="md" />
                            <LoadingSpinner size="lg" />
                            <LoadingSpinner size="xl" />
                          </div>

                          <Divider />

                          <div className="space-y-3">
                            <p className="text-text-muted text-xs">
                              Interactive skeleton layout simulation
                            </p>
                            <div className="flex items-center gap-3">
                              <SkeletonLoader variant="circular" width={40} height={40} />
                              <div className="flex-1 space-y-2">
                                <SkeletonLoader variant="text" width="40%" />
                                <SkeletonLoader variant="text" width="85%" />
                              </div>
                            </div>
                            <SkeletonLoader variant="rectangular" height={100} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Linear Progress Bar</CardTitle>
                          <CardDescription>
                            Indicates task accomplishment percentage.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <ProgressBar value={progressVal} showValue variant="primary" />

                          <div className="flex items-center gap-2">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setProgressVal(Math.max(0, progressVal - 15))}
                            >
                              Decrease -15%
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setProgressVal(Math.min(100, progressVal + 15))}
                            >
                              Increase +15%
                            </Button>
                            <Button size="xs" variant="ghost" onClick={() => setProgressVal(65)}>
                              Reset
                            </Button>
                          </div>

                          <div className="space-y-3 pt-2">
                            <ProgressBar value={30} variant="danger" />
                            <ProgressBar value={50} variant="warning" />
                            <ProgressBar value={100} variant="success" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Empty and Error states */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <p className="text-text-muted text-xs font-semibold tracking-wider uppercase">
                          Empty State Component
                        </p>
                        <EmptyState
                          title="No Active Agent Clusters"
                          description="You have not deployed any AI agent orchestrators yet. Spin up a new model instance to begin executing business workflows."
                          icon={Boxes}
                          action={{
                            label: 'Deploy First Agent',
                            onClick: () =>
                              toast('Deploying', 'Initializing new agent container...', 'success'),
                          }}
                        />
                      </div>

                      <div className="space-y-3">
                        <p className="text-text-muted text-xs font-semibold tracking-wider uppercase">
                          Error State Component
                        </p>
                        <ErrorState
                          title="Database Sync Interrupted"
                          message="We were unable to securely dial your remote PostgreSQL tunnel. Check your credential parameters and ensure white-listed firewall policies."
                          onRetry={() =>
                            toast('Retrying', 'Polling secure tunnel server...', 'info')
                          }
                        />
                      </div>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* Layouts Section */}
            {activeTab === 'Layouts' && (
              <div className="animate-in fade-in space-y-10 duration-300">
                <Breadcrumb items={[{ label: 'Design System' }, { label: 'Layout Showcase' }]} />

                <Section
                  title="Enterprise Grid Layout Systems"
                  subtitle="Responsive grid wrappers optimized for desktop, tablet and mobile form factors."
                >
                  <div className="space-y-8">
                    {/* Grid Columns */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Standard Dynamic Columns</CardTitle>
                        <CardDescription>
                          Responsive 1-col, 2-col, 3-col grids with standard gutter sizes matching
                          our design principles.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <p className="text-text-muted text-xs font-bold tracking-wider uppercase">
                            Three Column Grid (Desktop) &rarr; One Column (Mobile)
                          </p>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="bg-neutral-light border-border rounded-xl border p-5 text-center text-sm font-semibold">
                              Responsive Column A
                            </div>
                            <div className="bg-neutral-light border-border rounded-xl border p-5 text-center text-sm font-semibold">
                              Responsive Column B
                            </div>
                            <div className="bg-neutral-light border-border rounded-xl border p-5 text-center text-sm font-semibold">
                              Responsive Column C
                            </div>
                          </div>
                        </div>

                        <Divider />

                        <div className="space-y-2">
                          <p className="text-text-muted text-xs font-bold tracking-wider uppercase">
                            Two Column Left-Weighted Grid
                          </p>
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <div className="bg-neutral-light border-border rounded-xl border p-5 text-sm font-semibold lg:col-span-2">
                              Weighted Workspace (Col Span 2)
                            </div>
                            <div className="bg-neutral-light border-border rounded-xl border p-5 text-sm font-semibold">
                              Sidebar Parameter Panel (Col Span 1)
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Standard Inline Notification banner & Dividers */}
                    <div className="space-y-4">
                      <p className="text-text-muted text-xs font-semibold tracking-wider uppercase">
                        Notifications & Warning Banners
                      </p>
                      <Notification
                        title="Scheduled Database Maintenance Alert"
                        description="Our cloud storage provider is undergoing standard network optimization from 02:00 to 04:00 UTC. Running agent logs will defer synchronization."
                        type="warning"
                        onClose={() => toast('Banner Dismissed', 'Warning alert closed.', 'info')}
                      />
                      <Notification
                        title="V1 API Deprecation Warning"
                        description="Legacy API triggers are deprecated and will shut down on August 31st. Update your workflows to use v2 endpoints."
                        type="danger"
                        onClose={() => {}}
                      />
                    </div>
                  </div>
                </Section>
              </div>
            )}
          </Container>
        </main>
      </div>

      {/* Footer component */}
      <Footer />

      {/* Global Modals / Dialog instances */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Deploy New Autonomous Agent Core"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-text-secondary text-sm leading-relaxed">
            Specify the foundation configurations to instantiate your custom multi-agent team. This
            processes mock containers in real-time.
          </p>
          <Input label="Agent Identifier" placeholder="e.g. Finance-Analyst-01" />
          <Select label="Inference Engine Provider">
            <option>Claude 3.5 Sonnet</option>
            <option>GPT-4o</option>
            <option>Llama 3 Local</option>
          </Select>
          <div className="border-border flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel Deployment
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                toast(
                  'Agent Core Deployed',
                  'New Finance-Analyst-01 cluster successfully spun up!',
                  'success',
                );
              }}
            >
              Launch Container
            </Button>
          </div>
        </div>
      </Modal>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Destroy Selected Agent Cluster?"
        description="Warning: This is a highly destructive operational task. All local caches, model parameters and temporary workflow log streams will be permanently purged. This action is irreversible."
        confirmText="Purge Instance"
        cancelText="Keep Live"
        variant="danger"
        isConfirming={isDialogConfirming}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
}
