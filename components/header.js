import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { auth } from '../constants/config';
import { useNavigate } from 'react-router-native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../constants/config';

const Header = () => {
  const [user, setUser] = useState(null);
  const [teamName, setTeamName] = useState(null);
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
                setTeamName(teamData.name);
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
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setTeamName(null);
        navigate('/');
      })
      .catch((error) => {
        console.error('Błąd wylogowania', error);
      });
  };

  return (
<View style={styles.header}>
  {user && (
    <View style={styles.userDetails}>
      <View style={styles.userInfo}>
      <Text style={styles.userText}>
          Zalogowany: {user.firstName} {user.lastName}
        </Text>
        {teamName && (
          <Text style={styles.teamText}>
            Drużyna: {teamName}
          </Text>
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
    padding: 15,
    marginBottom: '10%'
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  // ...
  logoutButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 5,
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
  logoutButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
  },
  logoutText: {
    fontSize: 14,
    color: 'black',
  },
});

export default Header;
