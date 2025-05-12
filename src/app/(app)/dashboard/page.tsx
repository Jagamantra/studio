
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, ShieldQuestion, BarChart3, AlertTriangle, Loader2, Database, Activity, Zap, Info, GitBranch } from 'lucide-react';
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
import { projectConfig } from '@/config/project.config';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
         <Card className="mb-4 md:mb-6 border-accent bg-accent/10 dark:bg-accent/20">
          <CardHeader className="p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              <CardTitle className="text-base sm:text-lg text-accent">Demo Mode</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs sm:text-sm text-accent/90 dark:text-accent/80">
              Firebase is not configured. You are viewing the dashboard with sample data. Some interactive features might be limited.
            </p>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">
              Your Role
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg md:text-xl font-bold capitalize">{userToRenderOnDashboard.role}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Full access to all features.' : 'Standard user access.'}
            </p>
          </CardContent>
        </Card>

        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-sm font-medium">User Management</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-lg md:text-xl font-bold">Manage Users</div>
                <p className="text-xs text-muted-foreground mb-2">
                  View, add, edit, or remove users.
                </p>
                <Button asChild size="sm">
                  <Link href="/users">Go to Users</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-sm font-medium">Config Advisor</CardTitle>
                <ShieldQuestion className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-lg md:text-xl font-bold">AI Analyzer</div>
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
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
               <CardTitle className="text-sm font-medium">My Activity</CardTitle>
               <BarChart3 className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent className="p-4 pt-0">
               <div className="text-lg md:text-xl font-bold">Coming Soon</div>
               <p className="text-xs text-muted-foreground">
                 Your recent activity and statistics will appear here.
               </p>
             </CardContent>
           </Card>
        )}
      </div>

      <Card className="mt-4 md:mt-6">
        <CardHeader className="p-4">
          <CardTitle className="text-lg md:text-xl">Getting Started</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Explore the features and make this template your own.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 p-4 pt-0">
            <div className="flex flex-col items-center justify-center p-3 sm:p-4 border rounded-lg text-center">
                <div className="w-full aspect-[2/1] relative mb-3">
                  <Image src="https://picsum.photos/seed/dashboard1/400/200" alt="Feature placeholder 1" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="office team" />
                </div>
                <h3 className="text-sm md:text-base font-semibold mb-1">Customize Your Profile</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 sm:mb-3">Personalize your account details and preferences.</p>
                <Button asChild variant="secondary" size="sm">
                    <Link href="/profile">Go to Profile</Link>
                </Button>
            </div>
            <div className="flex flex-col items-center justify-center p-3 sm:p-4 border rounded-lg text-center">
                <div className="w-full aspect-[2/1] relative mb-3">
                  <Image src="https://picsum.photos/seed/dashboard2/400/200" alt="Feature placeholder 2" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="modern workspace" />
                </div>
                <h3 className="text-sm md:text-base font-semibold mb-1">Explore Theme Options</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 sm:mb-3">Adjust themes, colors, and more via the palette icon in the header.</p>
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
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 mb-4 text-xs sm:text-sm">
        <TabsTrigger value="overview">Beta Overview</TabsTrigger>
        <TabsTrigger value="analytics">User Analytics</TabsTrigger>
        <TabsTrigger value="feedback" className="hidden sm:inline-flex">Feedback Log</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-lg md:text-xl">Welcome to Beta!</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Explore new features and improvements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 p-4 pt-0">
                <p className="text-xs sm:text-sm">This beta phase introduces a revamped analytics module and a direct feedback channel. Your input is valuable!</p>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span>Enhanced performance metrics</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span>Real-time activity tracking (mocked)</span>
                </div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-sm font-medium">Your Role (Beta)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-lg md:text-xl font-bold capitalize">{userToRenderOnDashboard.role}</div>
                <p className="text-xs text-muted-foreground">
                {isAdmin ? 'Full access to beta features and admin tools.' : 'Standard user access for beta testing.'}
                </p>
                {isAdmin && <Button size="sm" variant="outline" className="mt-2 sm:mt-3 text-xs">Beta Admin Panel</Button>}
            </CardContent>
            </Card>
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg md:text-xl">User Growth Analytics (Beta)</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Monthly new vs. churned users.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 sm:pl-2 pr-2 sm:pr-4 pb-4">
            <ChartContainer config={betaChartConfig} className="min-h-[200px] sm:min-h-[250px] w-full">
              <RechartsBarChartComponent data={betaChartData} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={10}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
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
          <CardHeader className="p-4">
            <CardTitle className="text-lg md:text-xl">Beta Feedback Log</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Recent feedback submitted by beta testers.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isAdmin ? (
                <ul className="space-y-2 text-xs sm:text-sm">
                <li className="p-2 sm:p-3 border rounded-md bg-muted/50"><strong>User A:</strong> "Love the new chart, very intuitive!"</li>
                <li className="p-2 sm:p-3 border rounded-md bg-muted/50"><strong>User B:</strong> "Found a small bug in the date picker."</li>
                <li className="p-2 sm:p-3 border rounded-md bg-muted/50"><strong>User C:</strong> "Performance seems much better."</li>
                </ul>
            ) : (
                <p className="text-muted-foreground text-xs sm:text-sm">Submit your feedback through the "Help & Feedback" section (coming soon).</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

// --- Content for dev ---
const DashboardDevContent = ({ userToRenderOnDashboard }: { userToRenderOnDashboard: UserProfile }) => {
  const { theme, accentColor, borderRadius } = useTheme();
  const [currentProgress, setCurrentProgress] = useState(67);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProgress(Math.floor(Math.random() * 101));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      <Alert variant="destructive" className="p-3 sm:p-4">
        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
        <AlertTitle className="text-sm sm:text-base">Developer Build Environment</AlertTitle>
        <AlertDescription className="text-xs sm:text-sm">
          You are viewing the <strong>dev</strong> build. All experimental features are active and may be unstable. Use for testing purposes only.
        </AlertDescription>
      </Alert>
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2"><Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Current Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 sm:space-y-2 text-xs sm:text-sm p-4 pt-0">
            <div><strong>User:</strong> <span className="font-mono break-all">{userToRenderOnDashboard.displayName} ({userToRenderOnDashboard.email})</span></div>
            <div><strong>Role:</strong> <Badge variant={userToRenderOnDashboard.role === 'admin' ? 'default' : 'secondary'} className="text-xs px-1.5 py-0.5">{userToRenderOnDashboard.role}</Badge></div>
            <div><strong>Theme Mode:</strong> <span className="font-mono capitalize">{theme}</span></div>
            <div><strong>Accent:</strong> <span className="font-mono p-1 rounded text-xs" style={{backgroundColor: accentColor.startsWith('#') ? accentColor : `hsl(${accentColor})`, color: 'hsl(var(--accent-foreground))'}}>{accentColor}</span></div>
            <div><strong>Radius:</strong> <span className="font-mono">{borderRadius}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2"><Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Developer Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 p-4 pt-0">
            <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-9">Trigger Test Notification</Button>
            <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-9">Simulate API Error</Button>
            <div className="mt-1 sm:mt-2">
              <label htmlFor="stability" className="text-xs sm:text-sm font-medium text-muted-foreground">System Stability Monitor (Dummy):</label>
              <Progress id="stability" value={currentProgress} className="w-full mt-1 h-3 sm:h-4" />
              <p className="text-xs text-muted-foreground text-right">{currentProgress}% Stable</p>
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
      <div className="flex flex-1 items-center justify-center p-4">
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
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-4">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Access Denied</CardTitle>
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
    if (!userToRenderOnDashboard) return null; 

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
    <TooltipProvider>
      <div className="flex-1 space-y-4 md:space-y-6">
        <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            {versionDetails && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={appVersion === 'dev' ? 'destructive' : 'ghost'} 
                    size="icon" 
                    className="h-7 w-7 sm:h-8 sm:w-8" // Adjusted button size
                  >
                    {appVersion === 'dev' ? 
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" /> :  // Adjusted icon size
                      <GitBranch className="h-4 w-4 sm:h-5 sm:w-5" />       // Adjusted icon size
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{versionDetails.name}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Welcome back, {userToRenderOnDashboard.displayName || 'User'}!
          </p>
        </div>
        {renderDashboardContent()}
      </div>
    </TooltipProvider>
  );
}

