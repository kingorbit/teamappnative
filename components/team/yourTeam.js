import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';
import NavigationBar from '../navBar';
import { lightTheme, darkTheme } from '../theme';

const YourTeam = () => {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [theme, setTheme] = useState(darkTheme);
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

            // Dodane wywołanie funkcji fetchUserSettings
            fetchUserSettings(authUser.uid);
          }
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserSettings = async (uid) => {
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

  const getAvatarInitials = (name) => {
    const initials = name.charAt(0);
    return initials.toUpperCase();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Header user={user} setUser={setUser} />
      <ScrollView>
      <View style={styles.teamContent}>
        {teams.length > 0 ? (
          <>
            <Text style={styles.title}>Twoje Zespoły</Text>
            {teams.map((team, index) => (
              <View key={index} style={[styles.teamInfo, { backgroundColor: theme.buttonColor }]}>
                <View style={styles.teamAvatar}>
                  <Text style={styles.avatarText}>
                    {team.team.name ? getAvatarInitials(team.team.name) : ''}
                  </Text>
                </View>
                <Text style={[styles.teamName, { color: theme.textColor }]}>{team.team.name}</Text>
                <Text style={[styles.info, { color: theme.textColor }]}>{team.team.description}</Text>
                <Text style={[styles.membersTitle, { color: theme.textColor }]}>Członkowie:</Text>
                <View style={styles.memberContainer}>
                  {/* Sortowanie po pozycji */}
                  {team.members
                    .sort((a, b) => {
                      // Kolejność bramkarz, obrońca, pomocnik, napastnik
                      const order = {
                        Bramkarz: 1,
                        Obrońca: 2,
                        Pomocnik: 3,
                        Napastnik: 4,
                      };
                      return order[a.position] - order[b.position];
                    })
                    .map((member, memberIndex) => (
                      <View key={memberIndex} style={styles.memberContainer}>
                        <Text style={[styles.member, { color: theme.textColor }]}>
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
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={() => navigate('/team')}>
          <Text style={[styles.buttonText, { color: theme.textColor }]}>Powrót</Text>
        </TouchableOpacity>
      </View>
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
    textAlign: 'center',
  },
  teamInfo: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  teamAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'purple', // Kolor tła dla awatara drużyny
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 24,
    color: 'white',
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3498db',
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black',
  },
  membersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: 'black',
  },
  member: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  memberContainer: {
    marginBottom: 10,
  },
  membersContainer: {
    marginBottom: 15,
  },
  button: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    elevation: 3,
    width: '50%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default YourTeam;
