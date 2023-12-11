import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigate } from 'react-router-native';
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firestore, auth } from '../../constants/config';
import Header from '../header';
import { lightTheme, darkTheme } from '../theme';
import NavigationBar from '../navBar';

const joinTeamByCode = async (userUid, joinCode) => {
  try {
    const teamsRef = collection(firestore, 'teams');
    const q = query(teamsRef, where('joinCode', '==', joinCode));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const teamDoc = querySnapshot.docs[0];

      await updateDoc(teamDoc.ref, {
        members: arrayUnion(userUid),
      });

      console.log('Użytkownik dołączył do drużyny:', teamDoc.id);
      return true;
    } else {
      console.log('Drużyna o podanym kodzie nie istnieje.');
      return false;
    }
  } catch (error) {
    console.error('Błąd dołączania do drużyny', error);
    throw error;
  }
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

const JoinTeam = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [theme, setTheme] = useState(darkTheme);

  const handleJoinTeam = async () => {
    try {
      if (!user || !user.uid) {
        Alert.alert('Błąd', 'Użytkownik nie jest zalogowany.');
        return;
      }

      const success = await joinTeamByCode(user.uid, enteredCode);

      if (success) {
        Alert.alert('Sukces', 'Pomyślnie dołączono do drużyny!');
        setEnteredCode('');
        navigate('/team');
      } else {
        Alert.alert('Błąd', 'Drużyna o podanym kodzie nie istnieje.');
      }
    } catch (error) {
      console.error('Błąd dołączania do drużyny', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas dołączania do drużyny.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      if (userData) {
        setUser(userData);
        fetchUserSettings(userData.uid, setTheme);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
<View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Header user={user} setUser={setUser} />
      <View style={styles.teamContent}>
        <Text style={[styles.title, { color: theme.textColor }]}>Dołącz do Zespołu</Text>
        <TextInput
          style={styles.input}
          placeholder="Wprowadź kod drużyny"
          value={enteredCode}
          onChangeText={setEnteredCode}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.succes }]} onPress={handleJoinTeam}>
          <Text style={styles.buttonText}>Dołącz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.cancel }]} onPress={() => navigate('/team')}>
          <Text style={styles.buttonText}>Powrót</Text>
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
    padding: 20,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  teamContent: {
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default JoinTeam;
