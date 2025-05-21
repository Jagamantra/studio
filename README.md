
# Genesis Template

Welcome to the Genesis Template! This Next.js starter is built for speed and flexibility, featuring a mock API service for backend interactions.
 
## Getting Started

Follow these steps to run the Genesis Template locally:

1.  **Clone & Install**:
    *   If you haven't already, clone this repository.
    *   Install dependencies:
        ```bash
        npm install
        # or yarn install / pnpm install
        ```

2.  **Environment Variables**:
    *   Copy the `.env` file to `.env.local`:
        ```bash
        cp .env .env.local
        ```
    *   The `.env.local` file is for your local settings and is ignored by Git.
    *   The main variable here is `NEXT_PUBLIC_API_BASE_URL`. Initially, you can leave this as is, because the app uses an internal mock API.
    *   When you're ready to connect to your actual backend, update this URL (e.g., `NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api"`).

3.  **Run the App**:
    *   Start the development server:
        ```bash
        npm run dev
        # or yarn dev / pnpm dev
        ```
    *   The app usually runs on `http://localhost:9002`.

4.  **Explore**:
    *   The app will redirect to `/auth/login`.
    *   **Default Mock Credentials**:
        *   Admin: `admin@dummy.com` / `password123`
        *   User: `user@dummy.com` / `password123`
    *   You can register new dummy users. Their data is stored in your browser's Local Storage.
    *   Key features: Theme Switcher, Profile Editor, (Mock) Role-Based Access Control, Dynamic Sidebar, AI Application Config.

## Core Features

-   **Theme Switcher**: Change themes (dark/light), accent colors, border radius, font size, and app scale. Find it via the palette icon in the header.
-   **Profile Editor**: Manage user profiles (details, password) using mock services.
-   **Access Control**: (Mocked) Role-based route access. Configure in `config/roles.config.ts`. Unauthorized access attempts redirect to the dashboard with a toast notification.
-   **Dynamic Sidebar**: Navigation configured in `config/sidebar.config.ts`. Varies with user role.
-   **Application Config (AI Analyzer)**: (Admin-only) AI tool to analyze app configuration files. Enable/disable in `config/project.config.ts` via the `enableApplicationConfig` flag.
-   **Mock MFA**: A mock Multi-Factor Authentication step is included in the login/registration flow for demonstration.

## Genkit for AI

The app uses Genkit for AI features like the Application Config analyzer.
-   Genkit flows are in `ai/flows/`.
-   To run Genkit locally for development:
    ```bash
    npm run genkit:dev
    # or for live reloading:
    npm run genkit:watch
    ```

## Mock API & Data Persistence

This template uses a **mock API service** (`services/api.ts` and `services/api.mock.ts`) and dummy data (`data/dummy-data.ts`). This lets you build the entire frontend without a real backend. It can be switched to a real API by setting `mockApiMode: false` in `config/project.config.ts` and providing your API base URL in `.env.local`.

**When `mockApiMode` is `true`, data is stored in your browser's Local Storage**:
-   **User Session & Details**:
    *   `genesis_current_dummy_user`: Current logged-in (dummy) user's profile.
    *   `genesis_mfa_verified`: Mock MFA status.
-   **Dummy User Database**:
    *   `genesis_dummy_users`: All registered dummy users.
-   **Theme Settings**:
    *   `genesis-theme-mode`, `genesis-theme-accent`, `genesis-theme-radius`, `genesis-theme-version`, `genesis-theme-app-name`, `genesis-theme-app-icon-paths`, `genesis-theme-font-size`, `genesis-theme-scale`.
-   **Application Config Inputs**:
    *   `configAdvisorInputs`: User inputs for the Application Config analyzer. (Note: The key `configAdvisorInputs` is historical; the feature is now called "Application Config").

**Note**: Local Storage is for the mock setup. A real backend would store this data in a database.

## Application Configuration

Key configurations are in the `config/` directory.

### 1. Project-Wide Settings (`config/project.config.ts`)

This file (`projectConfig`) controls:

-   **`appName: string`**: Your application's name. Used in headers, tab titles, etc. Can be updated at runtime (e.g., via Application Config) and is persisted in Local Storage.
-   **`appIconPaths: string[]`**: SVG path `d` attributes for the main app icon (shown in header and next to page titles). If empty or not provided, a generic document icon (`FileText` from Lucide) is used. This setting also dynamically sets the browser tab icon (favicon).
-   **`availableAccentColors` & `defaultAccentColorName`**: Predefined accent colors for the Theme Switcher.
-   **`availableBorderRadii` & `defaultBorderRadiusName`**: Border radius options.
-   **`availableAppVersions` & `defaultAppVersionId`**: Define different app "versions" (e.g., 'v1.0.0', 'beta'). Affects UI/features (see Dashboard).
-   **`availableFontSizes` & `defaultFontSizeName`**: Font size options for base HTML font size.
-   **`availableScales` & `defaultScaleName`**: Screen scaling/zoom options.
-   **`enableApplicationConfig: boolean`**: Toggle the AI Application Config feature (default: `true`). If `false`, links/cards are hidden, and direct access shows a "disabled" message.
-   **`mockApiMode: boolean`**: Set to `true` to use mock API and Local Storage for data. Set to `false` to use real API calls (requires `NEXT_PUBLIC_API_BASE_URL` to be set in `.env.local`).

