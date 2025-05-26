
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/auth-context'; // Using the unified AuthContext
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, AlertTriangle, GitBranch, Info } from 'lucide-react';
import type { UserProfile } from '@/types';
import { useTheme } from '@/contexts/theme-provider';
import { projectConfig } from '@/config/project.config';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { dummyUserForDashboardView } from '@/data/dummy-data';
import { DashboardV1Content } from '@/components/dashboard/dashboard-v1-content';
import { DashboardBetaContent } from '@/components/dashboard/dashboard-beta-content';
import { DashboardDevContent } from '@/components/dashboard/dashboard-dev-content';
import { AuthenticatedPageLayout } from '@/components/layout/authenticated-page-layout';
import { DashboardToastHandler } from '@/components/dashboard/dashboard-toast-handler';
import { PageTitleWithIcon } from '@/components/layout/page-title-with-icon';


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
        <div className="flex flex-1 items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthenticatedPageLayout>
    );
  }

  const userToRenderOnDashboard: UserProfile | null = authUser || (projectConfig.mockApiMode ? dummyUserForDashboardView : null);


  if (!userToRenderOnDashboard) {
    // This case should ideally be handled by AuthProvider redirecting to login if no user
    // But as a fallback:
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md text-center p-4">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Access Denied</CardTitle>
              <CardDescription>You need to be logged in to view this page.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedPageLayout>
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
        return <DashboardV1Content userToRenderOnDashboard={userToRenderOnDashboard} />;
    }
  };

  const versionDetails = projectConfig.availableAppVersions.find(v => v.id === appVersion);

  return (
    <AuthenticatedPageLayout>
      <Suspense fallback={null}>
        <DashboardToastHandler />
      </Suspense>
      <TooltipProvider>
        <div className="space-y-4 md:space-y-6">
           {/* <PageTitleWithIcon title="Dashboard"> */}
            <div className="flex items-center gap-2">
                {versionDetails && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={appVersion === 'dev' ? 'destructive' : 'ghost'} 
                      size="icon" 
                      className="h-7 w-7 sm:h-8 sm:w-8" 
                    >
                      {appVersion === 'dev' ? 
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" /> :  
                        <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />       
                      }
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">{versionDetails.name}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground">
                Welcome back, {userToRenderOnDashboard.displayName || 'User'}!
              </p>
            </div>
          {/* </PageTitleWithIcon> */}
          {/* Removed the mock mode warning card here, as requested. */}
          {renderDashboardContent()}
        </div>
      </TooltipProvider>
    </AuthenticatedPageLayout>
  );
}
