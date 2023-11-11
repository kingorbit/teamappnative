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

  const leaveTeam = async () => {
    try {
      if (!team || !user || !teamId) {
        console.error('Brak danych o zespole, użytkowniku lub teamId.');
        return;
      }
  
      console.log('Team:', team);
      console.log('Team members:', team.members);
      console.log('User:', user);
  
      const updatedMembers = team.members ? team.members.filter((member) => member !== user.uid) : [];
  
      const teamRef = doc(firestore, 'teams', teamId);
      await updateDoc(teamRef, { members: updatedMembers });
  
      const userRef = doc(firestore, 'users', user.id);
      await updateDoc(userRef, { teamId: null });
  
      setTeam(null);
      setTeamId(null);
      setLeaveSuccess(true);
  
    } finally {
      navigate('/team');
      Alert.alert('Sukces', 'Zespół został pomyślnie opuszczony!');
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
