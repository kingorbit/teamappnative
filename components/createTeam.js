import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { firestore, auth } from '../constants/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-native';

const CreateTeam = () => {
  const navigate = useNavigate();
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

  const generateJoinCode = () => {
    // Funkcja generująca losowy 6-znakowy kod dołączenia
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
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
        createdBy: user.uid, // Dodawanie informacji o użytkowniku, który utworzył zespół
        joinCode: generateJoinCode(), // Generowanie kodu dołączenia
      };

      await addDoc(teamRef, newTeam);

      // Czyszczenie pól po dodaniu zespołu
      setTeamName('');
      setTeamDescription('');

      Alert.alert('Sukces', 'Zespół został pomyślnie utworzony!');
    } catch (error) {
      console.error('Błąd podczas dodawania zespołu', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas dodawania zespołu.');
    }
  };

  return (
    <View style={styles.container}>
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
        <TouchableOpacity style={styles.link} onPress={() => navigate('/team')}>
          <Text style={styles.linkText}>Powrót</Text>
        </TouchableOpacity>
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
  

export default CreateTeam;
