
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, ShieldQuestion, BarChart3, AlertTriangle, Loader2, Database, Activity, Zap } from 'lucide-react';
import Image from 'next/image';
import type { UserProfile } from '@/types';
import { useTheme } from '@/contexts/theme-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { BarChart as RechartsBarChartComponent, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { projectConfig } from '@/config/project.config'; // Added import

// Define a dummy user for viewing the dashboard when Firebase isn't configured
const DUMMY_USER_FOR_VIEWING: UserProfile = {
  uid: 'dummy-dashboard-viewer-001',
  email: 'viewer@example.com',
  displayName: 'Demo User (Admin View)',
  photoURL: 'https://picsum.photos/seed/demoviewer/40/40',
  phoneNumber: null,
  role: 'admin', 
};

// --- Content for v1.0.0 (Current Dashboard) ---
const DashboardV1Content = ({ userToRenderOnDashboard, isConfigured }: { userToRenderOnDashboard: UserProfile, isConfigured: boolean }) => {
  const isAdmin = userToRenderOnDashboard.role === 'admin';
  return (
    <>
      {!isConfigured && (
         <Card className="mb-6 border-accent bg-accent/10 dark:bg-accent/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-accent" />
              <CardTitle className="text-accent">Demo Mode</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-accent/90 dark:text-accent/80">
              Firebase is not configured. You are viewing the dashboard with sample data. Some interactive features might be limited.
            </p>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Role
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{userToRenderOnDashboard.role}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Full access to all features.' : 'Standard user access.'}
            </p>
          </CardContent>
        </Card>

        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Management</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage Users</div>
                <p className="text-xs text-muted-foreground mb-2">
                  View, add, edit, or remove users.
                </p>
                <Button asChild size="sm">
                  <Link href="/users">Go to Users</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Config Advisor</CardTitle>
                <ShieldQuestion className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">AI Analyzer</div>
                 <p className="text-xs text-muted-foreground mb-2">
                  Get insights on your app configurations.
                </p>
                <Button asChild size="sm">
                  <Link href="/config-advisor">Analyze Configs</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {!isAdmin && (
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">My Activity</CardTitle>
               <BarChart3 className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">Coming Soon</div>
               <p className="text-xs text-muted-foreground">
                 Your recent activity and statistics will appear here.
               </p>
             </CardContent>
           </Card>
        )}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Explore the features and make this template your own.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg text-center">
                <Image src="https://picsum.photos/seed/dashboard1/400/200" alt="Feature placeholder 1" width={400} height={200} className="rounded-md mb-4" data-ai-hint="office team" />
                <h3 className="text-lg font-semibold mb-1">Customize Your Profile</h3>
                <p className="text-sm text-muted-foreground mb-3">Personalize your account details and preferences.</p>
                <Button asChild variant="secondary" size="sm">
                    <Link href="/profile">Go to Profile</Link>
                </Button>
            </div>
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg text-center">
                 <Image src="https://picsum.photos/seed/dashboard2/400/200" alt="Feature placeholder 2" width={400} height={200} className="rounded-md mb-4" data-ai-hint="modern workspace" />
                <h3 className="text-lg font-semibold mb-1">Explore Theme Options</h3>
                <p className="text-sm text-muted-foreground mb-3">Adjust themes, colors, and more via the palette icon in the header.</p>
            </div>
        </CardContent>
      </Card>
    </>
  );
};

// --- Content for v0.9.0-beta ---
const betaChartData = [
  { month: "Jan", newUsers: 186, churnedUsers: 80 },
  { month: "Feb", newUsers: 305, churnedUsers: 120 },
  { month: "Mar", newUsers: 237, churnedUsers: 90 },
  { month: "Apr", newUsers: 273, churnedUsers: 110 },
  { month: "May", newUsers: 209, churnedUsers: 70 },
  { month: "Jun", newUsers: 254, churnedUsers: 100 },
];

const betaChartConfig = {
  newUsers: { label: "New Users", color: "hsl(var(--chart-1))" },
  churnedUsers: { label: "Churned Users", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const DashboardBetaContent = ({ userToRenderOnDashboard }: { userToRenderOnDashboard: UserProfile }) => {
  const isAdmin = userToRenderOnDashboard.role === 'admin';
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="overview">Beta Overview</TabsTrigger>
        <TabsTrigger value="analytics">User Analytics</TabsTrigger>
        <TabsTrigger value="feedback">Feedback Log</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
            <CardHeader>
                <CardTitle>Welcome to Beta!</CardTitle>
                <CardDescription>Explore new features and improvements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <p>This beta phase introduces a revamped analytics module and a direct feedback channel. Your input is valuable!</p>
                <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-5 w-5 text-primary" />
                    <span>Enhanced performance metrics</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-5 w-5 text-primary" />
                    <span>Real-time activity tracking (mocked)</span>
                </div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Role (Beta)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold capitalize">{userToRenderOnDashboard.role}</div>
                <p className="text-xs text-muted-foreground">
                {isAdmin ? 'Full access to beta features and admin tools.' : 'Standard user access for beta testing.'}
                </p>
                {isAdmin && <Button size="sm" variant="outline" className="mt-3">Beta Admin Panel</Button>}
            </CardContent>
            </Card>
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>User Growth Analytics (Beta)</CardTitle>
            <CardDescription>Monthly new vs. churned users.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={betaChartConfig} className="min-h-[300px] w-full">
              <RechartsBarChartComponent data={betaChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="newUsers" fill="var(--color-newUsers)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churnedUsers" fill="var(--color-churnedUsers)" radius={[4, 4, 0, 0]} />
              </RechartsBarChartComponent>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="feedback">
        <Card>
          <CardHeader>
            <CardTitle>Beta Feedback Log</CardTitle>
            <CardDescription>Recent feedback submitted by beta testers.</CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
                <ul className="space-y-3 text-sm">
                <li className="p-3 border rounded-md bg-muted/50"><strong>User A:</strong> "Love the new chart, very intuitive!"</li>
                <li className="p-3 border rounded-md bg-muted/50"><strong>User B:</strong> "Found a small bug in the date picker."</li>
                <li className="p-3 border rounded-md bg-muted/50"><strong>User C:</strong> "Performance seems much better."</li>
                </ul>
            ) : (
                <p className="text-muted-foreground">Submit your feedback through the "Help & Feedback" section (coming soon).</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

// --- Content for dev ---
const DashboardDevContent = ({ userToRenderOnDashboard }: { userToRenderOnDashboard: UserProfile }) => {
  const { theme, accentColor, borderRadius, appVersion } = useTheme();
  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Developer Build Environment</AlertTitle>
        <AlertDescription>
          You are viewing the <strong>{appVersion}</strong> build. All experimental features are active and may be unstable. Use for testing purposes only.
        </AlertDescription>
      </Alert>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> Current Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>User:</strong> <span className="font-mono">{userToRenderOnDashboard.displayName} ({userToRenderOnDashboard.email})</span></div>
            <div><strong>Role:</strong> <Badge variant={userToRenderOnDashboard.role === 'admin' ? 'default' : 'secondary'}>{userToRenderOnDashboard.role}</Badge></div>
            <div><strong>Theme Mode:</strong> <span className="font-mono capitalize">{theme}</span></div>
            <div><strong>Accent Color:</strong> <span className="font-mono p-1 rounded" style={{backgroundColor: accentColor.startsWith('#') ? accentColor : `hsl(${accentColor})`, color: 'hsl(var(--accent-foreground))'}}>{accentColor}</span></div>
            <div><strong>Border Radius:</strong> <span className="font-mono">{borderRadius}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Developer Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full">Trigger Test Notification</Button>
            <Button variant="outline" className="w-full">Simulate API Error</Button>
            <div className="mt-2">
              <label htmlFor="stability" className="text-sm font-medium text-muted-foreground">System Stability Monitor (Dummy):</label>
              <Progress id="stability" value={67} className="w-full mt-1" />
              <p className="text-xs text-muted-foreground text-right">67% Stable</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user: authUser, loading, isConfigured } = useAuth();
  const { appVersion } = useTheme(); 
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userToRenderOnDashboard: UserProfile | null = (() => {
    if (!isConfigured) {
      return DUMMY_USER_FOR_VIEWING;
    }
    return authUser;
  })();

  if (!userToRenderOnDashboard) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const renderDashboardContent = () => {
    if (!userToRenderOnDashboard) return null; // Should not happen due to check above

    switch (appVersion) {
      case 'v0.9.0-beta':
        return <DashboardBetaContent userToRenderOnDashboard={userToRenderOnDashboard} />;
      case 'dev':
        return <DashboardDevContent userToRenderOnDashboard={userToRenderOnDashboard} />;
      case 'v1.0.0':
      default:
        return <DashboardV1Content userToRenderOnDashboard={userToRenderOnDashboard} isConfigured={isConfigured} />;
    }
  };

  const versionDetails = projectConfig.availableAppVersions.find(v => v.id === appVersion);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          {versionDetails && (
            <Badge 
              variant={appVersion === 'dev' ? 'destructive' : 'outline'} 
              className="align-middle text-sm"
            >
              {versionDetails.name}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Welcome back, {userToRenderOnDashboard.displayName || 'User'}!
        </p>
      </div>
      {renderDashboardContent()}
    </div>
  );
}

