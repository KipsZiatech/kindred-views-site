import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ab481ff90e1c4dc1842d84aa2a93e02f',
  appName: 'okoa-express',
  webDir: 'dist',
  server: {
    url: 'https://ab481ff9-0e1c-4dc1-842d-84aa2a93e02f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#10b981',
      showSpinner: true,
      spinnerColor: '#ffffff'
    }
  }
};

export default config;