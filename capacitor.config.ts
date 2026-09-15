import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.expensewise.japan',
  appName: 'ExpenseWise Japan',
  webDir: 'public',
  server: {
    // Allows live connection to the full-stack Next.js + SQLite local server
    url: 'http://10.160.23.86:3000',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
