import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../constants/config';
import Header from '../components/header';
import NavigationBar from '../components/navBar';
import { lightTheme, darkTheme } from '../components/theme'; // Dodaj import

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
          const userDocRef = doc(firestore, 'users', userData.uid);
  
          // Sprawdź, czy istnieje dokument o nazwie UID użytkownika
          const userDocSnapshot = await getDoc(userDocRef);
  
          if (userDocSnapshot.exists()) {
            const userDataFromFirestore = userDocSnapshot.data();
            setUserEmail(userDataFromFirestore.email || '');
            setNotificationsEnabled(userDataFromFirestore.notificationsEnabled || false);
            setDarkModeEnabled(userDataFromFirestore.darkModeEnabled || false);
  
            // Aktualizuj istniejący dokument
            await updateDoc(userDocRef, {
              notificationsEnabled: userDataFromFirestore.notificationsEnabled || false,
              darkModeEnabled: userDataFromFirestore.darkModeEnabled || false,
            });
          } else {
            // Zmiana nazwy dokumentu na UID użytkownika
            const renamedDocRef = doc(firestore, 'users', userData.uid);
  
            // Utwórz nowy dokument z nową nazwą
            await setDoc(renamedDocRef, {
              uid: userData.uid,
              email: userData.email,
              notificationsEnabled: false, // Możesz ustawić domyślne wartości
              darkModeEnabled: false,
            });
          }
        } catch (error) {
          console.error('Błąd podczas pobierania/dodawania danych użytkownika:', error.message);
        }
      }
    });
  
    return () => unsubscribe();
  }, []);

  const handleNotificationsToggle = async () => {
    try {
      // Aktualizuj stan w bazie danych
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        notificationsEnabled: !notificationsEnabled,
      });

      // Aktualizuj lokalny stan
      setNotificationsEnabled((prev) => !prev);
    } catch (error) {
      console.error('Błąd podczas aktualizacji ustawień powiadomień:', error.message);
    }
  };

  const handleThemeToggle = () => {
    const newDarkMode = !darkModeEnabled;
  
    // Aktualizuj stan w bazie danych
    const userDocRef = doc(firestore, 'users', user.uid);
    updateDoc(userDocRef, {
      darkModeEnabled: newDarkMode,
    });
  
    // Aktualizuj lokalny stan
    setDarkModeEnabled(newDarkMode);
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

  const theme = darkModeEnabled ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Header user={user} setUser={setUser} />
      <View style={styles.settingsContent}>
        <Text style={[styles.title, { color: theme.textColor }]}>Ustawienia Aplikacji</Text>

        <View style={[styles.optionContainer, { backgroundColor: 'white' }]}>
          <Text style={[styles.optionText, { color: 'black' }]}>Powiadomienia</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
          />
        </View>

        <View style={[styles.optionContainer, { backgroundColor: 'white' }]}>
          <Text style={[styles.optionText, { color: 'black' }]}>Motyw</Text>
          <Switch
            value={darkModeEnabled}
            onValueChange={handleThemeToggle}
          />
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
          style={[styles.optionContainer]}
          onPress={() => setShowInformation((prev) => !prev)}
        >
          <Text style={[styles.optionText]}>Informacje</Text>
        </TouchableOpacity>

        {renderInformation()}
      </View>
      <NavigationBar></NavigationBar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: 90,
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
