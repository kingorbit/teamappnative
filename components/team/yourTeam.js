import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';

const YourTeam = () => {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
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

            // Sprawdź, czy użytkownik jest w zespołach
            const teamsRef = collection(firestore, 'teams');
            const teamsQuery = query(teamsRef, where('members', 'array-contains', userData.uid));
            const teamsSnapshot = await getDocs(teamsQuery);

            const userTeams = [];
            for (const teamDoc of teamsSnapshot.docs) {
              const teamData = teamDoc.data();

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
                {team.members.map((member, memberIndex) => (
                  <Text key={memberIndex} style={styles.member}>{member}</Text>
                ))}
                {index < teams.length - 1 && <View style={styles.hr} />}
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