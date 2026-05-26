# SA HALPER Android APK

The APK is built with Capacitor as an Android WebView shell over the live SA HALPER web app.

## Live Updates

`capacitor.config.json` points the app to:

```json
"server": {
  "url": "https://aim123qqq-cpu.github.io/prepbase-mvp/"
}
```

This means:

- frontend changes become visible in the APK after the website is published;
- backend/API data is shared by web and APK;
- the APK must be rebuilt only when native settings, icons, permissions, or the platform URL change.

## Local Setup

```bash
npm install
npx cap add android
npx cap sync android
```

## Debug APK

```bash
cd android
gradlew.bat assembleDebug
```

The file is created at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## GitHub Actions

`.github/workflows/android-apk.yml` creates the Android project on the runner, builds a debug APK, and uploads it as an artifact.

The generated `android/` folder is intentionally not stored in the repository during the MVP phase.

## Future Domain

When the custom domain is ready, update `server.url` in `capacitor.config.json`, for example:

```json
"url": "https://sahalper.ru/"
```

After changing the URL, rebuild the APK once. Future website and data updates will again arrive without rebuilding the APK.
