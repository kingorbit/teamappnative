import React, { useState } from 'react';
import { TextInput, View, Alert, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../constants/config'; // Import zainicjalizowanej konfiguracji Firebase
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-native';
import ModalDropdown from 'react-native-modal-dropdown';

const FormSignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [position, setPosition] = useState('Bramkarz'); // Początkowa wartość to "Bramkarz"
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
  
      const userDoc = await addDoc(collection(firestore, 'users'), {
        email: email,
        firstName: firstName,
        lastName: lastName,
        age: age,
        position: position,
        uid: userCredential.user.uid,
      });
  
      console.log('Dodano użytkownika do kolekcji "users" z ID:', userDoc.id);
      navigate('/home');
    } catch (error) {
      console.error('Błąd rejestracji', error);
      Alert.alert('Błąd rejestracji', error.message);
    }
  };
  const positionOptions = ['Bramkarz', 'Obronca', 'Pomocnik', 'Napastnik'];

  return (
<KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={-500}>
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
        maxLength={2} // Limits the input length to 2 characters
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
      </KeyboardAvoidingView>
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
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    width: '60%',
  },
  dropdown: {
    width: '100%',
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
