
# Genesis Template

This is a Next.js starter template, "Genesis Template", designed for rapid development, now using a mock API service layer for backend interactions.

## Getting Started

To get started with the Genesis Template:

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  **Set up Environment Variables**:
    *   A file named `.env` has been provided in the root of your project.
    *   You should copy this file to `.env.local`. `.env.local` is ignored by Git and is where your local environment-specific variables should go.
        ```bash
        cp .env .env.local
        ```
    *   Open your `.env.local` file.
    *   The primary variable to configure if you decide to connect to a real backend is `NEXT_PUBLIC_API_BASE_URL`.
        *   Initially, this can be left blank or as a placeholder, as the application uses an internal mock API service by default (see "Mock API and Data" section below).
        *   When you're ready to connect to your actual backend, update this URL to point to your API's base endpoint.
        Example:
        ```env
        NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api"
        # Or for a production API:
        # NEXT_PUBLIC_API_BASE_URL="https://api.yourdomain.com"
        ```
    *   No Firebase configuration is required as Firebase has been removed.

4.  **Restart your development server**:
    If your Next.js development server was already running, you **must restart it** for any new environment variables in `.env.local` to be loaded.
    ```bash
    # Stop the server (Ctrl+C or Cmd+C) if running, then:
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    The application should now be running, typically on `http://localhost:9002`.

5.  **Explore the App**:
    *   Navigate to `src/app/page.tsx` which redirects to `/auth/login`.
    *   The application uses a dummy authentication system. Default credentials are:
        *   Admin: `admin@dummy.com` / `password123`
        *   User: `user@dummy.com` / `password123`
    *   You can register new dummy users. Their data and session state are managed using browser Local Storage.
    *   Check out core features like Theme Switcher, Profile Editor, Role-Based Access Control (mocked), Dynamic Sidebar, and the AI Config Advisor.

## Core Features

-   **Theme Switcher**: Dynamic theme customization (dark/light modes, accent color, border radius). Access via the palette icon in the header.
-   **Profile Editor**: User profile management (personal details, password change) using mock services.
-   **Access Control**: Role-based access control for routes (mocked), configured in `src/config/roles.config.ts`.
-   **Sidebar Manager**: Dynamic sidebar navigation, configured in `src/config/sidebar.config.ts`, with a minimize option.
-   **Config Advisor**: AI-powered tool to analyze configuration files (`project.config.ts`, `sidebar.config.ts`, `roles.config.ts`) for improvements. Accessible to (mock) admins. This feature can be enabled or disabled (see "Application Configuration" section below).

## Genkit for AI Features

This application uses Genkit for AI-related functionalities like the Config Advisor.
-   Genkit flows are typically located in `src/ai/flows/`.
-   To run Genkit services locally for development (e.g., if you extend AI features):
    ```bash
    npm run genkit:dev
    # or for watching changes
    npm run genkit:watch
    ```

## Mock API and Data Persistence

The application currently uses a mock API service layer located in `src/services/api.ts`. This layer simulates backend interactions and uses dummy data primarily from `src/data/dummy-data.ts`. This allows for full frontend development and testing without a live backend. User authentication is also handled by a dummy system.

Data is persisted in the browser's **Local Storage**:
-   **User Session & Details**:
    *   `genesis_current_dummy_user`: Stores the profile of the currently logged-in (dummy) user. Managed by `src/contexts/auth-provider.tsx`.
    *   `genesis_mfa_verified`: Stores a boolean flag indicating if the current user has completed the mock MFA step. Managed by `src/contexts/auth-provider.tsx`.
-   **Dummy User Database**:
    *   `genesis_dummy_users`: Stores an array of all registered dummy users. This is used by the User Management features and the mock API service in `src/services/api.ts`.
-   **Theme Settings (`src/contexts/theme-provider.tsx`)**:
    *   `genesis-theme-mode`: Stores the selected theme (light, dark, system).
    *   `genesis-theme-accent`: Stores the selected accent color (HSL or HEX string).
    *   `genesis-theme-radius`: Stores the selected border radius value (e.g., "0.5rem").
    *   `genesis-theme-version`: Stores the selected application version ID.
    *   `genesis-theme-app-name`: Stores the application name.
    *   `genesis-theme-app-icon-paths`: Stores the SVG path data for the dynamic app icon.
