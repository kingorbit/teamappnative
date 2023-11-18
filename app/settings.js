import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import Header from '../components/header';
import Footer from '../components/footer';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../constants/config';

const Settings = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      if (userData) {
        setUser(userData); // Aktualizacja stanu użytkownika po zalogowaniu
      }
    });

    return () => unsubscribe(); // Oczyszczanie subskrypcji po zamontowaniu komponentu
  }, []);

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <View style={styles.settingsContent}>
        <Text style={styles.title}>Ustawienia Aplikacji</Text>
        <Text>Powiadomienia</Text>
        <Text>Motyw</Text>
        <Text>Zmiań hasło</Text>
        <Text>Informacje</Text>

        <Link to="/home" style={styles.link}>
          <Text style={styles.linkText}>Powrót do Home</Text>
        </Link>
      </View>
      <Footer></Footer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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

export default Settings;
