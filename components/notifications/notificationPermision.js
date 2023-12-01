import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

const NotificationPermissionHandler = () => {
  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.error('Brak uprawnień do powiadomień!');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      console.log('Expo Push Token:', token);


      // Tutaj możesz zarejestrować urządzenie w usługach do wysyłania powiadomień (np. w backendzie)
      // Aby uzyskać token, użyj Notifications.getExpoPushTokenAsync()
    })();
  }, []);

  return null;
};

export default NotificationPermissionHandler;