-   **Config Advisor Inputs (`src/app/(app)/config-advisor/page.tsx`)**:
    *   `configAdvisorInputs`: Stores the user's input for the project, sidebar, and roles configuration content for analysis.

**Note**: This Local Storage persistence is for the mock/dummy setup. When you integrate a real backend API, this data would typically be stored in your backend database, and Local Storage would primarily be used for session tokens or minimal client-side preferences.

## Application Configuration

Most application-level configurations are centralized in the `src/config/` directory.

### 1. Project-Wide Settings (`src/config/project.config.ts`)

This file (`projectConfig`) controls fundamental aspects of the application:

-   **`appName: string`**:
    *   Sets the application's name, displayed in the header, browser title, and other UI elements.
    *   Dynamically updated via the ThemeProvider and `ThemeSwitcher` component if changed at runtime (e.g., through Config Advisor page).
-   **`appIconPaths: string[]`**:
    *   An array of SVG path `d` attributes that define the application's main icon. This icon is rendered dynamically in the header and auth layout.
    *   Can be updated via `ThemeProvider` if needed.
-   **`availableAccentColors: AccentColor[]`** and **`defaultAccentColorName: string`**:
    *   `AccentColor = { name: string; hslValue: string; hexValue: string; }`
    *   Defines the list of predefined accent colors available in the `ThemeSwitcher`.
    *   `defaultAccentColorName` specifies which of these colors is the default.
    *   The `ThemeSwitcher` also allows users to pick a custom HEX color.
-   **`availableBorderRadii: BorderRadiusOption[]`** and **`defaultBorderRadiusName: string`**:
    *   `BorderRadiusOption = { name: string; value: string; }` (e.g., `{ name: 'Medium', value: '0.5rem' }`)
    *   Defines the border radius options available in the `ThemeSwitcher`.
    *   `defaultBorderRadiusName` sets the default.
-   **`availableAppVersions: AppVersion[]`** and **`defaultAppVersionId: string`**:
    *   `AppVersion = { name: string; id: string; }`
    *   Allows defining different "versions" or modes of the application (e.g., 'v1.0.0', 'beta', 'dev').
    *   The selected version can alter UI components or features, as seen in the Dashboard page.
    *   Users can switch versions via the dropdown in the `AppSidebar` or `ThemeSwitcher`.
-   **`enableConfigAdvisor: boolean`**:
    *   Controls the visibility and accessibility of the AI Config Advisor feature.
    *   If `false`:
        *   "Config Advisor" link is removed from the sidebar.
        *   "Config Advisor" card is hidden from the admin dashboard.
        *   Direct navigation to `/config-advisor` shows a "Feature Disabled" message.
    *   If `true` (default): The feature is available to admin users.

### 2. Theme Customization (Runtime)

Users can customize the theme at runtime using the **Theme Switcher** (palette icon in the header):
-   **Mode**: Light, Dark, or System preference.
-   **Accent Color**: Choose from predefined colors (from `project.config.ts`) or pick a custom HEX color. The application uses HSL CSS variables (`--accent-h`, `--accent-s`, `--accent-l`) in `src/app/globals.css` for dynamic theming.
-   **Border Radius**: Select from predefined border radius options (from `project.config.ts`). This updates the `--radius` CSS variable.

These settings are managed by `src/contexts/theme-provider.tsx` and persisted in Local Storage.

### 3. Sidebar Navigation (`src/config/sidebar.config.ts`)

This file defines the navigation items displayed in the application sidebar:
-   Each `SidebarNavItem` object includes:
    *   `id`: A unique identifier.
    *   `label`: The text displayed for the item.
    *   `href`: The path the item links to.
    *   `icon`: A Lucide icon component.
    *   `roles?`: An optional array of `Role` (e.g., `['admin', 'user']`) that determines who can see the item. If omitted, it's visible to all authenticated users who meet other criteria.
    *   `subItems?`: An optional array of `SidebarNavItem` for creating nested menus.
    *   `disabled?`: A boolean to disable the item.
