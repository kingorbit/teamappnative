import React, { useState } from 'react';
import { TextInput, View, Alert, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Image } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../constants/config';
import { collection, addDoc, doc, setDoc, } from 'firebase/firestore';
import { useNavigate } from 'react-router-native';
import CheckBox from 'react-native-check-box';

const FormSignUpCoach = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCoach, setIsCoach] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !firstName || !lastName || !age || !phoneNumber) {
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
  
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
  
      await setDoc(userDocRef, {
        email: email,
        firstName: firstName,
        lastName: lastName,
        age: age,
        isCoach: isCoach,
        phoneNumber: phoneNumber,
        darkModeEnabled: false,
        notificationsEnabled: false,
        uid: userCredential.user.uid,
      });
  
      console.log('Utworzono dokument użytkownika z ID:', userCredential.user.uid);
      navigate('/home');
    } catch (error) {
      console.error('Błąd rejestracji', error);
      Alert.alert('Błąd rejestracji', error.message);
    }
  };
  

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={-500}>
      <View style={styles.formContainer}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>
      Rejestracja Trener
    </Text>
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
        <TextInput
          style={styles.input}
          placeholder="Numer Telefonu"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="numeric"
        />
        <View style={styles.checkboxContainer}>
          <CheckBox
            isChecked={isCoach}
            onClick={() => setIsCoach(!isCoach)}
            checkBoxColor="white"
          />
          <Text style={styles.label}>Jestem trenerem</Text>
        </View>
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
    padding: 20,
    margin: 10,
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
  logo: {
    width: 80,
    height: 75,
    borderRadius: 15,
  }
});

export default FormSignUpCoach;
