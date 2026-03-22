# 🚨 ALERT PH - Emergency Safety App

A modern React Native mobile application built with Expo and Expo Router, designed to provide quick access to emergency services and safety features in the Philippines.

## 📋 Features

### 🎯 **Splash Screen**
- ALERT PH branding with centered logo
- Tagline: "Stay alert. Stay safe."
- 2-3 second auto-redirect to login screen
- Clean minimal design

### 🔐 **Authentication Screens**
- **Login Screen**: Email and password authentication with link to signup
- **Sign Up Screen**: Full name, email, contact number, and password registration
- Responsive design with rounded card UI, soft shadows, and red accent colors

### 🏠 **Home Screen**
- Welcome message with app branding
- Large Emergency Call button
- Dashboard with quick access cards (Find Help, Hotlines, Contacts, Location)
- Safety tips section

### 🗺️ **Map Screen**
- User's current location display
- Nearby emergency services (hospitals, police stations, fire departments)
- Distance information for each service
- Ready for react-native-maps integration

### 👥 **Emergency Contacts Screen**
- Expandable contact cards with family information
- Each contact displays name, phone number, and relationship
- Quick call buttons
- Add new contact functionality
- Default contacts: Mother, Father, Sister, Brother

### ☎️ **Hotlines Screen**
- Quick access to emergency hotlines
- Search functionality to filter services
- Services included:
  - National Emergency Hotline (911)
  - Fire Emergency (112)
  - Police (117)
  - Medical Emergency (919)
  - Suicide Prevention (887)
- One-tap call functionality

### 👤 **Profile Screen**
- User profile picture and information
- Editable profile settings
- Personal details section (age, birthday, address)
- Medical records (blood type, conditions, allergies)
- family contacts list
- Edit and logout buttons

### 🧭 **Floating Bottom Navigation Bar**
- Modern pill-shaped design with 50px border radius
- Floating style above the bottom with soft shadows
- 5 main tabs: Home, Map, Contacts, Hotlines, Profile
- Uses SF Symbols for icons
- Responsive to all screen sizes

## 🛠️ **Tech Stack**

- **React Native**: 0.81.5
- **Expo**: ~54.0.33
- **Expo Router**: ~6.0.23 (File-based navigation)
- **TypeScript**: ~5.9.2
- **React Navigation**: 7.x
- **Expo Vectors & Icons**: @expo/vector-icons
- **React Native Reanimated**: ~4.1.1

## 🎨 **Design System**

### Colors
- **Primary Red**: #D32F2F (Emergency actions)
- **Secondary Red**: #F44336 (Alternative actions)
- **Background**: #FAFAFA (Light) / #121212 (Dark)
- **Cards**: #FFFFFF (Light) / #1E1E1E (Dark)
- **Border**: #E0E0E0 (Light) / #424242 (Dark)

### Typography
- **Font**: System fonts (clean modern sans-serif)
- **Title**: 24-32px, Bold
- **Subtitle**: 14-16px, Regular
- **Body**: 12-14px, Regular

### UI Components
- Rounded corners (12-20px border radius)
- Soft shadows for depth
- Outlined icons
- Card-based layout

## 📂 **Project Structure**

```
app/
├── splash.tsx                 # Splash screen
├── (auth)/                    # Auth group
│   ├── _layout.tsx           # Auth layout
│   ├── login.tsx             # Login screen
│   └── signup.tsx            # Sign up screen
├── (tabs)/                    # Tab navigation group
│   ├── _layout.tsx           # Floating bottom tabs layout
│   ├── index.tsx             # Home screen
│   ├── map.tsx               # Map screen
│   ├── contacts.tsx          # Contacts screen
│   ├── hotlines.tsx          # Hotlines screen
│   └── profile.tsx           # Profile screen
├── modal.tsx                 # Modal example
└── _layout.tsx               # Root layout

constants/
└── theme.ts                  # Color and font configuration

hooks/
├── use-color-scheme.ts       # Dark mode detection
├── use-color-scheme.web.ts   # Web variant
└── use-theme-color.ts        # Theme color hook

components/
├── haptic-tab.tsx            # Haptic feedback for tabs
├── external-link.tsx         # External link handling
├── hello-wave.tsx            # Wave animation
├── themed-text.tsx           # Themed text component
├── themed-view.tsx           # Themed view component
└── ui/
    ├── icon-symbol.tsx       # SF Symbols icon wrapper
    └── icon-symbol.ios.tsx   # iOS variant
```

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## 📱 **Navigation Flow**

1. **Splash Screen** (2-3 seconds) → Auto-redirect to Login
2. **Login Screen** → Can sign up or log in
3. **Sign Up Screen** → Create account, then redirect to Home
4. **Home (Tabs)** → Access all features via bottom navigation

## 🔄 **Key Features Implementation**

### Authentication Flow
- Splash screen with auto-navigation
- Login/signup with form validation
- Session management (mock implementation)

### Tab Navigation
- Expo Router file-based routing
- Custom floating bottom tab bar
- Haptic feedback on tab interaction

### Emergency Features
- One-tap emergency calling
- Quick hotline access
- Emergency contact management

### Responsive Design
- Optimized for mobile screens
- Safe area insets for notch handling
- Flexible layouts using flexbox

## 🧪 **Testing

Run the linter:
```bash
npm run lint
```

## 📦 **Build for Production**

iOS:
```bash
eas build --platform ios
```

Android:
```bash
eas build --platform android
```

## 🚦 **Future Enhancements**

- [x] Splash screen implementation
- [x] Authentication screens
- [x] Floating bottom navigation
- [x] All tab screens with mock data
- [ ] Backend integration (Firebase/custom)
- [ ] Real location tracking (expo-location)
- [ ] React Native Maps integration
- [ ] Phone calling functionality (expo-phone)
- [ ] Push notifications (Expo Push Notifications)
- [ ] Data persistence (AsyncStorage)
- [ ] Dark mode optimization
- [ ] Backup features and data export

## 📄 **License**

This project is licensed under the MIT License.

## 👨‍💻 **Author**

Created as an Expo/React Native project.

## 📞 **Support**

For issues, feature requests, or questions, please contact the development team.

---

**Stay Alert. Stay Safe. 🚨**
