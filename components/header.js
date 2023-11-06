import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { auth } from '../constants/config';
import { useNavigate } from 'react-router-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../constants/config';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        try {
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, where('uid', '==', userData.uid));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            setUser(doc.data());
          });
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        navigate('/');
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
          <Text style={styles.userText}>
            Zalogowany: {user.firstName} {user.lastName}
          </Text>
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
