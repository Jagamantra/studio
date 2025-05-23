
'use client';

import React from 'react';
import type { UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, ShieldQuestion, BarChart3 } from 'lucide-react'; 
import Image from 'next/image';
import { projectConfig } from '@/config/project.config'; 

interface DashboardV1ContentProps {
  userToRenderOnDashboard: UserProfile;
}

export const DashboardV1Content = React.memo(function DashboardV1Content({ userToRenderOnDashboard }: DashboardV1ContentProps) {
  const isAdmin = userToRenderOnDashboard.role === 'admin';

  return (
    <>
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">
              Your Role
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
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
                <Users className="h-4 w-4 text-primary" />
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

            {projectConfig.enableApplicationConfig && (  // Updated to use enableApplicationConfig
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                  <CardTitle className="text-sm font-medium">Application Config</CardTitle> {/* Changed title */}
                  <ShieldQuestion className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-lg md:text-xl font-bold">Applicaiton settings</div>
                   <p className="text-xs text-muted-foreground mb-2">
                    Get insights on your app configurations.
                  </p>
                  <Button asChild size="sm">
                    <Link href="/config-advisor">Config Setup</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!isAdmin && (
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
               <CardTitle className="text-sm font-medium">My Activity</CardTitle>
               <BarChart3 className="h-4 w-4 text-primary" />
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

      {/* <Card className="mt-4 md:mt-6">
        <CardHeader className="p-4">
          <CardTitle className="text-lg md:text-xl">Getting Started</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Explore the features and make this template your own.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 p-4 pt-0">
            <div className="flex flex-col items-center justify-center p-3 sm:p-4 border rounded-lg text-center">
                <div className="w-full aspect-[2/1] relative mb-3">
                  <Image 
                    src="https://placehold.co/400x200.png"
                    alt="Feature placeholder 1" 
                    layout="fill" 
                    objectFit="cover" 
                    className="rounded-md" 
                    data-ai-hint="office team" 
                    unoptimized={true}
                  />
                </div>
                <h3 className="text-sm md:text-base font-semibold mb-1">Customize Your Profile</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 sm:mb-3">Personalize your account details and preferences.</p>
                <Button asChild variant="secondary" size="sm">
                    <Link href="/profile">Go to Profile</Link>
                </Button>
            </div>
            <div className="flex flex-col items-center justify-center p-3 sm:p-4 border rounded-lg text-center">
                <div className="w-full aspect-[2/1] relative mb-3">
                  <Image 
                    src="https://placehold.co/400x200.png"
                    alt="Feature placeholder 2" 
                    layout="fill" 
                    objectFit="cover" 
                    className="rounded-md" 
                    data-ai-hint="modern workspace"
                    unoptimized={true}
                  />
                </div>
                <h3 className="text-sm md:text-base font-semibold mb-1">Explore Theme Options</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 sm:mb-3">Adjust themes, colors, and more via the palette icon in the header.</p>
            </div>
        </CardContent>
      </Card> */}
    </>
  );
});

DashboardV1Content.displayName = 'DashboardV1Content';
