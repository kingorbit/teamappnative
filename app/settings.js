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
import { collection, query, where, getDoc, updateDoc, doc, setDoc, getDocs } from 'firebase/firestore';
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
          const userDocRef = collection(firestore, 'users');
          
          // Sprawdź, czy istnieje dokument z polem "uid" równe UID użytkownika
          const userQuery = query(userDocRef, where('uid', '==', userData.uid));
          const userDocs = await getDocs(userQuery);
  
          if (userDocs.size > 0) {
            // Dokument istnieje, więc go zaktualizuj
            const userDoc = userDocs.docs[0];
            const userDataFromFirestore = userDoc.data();
  
            setUserEmail(userDataFromFirestore.email || '');
            setNotificationsEnabled(userDataFromFirestore.notificationsEnabled || false);
            setDarkModeEnabled(userDataFromFirestore.darkModeEnabled || false);
  
            // Aktualizuj istniejący dokument
            await updateDoc(userDoc.ref, {
              notificationsEnabled: userDataFromFirestore.notificationsEnabled || false,
              darkModeEnabled: userDataFromFirestore.darkModeEnabled || false,
            });
          } else {
            // Dokument nie istnieje, więc go utwórz
            await addDoc(userDocRef, {
              uid: userData.uid,
              email: userData.email,
              notificationsEnabled: false,
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
        <View style={[styles.informationContainer, { backgroundColor: theme.buttonColor }]}>
          <Text style={[styles.informationText, { color: theme.textColor }]}>
            Praca inżynierska. Jakub Fluder 2023
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

        <View style={[styles.optionContainer, { backgroundColor: theme.buttonColor }]}>
          <Text style={[styles.optionText, { color: theme.textColor }]}>Powiadomienia</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
          />
        </View>

        <View style={[styles.optionContainer, { backgroundColor: theme.buttonColor }]}>
          <Text style={[styles.optionText, { color: theme.textColor }]}>Motyw</Text>
          <Switch
            value={darkModeEnabled}
            onValueChange={handleThemeToggle}
          />
        </View>

        {showPasswordReset ? (
          <View style={[styles.optionContainer, { backgroundColor: theme.buttonColor }]}>
            <Text style={[styles.optionText, { color: theme.textColor }]}>Zresetuj Hasło</Text>
            <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
              <Text style={styles.buttonText}>Resetuj Hasło</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.optionContainer, { backgroundColor: theme.buttonColor }]}>
            <Text style={[styles.optionText, { color: theme.textColor }]} onPress={() => setShowPasswordReset(true)}>
              Zmień hasło ({userEmail})
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.optionContainer, { backgroundColor: theme.buttonColor }]}
          onPress={() => setShowInformation((prev) => !prev)}
        >
          <Text style={[styles.optionText, { color: theme.textColor }]}>Informacje</Text>
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
