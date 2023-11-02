import React, { useState } from 'react';
import { TextInput, Button, View, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../constants/config'; // Import zainicjalizowanej konfiguracji Firebase

const FormLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log('Zalogowano', response);
      // Przekierowanie do innej trasy za pomocą funkcji obsługującej zmianę trasy
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }], // Nazwa trasy, do której ma nastąpić przekierowanie
      });
    } catch (error) {
      console.error('Błąd logowania', error);
      // Obsługa błędów poprzez wyświetlenie alertu
      Alert.alert('Błąd logowania', error.message); // Wyświetlenie komunikatu z błędem
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
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Zaloguj" onPress={handleLogin} />
    </View>
  );
};

export default FormLogin;
