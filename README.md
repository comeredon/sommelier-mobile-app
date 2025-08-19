# Sommelier Personal Wine Assistant - Mobile App

A sophisticated React Native mobile application for wine enthusiasts, featuring AI-powered wine recommendations, cellar management, and wine recognition capabilities.

## Features

- 🍷 **Wine Cellar Management**: Track your wine collection with detailed information
- 🤖 **AI Wine Assistant**: Get personalized wine recommendations and advice
- 📱 **Wine Recognition**: Take photos of wine bottles to get instant information
- 🌍 **Multi-language Support**: English and French localization
- 🔐 **Secure Authentication**: JWT-based user authentication
- 📊 **Wine Statistics**: Track your wine preferences and collection stats
- 🎨 **Modern UI**: Beautiful interface with dark mode support

## Tech Stack

- **React Native**: 0.79.5
- **Expo**: ~53.0.20
- **TypeScript**: Full type safety
- **Navigation**: React Navigation 6 with tab and stack navigators
- **State Management**: React Hooks and Context
- **Storage**: AsyncStorage for local persistence
- **Backend**: Azure-hosted API with Cosmos DB
- **Camera**: Expo Camera for wine recognition

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g @expo/cli`
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Quick Start

1. **Clone and install dependencies**:
   ```bash
   git clone [your-repo-url]
   cd sommelier-mobile-standalone
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on your device**:
   - Download the Expo Go app on your phone
   - Scan the QR code displayed in your terminal
   - Or use an emulator: `npm run android` or `npm run ios`

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser
- `npm run build:android` - Build Android APK/AAB
- `npm run build:ios` - Build iOS app
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript check

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication screens
│   ├── cellar/         # Wine cellar management
│   ├── chat/           # AI chat interface
│   ├── intro/          # App introduction
│   ├── profile/        # User profile
│   └── ui/             # Base UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utilities and API client
├── locales/            # Internationalization
├── navigation/         # Navigation configuration
└── types/              # TypeScript type definitions
```

## Key Features Implementation

### Wine Recognition
Uses the device camera to capture wine bottle images and sends them to the Azure backend for AI-powered analysis and information retrieval.

### Cellar Management
- Add wines manually or through photo recognition
- Track wine details (vintage, region, notes, ratings)
- Search and filter your collection
- View collection statistics

### AI Chat Assistant
Powered by Azure OpenAI, providing:
- Wine recommendations based on preferences
- Food pairing suggestions
- Wine education and information
- Collection insights

### Localization
Supports English and French with automatic language detection and manual switching.

## Configuration

### Backend API
The app connects to an Azure-hosted backend API. The base URL is configured in `src/lib/api.ts`.

### Environment Variables
Create a `.env` file for local configuration:
```
EXPO_PUBLIC_API_BASE_URL=https://your-api-url.com
```

## Building for Production

### Android
1. **Generate a signed APK**:
   ```bash
   npm run build:android
   ```
   
2. **For Play Store**:
   - Generate an AAB (Android App Bundle)
   - Follow the Play Store upload process
   - Ensure compliance with privacy policy and terms of service

### iOS
1. **Build for App Store**:
   ```bash
   npm run build:ios
   ```
   
2. **Submit to App Store**:
   - Use Xcode or Expo Application Services (EAS)
   - Ensure all Apple guidelines are met

## Play Store Compliance

This app includes:
- ✅ Privacy Policy (`PRIVACY_POLICY.md`)
- ✅ Terms of Service (`TERMS_OF_SERVICE.md`)
- ✅ Minimal permissions (Camera only)
- ✅ Proper icon and metadata
- ✅ Content rating compliance

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Create a Pull Request

## License

[Add your license here]

## Support

For support, please contact [your-email@domain.com] or create an issue in this repository.

---

**Note**: This is the standalone mobile app repository. The backend API and web frontend are maintained separately.
