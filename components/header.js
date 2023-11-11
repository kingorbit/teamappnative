import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { auth } from '../constants/config';
import { useNavigate } from 'react-router-native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../constants/config';

const Header = () => {
  const [user, setUser] = useState(null);
  const [teamNames, setTeamNames] = useState([]);
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
              if (teamData.members && teamData.members.includes(userData.uid)) {
                userTeams.push(teamData.name);
              }
            }
            setTeamNames(userTeams);
          }
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setTeamNames([]);
        navigate('/');
      })
      .catch((error) => {
        console.error('Błąd wylogowania', error);
      });
  };

  return (
    <View style={styles.header}>
      <Text style={styles.appTitle}>Team App</Text>
      {user && (
        <View style={styles.userDetails}>
          <View style={styles.userInfo}>
            <Text style={styles.userText}>
              Zalogowany: {user.firstName} {user.lastName}
            </Text>
            {teamNames.length > 0 && (
              <View style={styles.teamContainer}>
                <Text style={styles.teamText}>Drużyny: </Text>
                <Text style={styles.teamNameText}>{teamNames.join(', ')}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Wyloguj</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#40407a',
    marginBottom: '10%',
  },
  appTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',

  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamText: {
    color: 'white',
    fontWeight: 'bold',
  },
  teamNameText: {
    color: 'white',
    marginLeft: 5,
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logoutButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
  },
  userText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
  },
  teamText: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logoutText: {
    fontSize: 14,
    color: 'black',
  },
});

export default Header;
