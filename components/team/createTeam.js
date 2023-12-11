import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../../constants/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-native';
import Header from '../header';
import NavigationBar from '../navBar';
import { lightTheme, darkTheme } from '../theme';

const CreateTeam = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
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

  const generateJoinCode = () => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  };

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

  const handleCreateTeam = async () => {
    if (!teamName || !teamDescription) {
      Alert.alert('Błąd', 'Proszę uzupełnić nazwę i opis zespołu.');
      return;
    }
  
    try {
      const teamRef = collection(firestore, 'teams');
      const newTeam = {
        name: teamName,
        description: teamDescription,
        createdBy: user.uid,
        joinCode: generateJoinCode(),
        members: [user.uid], // Dodanie trenera do listy członków
      };
  
      const docRef = await addDoc(teamRef, newTeam);
      const teamId = docRef.id;
  
      // Dodajemy unikalne ID do zespołu
      await updateDoc(doc(firestore, 'teams', teamId), { teamId });
  
      // Czyszczenie pól po dodaniu zespołu
      setTeamName('');
      setTeamDescription('');
  
      Alert.alert('Sukces', 'Zespół został pomyślnie utworzony!');
      navigate('/team');
    } catch (error) {
      console.error('Błąd podczas dodawania zespołu', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas dodawania zespołu.');
    }
  };

  return (
<View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Header></Header>
      <View style={styles.teamContent}>
        <Text style={[styles.title, { color: theme.textColor }]}>Utwórz Zespół</Text>
        <TextInput
          style={styles.input}
          placeholder="Nazwa zespołu"
          value={teamName}
          onChangeText={setTeamName}
        />
        <TextInput
          style={styles.input}
          placeholder="Opis zespołu"
          value={teamDescription}
          onChangeText={setTeamDescription}
          multiline={true}
          numberOfLines={4}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.succes }]} onPress={handleCreateTeam}>
          <Text style={styles.buttonText}>Utwórz Zespół</Text>
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

export default CreateTeam;
