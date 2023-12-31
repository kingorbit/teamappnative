import React, { useState } from 'react';
import { TextInput, View, Alert, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Image } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../constants/config';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-native';
import ModalDropdown from 'react-native-modal-dropdown';

const FormSignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [position, setPosition] = useState('Bramkarz');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !firstName || !lastName || !age) {
      Alert.alert('Błąd rejestracji', 'Proszę wypełnić wszystkie pola.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Błąd rejestracji', 'Hasła nie pasują do siebie. Wprowadź je ponownie.');
      return;
    }

    const isValidAge = /^\d+$/.test(age) && age >= 1 && age <= 99;
    if (!isValidAge) {
      Alert.alert('Błąd rejestracji', 'Podaj prawidłowy wiek (1-99).');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Dodaj użytkownika do kolekcji "users"
      const userRef = doc(firestore, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        email: email,
        firstName: firstName,
        lastName: lastName,
        age: age,
        position: position,
        isCoach: false,
        darkModeEnabled: false,  // Add this line to set darkModeEnabled to false
        notificationsEnabled: false,  // Add this line to set notificationsEnabled to false
        uid: userCredential.user.uid,
      });

      navigate('/home');
    } catch (error) {
      console.error('Błąd rejestracji', error);
      Alert.alert('Błąd rejestracji', error.message);
    }
  };

  const positionOptions = ['Bramkarz', 'Obronca', 'Pomocnik', 'Napastnik'];

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={-500}>
      <View style={styles.formContainer}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Rejestracja Zawodnik</Text>
        <TextInput
          style={styles.input}
          placeholder="Imię"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Nazwisko"
          value={lastName}
          onChangeText={setLastName}
        />
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
        <TextInput
          style={styles.input}
          placeholder="Potwierdź Hasło"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Wiek"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          maxLength={2}
        />
        <ModalDropdown
          options={positionOptions}
          defaultValue={position}
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          dropdownStyle={styles.dropdownOptions}
          dropdownTextStyle={styles.dropdownOptionText}
          onSelect={(index, value) => setPosition(value)}
        />
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Zarejestruj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigate('/')}>
          <Text style={styles.linkText}>Powrót</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      backgroundColor: '#24243f',
    },
    formContainer: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    link: {
      marginVertical: 20,
      padding: 20,
      backgroundColor: '#9091fd',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      width: '60%',
    },
    linkText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    logo: {
      width: 80,
      height: 75,
      borderRadius: 10,
    },
    input: {
      width: '70%',
      height: 35,
      borderWidth: 1,
      backgroundColor: 'white',
      borderRadius: 5,
      marginBottom: 15,
      paddingHorizontal: 10,
      textAlign: 'center',
    },
    title: {
      fontSize: 35,
      fontWeight: 'bold',
      marginBottom: 20,
      color: 'white',
    },
    buttonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    button: {
      padding: 20,
      backgroundColor: '#9091fd',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      width: '60%',
    },
    checkboxContainer: {
      flexDirection: 'row',
      marginBottom: 15,
      alignItems: 'center',
    },
    checkbox: {
      alignSelf: 'center',
    },
    label: {
      margin: 8,
      color: 'white',
    },
  dropdown: {
    width: '70%',
    height: 35,
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 15,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  dropdownText: {
    textAlign: 'center',
    fontSize: 17,
  },
  dropdownOptions: {
    textAlign: 'center',
    height: 150,
    width: '65%',
    borderRadius: 5,
    marginTop: -5,
  },
  dropdownOptionText: {
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
});

export default FormSignUp;
