import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inventaris.labsma',
  appName: 'Inventaris Lab SMA',
  webDir: 'dist',
  android: {
    backgroundColor: '#f1f5f9', // slate-100
    allowMixedContent: true,
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#059669', // emerald-600
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#059669',
    },
  },
};

export default config;