### 2. Theme Customization (Runtime)

Users can customize:
-   **Mode**: Light, Dark, System.
-   **Accent Color**: Predefined or custom HEX.
-   **Border Radius**: Predefined options.
-   **Font Size**: Predefined options.
-   **App Scale**: Predefined options.
Managed by `contexts/theme-provider.tsx`, saved in Local Storage.

### 3. Sidebar Navigation (`config/sidebar.config.ts`)

Defines sidebar items:
-   `id`, `label`, `href`, `icon` (Lucide), `roles?` (access control), `subItems?` (nested menus), `disabled?`.
-   Dynamically rendered based on config and user role.

### 4. Role-Based Access Control (RBAC) (`config/roles.config.ts`)

-   **`roles: Role[]`**: Available roles (e.g., `admin`, `user`).
-   **`routePermissions: Record<string, Role[]>`**: Maps routes to allowed roles (e.g., `'/users': ['admin']`).
-   **`defaultRole: Role`**: Role for new (dummy) users.
-   Access control is enforced by `contexts/auth-provider.tsx` (or `contexts/mock-auth-provider.tsx` if in mock mode). Unauthorized navigation attempts redirect to `/dashboard` with a toast message.

## Connecting to Your Backend API

To switch from the mock API to your real backend:

1.  **Set API Base URL**:
    *   In `.env.local`, set `NEXT_PUBLIC_API_BASE_URL` to your backend's URL (e.g., `https://your-api.com/v1`).
    *   Restart your Next.js server.

2.  **Disable Mock API Mode**:
    *   In `config/project.config.ts`, set `mockApiMode: false`.

3.  **Update API Service Functions (`services/api.real.ts`)**:
    *   This file currently has placeholder functions for real API calls.
    *   Modify these functions (e.g., `_realFetchUsers`, `_realLoginUser`) to make actual HTTP requests to your backend endpoints using the pre-configured `apiClient` (an Axios instance).
    *   **Example - Modifying `_realFetchUsers`**:
        ```typescript
        // Before (Placeholder)
        // export const _realFetchUsers = async (): Promise<UserProfile[]> => {
        //   // Replace with actual API call
        //   console.warn('Real API: _realFetchUsers not implemented');
        //   return [];
        // };

        // After (Real API Call)
        import type { UserProfile } from '@/types';
        export const _realFetchUsers = async (): Promise<UserProfile[]> => {
          try {
            const response = await apiClient.get('/users'); // Your endpoint
            return response.data; // Assuming your API returns an array of UserProfile
          } catch (error) {
            console.error('Error fetching users:', error);
            throw error; // Or handle error as appropriate
          }
        };
        ```
    *   Update all relevant functions in `services/api.real.ts` to match your backend's API.

4.  **Authentication (Real API)**:
    *   The `contexts/auth-provider.tsx` handles real API authentication when `mockApiMode` is `false`.
    *   **Login (`_realLoginUser` in `services/api.real.ts`)**:
        *   This function should call your backend's login endpoint.
        *   It's expected to return a JWT token (or similar session identifier) and basic user info (UID, role).
        *   The `apiClient` in `services/api.ts` is set up to automatically include the JWT token from cookies in subsequent requests. Ensure your backend sets an HTTP-only cookie for the token.
    *   **Fetch User Profile (`_realFetchUserProfile` in `services/api.real.ts`)**:
        *   After login, this function is called to get detailed user profile information (including theme preferences if stored on the backend).
    *   **Registration, Password Change, etc.**: Implement these in `services/api.real.ts` to call your backend.
    *   **Token Management**:
        *   The `apiClient` in `services/api.ts` automatically includes the `Authorization: Bearer <token>` header if a token is found in cookies (key: `genesis_token`).
        *   Your backend should issue this token upon login and verify it for protected routes.

5.  **Data Types**:
    *   Ensure TypeScript types in `types/index.ts` (e.g., `UserProfile`) match your API's data structures.
    *   If your backend stores user theme preferences (accent color, radius, etc.), ensure `UserProfile` type includes these, and `_realFetchUserProfile` returns them. The `ThemeProvider` will then use these preferences.

## Adding a New Page

Guide to adding new pages:

### 1. Create the Page File

