// CalendarScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');

  const handleDayPress = (day) => {
    // Obsługa naciśnięcia dnia
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wybierz datę:</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' },
        }}
      />
      <Text style={styles.selectedDate}>{selectedDate}</Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedDate: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default CalendarScreen;
