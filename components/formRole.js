import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-native';

const FormRole = () => {
  const navigate = useNavigate();

  const handlePlayerSelection = () => {
    navigate('./formSignUp');
  };

  const handleCoachSelection = () => {
    navigate('./formCoach');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wybierz Rolę</Text>
      <Text style={styles.title2}>Jeśli jesteś Trenerem i chcesz zarządzać swoją drużyną, wybierz rolę Trener. Jeśli jesteś Zawodnikiem i chcesz dołączyć do drużyny oraz komunikować się z zespołem, wybierz rolę Zawodnik.</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handlePlayerSelection}>
          <Text style={styles.buttonText}>Zawodnik</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCoachSelection}>
          <Text style={styles.buttonText}>Trener</Text>
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
    backgroundColor: '#24243f',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  title2: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
    padding: 20,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonContainer: {
    alignSelf: 'stretch', // Ustawienie, aby przyciski były szersze
    marginVertical: 10,
    alignItems: 'center', // Ustawienie centrowania przycisków wzdłuż osi poziomej
  },
  button: {
    width: '55%', // Ustawienie szerokości przycisku
    paddingVertical: 20,
    backgroundColor: '#9091fd',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
});

export default FormRole;
