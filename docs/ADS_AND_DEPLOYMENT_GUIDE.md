
# 📱 Complete Guide: Adding Ads & Deploying to Google Play Store

## Part 1: Adding Ads to Your App

### Step 1: Choose an Ad Network

**Recommended: Google AdMob** (Most popular and reliable)

### Step 2: Install Dependencies

```bash
npx expo install react-native-google-mobile-ads
```

### Step 3: Create AdMob Account

1. Go to https://admob.google.com/
2. Sign in with your Google account
3. Click "Get Started"
4. Create a new app
5. Note your **App ID** and **Ad Unit IDs**

### Step 4: Configure app.json

Add AdMob configuration to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"
        }
      ]
    ]
  }
}
```

### Step 5: Initialize AdMob in Your App

Update `app/_layout.tsx`:

```typescript
import mobileAds from 'react-native-google-mobile-ads';

export default function RootLayout() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob initialized', adapterStatuses);
      });
  }, []);
  
  // ... rest of your code
}
```

### Step 6: Replace AdBanner Component

Update `components/AdBanner.tsx` with real ads:

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ 
  ? TestIds.BANNER 
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY'; // Replace with your Ad Unit ID

export default function AdBanner({ position = 'bottom' }) {
  return (
    <View style={[styles.container, position === 'top' && styles.topPosition]}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  topPosition: {
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
});
```

### Step 7: Test Ads

- Use `TestIds.BANNER` during development
- Real ads will only show in production builds
- Test on real devices, not emulators

---

## Part 2: Deploying to Google Play Store

### Prerequisites

- Google Play Developer Account ($25 one-time fee)
- EAS CLI installed: `npm install -g eas-cli`
- Expo account

### Step 1: Configure EAS Build

1. Login to EAS:
```bash
eas login
```

2. Configure your project:
```bash
eas build:configure
```

