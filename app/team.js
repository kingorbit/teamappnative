import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { firestore, auth } from '../constants/config';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-native';
import Header from '../components/header';

const Team = () => {
  const [user, setUser] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      if (userData) {
        setUser(userData);
      }
    });

    return () => unsubscribe();
  }, []);

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
        createdBy: user.uid, // Dodawanie informacji o użytkowniku, który utworzył zespół
      };

      const docRef = await addDoc(teamRef, newTeam);
      alert('Dodano zespół do kolekcji "teams" z ID:', docRef.id);

      // Czyszczenie pól po dodaniu zespołu
      setTeamName('');
      setTeamDescription('');

      // Dodać kod lub powiadomienie potwierdzające dodanie zespołu
    } catch (error) {
      console.error('Błąd podczas dodawania zespołu', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas dodawania zespołu.');
    }
  };

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <View style={styles.teamContent}>
        <Text style={styles.title}>Utwórz Zespół</Text>
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
        <TouchableOpacity style={styles.button} onPress={handleCreateTeam}>
          <Text style={styles.buttonText}>Utwórz Zespół</Text>
        </TouchableOpacity>
        <Link to="/home" style={styles.link}>
          <Text style={styles.linkText}>Powrót do Home</Text>
        </Link>
      </View>
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
    color: 'black',
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

export default Team;
