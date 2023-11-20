import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform, Link } from 'react-native';
import { Agenda } from 'react-native-calendars';
import Header from '../components/header';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firestore, auth } from '../constants/config';

const Calendar = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCoach, setIsCoach] = useState(false);
  const [isEventFormVisible, setEventFormVisible] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventDate, setEventDate] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        try {
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, where('uid', '==', userData.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUser(userData);

            if (userData.isCoach) {
              setIsCoach(true);
            } else {
              setIsCoach(false);
            }

            // Pobierz wydarzenia po teamId
            if (userData.teamId) {
              const eventsRef = collection(firestore, 'calendars');
              const eventsQuery = query(eventsRef, where('teamId', '==', userData.teamId));
              const eventsSnapshot = await getDocs(eventsQuery);

              if (!eventsSnapshot.empty) {
                let updatedEvents = {};
                eventsSnapshot.forEach((doc) => {
                  const eventData = doc.data();
                  const eventDate = eventData.eventDate.split('T')[0];
                  if (!updatedEvents[eventDate]) {
                    updatedEvents[eventDate] = [];
                  }
                  updatedEvents[eventDate].push(eventData);
                });
                setEvents(updatedEvents);
              }
            }
          }
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addEvent = async () => {
    if (selectedDate && user && isCoach && eventName && eventCategory && eventDate) {
      const event = {
        eventDate: eventDate,
        eventId: `${user.teamId}_${user.uid}_${new Date().getTime()}`,
        eventName: eventName,
        eventCategory: eventCategory,
        teamId: user.teamId,
        uid: user.uid,
      };

      try {
        const docRef = await addDoc(collection(firestore, 'calendars'), event);
        console.log('Event added successfully!', docRef.id);
        setEventFormVisible(false);
      } catch (error) {
        console.error('Error adding event:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <Agenda
        items={events}
        renderItem={(item) => (
          <View style={styles.item}>
            <Text>{item.eventName}</Text>
          </View>
        )}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          if (user && isCoach) {
            setEventFormVisible(true);
          }
        }}
        pastScrollRange={12}
        futureScrollRange={12}
        hideExtraDays={false}
        style={styles.agenda}
      />
              <Link to="/home" style={styles.link}>
          <Text style={styles.linkText}>Powrót do Home</Text>
        </Link>

      {user && isCoach && (
        <TouchableOpacity style={styles.addButton} onPress={() => setEventFormVisible(true)}>
          <Text style={styles.buttonText}>Dodaj Wydarzenie</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isEventFormVisible}
        onRequestClose={() => setEventFormVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Dodaj Wydarzenie</Text>
          <TextInput
            style={styles.input}
            placeholder="Nazwa wydarzenia"
            onChangeText={(text) => setEventName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Kategoria"
            onChangeText={(text) => setEventCategory(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Data (np. 21.11.2023 17:00)"
            onChangeText={(text) => setEventDate(text)}
          />
          <TouchableOpacity style={styles.button} onPress={addEvent}>
            <Text style={styles.buttonText}>Dodaj</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  agenda: {
    flex: 1,
    ...Platform.select({
      ios: {
        paddingTop: 64,
      },
      android: {},
    }),
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default Calendar;
