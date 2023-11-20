import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import Header from '../components/header';
import Footer from '../components/footer';
import { onAuthStateChanged } from 'firebase/auth';
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
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Powiadomienia</Text>
        </View>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Motyw</Text>
        </View>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Zmień hasło</Text>
        </View>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Informacje</Text>
        </View>

        <Link to="/home" style={styles.link}>
          <Text style={styles.linkText}>Powrót do Home</Text>
        </Link>
      </View>
      <Footer />
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
    color: 'white',
  },
  settingsContent: {
    padding: 20,
    flex: 1,
  },
  optionContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  link: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    elevation: 3,
    backgroundColor: '#f0f0f0',
  },
  linkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default Settings;
