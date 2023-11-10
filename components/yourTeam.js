import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import Header from '../components/header';
import { firestore, auth } from '../constants/config';
import { useNavigate } from 'react-router-native';

const YourTeam = () => {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [founderData, setFounderData] = useState(null);
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

            // Sprawdź, czy użytkownik jest w zespole
            const teamsRef = collection(firestore, 'teams');
            const teamsQuery = query(teamsRef, where('members', 'array-contains', userData.uid));
            const teamsSnapshot = await getDocs(teamsQuery);

            for (const teamDoc of teamsSnapshot.docs) {
              const teamData = teamDoc.data();
              if (teamData.members && teamData.members.includes(userData.uid)) {
                setTeam(teamData);

                // Pobierz imiona i nazwiska członków zespołu
                const membersData = [];
                for (const memberUid of teamData.members) {
                  const memberQuery = query(usersRef, where('uid', '==', memberUid));
                  const memberSnapshot = await getDocs(memberQuery);

                  if (!memberSnapshot.empty) {
                    const memberData = memberSnapshot.docs[0].data();
                    membersData.push(`${memberData.firstName} ${memberData.lastName}`);
                  }
                }

                setTeamMembers(membersData);

                // Pobierz dane założyciela
                const founderQuery = query(usersRef, where('uid', '==', teamData.createdBy));
                const founderSnapshot = await getDocs(founderQuery);

                if (!founderSnapshot.empty) {
                  const founderData = founderSnapshot.docs[0].data();
                  setFounderData(founderData);
                }
              }
            }
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
        {team ? (
          <>
            <Text style={styles.title}>Twój Zespół</Text>
            <Text>Nazwa Zespołu: {team.name}</Text>
            <Text>Opis: {team.description}</Text>
            {founderData && (
              <Text>Założyciel: {`${founderData.firstName} ${founderData.lastName}`}</Text>
            )}
            <Text>Członkowie:</Text>
            {teamMembers.map((member, index) => (
              <Text key={index}>{member}</Text>
            ))}
          </>
        ) : (
          <Text>Nie jesteś członkiem żadnego zespołu.</Text>
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
    teamContent: {
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
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
  });
  
  export default YourTeam;