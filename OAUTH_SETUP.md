# Social Login Setup Guide

This guide walks through setting up OAuth for Google, Apple, and Facebook authentication in the Yobbu mobile app.

## Prerequisites

- Expo CLI installed
- Expo account (https://expo.dev)
- Google, Apple, and Facebook developer accounts

## Installation

```bash
npm install expo-auth-session expo-web-browser
```

## Google OAuth Setup

### 1. Create Google Cloud Project

1. **Open Google Cloud Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click on the project dropdown at the top (shows "My First Project" or similar)
   - Click "NEW PROJECT" button

2. **Create New Project**
   - Project name: `Yobbu`
   - Organization: Leave blank (or select your org)
   - Location: Leave as default
   - Click "CREATE"
   - Wait 2-3 minutes for project to be created
   - Select the new "Yobbu" project from the dropdown

3. **Enable Google+ API**
   - In the left sidebar, click "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on "Google+ API" in results
   - Click the blue "ENABLE" button
   - Wait for it to complete (you'll see "API enabled" message)

### 2. Create OAuth 2.0 Consent Screen

Before creating credentials, you must set up the OAuth consent screen:

1. **Go to OAuth Consent Screen**
   - In left sidebar: "APIs & Services" → "OAuth consent screen"
   
2. **Configure Consent Screen**
   - Choose "External" user type (unless you have a Google Workspace)
   - Click "CREATE"
   
3. **Fill Out App Information**
   - App name: `Yobbu`
   - User support email: `your-email@gmail.com`
   - Developer contact email: `your-email@gmail.com`
   - Click "SAVE AND CONTINUE"

4. **Scopes** (Step 2)
   - Click "ADD OR REMOVE SCOPES"
   - Search for and select:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - Click "UPDATE" then "SAVE AND CONTINUE"

5. **Test Users** (Step 3)
   - Add your test email address
   - This allows you to test before publishing
   - Click "SAVE AND CONTINUE"

6. **Review and Finish**
   - Click "BACK TO DASHBOARD" (no need to publish to production yet)

### 3. Create OAuth 2.0 Client ID

1. **Open Credentials Page**
   - In left sidebar: "APIs & Services" → "Credentials"
   - Click blue "+ CREATE CREDENTIALS" button
   - Choose "OAuth client ID"

2. **Configure Client ID**
   - Application type: `Web application`
   - Name: `Yobbu Web Client`

3. **Add Authorized Redirect URIs**
   
   First, get your **Expo username**:
   ```bash
   # In your terminal, run:
   expo whoami
   # If not logged in:
   expo login
   # Then run whoami again to see your username
   ```
   
   In the "Authorized redirect URIs" section, add both:
   - `https://auth.expo.io/@YOUR_EXPO_USERNAME/yobbu`
   - `http://localhost:19006`
   
   Replace `YOUR_EXPO_USERNAME` with your actual Expo username from above.
   
   Example: `https://auth.expo.io/@papamamadous/yobbu`
   
   - Click "CREATE"

4. **Copy Your Credentials**
   - A modal will appear with your:
     - **Client ID** (looks like: `123456789.apps.googleusercontent.com`)
     - **Client Secret** (long string, keep this private!)
   - Click the copy icon next to Client ID
   - Save both somewhere safe

### 4. Update Environment Variables

Create/update `.env` in your project root:

```
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
EXPO_USERNAME=your_expo_username
```

Replace the values with your actual credentials from step 3.

### 5. Update LoginScreen.tsx

In `app/screens/LoginScreen.tsx`, update the Google auth configuration:

```typescript
import * as Google from 'expo-auth-session/providers/google';

// Inside your LoginScreen component:
const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
  clientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  redirectUrl: `https://auth.expo.io/@${process.env.EXPO_USERNAME}/yobbu`,
  scopes: ['profile', 'email'],
});

// Handle the response after user authenticates:
useEffect(() => {
  if (googleResponse?.type === 'success') {
    const { authentication } = googleResponse;
    // Send authentication.accessToken to your backend
    // Backend will verify the token and create a session
    handleGoogleLogin(authentication.accessToken);
  }
}, [googleResponse]);
```

**Important:** 
- Never hardcode credentials in production
- Load from environment variables (already set in `.env`)
- The `redirectUrl` must match EXACTLY what you registered in Google Cloud Console

## Apple OAuth Setup

### 1. Create Apple Sign In Credentials

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create a new App ID with "Sign in with Apple" capability
3. Create a Service ID for your app
4. Register the redirect URL: `https://auth.expo.io/@your-username/yobbu`
5. Create a private key and download the `.p8` file

### 2. Update LoginScreen.tsx

Replace `YOUR_APPLE_TEAM_ID` and `com.yobbu.app`:

```typescript
const [appleRequest, appleResponse, applePromptAsync] = Apple.useAuthRequest({
  clientId: 'com.yobbu.app', // Your Service ID
  teamId: 'YOUR_APPLE_TEAM_ID', // From Apple Developer account
  redirectUrl: 'https://auth.expo.io/@your-username/yobbu',
});
```