-   Create a new `.tsx` file in the `app/` directory. For example, `app/my-new-page/page.tsx` (accessible at `/my-new-page`).
-   Use Next.js App Router conventions. Authenticated pages typically use `AuthenticatedPageLayout`.

**Example:** `app/my-new-page/page.tsx`
```tsx
// app/my-new-page/page.tsx
'use client';

import React from 'react';
import { AuthenticatedPageLayout } from '@/components/layout/authenticated-page-layout';
import { PageTitleWithIcon } from '@/components/layout/page-title-with-icon';

const MyNewPage = () => {
  return (
    <AuthenticatedPageLayout>
      <PageTitleWithIcon title="My New Page Title" />
      <div>
        <p>Page content goes here.</p>
      </div>
    </AuthenticatedPageLayout>
  );
};

export default MyNewPage;
```

### 2. Add to Sidebar (Optional)

-   Update `config/sidebar.config.ts`. Import icons and add a `SidebarNavItem`.
```typescript
// config/sidebar.config.ts
import type { SidebarConfig, SidebarNavItem } from '@/types';
import { PlusCircle, /* other icons */ } from 'lucide-react';
// ...
const sidebarItems: SidebarNavItem[] = [
  // ... other items
  {
    id: 'mynewpage',
    label: 'My New Page',
    href: '/my-new-page', // Matches file structure
    icon: PlusCircle,
    roles: ['admin', 'user'], // Adjust as needed
  },
];
// ...
export const sidebarConfig: SidebarConfig = { items: sidebarItems };
```

### 3. Configure Route Permissions (Optional)

-   Update `config/roles.config.ts` if the page needs specific role access.
```typescript
// config/roles.config.ts
// ...
export const rolesConfig: RolesConfig = {
  // ...
  routePermissions: {
    // ... other permissions
    '/my-new-page': ['admin', 'user'], // Added permission
  },
  // ...
};
```

### 4. Page Title and Icon

-   **Browser Tab Title**: Set the `document.title` dynamically in a `useEffect` hook in your page component if you want it to depend on theme settings (like `appName`).
    ```tsx
    // app/my-new-page/page.tsx
    'use client';

    import React, { useEffect } from 'react';
    import { useTheme } from '@/contexts/theme-provider';
    // ... other imports

    const MyNewPage = () => {
      const { appName } = useTheme();
      useEffect(() => {
        document.title = `My New Page Title | ${appName}`;
      }, [appName]);
      // ... rest of component
      return (/* JSX as in Step 1 */);
    };
    export default MyNewPage;
    ```
-   **Displayed Page Title**: Use the `PageTitleWithIcon` component (see Step 1 example). This component displays the `title` prop along with the global application icon.
-   **Page Icon (Next to Title)**: `PageTitleWithIcon` automatically uses the global app icon defined by `appIconPaths` in `config/project.config.ts`. If no icon is set there, it defaults to a `FileText` icon.
-   **Global App Icon (Header & Favicon)**:
    *   **In-App Icon**: Modify `appIconPaths` in `config/project.config.ts`. These are SVG path `d` attributes.
    *   **Browser Tab Icon (Favicon)**: The favicon is also dynamically set based on `appIconPaths`. If `appIconPaths` is empty, it defaults to `public/favicon.svg`. To customize the default, replace or update `public/favicon.svg`.

### 5. Use Theme Settings

-   Import `useTheme` from `contexts/theme-provider.tsx` to access `accentColor`, `borderRadius`, etc.
```tsx
// app/my-new-page/page.tsx (inside your component)
import { useTheme } from '@/contexts/theme-provider';
import { Button } from '@/components/ui/button';

const { accentColor, borderRadius } = useTheme();
// ...
<p style={{ color: `hsl(${accentColor})` }}>Styled text.</p>
<Button style={{ borderRadius: borderRadius }}>Styled Button</Button>
```

### 6. Version-Specific Content

-   Use `appVersion` from `useTheme` to show different content based on the selected application version.
```tsx
// app/my-new-page/page.tsx
import { useTheme } from '@/contexts/theme-provider';
const { appVersion } = useTheme();
// ...
{appVersion === 'v1.0.0' && <p>Content for Version 1.0.</p>}
{appVersion === 'v0.9.0-beta' && <p>Content for Beta.</p>}
```

### 7. Add "Appearance" Dropdowns (Theme Switcher Style)

-   To replicate Theme Switcher dropdowns (mode, accent, radius, version, font size, scale):
    *   Use the `useTheme` hook for current values and setters.
    *   Adapt JSX from `components/layout/theme-switcher.tsx` or create a new reusable component.
    *   Use `projectConfig.availableAccentColors`, `projectConfig.availableBorderRadii`, `projectConfig.availableAppVersions`, `projectConfig.availableFontSizes`, and `projectConfig.availableScales` for dropdown options.

