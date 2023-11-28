import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Importuj funkcje onAuthStateChanged, auth i signOut
import { auth } from '../constants/config'; 
import Header from './header';
import NavigationBar from './navBar';



const Home = () => {
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
      <View style={styles.tilesContainer}>
      <Link to="/calendar" style={styles.link}>
        <Text style={styles.linkText}>Kalendarz</Text>
      </Link>
      <Link to="/team" style={styles.link}>
        <Text style={styles.linkText}>Drużyna</Text>
      </Link>
      <Link to="/chat" style={styles.link}>
        <Text style={styles.linkText}>Chat</Text>
      </Link>
      <Link to="/profil" style={styles.link}>
        <Text style={styles.linkText}>Profil</Text>
      </Link>
      <Link to="/stats" style={styles.link}>
        <Text style={styles.linkText}>Statystyki</Text>
      </Link>
      <Link to="/settings" style={styles.link}>
        <Text style={styles.linkText}>Ustawienia</Text>
      </Link>
      <NavigationBar></NavigationBar>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  tile: {
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    width: 150,
    height: 150,
    margin: 15,
  },
  tileText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  link: {
    padding: 20,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    width: '50%',
  },
  linkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default Home;
