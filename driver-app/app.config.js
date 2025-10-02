module.exports = {
  expo: {
    name: "Zonglist Driver",
    slug: "zonglist-driver",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.zonglist.driver",
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        },
        UIBackgroundModes: ["audio"]
      }
    },
    android: {
      package: "com.zonglist.driver"
    },
    extra: {
      eas: {
        projectId: "b8673481-c0f8-4c7d-9467-65de50f5e2d2"
      },
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseDatabaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      driverId: process.env.EXPO_PUBLIC_DRIVER_SESSION_ID || "tesla_driver_001"
    }
  }
};