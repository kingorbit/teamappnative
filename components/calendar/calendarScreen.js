import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = ({ addEvent }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventName, setEventName] = useState('');

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Nazwa wydarzenia"
        onChangeText={(text) => setEventName(text)}
      />
      <TouchableOpacity style={styles.button} onPress={() => addEvent(selectedDate, eventName)}>
        <Text style={styles.buttonText}>Dodaj</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
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

export default CalendarScreen;
