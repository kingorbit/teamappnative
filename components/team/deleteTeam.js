import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, query, where, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../../constants/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-native';
import Header from '../header';
import NavigationBar from '../navBar';
import { lightTheme, darkTheme } from '../theme';

const DeleteTeam = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [theme, setTheme] = useState(darkTheme);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        setUser(userData);
        await fetchUserSettings(userData.uid, setTheme);
      }
    });
  
    return () => unsubscribe();
  }, []);

  const fetchUserSettings = async (uid, setTheme) => {
    try {
      const userDocRef = doc(firestore, 'users', uid);
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (userDocSnapshot.exists()) {
        const userDataFromFirestore = userDocSnapshot.data();
        const darkModeEnabled = userDataFromFirestore.darkModeEnabled || false;
        setTheme(darkModeEnabled ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error.message);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamName) {
      Alert.alert('Błąd', 'Proszę uzupełnić nazwę zespołu.');
      return;
    }

    try {
      const teamsRef = collection(firestore, 'teams');
      const q = query(teamsRef, where('name', '==', teamName));
      const teamsQuery = await getDocs(q);

      if (!teamsQuery.empty) {
        const teamDoc = teamsQuery.docs[0];
        const teamData = teamDoc.data();

        // Sprawdzamy, czy aktualnie zalogowany użytkownik jest założycielem zespołu
        if (teamData.createdBy === user.uid) {
          const teamId = teamDoc.id;

          // Usuwanie zespołu z kolekcji
          await deleteDoc(doc(firestore, 'teams', teamId));

          // Czyszczenie pola po usunięciu zespołu
          setTeamName('');

          Alert.alert('Sukces', 'Zespół został pomyślnie usunięty!');
          navigate('/team');
        } else {
          Alert.alert('Błąd', 'Nie masz uprawnień do usunięcia tego zespołu.');
        }
      } else {
        Alert.alert('Błąd', 'Nie znaleziono zespołu o podanej nazwie.');
      }
    } catch (error) {
      console.error('Błąd podczas usuwania zespołu', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania zespołu.');
    }
  };

  return (
<View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Header></Header>
      <View style={styles.teamContent}>
        <Text style={[styles.title, { color: theme.textColor }]}>Usuń Zespół</Text>
        <TextInput
          style={styles.input}
          placeholder="Nazwa zespołu"
          value={teamName}
          onChangeText={setTeamName}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.cancel }]} onPress={handleDeleteTeam}>
          <Text style={styles.buttonText}>Usuń Zespół</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.link, { backgroundColor: theme.buttonColor }]} onPress={() => navigate('/team')}>
          <Text style={[styles.linkText, { color: theme.textColor }]}>Powrót</Text>
        </TouchableOpacity>
      </View>
      <NavigationBar></NavigationBar>
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
  input: {
    width: '90%',
    height: 35,
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  button: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    elevation: 3,
    width: '50%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
  teamContent: {
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default DeleteTeam;
