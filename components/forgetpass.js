import React, { useState } from 'react';
import { TextInput, View, TouchableOpacity, Text, Alert, StyleSheet, Image } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../constants/config';
import { useNavigate } from 'react-router-native';

const ForgetPass = ({ navigateToHome }) => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('E-mail z resetowaniem hasła został wysłany. Sprawdź swoją skrzynkę pocztową.');
    } catch (error) {
      console.error('Błąd podczas wysyłania e-maila resetującego hasło', error);
      Alert.alert('Wystąpił błąd podczas wysyłania e-maila resetującego hasło. Spróbuj ponownie.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.forgotContainer}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.header}>Zapomniałeś hasła?</Text>
        <TextInput
          style={styles.input}
          placeholder="Podaj swój adres e-mail"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Wyślij</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.goBackButton} onPress={() => navigate('/')}>
          <Text style={styles.goBackText}>Powrót</Text>
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
  forgotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '70%',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
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
  goBackButton: {
    marginTop: 20,
    padding: 20,
    margin: 10,
    backgroundColor: '#9091fd',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    width: '70%',
  },
  goBackText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logo: {
    width: 200,
    height: 200,
    marginVertical: 25,
    borderRadius: 20,
  }
});

export default ForgetPass;
