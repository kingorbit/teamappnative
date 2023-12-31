import React, { useState } from 'react';
import { TextInput, View, Alert, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../constants/config';
import { useNavigate } from 'react-router-native';

const FormLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log('Zalogowano', response);
      navigate('/home');
    } catch (error) {
      console.error('Błąd logowania', error);
      Alert.alert('Podałeś niepoprawny email lub hasło!');
    }
  };

  const handleForgotPassword = () => {
    // Navigate to the forgetpass.js screen here
    navigate('/forgetpass');
  };

  const handleStart = () => {
    navigate('/loading'); // Przejście do ekranu ładowania
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="gray"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Hasło"
        placeholderTextColor="gray"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
            <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Zapomniałeś hasła?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Zaloguj</Text>
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
    height: 45,
    borderWidth: 1,
    backgroundColor: 'white',
    color: 'black',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  button: {
    padding: 20,
    margin: 10,
    backgroundColor: '#9091fd',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    width: '70%',
  },
  forgotPasswordText: {
    color: 'gray', // Zmiana koloru tekstu na biały
    marginVertical: 15,
  },
});

export default FormLogin;