### 8. Create a New Application Version

1.  **Define in `config/project.config.ts`**:
    *   Add a new object to `availableAppVersions` (e.g., `{ name: 'Version 2.0 Alpha', id: 'v2.0.0-alpha' }`).
    ```typescript
    // config/project.config.ts
    export const projectConfig: ProjectConfig = {
      // ...
      availableAppVersions: [
        { name: 'Version 1.0', id: 'v1.0.0' },
        { name: 'Beta Preview', id: 'v0.9.0-beta' },
        { name: 'Dev Build', id: 'dev' },
        { name: 'New Version Alpha', id: 'v2.0.0-alpha' }, // New version
      ],
      // ...
    };
    ```
2.  **Implement Logic**: Use `appVersion` from `useTheme` (as shown in Step 6) to control UI/features for the new version ID.

The new version will then appear in the version switchers (sidebar and theme switcher dropdown).

## Performance Tips

Optimizing your Next.js application is key to a great user experience. Here are some tips, especially relevant to the dynamic features of this template:

1.  **Leverage Next.js Features**:
    *   **App Router**: Already in use, promoting server components and efficient routing.
    *   **Code Splitting**: Next.js automatically splits code by page. Ensure your components are well-modularized.
    *   **`next/image`**: Use for all static images to get automatic optimization. For dynamic external images (like `placehold.co`), `unoptimized={true}` is appropriate if they are already optimized or to avoid build errors.
    *   **`next/dynamic`**: Use for components that are not critical for the initial page load (e.g., complex charts, modals not shown by default). This is already used for Recharts in `DashboardBetaContent`.

2.  **React Best Practices**:
    *   **`React.memo`**: Wrap components that re-render unnecessarily with `React.memo`. This is useful for components that receive the same props often. Several components in this template already use it.
    *   **`useCallback` and `useMemo`**: Memoize functions and values to prevent unnecessary re-renders of child components or expensive calculations. These are used in providers and data-heavy components.
    *   **Minimize Re-renders**:
        *   Be mindful of context updates. The `ThemeProvider` and `AuthProvider` (or `MockAuthProvider`) provide dynamic data. Components consuming these contexts will re-render when the context value changes.
        *   Structure components to only subscribe to the parts of the context they need, if possible (though often context provides a single object).
        *   Use selectors with state management libraries if you introduce them (e.g., Zustand, Redux).

3.  **Optimize Dynamic Features**:
    *   **Theming (Accent, Radius, App Name, Icon, Font Size, Scale)**:
        *   The `ThemeProvider` updates can trigger re-renders across components using `useTheme`. Ensure components are memoized if they don't visually change with every theme update.
        *   The dynamic app icon uses SVG paths. Keep these paths reasonably simple.
        *   Font size changes affect the root element, leading to a global reflow. Use sparingly if frequent changes are expected by the user.
        *   App scaling (`zoom`) also causes a global reflow.
    *   **App Version Switching**:
        *   Conditional rendering (`{appVersion === 'v1.0.0' && <ComponentForV1 />}`) is efficient.
        *   Avoid overly complex logic directly within the render method based on `appVersion`. Abstract into separate, memoized components if necessary.
    *   **Application Config (AI Analyzer)**:
        *   AI analysis calls (`analyzeConfig`) are asynchronous and can take time. The `useAiConfigAnalysis` hook handles loading states. Ensure UI remains responsive.
        *   Consider debouncing user input for the "Raw Configuration Files" if performance becomes an issue with rapid typing triggering analyses (though currently, analysis is manual via button click).

4.  **Bundle Size & Assets**:
    *   **Analyze Your Bundle**: Use `@next/bundle-analyzer` to inspect what's contributing to your JavaScript bundle sizes.
    *   **Tree Shaking**: Ensure your imports are structured to allow for effective tree shaking (e.g., `import { SpecificIcon } from 'lucide-react';` rather than `import * as LucideIcons from 'lucide-react';`).
    *   **SVGs**: For icons, prefer importing specific icons from `lucide-react` as done. For custom complex SVGs, consider optimizing them using tools like SVGO.

5.  **Data Fetching (for Real API)**:
    *   When connecting to a real backend, use efficient data fetching libraries like SWR or React Query for caching, revalidation, and optimistic updates.
    *   Fetch only the data needed for the current view.

6.  **General Tips for New Pages/Components**:
    *   **Keep Components Small and Focused**: Follow the Single Responsibility Principle. Break down complex pages into smaller, manageable components.
    *   **Profile Performance**: Use browser developer tools (Profiler tab) to identify performance bottlenecks in your components.
    *   **Test on Various Devices/Networks**: Performance can vary. Test on less powerful devices or slower network conditions to find areas for improvement.

By keeping these tips in mind as you develop new features and pages, you can maintain a performant and responsive application.
