import React, { useState } from 'react';
import { TextInput, Button, View, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import auth from '../constants/config'; // Import zainicjalizowanej konfiguracji Firebase

const FormSignUp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
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

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Zarejestruj" onPress={handleSignUp} />
    </View>
  );
};

export default FormSignUp;