-   The sidebar dynamically renders items based on this configuration and the current user's role.
-   The Config Advisor link is conditionally added based on `projectConfig.enableConfigAdvisor`.

### 4. Role-Based Access Control (RBAC) (`src/config/roles.config.ts`)

This file configures user roles and their permissions:
-   **`roles: Role[]`**: Defines all available roles in the system (e.g., `['admin', 'user', 'guest']`).
-   **`routePermissions: Record<string, Role[]>`**: Maps base route paths to an array of roles allowed to access them.
    *   Example: `'/users': ['admin']` means only users with the 'admin' role can access `/users` and its sub-routes.
    *   The `AuthProvider` and page-level checks use this for route protection.
-   **`defaultRole: Role`**: Specifies the role assigned to newly registered (dummy) users.


## Connecting to Your Backend API

To connect the Genesis Template to your actual backend API, follow these steps:

1.  **Set `NEXT_PUBLIC_API_BASE_URL`**:
    *   In your `.env.local` file, update `NEXT_PUBLIC_API_BASE_URL` to point to your backend's base URL. For example:
        ```env
        NEXT_PUBLIC_API_BASE_URL="https://your-api.example.com/v1"
        ```
    *   Restart your Next.js development server for this change to take effect.

2.  **Update API Service Functions**:
    *   Open `src/services/api.ts`. This file contains functions like `fetchUsers`, `addUser`, `updateUserProfile`, etc. Currently, these functions return mock data or simulate API calls.
    *   Modify these functions to make actual HTTP requests to your backend endpoints using an HTTP client like `axios` (which is already set up as `apiClient` within this file) or the native `fetch` API.
    *   **Example - Modifying `fetchUsers`**:
        ```typescript
        // Before (Mock Implementation) in src/services/api.ts
        // export const fetchUsers = async (): Promise<UserProfile[]> => {
        //   console.log('API Service: Mock fetchUsers called');
        //   return Promise.resolve([...currentMockUsers]);
        // };

        // After (Real API Call) in src/services/api.ts
        import type { UserProfile } from '@/types'; // Ensure UserProfile type matches your API response
        // ... (apiClient setup remains the same)

        export const fetchUsers = async (): Promise<UserProfile[]> => {
          try {
            const response = await apiClient.get('/users'); // Replace '/users' with your actual endpoint
            return response.data; // Assuming your API returns user data in response.data
          } catch (error) {
            console.error('Error fetching users:', error);
            // Handle errors appropriately, e.g., throw error or return empty array
            throw error;
          }
        };
        ```
    *   Update all relevant functions in `src/services/api.ts` (`addUser`, `updateUser`, `deleteUser`, `loginUser`, `registerUser`, `updateUserProfile`, `changeUserPassword`, `forgotPassword`, etc.) to interact with your backend endpoints. Ensure the request payloads and response data structures match your API's specifications.

3.  **Authentication**:
    *   The current application uses a dummy authentication system managed by `src/contexts/auth-provider.tsx` and `src/services/api.ts` (mock `loginUser`, `registerUser`).
    *   You will need to replace this with your backend's authentication mechanism.
    *   Modify `loginUser` and `registerUser` in `src/services/api.ts` to call your backend's auth endpoints.
    *   Adjust `src/contexts/auth-provider.tsx` to handle tokens (e.g., JWTs) received from your backend, store them securely (e.g., HttpOnly cookies managed by the backend, or localStorage for client-side tokens if appropriate for your security model), and include them in `apiClient` requests (e.g., via Authorization headers).
    *   The `apiClient` in `src/services/api.ts` can be configured with interceptors to automatically add auth tokens to requests.

4.  **Data Types**:
    *   Ensure the TypeScript types defined in `src/types/index.ts` (e.g., `UserProfile`) match the data structures your backend API expects and returns. Update these types as necessary.