## Facebook OAuth Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app → "Consumer"
3. Add "Facebook Login" product
4. In Settings → Basic, get your App ID and App Secret
5. Add Valid OAuth Redirect URIs:
   - `https://auth.expo.io/@your-username/yobbu`

### 2. Backend Implementation

Facebook login requires additional SDK integration. For now, a placeholder is shown.

## Backend Integration

Your backend needs to handle social login verification:

```typescript
POST /auth/social-login
{
  "provider": "google" | "apple" | "facebook",
  "idToken": "JWT token from OAuth provider",
  "accessToken": "Access token from OAuth provider"
}
```

### Backend Responsibilities:

1. **Verify ID Token**: Validate the JWT signature with the provider's public key
2. **Extract User Info**: Decode the token to get email, name, etc.
3. **Create or Update User**: Check if user exists by email, create if not
4. **Generate Session**: Create a session token for the app
5. **Return**: Send back `{ sessionToken: "..." }`

### Example (Node.js + Express):

```typescript
import { OAuth2Client } from 'google-auth-library';

app.post('/auth/social-login', async (req, res) => {
  const { provider, idToken } = req.body;

  try {
    if (provider === 'google') {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({ idToken });
      const payload = ticket.getPayload();

      // Find or create user
      let user = await User.findOne({ email: payload.email });
      if (!user) {
        user = await User.create({
          email: payload.email,
          fullName: payload.name,
          photoUrl: payload.picture,
          provider: 'google',
        });
      }

      // Create session
      const sessionToken = createSessionToken(user.id);
      return res.json({ sessionToken });
    }

    if (provider === 'apple') {
      // Use Apple's JWT verification
      const payload = verifyAppleToken(idToken);
      // Same flow as Google
    }

    res.status(400).json({ error: 'Invalid provider' });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
});
```

## Environment Variables

Create a `.env` file:

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_TEAM_ID=YOUR_APPLE_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
EXPO_USERNAME=your-expo-username
```

## Testing

### Local Development

1. Run the app with Expo:
   ```bash
   expo start
   ```

2. Open in Expo Go or web browser

3. Test each social login button

4. Monitor backend logs for token verification

### Production

1. Update `redirectUrl` to use production domain
2. Register OAuth credentials with production URLs
3. Deploy backend with proper secret management
4. Test with real user accounts

## Troubleshooting

### Google OAuth Issues

#### "Invalid Client" or "Client ID not found"
- ✓ Verify Client ID matches exactly (copy-paste from Google Cloud Console)
- ✓ Check it ends with `.apps.googleusercontent.com`
- ✓ Restart Expo (sometimes cache issues): `expo start --clear`

#### "Redirect URI mismatch"
- ✓ Verify redirect URL in code matches EXACTLY in Google Cloud Console
- ✓ Check for trailing slashes (`https://auth.expo.io/@user/yobbu` NOT `https://auth.expo.io/@user/yobbu/`)
- ✓ Verify Expo username is correct: run `expo whoami`
- ✓ If using localhost, use `http://localhost:19006` (not https)

#### Login button does nothing / doesn't open Google login
- ✓ Check that `Google.useAuthRequest` is properly initialized
- ✓ Verify `googlePromptAsync` is being called on button press
- ✓ Check browser console for errors
- ✓ Make sure app is running with `expo start` (not Expo Go directly)

#### "Google+ API not enabled" error
- ✓ Go back to Google Cloud Console
- ✓ Check that Google+ API shows as "ENABLED"
- ✓ Wait 5 minutes - sometimes takes time to propagate

#### Cannot find Expo username
```bash
# Make sure you're logged in to Expo:
expo login

# Then run:
expo whoami
# Output will show your username
```

### JWT Decoding Error
- ✓ Ensure `expo` package has buffer polyfill
- ✓ Check token format (should have 3 parts separated by dots)
- ✓ Verify token isn't expired before sending to backend

### User not found after login
- ✓ Verify backend is creating users from OAuth payloads
- ✓ Check database connection
- ✓ Verify email is being extracted from Google JWT
- ✓ Check backend logs for errors during token verification

### Testing Checklist

Before deploying to production:

- [ ] Redirect URL in code matches Google Cloud Console exactly
- [ ] `.env` file has correct `GOOGLE_CLIENT_ID` and `EXPO_USERNAME`
- [ ] `expo login` shows you're authenticated
- [ ] `expo whoami` returns correct username
- [ ] Google+ API is enabled in Google Cloud Console
- [ ] OAuth consent screen is configured
- [ ] Test user email is added to test users list
- [ ] Login button opens Google auth flow
- [ ] Backend can verify returned access token
- [ ] New user is created in database after first login
- [ ] Subsequent logins find existing user

## Security Notes

- Never expose client secrets in frontend code
- Always verify tokens on the backend
- Use HTTPS for all OAuth redirects
- Store sessions securely in encrypted storage
- Implement rate limiting on `/auth/social-login` endpoint
- Use secure headers (CORS, CSP) on backend
