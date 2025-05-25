'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertTriangle, GitBranch, Info } from 'lucide-react';
import { UserProfile } from '@/types';
import { useTheme } from '@/contexts/theme-provider';
import { projectConfig } from '@/config/project.config';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { dummyUserForDashboardView } from '@/data/dummy-data';
import { DashboardV1Content } from '@/components/dashboard/dashboard-v1-content';
import { DashboardBetaContent } from '@/components/dashboard/dashboard-beta-content';
import { DashboardDevContent } from '@/components/dashboard/dashboard-dev-content';
import { DashboardToastHandler } from '@/components/dashboard/dashboard-toast-handler';
import { AuthenticatedPageLayout } from '@/components/layout/authenticated-page-layout';
import { LoadingScreen } from '@/components/common/loading-screen';

export default function DashboardPage() {
  const { user: authUser, loading } = useAuth();
  const { appName, appVersion } = useTheme(); 
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (appName && isClient) {
      document.title = `Dashboard | ${appName}`;
    }
  }, [appName, isClient]);

  if (!isClient || loading) {
    return (
      <AuthenticatedPageLayout>
        <LoadingScreen message="Loading dashboard..." submessage="Please wait while we fetch your data." />
      </AuthenticatedPageLayout>
    );
  }

  const userToRenderOnDashboard: UserProfile | null = authUser || (projectConfig.mockApiMode ? dummyUserForDashboardView : null);

  if (!userToRenderOnDashboard) {
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">Authentication Required</h1>
          <p className="text-muted-foreground text-center">
            Please log in to view your dashboard.
          </p>
          <Button asChild>
            <Link href="/auth/login">Go to Login</Link>
          </Button>
        </div>
      </AuthenticatedPageLayout>
    );
  }

  const versionDetails = projectConfig.availableAppVersions.find(v => v.id === appVersion);

  return (
    <AuthenticatedPageLayout>
      <div className="min-h-screen">
        <DashboardToastHandler />
        
        {/* Version Banner */}
        {versionDetails && (
          <Card className="mb-4 bg-muted/50 border-dashed">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{versionDetails.name}</span>
                  {versionDetails.description && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{versionDetails.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={appVersion === 'dev' ? 'destructive' : 'ghost'}
                    size="sm"
                    className="h-7 px-2"
                    asChild
                  >
                    <Link href="/config-advisor">
                      {appVersion === 'dev' ?
                        'Exit Development Mode' :
                        'Configuration Advisor'
                      }
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content */}
        <Suspense fallback={<LoadingScreen message="Loading dashboard content..." />}>
          {(() => {
            switch (appVersion) {
              case 'beta':
                return <DashboardBetaContent userToRenderOnDashboard={userToRenderOnDashboard} />;
              case 'dev':
                return <DashboardDevContent userToRenderOnDashboard={userToRenderOnDashboard} />;
              default:
                return <DashboardV1Content userToRenderOnDashboard={userToRenderOnDashboard} />;
            }
          })()}
        </Suspense>
      </div>
    </AuthenticatedPageLayout>
  );
}