3. Update `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

### Step 2: Update app.json

```json
{
  "expo": {
    "name": "SmartPDF Toolkit",
    "slug": "smartpdf-toolkit",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "smartpdf",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3F51B5"
    },
    "android": {
      "package": "com.yourcompany.smartpdf",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#3F51B5"
      },
      "permissions": [
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

### Step 3: Prepare App Assets

Create required images:

- **Icon**: 1024x1024px PNG (./assets/images/icon.png)
- **Adaptive Icon**: 1024x1024px PNG (./assets/images/adaptive-icon.png)
- **Splash Screen**: 1284x2778px PNG (./assets/images/splash.png)
- **Feature Graphic**: 1024x500px PNG (for Play Store)
- **Screenshots**: At least 2 screenshots (phone and tablet)

### Step 4: Build APK/AAB

For APK (testing):
```bash
eas build --platform android --profile preview
```

For AAB (production):
```bash
eas build --platform android --profile production
```

Wait for build to complete (10-20 minutes). Download the file when ready.

### Step 5: Create Google Play Console Account

1. Go to https://play.google.com/console
2. Pay $25 registration fee
3. Complete account setup
4. Accept developer agreement

### Step 6: Create New App

1. Click "Create app"
2. Fill in app details:
   - App name: "SmartPDF Toolkit"
   - Default language: English
   - App or game: App
   - Free or paid: Free
3. Complete declarations

### Step 7: Set Up Store Listing

Navigate to "Store presence" → "Main store listing":

**App details:**
- Short description (80 chars max):
  ```
  View, edit, and summarize PDFs with AI. OCR, annotations, and smart features.
  ```

- Full description (4000 chars max):
  ```
  SmartPDF Toolkit - Your Complete PDF Solution
  
  Transform how you work with PDFs on mobile! SmartPDF Toolkit combines powerful 
  PDF viewing, editing, and AI-powered features in one beautiful app.
  
  KEY FEATURES:
  
  📄 PDF Viewer
  - Open and view PDF documents
  - Smooth navigation and zooming
  - Page thumbnails
  
  🔍 OCR Technology
  - Extract text from scanned documents
  - Support for multiple languages
  - Copy extracted text
  
  ✏️ PDF Editor
  - Highlight important sections
  - Add text annotations
  - Draw and markup
  - Undo/redo support
  
  🤖 AI-Powered Features
  - Smart document summarization
  - Chat with your PDFs
  - Generate revision questions
  - Extract key points
  - Create mind maps
  - Quiz generator
  - Citation extractor
  
  🔄 Document Converter
  - Convert to TXT, DOCX, HTML, Markdown
  - Optimize PDFs
  - Export to multiple formats
  
  💾 Cloud & Offline
  - Work offline
  - Cloud sync support
  - Recent files history
  
  🎯 Additional Features
  - PDF to audio summary
  - Shareable links
  - Multi-format export
  - Clean, modern UI
  - Dark mode support
  
  Perfect for students, professionals, researchers, and anyone who works with PDFs!
  
  Download now and experience the future of mobile PDF management.
  ```

**Graphics:**
- Upload app icon
- Upload feature graphic (1024x500)
- Upload at least 2 screenshots
- Optional: Upload promo video

**Categorization:**
- App category: Productivity
- Tags: PDF, Document, Scanner, OCR, AI

**Contact details:**
- Email: your-email@example.com
- Website: https://yourwebsite.com (optional)
- Privacy policy URL: Required (create one)

### Step 8: Content Rating

1. Go to "Policy" → "App content"
2. Complete content rating questionnaire
3. Submit for rating

### Step 9: Set Up Pricing & Distribution

1. Go to "Pricing & distribution"
2. Select countries (or "All countries")
3. Confirm it's free
4. Complete other declarations

### Step 10: Create Release

1. Go to "Release" → "Production"
2. Click "Create new release"
3. Upload your AAB file
4. Fill in release notes:
   ```
   Initial release of SmartPDF Toolkit!
   
   Features:
   - PDF viewing and navigation
   - OCR text extraction
   - PDF editing and annotations
   - AI-powered summarization
   - Document converter
   - Chat with PDFs
   - Mind maps and quizzes
   - Multi-format export
   ```
5. Review and roll out

### Step 11: Submit for Review

1. Review all sections (must have green checkmarks)
2. Click "Send for review"
3. Wait for approval (typically 1-7 days)

---

## Part 3: Post-Launch

### Monitor Your App

- Check Google Play Console regularly
- Respond to user reviews
- Monitor crash reports
- Track download statistics

### Update Your App

When releasing updates:

1. Increment version in app.json:
```json
{
  "version": "1.0.1",
  "android": {
    "versionCode": 2
  }
}
```

2. Build new version:
```bash
eas build --platform android --profile production
```

3. Create new release in Play Console
4. Upload new AAB
5. Add release notes
6. Roll out update

### Monetization Tips

**Ad Placement Best Practices:**
- Bottom banner ads (non-intrusive)
- Interstitial ads between major actions
- Rewarded ads for premium features
- Never block core functionality

**Premium Features to Consider:**
- Remove ads
- Unlimited OCR
- Advanced AI features
- Cloud storage
- Priority support

---

## Part 4: Privacy Policy (Required)

Create a privacy policy page. Here's a template:

```markdown
# Privacy Policy for SmartPDF Toolkit

Last updated: [Date]

## Information We Collect

- PDF documents you upload (stored locally)
- Usage analytics (anonymous)
- Crash reports

## How We Use Information

- To provide app functionality
- To improve user experience
- To fix bugs and issues

## Data Storage

- All PDFs stored locally on your device
- Optional cloud sync (with your permission)
- We do not sell your data

## Third-Party Services

- Google AdMob (for ads)
- Google Analytics (for usage stats)

## Your Rights

- Delete your data anytime
- Opt-out of analytics
- Contact us with concerns

## Contact

Email: your-email@example.com
```

Host this on a website (GitHub Pages, Netlify, etc.) and add the URL to your Play Store listing.

---

## Troubleshooting

### Common Issues:

**Build fails:**
- Check eas.json configuration
- Ensure all dependencies are compatible
- Clear cache: `eas build:clear-cache`

**App rejected:**
- Review Google Play policies
- Ensure privacy policy is accessible
- Check content rating accuracy
- Verify all required permissions

**Ads not showing:**
- Use test IDs during development
- Real ads only show in production
- Check AdMob account status
- Verify ad unit IDs

---

## Checklist Before Submission

- [ ] App builds successfully
- [ ] All features tested on real device
- [ ] Privacy policy created and hosted
- [ ] All required graphics prepared
- [ ] Store listing completed
- [ ] Content rating obtained
- [ ] Pricing & distribution configured
- [ ] Release notes written
- [ ] AdMob integrated and tested
- [ ] Version numbers correct

---

## Resources

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [AdMob Documentation](https://developers.google.com/admob)
- [React Native Google Mobile Ads](https://docs.page/invertase/react-native-google-mobile-ads)

---

**Good luck with your app launch! 🚀**
