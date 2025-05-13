'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, AlertTriangle, GitBranch } from 'lucide-react';
import type { UserProfile } from '@/types';
import { useTheme } from '@/contexts/theme-provider';
import { projectConfig } from '@/config/project.config';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { dummyUserForDashboardView } from '@/data/dummy-data';
import { DashboardV1Content } from '@/components/dashboard/dashboard-v1-content';
import { DashboardBetaContent } from '@/components/dashboard/dashboard-beta-content';
import { DashboardDevContent } from '@/components/dashboard/dashboard-dev-content';
import { AuthenticatedPageLayout } from '@/components/layout/authenticated-page-layout';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Metadata } from 'next';
import { PageTitleWithIcon } from '@/components/layout/page-title-with-icon';

// Cannot use generateMetadata in a 'use client' component directly.
// Metadata for client components is typically set by the nearest server component parent or via RootLayout.
// For dynamic titles in client components based on client-side state, document.title can be used in useEffect.
// However, for Next.js App Router, it's best to export generateMetadata from server components if possible.
// If this page must be client, dynamic title via document.title is the way.
// For now, we'll rely on the title being potentially set by a server layout or RootLayout default.
// To achieve dynamic title based on appName from useTheme, we must update it in useEffect.

export default function DashboardPage() {
  const { user: authUser, loading, isConfigured } = useAuth();
  const { appName, appVersion } = useTheme(); 
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    document.title = appName; // Set dynamic title based on appName from theme
  }, [appName]);

  useEffect(() => {
    const toastMessageKey = 'toast_message';
    const messageType = searchParams.get(toastMessageKey);
    
    if (messageType === 'access_denied_role') {
      toast({
        title: 'Access Denied',
        message: 'You do not have permission for the requested page.',
        variant: 'destructive',
      });
      const currentPath = window.location.pathname;
      const params = new URLSearchParams(searchParams.toString());
      if (params.has(toastMessageKey)) {
          params.delete(toastMessageKey);
          const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;
          router.replace(newUrl, { shallow: true });
      }
    }
  }, [searchParams, toast, router]);

  if (!isClient || loading) {
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthenticatedPageLayout>
    );
  }

  const userToRenderOnDashboard: UserProfile | null = (() => {
    if (!isConfigured) {
      return dummyUserForDashboardView;
    }
    return authUser;
  })();

  if (!userToRenderOnDashboard) {
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md text-center p-4">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Access Denied</CardTitle>
              <CardDescription>You need to be logged in to view this page, or the application is in a preview state.</CardDescription>
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
      <TooltipProvider>
        <div className="space-y-4 md:space-y-6">
          <PageTitleWithIcon title="Dashboard">
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
          </PageTitleWithIcon>
          {renderDashboardContent()}
        </div>
      </TooltipProvider>
    </AuthenticatedPageLayout>
  );
}
