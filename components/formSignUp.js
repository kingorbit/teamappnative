import React, { useState } from 'react';
import { TextInput, View, Alert, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import auth from '../constants/config'; // Import zainicjalizowanej konfiguracji Firebase
import { useNavigate } from 'react-router-native'; // Zaimportuj useNavigate

const FormSignUp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Błąd rejestracji', 'Hasła nie pasują do siebie. Wprowadź je ponownie.');
      return;
    }

    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Zarejestrowano', response);
      // Przekierowanie do innej trasy za pomocą funkcji obsługującej zmianę trasy
      navigation.navigate('Login'); // Przykładowe przekierowanie do ekranu logowania
    } catch (error) {
      console.error('Błąd rejestracji', error);
      // Obsługa błędów poprzez wyświetlenie alertu
      Alert.alert('Błąd rejestracji', error.message); // Wyświetlenie komunikatu z błędem
    }
  };
  const navigate = useNavigate(); // Użyj useNavigate
  const handleBack = () => {
    navigate('/'); 
  };

  return (
    <View style={styles.container} >
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Potwierdź hasło"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '70%',
  },
  input: {
    width: '100%',
    height: 35,
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    textAlign: 'center',
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
    width: '50%',
  },
});

export default FormSignUp;
