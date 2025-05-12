# Genesis Template (formerly Firebase Studio)

This is a Next.js starter template, "Genesis Template", designed for rapid development with Firebase integration.

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
3.  **Set up Firebase Environment Variables**:
    *   Rename the `.env.example` file (if it exists) or the existing `.env` file to `.env.local`.
        *   Using `.env.local` is recommended as it's typically ignored by Git and ensures your credentials are not accidentally committed.
    *   Open the `.env.local` file.
    *   You will see placeholder values for Firebase configuration (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY_HERE"`).
    *   Replace these placeholders with your actual Firebase project's credentials. You can find these in your Firebase project console:
        *   Go to your Firebase project.
        *   Click on "Project settings" (the gear icon).
        *   Under the "General" tab, scroll down to "Your apps".
        *   If you haven't added a web app, do so now.
        *   Select your web app, and you'll find the Firebase SDK snippet with a `firebaseConfig` object. Copy the corresponding values into your `.env.local` file.
    *   **Example of variables in `.env.local`**:
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
        NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="12345..."
        NEXT_PUBLIC_FIREBASE_APP_ID="1:12345...:web:..."
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-..." # Optional
        ```
    *   **Important**: Ensure the variable names in your `.env.local` file exactly match those used in `src/lib/firebase.ts` (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`).

4.  **Run the development server**:
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    The application should now be running, typically on `http://localhost:9002`.

5.  **Explore the App**:
    *   Navigate to `src/app/page.tsx` to see the entry point.
    *   Check out the core features like Theme Switcher, Profile Editor, Role-Based Access Control, Dynamic Sidebar, and the AI Config Advisor.

## Core Features

-   **Theme Switcher**: Dynamic theme customization (dark/light modes, accent color, border radius). Access via the palette icon in the header.
-   **Profile Editor**: User profile management (personal details, password change).
-   **Access Control**: Role-based access control for routes, configured in `src/config/roles.config.ts`.
-   **Sidebar Manager**: Dynamic sidebar navigation, configured in `src/config/sidebar.config.ts`, with a minimize option.
-   **Config Advisor**: AI-powered tool to analyze configuration files (`project.config.ts`, `sidebar.config.ts`, `roles.config.ts`) for improvements. Accessible to admins.

## Genkit for AI Features

This application uses Genkit for AI-related functionalities like the Config Advisor.
-   Genkit flows are typically located in `src/ai/flows/`.
-   To run Genkit services locally for development (e.g., if you extend AI features):
    ```bash
    npm run genkit:dev
    # or for watching changes
    npm run genkit:watch
    ```

## Troubleshooting Firebase Errors

-   **`Firebase: Error (auth/invalid-api-key)` or `Firebase: Error (auth/api-key-not-valid)`**:
    This means the API key in your `.env.local` file is incorrect or not recognized by Firebase. Double-check that you've copied the correct `apiKey` from your Firebase project settings into `NEXT_PUBLIC_FIREBASE_API_KEY`.
-   **"Configuration Error: Firebase authentication is not configured..."**:
    This alert in the UI means that essential Firebase configuration variables (like `NEXT_PUBLIC_FIREBASE_API_KEY` or `NEXT_PUBLIC_FIREBASE_PROJECT_ID`) are missing or empty in your environment. Ensure your `.env.local` file is correctly set up and that the Next.js development server has been restarted after changes.

Refer to `src/lib/firebase.ts` to see how environment variables are consumed.
