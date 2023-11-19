import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../constants/config';
import { Agenda } from 'react-native-calendars';
import Header from '../components/header';
import EventForm from '../components/calendar/eventForm'; // Dodaj import komponentu formularza

const Calendar = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      console.log('onAuthStateChanged - userData:', userData); // Doda
      if (userData) {
        setUser(userData);
      }
    });

    // Pobierz wydarzenia z bazy danych lub innego źródła
    // Przykładowe dane:
    const fetchedEvents = {
      '2023-11-19': [{ name: 'Mecz 1' }],
    };
    setEvents(fetchedEvents);

    return () => unsubscribe();
  }, []);

  const addEvent = () => {
    console.log('user:', user); // Dodaj ten log
    if (selectedDate && user && user.isCoach) {
      console.log('Dodaję wydarzenie'); // Dodaj ten log
      const updatedEvents = { ...events };
      if (updatedEvents[selectedDate]) {
        updatedEvents[selectedDate].push({ name: eventName });
      } else {
        updatedEvents[selectedDate] = [{ name: eventName }];
      }
      setEvents(updatedEvents);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <Agenda
        items={events}
        renderItem={(item) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
          </View>
        )}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setModalVisible(true);
        }}
        pastScrollRange={12}
        futureScrollRange={12}
        hideExtraDays={false}
        style={styles.agenda}
      />
{user && user.isCoach && (
  <TouchableOpacity
    style={styles.addButton}
    onPress={() => {
      console.log('Button pressed - user.isCoach:', user.isCoach); // Dodaj ten log
      setModalVisible(true);
    }}
  >
    <Text style={styles.buttonText}>Dodaj Wydarzenie</Text>
  </TouchableOpacity>
)}



      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <EventForm onClose={() => setModalVisible(false)} />
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
});

export default Calendar;
