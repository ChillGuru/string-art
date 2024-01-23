import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.moment.stringArt',
  appName: 'String Art',
  webDir: 'dist',
  server: {
    hostname: 'string-art-io.vercel.app',
    androidScheme: 'https',
  },
  plugins: {
    CapacitorHttp: {
      enabled: false,
    },
  },
};

export default config;
