# TestFlight and App Store checklist

## Before archiving

- [ ] Install full Xcode and set active developer directory: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
- [ ] Apple Developer Program membership
- [ ] Set **Development Team** on the DailyAffirmation target
- [ ] Unique **Bundle ID** (default: `com.dailyaffirmation.app`) registered in App Store Connect
- [ ] Add a 1024×1024 app icon in `Assets.xcassets/AppIcon`

## Privacy and compliance

- [ ] App Privacy questionnaire: disclose that user-provided text is sent to a third-party AI API
- [ ] Privacy policy URL (required for App Store)
- [ ] `PrivacyInfo.xcprivacy` is included (UserDefaults API reason CA92.1)
- [ ] `NSUserNotificationsUsageDescription` in Info.plist for daily reminders

## Build and upload

1. Product → Archive (Release, Any iOS Device).
2. Distribute App → App Store Connect.
3. In App Store Connect, create the app record and attach the build.
4. Complete metadata, screenshots, age rating, and export compliance.
5. Submit to TestFlight for internal testing, then external if needed.

## Testing focus

- Generate affirmation with OpenAI and Anthropic keys
- Kill and relaunch app — today’s entry and Keychain key persist
- Edit a past day in History and regenerate
- Enable/disable daily reminder; confirm notification opens Today tab
- Airplane mode — clear error with retry, thought still saved

## Known MVP limitations

- API key is entered by the user (no backend proxy)
- No iCloud sync or accounts
- App icon placeholder until you add artwork
