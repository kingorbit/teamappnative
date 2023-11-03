import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Importuj funkcje onAuthStateChanged, auth i signOut
import { auth } from '../constants/config'; 
import { useNavigate } from 'react-router-native';
const Home = () => {
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
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.userText}>
          {user ? `Zalogowany użytkownik: ${user.email}` : 'Brak zalogowanego użytkownika'}
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Wyloguj</Text>
        </TouchableOpacity>
      </View>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9091fd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  userText: {
    fontSize: 16,
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
    margin: 10,
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
