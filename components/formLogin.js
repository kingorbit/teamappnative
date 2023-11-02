import React, { useState } from 'react';
import { TextInput, Button, View } from 'react-native';
import auth from '../constants/config'; // Import zainicjalizowanej konfiguracji Firebase

const FormLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await auth.signInWithEmailAndPassword(email, password);
      console.log('Zalogowano', response);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Błąd logowania', error);
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
      <Button title="Zaloguj" onPress={handleLogin} />
    </View>
  );
};

export default FormLogin;
