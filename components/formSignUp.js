import React, { useState } from 'react';
import { TextInput, Button, View } from 'react-native';
import auth from '../constants/config'; // Import zainicjalizowanej konfiguracji Firebase

const FormSignUp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      const response = await auth.createUserWithEmailAndPassword(email, password);
      console.log('Zarejestrowano', response);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Błąd rejestracji', error);
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