By following these steps, you can transition the Genesis Template from using its mock API to interacting with your live backend services.
The folder structure utilizes Next.js App Router conventions. Components are primarily sourced from Shadcn UI, ensuring a consistent and modern look and feel.


## Adding a New Page

This section guides you on adding new pages to the application and configuring them within the existing structure.

### 1. Create the Page File

Create a new `.tsx` file inside the `src/app` directory. Follow Next.js's [App Router conventions](https://nextjs.org/docs/app/building-your-application/routing) for file naming and placement.

*   For a simple page, place it directly in `src/app`. For example, `src/app/newpage/page.tsx`.
*   For grouped routes or routes with layouts, you can use directories without affecting the URL path (e.g., `src/app/(main)/newpage/page.tsx`) or standard directories that become part of the URL path (e.g., `src/app/main/newpage/page.tsx`).

**Example:**  `src/app/my-new-page/page.tsx` (This will be accessible at `/my-new-page`)

```tsx
// src/app/my-new-page/page.tsx
'use client';

import React from 'react';

const MyNewPage = () => {
  return (
    <div>
      <h1>My New Page</h1>
      <p>This is a dynamically added page.</p>
    </div>
  );
};

export default MyNewPage;
```

### 2. Add a Sidebar Item (Optional)

If the new page should be accessible from the sidebar, update `src/config/sidebar.config.ts`.

*   Import any necessary icons from `lucide-react`.
*   Add a new `SidebarNavItem` object to the `items` array.

```typescript
// src/config/sidebar.config.ts
import type { SidebarConfig, SidebarNavItem } from '@/types';
import { LayoutDashboard, Users, UserCircle, Cog, ShieldQuestion, FileText, BarChart3, PlusCircle } from 'lucide-react';
import { projectConfig } from './project.config'; // Import projectConfig

const sidebarItems: SidebarNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'user'],
  },
  // ... other items
  {
    id: 'mynewpage',
    label: 'My New Page',
    href: '/my-new-page', // Match the file structure from Step 1
    icon: PlusCircle, // Example icon
    roles: ['admin', 'user'],  // Adjust roles as needed
  },
];

// Conditionally add Config Advisor
if (projectConfig.enableConfigAdvisor) {
  sidebarItems.push({
    id: 'config-advisor',
    label: 'Config Advisor',
    href: '/config-advisor',
    icon: ShieldQuestion,
    roles: ['admin'],
  });
}
// ...

export const sidebarConfig: SidebarConfig = {
  items: sidebarItems,
};
```

### 3. Configure Route Permissions (Optional)

If the page requires specific roles for access, update `src/config/roles.config.ts`.

*   Add the route to the `routePermissions` object, specifying the allowed roles.

```typescript
// src/config/roles.config.ts
import type { RolesConfig } from '@/types';

export const rolesConfig: RolesConfig = {
  roles: ['admin', 'user', 'guest'],
  routePermissions: {
    '/dashboard': ['admin', 'user'],
    '/users': ['admin'],
    '/profile': ['admin', 'user'],
    '/config-advisor': ['admin'],
    '/my-new-page': ['admin', 'user'],  // Added permission rule
    '/auth/login': ['guest'],
    '/auth/register': ['guest'],
    '/auth/mfa': ['guest'], 
  },
  defaultRole: 'user',
};
```
The `AuthProvider` uses these permissions to protect routes. Ensure your middleware in `src/middleware.ts` also correctly handles routing based on authentication status.

### 4. Integrate Theme Settings

To use theme settings (accent color, border radius, etc.) on the new page, import the `useTheme` hook from `src/contexts/theme-provider.tsx`.

```tsx
// src/app/my-new-page/page.tsx
'use client';

import React from 'react';
import { useTheme } from '@/contexts/theme-provider';
import { Button } from '@/components/ui/button'; // Example component

const MyNewPage = () => {
  const { appName, accentColor, borderRadius } = useTheme();

  return (
    <div className="p-4">
      <h1>{appName} - My New Page</h1>
      <p style={{ color: `hsl(${accentColor})` }}>This text uses the current accent color.</p>
      <Button style={{ borderRadius: borderRadius }}>Styled Button</Button>
      {/* Page content */}
    </div>
  );
};

export default MyNewPage;
```

