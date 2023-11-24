import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'react-router-native';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../constants/config';
import Header from '../components/header';
import Footer from '../components/footer';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showInformation, setShowInformation] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        setUser(userData);
        try {
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, where('uid', '==', userData.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDataFromFirestore = querySnapshot.docs[0].data();
            setUserEmail(userDataFromFirestore.email || '');
          }
        } catch (error) {
          console.error('Błąd podczas pobierania danych użytkownika:', error.message);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationsToggle = () => {
    setNotificationsEnabled((prev) => !prev);
  };

  const handleDarkModeToggle = () => {
    setDarkModeEnabled((prev) => !prev);
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, userEmail);
      Alert.alert('Sukces', 'Wysłano link do zresetowania hasła na podany adres email.');
    } catch (error) {
      console.error('Błąd resetowania hasła:', error.message);
      Alert.alert('Błąd', 'Nie udało się wysłać linku do zresetowania hasła. Spróbuj ponownie.');
    } finally {
      setShowPasswordReset(false);
    }
  };

  const renderInformation = () => {
    if (showInformation) {
      return (
        <View style={styles.informationContainer}>
          <Text style={styles.informationText}>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <View style={styles.settingsContent}>
        <Text style={styles.title}>Ustawienia Aplikacji</Text>

        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Powiadomienia</Text>
          <Switch value={notificationsEnabled} onValueChange={handleNotificationsToggle} />
        </View>

        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Motyw</Text>
          <Switch value={darkModeEnabled} onValueChange={handleDarkModeToggle} />
        </View>

        {showPasswordReset ? (
          <View style={styles.optionContainer}>
            <Text style={styles.optionText}>Zresetuj Hasło</Text>
            <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
              <Text style={styles.buttonText}>Resetuj Hasło</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.optionContainer}>
            <Text style={styles.optionText} onPress={() => setShowPasswordReset(true)}>
              Zmień hasło ({userEmail})
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.optionContainer}
          onPress={() => setShowInformation((prev) => !prev)}
        >
          <Text style={styles.optionText}>Informacje</Text>
        </TouchableOpacity>

        {renderInformation()}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  button: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  informationContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
  },
  informationText: {
    fontSize: 16,
    color: 'black',
  },
});

export default Settings;
