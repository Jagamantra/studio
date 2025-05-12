md
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
    *   A file named `.env` has been provided in the root of your project with placeholder values.
    *   You should copy this file to `.env.local` (if you prefer to keep `.env` as a template or for other environments). `.env.local` is ignored by Git by default and ensures your credentials are not committed.
        ```bash
        cp .env .env.local
        ```
    *   Open your `.env.local` file.
    *   You **must** populate it with your Firebase project's configuration, replacing the placeholder values.
    *   **Where to find your Firebase config values**:
        1.  Go to the [Firebase Console](https://console.firebase.google.com/).
        2.  Select your Firebase project (or create one if you haven't).
        3.  In the project overview, click on "Project settings" (the gear icon ⚙️ usually near the project name).
        4.  Under the "General" tab, scroll down to the "Your apps" section.
        5.  If you haven't added a web app yet, click the "Web" icon (</>) to add one. Follow the prompts to register your app (you can use a nickname like "My Next.js App").
        6.  After registering (or if you select an existing web app), you'll find the Firebase SDK setup snippet. It will look something like this:
            ```javascript
            const firebaseConfig = {
              apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX", // This is the crucial one
              authDomain: "your-project-id.firebaseapp.com",
              projectId: "your-project-id",
              storageBucket: "your-project-id.appspot.com",
              messagingSenderId: "123456789012",
              appId: "1:123456789012:web:XXXXXXXXXXXXXXXXXXXXXX",
              measurementId: "G-XXXXXXXXXX" // Optional
            };
            ```
    *   Copy these values into your `.env.local` file, replacing the placeholder values. **It is critical that the variable names in `.env.local` exactly match those used in `src/lib/firebase.ts` and shown in the `.env` file.**
    *   **Example `.env.local` content (after you've filled it with your actual keys)**:
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY="REPLACE_WITH_YOUR_FIREBASE_API_KEY"
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="REPLACE_WITH_YOUR_FIREBASE_AUTH_DOMAIN"
        NEXT_PUBLIC_FIREBASE_PROJECT_ID="REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID"
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="REPLACE_WITH_YOUR_FIREBASE_STORAGE_BUCKET"
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="REPLACE_WITH_YOUR_FIREBASE_MESSAGING_SENDER_ID"
        NEXT_PUBLIC_FIREBASE_APP_ID="REPLACE_WITH_YOUR_FIREBASE_APP_ID"
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="REPLACE_WITH_YOUR_FIREBASE_MEASUREMENT_ID" # This one is optional
        ```
    *   **Crucial**:
        *   Ensure there are no extra spaces or quotes around the values unless they are part of the value itself (which is rare for these config keys).
        *   **Double-check `NEXT_PUBLIC_FIREBASE_API_KEY`**. This is the most common source of "invalid API key" errors. Copy it exactly from your Firebase project.
        *   Save the `.env.local` file.

4.  **Restart your development server**:
    If your Next.js development server was already running, you **must restart it** for the new environment variables in `.env.local` to be loaded.
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

-   **"Configuration Error: Firebase authentication is not configured..." (UI Alert)**:
    This alert means that essential Firebase configuration variables (like `NEXT_PUBLIC_FIREBASE_API_KEY` or `NEXT_PUBLIC_FIREBASE_PROJECT_ID`) are missing, empty, or still have placeholder values in your environment.
    *   Ensure your `.env.local` file exists in the project root and contains your actual Firebase project credentials, not placeholders.
    *   Verify that the variable names in `.env.local` start with `NEXT_PUBLIC_` and match those in `src/lib/firebase.ts` and the `.env` template file.
    *   Make sure you've populated the values from your Firebase project console.
    *   Make sure you've **restarted your Next.js development server** after creating or modifying `.env.local`.

-   **`Firebase: Error (auth/invalid-api-key)` or `Firebase: Error (auth/api-key-not-valid)` or `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)` (Console or UI Error)**:
    This is a very common error. It means the `NEXT_PUBLIC_FIREBASE_API_KEY` value in your `.env.local` file is incorrect, not recognized by your Firebase project, or possibly malformed. It might also mean you are still using a placeholder value.
    *   **Action:** You need to obtain the correct API key from your Firebase project and put it in your `.env.local` file, replacing any placeholder.
    *   **Double, triple-check** that you've copied the `apiKey` value **exactly** from your Firebase project settings (see step 3 in "Getting Started").
    *   Ensure there are no leading/trailing spaces or typos.
    *   Verify the API key is for the correct Firebase project.
    *   Verify that the variable name in `.env.local` is exactly `NEXT_PUBLIC_FIREBASE_API_KEY`.
    *   If you recently enabled or restricted API keys in the Google Cloud Console for your Firebase project, ensure the key used is permitted for web client access from your domain (usually `localhost` for development). You might need to check the "API restrictions" for your key in Google Cloud Console under "APIs & Services" > "Credentials". Make sure "Cloud Identity Platform API" and "Identity Toolkit API" (which Firebase Auth uses) are enabled for your project and the key has access.
    *   **Restart your Next.js development server** after any changes to `.env.local`.
    *   If the problem persists after verifying the key, try regenerating the Firebase config snippet in the Firebase console for your web app and re-copying all values.

Refer to `src/lib/firebase.ts` to see how environment variables are consumed and the `.env` file (or `.env.example` if you created one) for the required variable names. If problems persist, ensure your Firebase project and web app registration are correctly set up in the Firebase Console.