### 5. Handle Version-Specific Content

To display different content or components based on the selected application version, use the `appVersion` property from the `useTheme` hook.

```tsx
// src/app/my-new-page/page.tsx
'use client';

import React from 'react';
import { useTheme } from '@/contexts/theme-provider';

const MyNewPage = () => {
  const { appVersion } = useTheme();

  return (
    <div>
      <h1>My New Page (Version: {appVersion})</h1>
      {appVersion === 'v1.0.0' && <p>Content specific to Version 1.0.</p>}
      {appVersion === 'v0.9.0-beta' && <p>This is content for the Beta Preview.</p>}
      {appVersion === 'dev' && <p>Developer-specific features or information can be shown here.</p>}
    </div>
  );
};

export default MyNewPage;
```

### 6. Add "Appearance" Dropdown Options (Theme Switcher Integration)

The Theme Switcher (`src/components/layout/theme-switcher.tsx`) provides options for mode, accent color, border radius, and app version. If your new page needs to directly interact with or display these options (beyond just using the theme context), you can:

*   **Use the `useTheme` hook**: Access `theme`, `accentColor`, `borderRadius`, `appVersion`, and their respective setters (`setTheme`, `setAccentColor`, etc.).
*   **Replicate Dropdown Logic**: If you need a similar dropdown structure within your page, you can adapt the JSX and logic from `ThemeSwitcher` or create a new component that consumes `useTheme` and `projectConfig.availableAccentColors`, `projectConfig.availableBorderRadii`, etc.

**Example of a simple custom accent color picker within your page:**
```tsx
// src/app/my-new-page/page.tsx
'use client';

import React from 'react';
import { useTheme } from '@/contexts/theme-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Shadcn UI
import { Label } from '@/components/ui/label';

const MyNewPage = () => {
  const { accentColor, setAccentColor, availableAccentColors } = useTheme();

  return (
    <div>
      <h1>My New Page</h1>
      <div className="my-4">
        <Label htmlFor="page-accent-selector">Select Accent Color:</Label>
        <Select
          value={accentColor} // This should match the HSL value string if a predefined color is selected
          onValueChange={(newHslValue) => setAccentColor(newHslValue)}
        >
          <SelectTrigger id="page-accent-selector" className="w-[180px]">
            <SelectValue placeholder="Select color" />
          </SelectTrigger>
          <SelectContent>
            {availableAccentColors.map(colorOption => (
              <SelectItem key={colorOption.name} value={colorOption.hslValue}>
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full border" style={{ backgroundColor: `hsl(${colorOption.hslValue})` }} />
                  {colorOption.name}
                </div>
              </SelectItem>
            ))}
            {/* You could add a custom color picker input here too */}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default MyNewPage;
```

### 7. Creating a New Application Version

To add a new application version that users can switch to:

1.  **Define the Version**: Open `src/config/project.config.ts`.
2.  **Add to `availableAppVersions`**: Add a new object to the `availableAppVersions` array. Each object should have a unique `id` (e.g., `'v2.0.0'`) and a user-friendly `name` (e.g., `'Version 2.0 Alpha'`).

    ```typescript
    // src/config/project.config.ts
    export const projectConfig: ProjectConfig = {
      // ... other settings
      availableAppVersions: [
        { name: 'Version 1.0', id: 'v1.0.0' },
        { name: 'Beta Preview', id: 'v0.9.0-beta' },
        { name: 'Dev Build', id: 'dev' },
        { name: 'New Version 2.0', id: 'v2.0.0' }, // Example: New version added
      ],
      defaultAppVersionId: 'v1.0.0', // You might want to update this if the new version is default
      // ...
    };
    ```
3.  **Implement Version-Specific Logic**: Use the `appVersion` from the `useTheme` hook in your components and pages to conditionally render content or apply different styles/logic for this new version ID (as shown in "Handle Version-Specific Content" above).

After these steps, the new version will appear in the version switcher dropdowns (in the `AppSidebar` and `ThemeSwitcher`), and your application can react to its selection.
