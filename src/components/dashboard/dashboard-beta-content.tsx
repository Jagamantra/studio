'use client';

import React from 'react';
import type { UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Zap, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart as RechartsBarChartComponent, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { betaDashboardChartData } from '@/data/dummy-data';

interface DashboardBetaContentProps {
  userToRenderOnDashboard: UserProfile;
}

// Updated chartConfig to use direct CSS variable references
const betaChartConfig = {
  newUsers: { label: "New Users", color: "var(--chart-1)" }, // Changed from hsl(var(--chart-1))
  churnedUsers: { label: "Churned Users", color: "var(--chart-2)" }, // Changed from hsl(var(--chart-2))
} satisfies ChartConfig;


export function DashboardBetaContent({ userToRenderOnDashboard }: DashboardBetaContentProps) {
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
                <Users className="h-4 w-4 text-primary" />
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
              <RechartsBarChartComponent accessibilityLayer data={betaDashboardChartData} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
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
}