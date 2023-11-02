// Calendar.js

import * as React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const Calendar = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kalendarz</Text>
      {/* Tutaj możesz dodać zawartość kalendarza */}

      <Button
        title="Powrót do Home"
        onPress={() => navigation.navigate('Home')}
        style={styles.button}
      />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    margin: 10,
    backgroundColor: '#9091fd',
    borderRadius: 10,
    elevation: 3,
    width: '50%',
  },
});

export default Calendar;
