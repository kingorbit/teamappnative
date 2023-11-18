import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../constants/config';
import { Agenda } from 'react-native-calendars';
import Header from '../components/header';

const Calendar = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      if (userData) {
        setUser(userData);
      }
    });

    // Pobierz wydarzenia z bazy danych lub innego źródła
    // Przykładowe dane:
    const fetchedEvents = {
      '2023-11-17': [{ name: 'Mecz 1' }],
      '2023-11-18': [{ name: 'Trening 1' }],
      '2023-11-19': [],
      '2023-11-20': [{ name: 'Mecz 2' }, { name: 'Trening 2' }],
    };
    setEvents(fetchedEvents);

    return () => unsubscribe();
  }, []);

  const addEvent = () => {
    if (selectedDate) {
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
      <View style={styles.calendarContent}>
        <Agenda
         style={{ width: '75%' }}
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
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Dodaj Wydarzenie</Text>
            <TextInput
              style={styles.input}
              placeholder="Nazwa wydarzenia"
              onChangeText={(text) => setEventName(text)}
            />
            <TouchableOpacity style={styles.button} onPress={addEvent}>
              <Text style={styles.buttonText}>Dodaj</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  calendarContent: {
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 5,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default Calendar;
