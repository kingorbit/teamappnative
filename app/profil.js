import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Link } from 'react-router-native';
import Header from '../components/header';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { firestore, auth } from '../constants/config';

const Profil = () => {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        // setUser(userData); // Ustawianie stanu użytkownika po zalogowaniu

        try {
          // Pobierz referencję do kolekcji "users" na podstawie uid
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, where('uid', '==', userData.uid));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            console.log(doc.id, ' => ', doc.data());
            setUser(doc.data()); // Ustawianie stanu użytkownika na podstawie danych z Firestore
          });
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });

    return () => unsubscribe(); // Oczyszczanie subskrypcji po zamontowaniu komponentu
  }, []);

  const handleUpdate = async () => {
    try {
      const userDocRef = doc(firestore, 'users', user.id);
      const updatedData = {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: email || user.email,
        position: position || user.position,
      };

      await updateDoc(userDocRef, updatedData);
      console.log('Dane zostały zaktualizowane.');
      // Tutaj można dodać potwierdzenie aktualizacji albo inny feedback dla użytkownika
    } catch (error) {
      console.error('Błąd aktualizacji danych użytkownika', error);
      // Obsługa błędów
    }
  };
  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <View style={styles.calendarContent}>
        <Text style={styles.title}>Twój Profil</Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Imię:</Text>
          <TextInput
            style={styles.input}
            value={firstName || user?.firstName}
            onChangeText={setFirstName}
          />
          <Text style={styles.label}>Nazwisko:</Text>
          <TextInput
            style={styles.input}
            value={lastName || user?.lastName}
            onChangeText={setLastName}
          />
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email || user?.email}
            onChangeText={setEmail}
          />
          <Text style={styles.label}>Pozycja:</Text>
          <TextInput
            style={styles.input}
            value={position || user?.position}
            onChangeText={setPosition}
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Aktualizuj Dane</Text>
          </TouchableOpacity>
        </View>
        <Link to="/home" style={styles.link}>
          <Text style={styles.linkText}>Powrót do Home</Text>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  link: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    elevation: 3,
    width: '50%',
    backgroundColor: '#f0f0f0',
  },
  linkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  calendarContent: {
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});


export default Profil;
