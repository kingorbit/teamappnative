import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
        setUser(userData);
      }
    });

    return () => unsubscribe();
  }, []);

  const exampleMessage = "Rozpoczynamy nowy sezon! Nowe mecze, nowe wyzwania. Zapisz się na najbliższy trening!";

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <ScrollView style={styles.contentContainer}>
        <View style={styles.messagesContainer}>
          <Text style={styles.sectionTitle}>Wiadomości</Text>
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{exampleMessage}</Text>
          </View>
          {/* Dodaj kolejne wiadomości, jeśli są dostępne */}
        </View>

        <View style={styles.eventsContainer}>
          <Text style={styles.sectionTitle}>Nadchodzące Wydarzenia</Text>
          {/* Tutaj możesz umieścić komponent wyświetlający najbliższe treningi lub mecze */}
          {/* Jeśli użytkownik nie jest w żadnym zespole, możesz wyświetlić napis zachęcający do dołączenia */}
          {user && user.isCoach ? (
            <Link to="/manage-events" style={styles.link}>
              <Text style={styles.linkText}>Zarządzaj Wydarzeniami</Text>
            </Link>
          ) : (
            <Link to="/join-team" style={styles.link}>
              <Text style={styles.linkText}>Dołącz do Zespołu</Text>
            </Link>
          )}
        </View>
      </ScrollView>
      <NavigationBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  messagesContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  messageContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: 'black',
  },
  eventsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  link: {
    padding: 20,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  linkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default Home;