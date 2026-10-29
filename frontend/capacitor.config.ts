import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.carlino.gestorvisitas',
  appName: 'Gestor de Visitas',
  webDir: 'dist',
  server: {
    // Debe ser 'https'. En WebViews modernos 'http' produce ERR_CONNECTION_REFUSED
    // porque Android no permite interceptar assets empaquetados bajo esquemas no seguros.
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    // Permite que la app (cargada internamente en https://localhost)
    // pueda llamar a la API del backend HTTP en la red local (http://192.168.1.70:8000).
    allowMixedContent: true,
  },
};

export default config;
