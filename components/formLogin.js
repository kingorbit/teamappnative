import React, { useState } from 'react';
import { TextInput, View, Alert, Button, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../constants/config';
import { Link } from 'react-router-native'; // Importuj Link

const FormLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log('Zalogowano', response);
      // Użyj Link to="/" po udanym zalogowaniu
      // Spowoduje to przekierowanie do ekranu Home
    } catch (error) {
      console.error('Błąd logowania', error);
      Alert.alert('Błąd logowania', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Zaloguj"
        onPress={handleLogin}
      />
      <Link to="/">
        <View>
          <Button title="Powrót" />
        </View>
      </Link>
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
});

export default FormLogin;
