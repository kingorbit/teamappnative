import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Importuj funkcje onAuthStateChanged, auth i signOut
import { auth } from '../constants/config';
import { useNavigate } from 'react-router-native';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Użyj useNavigate

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      if (userData) {
        setUser(userData); // Aktualizacja stanu użytkownika po zalogowaniu
      }
    });

    return () => unsubscribe(); // Oczyszczanie subskrypcji po zamontowaniu komponentu
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        navigate('/'); // Przekierowanie po wylogowaniu
      })
      .catch((error) => {
        console.error('Błąd wylogowania', error);
      });
  };

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Team App</Text>
      {user && (
        <View style={styles.userDetails}>
          <Text style={styles.userText}>Zalogowany: {user.email}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Wyloguj</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#40407a',
    padding: 15,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  userText: {
    color: 'white',
  },
  logoutButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 5,
  },
  logoutText: {
    fontSize: 14,
    color: 'black',
  },
});

export default Header;
