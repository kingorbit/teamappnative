import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const scheduleNotification = async (eventName, eventDate) => {
  if (Platform.OS === 'web') {
    // Obsługa powiadomień dla przeglądarki
    if (!("Notification" in window)) {
      console.error("Ta przeglądarka nie obsługuje powiadomień na pulpicie");
      return;
    }

    if (Notification.permission === "granted") {
      const options = {
        body: `Dzisiaj masz wydarzenie: ${eventName}`,
      };

      if (eventDate) {
        options.body += ` o godzinie ${eventDate.split(" ")[1]}`;
      }

      new Notification("Przypomnienie o wydarzeniu", options);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          scheduleNotification(eventName, eventDate);
        }
      });
    }
  } else if (Platform.OS === 'android') {
    // Obsługa powiadomień dla Androida
    try {
      if (eventDate) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Przypomnienie o wydarzeniu',
            body: `Dzisiaj o godzinie ${eventDate.split(':')[0]} masz wydarzenie: ${eventName}`,
          },
          trigger: {
            seconds: 1,  // Ustawiamy opóźnienie na 1 sekundę
          },
        });
      } else {
        // Obsługa powiadomień bez godziny
        // Możesz dostosować ten fragment kodu zgodnie z własnymi potrzebami
        console.log(`Dzisiaj masz wydarzenie: ${eventName}`);
      }
    } catch (error) {
      console.error('Błąd podczas planowania powiadomienia na Androidzie:', error);
    }
  }
};

const EventNotificationScheduler = ({ events }) => {
  useEffect(() => {
    events.forEach((event) => {
      // Jeśli godzina nie jest podana, ustaw na godzinę 12:00
      const eventTime = event.eventDate ? event.eventDate.split(' ')[1] : '12:00';

      scheduleNotification(event.eventName, eventTime);
    });
  }, [events]);

  return null;
};

export default EventNotificationScheduler;