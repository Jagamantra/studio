"use client";

import React, { useEffect, useState } from "react";
import type { UserProfile } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, ShieldQuestion, BarChart3, Loader2 } from "lucide-react";
import Image from "next/image";
import { projectConfig } from "@/config/project.config";
import * as Api from "@/services/api";

interface DashboardV1ContentProps {
  userToRenderOnDashboard: UserProfile;
}

export const DashboardV1Content = React.memo(function DashboardV1Content({
  userToRenderOnDashboard,
}: DashboardV1ContentProps) {
  const isAdmin = userToRenderOnDashboard.role === "admin";
  const [userCount, setUserCount] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [isLoadingUserCount, setIsLoadingUserCount] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      const fetchUserCount = async () => {
        setIsLoadingUserCount(true);
        try {
          const users = await Api.fetchUsers(); // Fetches from dummy data via services/api.ts
          setUserCount(users.length);
        } catch (error) {
          console.error("Failed to fetch user count for dashboard:", error);
          setUserCount(0); // Fallback or indicate error
        } finally {
          setIsLoadingUserCount(false);
        }
      };
      fetchUserCount();
      const fetchCustomerCount = async () => {
        setIsLoadingUserCount(true);
        try {
          const customers = await Api.getCustomers(); // Fetches from dummy data via services/api.ts
          setCustomerCount(customers.length);
        } catch (error) {
          console.error("Failed to fetch user count for dashboard:", error);
          setCustomerCount(0); // Fallback or indicate error
        } finally {
          setIsLoadingUserCount(false);
        }
      };
      fetchCustomerCount();
    } else {
      setIsLoadingUserCount(false); // Not admin, no need to load
    }
  }, [isAdmin]);

  return (
    <>
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-sm font-medium">
                  User Management
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-2 flex flex-col">
                <div className="text-2xl font-bold text-primary">
                  {isLoadingUserCount ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : userCount !== null ? (
                    userCount
                  ) : (
                    "-"
                  )}
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  {isLoadingUserCount
                    ? "Loading count..."
                    : "Total registered users"}
                </p>
                <Button asChild size="sm" className="mt-4 w-full sm:w-auto">
                  <Link href="/users">View & Manage Users</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-sm font-medium">
                  Customer Management
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-2 flex flex-col">
                <div className="text-2xl font-bold text-primary items-center">
                  {isLoadingUserCount ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : customerCount !== null ? (
                    customerCount
                  ) : (
                    "-"
                  )}
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  {isLoadingUserCount
                    ? "Loading count..."
                    : "Total registered Customers"}
                </p>
                <Button asChild size="sm" className="mt-4 w-full sm:w-auto">
                  <Link href="/customers">Go to Customer Management</Link>
                </Button>
              </CardContent>
            </Card>

            {projectConfig.enableApplicationConfig && ( // Updated to use enableApplicationConfig
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                  <CardTitle className="text-sm font-medium">
                    Application Config
                  </CardTitle>
                  <ShieldQuestion className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="p-4 pt-2 flex flex-col space-y-2">
                  <div className="text-lg md:text-xl font-bold">
                    Customize App
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug pb-2">
                    Modify settings and analyze configurations.
                  </p>
                  {/* Changed to programmatic navigation */}
                  <Button
                    size="sm"
                    className="mt-auto w-full sm:w-auto self-start"
                  >
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
    </>
  );
});

DashboardV1Content.displayName = "DashboardV1Content";
