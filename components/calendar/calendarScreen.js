// CalendarScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState('');

  const onDayPress = (day) => {
    // Zapisz datę po naciśnięciu
    setSelectedDate(day.dateString);
  };

  const addEvent = () => {
    if (selectedDate && newEvent) {
      setEvents({
        ...events,
        [selectedDate]: { selected: true, marked: true, selectedColor: 'blue', event: newEvent },
      });
      setNewEvent('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kalendarz</Text>
      <Calendar
        onDayPress={onDayPress}
        markedDates={events}
      />
      <View style={styles.eventContainer}>
        <Text style={styles.eventTitle}>Dodaj nowe wydarzenie:</Text>
        <TextInput
          style={styles.eventInput}
          placeholder="Wprowadź wydarzenie"
          value={newEvent}
          onChangeText={(text) => setNewEvent(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addEvent}>
          <Text style={styles.addButtonText}>Dodaj</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  eventContainer: {
    marginTop: 20,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CalendarScreen;
