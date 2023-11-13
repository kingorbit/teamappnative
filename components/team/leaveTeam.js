import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';

const LeaveTeam = () => {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [leaveSuccess, setLeaveSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        try {
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, where('uid', '==', userData.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUser(userData);

            const teamsRef = collection(firestore, 'teams');
            const teamsQuery = query(teamsRef, where('members', 'array-contains', userData.uid));
            const teamsSnapshot = await getDocs(teamsQuery);

            for (const teamDoc of teamsSnapshot.docs) {
              const teamData = teamDoc.data();
              if (teamData.members && teamData.members.includes(userData.uid)) {
                setTeam(teamData);
                setTeamId(teamDoc.id);
                console.log('Nazwa zespołu:', teamData.name);
              }
            }
          }
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });

    return () => unsubscribe();
  }, [leaveSuccess]);

  const handleRemoveMember = async (memberUid) => {
    try {
      if (!teams || teams.length === 0) {
        console.error('Brak danych o zespole.');
        return;
      }
  
      const teamId = teams[0].team.teamId;
      const teamRef = doc(firestore, 'teams', teamId);
  
      // Pobierz aktualne dane zespołu
      const teamDoc = await getDoc(teamRef);
      const currentMembers = teamDoc.data().members;
  
      console.log('Current Members:', currentMembers);
  
      // Usuń członka zespołu
      const updatedMembers = currentMembers.filter((member) => member !== memberUid);
  
      console.log('Updated Members:', updatedMembers);
  
      // Zaktualizuj kolekcję teams
      await updateDoc(teamRef, {
        members: updatedMembers,
      });
  
      // Aktualizuj lokalny stan teams
      setTeams((prevTeams) => {
        const updatedTeams = [...prevTeams];
        const updatedTeamIndex = updatedTeams.findIndex((team) => team.team.teamId === teamId);
  
        if (updatedTeamIndex !== -1) {
          updatedTeams[updatedTeamIndex] = {
            ...updatedTeams[updatedTeamIndex],
            team: {
              ...updatedTeams[updatedTeamIndex].team,
              members: updatedMembers,
            },
          };
        }
  
        console.log('Updated Teams:', updatedTeams);
  
        return updatedTeams;
      });
  
      Alert.alert('Sukces', 'Członek zespołu został usunięty.');
    } catch (error) {
      console.error('Błąd usuwania członka zespołu', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania członka zespołu.');
      console.log('Teams after update:', teams);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <View style={styles.leaveTeamContent}>
        {team ? (
          <>
            <Text style={styles.title}>Opuść Zespół</Text>
            <Text style={styles.leaveText}>
              Czy na pewno chcesz opuścić zespół "{team.name}"? Po opuszczeniu będziesz musiał dołączyć ponownie.
            </Text>
            <TouchableOpacity style={styles.leaveButton} onPress={leaveTeam}>
              <Text style={styles.leaveButtonText}>Opuść Zespół</Text>
            </TouchableOpacity>
            {leaveSuccess && (
              <Text style={styles.successText}>Zespół został pomyślnie opuszczony!</Text>
            )}
          </>
        ) : (
          <Text style={styles.info}>Nie jesteś członkiem żadnego zespołu.</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={() => navigate('/team')}>
          <Text style={styles.buttonText}>Powrót</Text>
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
    color: 'white',
  },
  leaveTeamContent: {
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  leaveText: {
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
  },
  leaveButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ff5555',
    borderRadius: 5,
  },
  leaveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  successText: {
    marginTop: 20,
    color: 'green',
    textAlign: 'center',
  },
  info: {
    fontSize: 18,
    color: 'white',
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
});

export default LeaveTeam;
