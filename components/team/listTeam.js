import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../constants/config';
import { useNavigate } from 'react-router-native';

const TeamsList = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      const teamsCollection = collection(firestore, 'teams');
      const querySnapshot = await getDocs(teamsCollection);

      const teamsData = [];
      for (const docRef of querySnapshot.docs) {
        const teamData = docRef.data();
        const userData = await getUserData(teamData.createdBy);
        teamsData.push({ id: docRef.id, ...teamData, creator: userData });
      }

      setTeams(teamsData);
    };

    fetchTeams();
  }, []);

  const getUserData = async (uid) => {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
  
      let user = null;
      querySnapshot.forEach((doc) => {
        user = doc.data();
      });
  
      return user;
    } catch (error) {
      console.error('Błąd pobierania danych użytkownika', error);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista Zespołów</Text>
      {teams.map((team) => (
        <TouchableOpacity key={team.id} style={styles.team} onPress={() => navigate(`/team/${team.id}`)}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamDescription}>{team.description}</Text>
          {team.creator && (
            <Text style={styles.creatorInfo}>
              Założyciel: {team.creator.firstName} {team.creator.lastName}
            </Text>
          )}
        </TouchableOpacity>
      ))}
        <TouchableOpacity style={styles.link} onPress={() => navigate('/team')}>
          <Text style={styles.linkText}>Powrót</Text>
        </TouchableOpacity>
    </View>
    
  );


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista Zespołów</Text>
      {teams.map((team) => (
        <View key={team.id} style={styles.team}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamDescription}>{team.description}</Text>
          {team.creator && (
            <Text style={styles.creatorInfo}>
              Założyciel: {team.creator.firstName} {team.creator.lastName} ({team.creator.email})
            </Text>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.link} onPress={() => navigate('/team')}>
        <Text style={styles.linkText}>Powrót</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  team: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center', // Centrowanie tekstu
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center', // Centrowanie tekstu
  },
  teamDescription: {
    fontSize: 16,
    textAlign: 'center', // Centrowanie tekstu
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
});

export default TeamsList;
