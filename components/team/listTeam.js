import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../../constants/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-native';
import Header from '../header';
import NavigationBar from '../navBar';
import { lightTheme, darkTheme } from '../theme';

const TeamsList = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [theme, setTheme] = useState(darkTheme);

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
  
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        await fetchUserSettings(userData.uid, setTheme);
      }
    });
  
    fetchTeams();
  
    return () => unsubscribe();
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

  return (
<View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Header></Header>
    <ScrollView contentContainerStyle={styles.listcontainer}>
      <Text style={[styles.title, { color: theme.textColor }]}>Lista Zespołów</Text>
      {teams.map((team) => (
        <TouchableOpacity key={team.id} style={[styles.team, { backgroundColor: theme.buttonColor }]} onPress={() => navigate(`/team/${team.id}`)}>
          <Text style={[styles.teamName, { color: theme.textColor }]}>{team.name}</Text>
          <Text style={[styles.teamDescription, { color: theme.textColor }]}>{team.description}</Text>
          {team.creator && (
            <Text style={styles.creatorInfo}>
              Założyciel: {team.creator.firstName} {team.creator.lastName}
            </Text>
          )}
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.link, { backgroundColor: theme.buttonColor }]} onPress={() => navigate('/team')}>
        <Text style={[styles.linkText, { color: theme.textColor }]}>Powrót</Text>
      </TouchableOpacity>
    </ScrollView>
    <NavigationBar></NavigationBar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
flex: 1,
backgroundColor: '#9091fd',
  },
  listcontainer:{
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    width: '70%',
    alignItems: 'center', 
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center', 
  },
  teamDescription: {
    fontSize: 16,
    textAlign: 'center', 
  },
  creatorInfo: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 10, 
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
    color: 'white',
  },
});

export default TeamsList;
