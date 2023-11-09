import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-native';

const formRole = () => {
  const navigate = useNavigate();

  const handlePlayerSelection = () => {
    navigate('./formSignUp');
  };

  const handleCoachSelection = () => {
    navigate('/sign-up-coach');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wybierz Rolę</Text>
      <TouchableOpacity style={styles.button} onPress={handlePlayerSelection}>
        <Text style={styles.buttonText}>Zawodnik</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleCoachSelection}>
        <Text style={styles.buttonText}>Trener</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9091fd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  button: {
    padding: 20,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    width: '70%',
  },
});

export default formRole;
