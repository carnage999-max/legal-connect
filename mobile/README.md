# Legal Connect Mobile App

React Native mobile application for Legal Connect - connecting clients with attorneys while automatically checking for conflicts of interest.

## Features

### Client Features
- User authentication (login, register, password reset)
- Smart intake wizard for creating legal matters
- Automated conflict checking
- Lawyer matching and discovery
- Attorney profile viewing
- Appointment booking
- Secure encrypted messaging
- Document upload and e-signatures
- Payment processing
- Push notifications

### Attorney Features
- Dashboard with referral requests and earnings
- Accept/decline client referrals
- Calendar and availability management
- Client communication
- Document management
- Billing and payout tracking

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (native-stack, bottom-tabs)
- **State Management**: React Context
- **API Communication**: Axios
- **Secure Storage**: expo-secure-store
- **Push Notifications**: expo-notifications

## Project Structure

```
mobile/
├── App.tsx                 # Entry point with navigation and auth
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── src/
    ├── components/        # Reusable UI components
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   └── Input.tsx
    ├── context/           # React contexts
    │   └── AuthContext.tsx
    ├── navigation/        # Navigation configuration
    │   ├── AuthNavigator.tsx
    │   ├── ClientNavigator.tsx
    │   ├── AttorneyNavigator.tsx
    │   └── RootNavigator.tsx
    ├── screens/           # App screens
    │   ├── auth/          # Authentication screens
    │   ├── client/        # Client-specific screens
    │   ├── attorney/      # Attorney-specific screens
    │   └── shared/        # Shared screens (messaging, documents, etc.)
    ├── services/          # API and notification services
    │   ├── api.ts
    │   └── notifications.ts
    ├── types/             # TypeScript type definitions
    │   └── index.ts
    └── utils/             # Utilities and theme
        └── theme.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Studio (for emulator)
- Expo Go app on physical device (optional)

### Installation

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your API URL:
   ```
   EXPO_PUBLIC_API_URL=http://your-backend-url/api/v1
   ```

### Running the App

**Development mode:**
```bash
npm start
```

**iOS Simulator:**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Expo Go (physical device):**
1. Run `npm start`
2. Scan the QR code with Expo Go app

### Backend Connection

For local development, you'll need to:
1. Run the Django backend on `localhost:8000`
2. If using a physical device, update the API URL to your machine's IP address

## Design System

The app follows the Legal Connect design specifications:

### Client App (Light Theme)
- Primary accent: Emerald (`#065F46`)
- Background: White
- Top navigation

### Attorney App (Dark Theme)
- Primary accent: Indigo (`#6366F1`)
- Background: Dark (`#0B0D12`)
- Side navigation pattern (adapted for mobile)

### Typography
- Font: Inter (system font fallback)
- Consistent sizing scale

## Building for Production

### Using EAS Build

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Configure EAS:
   ```bash
   eas build:configure
   ```

3. Build for iOS:
   ```bash
   eas build --platform ios
   ```

4. Build for Android:
   ```bash
   eas build --platform android
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API URL |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key for payments |

## Push Notifications

Push notifications are configured using Expo Notifications. The app:
- Requests notification permissions on launch
- Registers device token with backend
- Handles foreground and background notifications
- Supports deep linking from notifications

## Security

- JWT tokens stored in secure storage (expo-secure-store)
- Automatic token refresh on 401 responses
- HTTPS-only API communication in production
- Secure file uploads

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **API connection errors**: Ensure backend is running and URL is correct
2. **Push notifications not working**: Physical device required for testing
3. **Build errors**: Clear metro cache with `npx expo start --clear`

### Useful Commands

```bash
# Clear cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache

# Check for issues
npx expo doctor
```

## License

Proprietary - Legal Connect
