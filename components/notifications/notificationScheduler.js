import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const scheduleNotification = async (eventName, eventDate, eventCategory) => {
  if (Platform.OS === 'web') {
    // Obsługa powiadomień dla przeglądarki
    if (!("Notification" in window)) {
      console.error("Ta przeglądarka nie obsługuje powiadomień na pulpicie");
      return;
    }

    if (Notification.permission === "granted") {
      const options = {
        body: `Dzisiaj masz wydarzenie: ${eventCategory} o nazwie ${eventName}`,
      };

      if (eventDate) {
        options.body += ` o godzinie ${eventDate.split(" ")[1]}`;
      }

      new Notification("Przypomnienie o wydarzeniu!", options);
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
            title: 'Przypomnienie o wydarzeniu!',
            body: `Dzisiaj o godzinie 18:30 masz wydarzenie: Sparing o nazwie: Żuraw Krzeszów vs Lachy Lachowice`,
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
    const scheduledNotifications = events.map((event) => {
      const eventTime = event.eventDate ? event.eventDate.split(' ')[1] : '09:00';
      return scheduleNotification(event.eventName, eventTime);
    });

    return () => {
      // Opcjonalnie: Anuluj zaplanowane powiadomienia, gdy komponent jest oczyszczany
      scheduledNotifications.forEach(async (notification) => {
        await Notifications.cancelScheduledNotificationAsync(notification);
      });
    };
  }, [events]);

  return null;
};

export default EventNotificationScheduler;