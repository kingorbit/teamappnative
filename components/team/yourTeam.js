import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';
import NavigationBar from '../navBar';

const YourTeam = () => {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, where('uid', '==', authUser.uid));
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            setUser(userData);
  
            // Sprawdź, czy użytkownik jest w zespołach
            const teamsRef = collection(firestore, 'teams');
            const teamsQuery = query(teamsRef, where('members', 'array-contains', authUser.uid));
            const teamsSnapshot = await getDocs(teamsQuery);
  
            const userTeams = [];
            for (const teamDoc of teamsSnapshot.docs) {
              const teamData = teamDoc.data();
  
              // Pobierz pozycję i imię członków zespołu z kolekcji "users"
              const membersData = [];
              const membersQuery = query(usersRef, where('uid', 'in', teamData.members));
              const membersSnapshot = await getDocs(membersQuery);
  
              membersSnapshot.forEach((memberDoc) => {
                const memberData = memberDoc.data();
                membersData.push({
                  position: memberData.position,
                  firstName: memberData.firstName,
                  lastName: memberData.lastName,
                  isCoach: memberData.isCoach,
                });
              });
  
              userTeams.push({
                team: teamData,
                members: membersData,
              });
            }
            setTeams(userTeams);
          }
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });
  
    return () => unsubscribe();
  }, []);
  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <View style={styles.teamContent}>
        {teams.length > 0 ? (
          <>
            <Text style={styles.title}>Twoje Zespoły</Text>
            {teams.map((team, index) => (
              <View key={index} style={styles.teamInfo}>
  <Text style={styles.info}>Nazwa Zespołu: {team.team.name}</Text>
  <Text style={styles.info}>Opis: {team.team.description}</Text>
  <Text style={styles.membersTitle}>Członkowie:</Text>
  <View style={styles.membersContainer}>
    {team.members.map((member, memberIndex) => (
      <View key={memberIndex} style={styles.memberContainer}>
        <Text style={styles.member}>
          {member.position} {member.firstName} {member.lastName}
          {member.isCoach ? ' (Trener)' : ''}
        </Text>
      </View>
    ))}
  </View>
</View>
            ))}
          </>
        ) : (
          <Text style={styles.info}>Nie jesteś członkiem żadnego zespołu.</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={() => navigate('/team')}>
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
    color: 'white',
  },
  teamContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInfo: {
    marginBottom: 20,
  },
  hr: {
    height: 1,
    backgroundColor: 'white',
    marginVertical: 10,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  membersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: 'white',
  },
  member: {
    fontSize: 16,
    marginBottom: 5,
    color: 'white',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default YourTeam;
