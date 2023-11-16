import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import Header from '../components/header';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { firestore, auth } from '../constants/config';


const Stats = () => {
  const [user, setUser] = useState(null);
  const [isCoach, setIsCoach] = useState(false);
  const [isInTeam, setIsInTeam] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, where('uid', '==', authUser.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUser(userData);
            setIsCoach(userData.isCoach || false);

            // Sprawdź, czy użytkownik jest w zespole
            const teamsRef = collection(firestore, 'teams');
            const teamsQuery = query(teamsRef, where('members', 'array-contains', authUser.uid));
            const teamsSnapshot = await getDocs(teamsQuery);

            if (!teamsSnapshot.empty) {
              setIsInTeam(true);
            } else {
              setIsInTeam(false);
            }
          } else {
            setUser(null);
            setIsCoach(false);
            setIsInTeam(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <View style={styles.calendarContent}>
        <Text style={styles.title}>Statystyki</Text>
        {isCoach && (
          <>
            <Link to="/teamStats" style={styles.link}>
              <Text style={styles.linkText}>Statystyki Indywidualne - Trener</Text>
            </Link>
            <Link to="/teamStats" style={styles.link}>
              <Text style={styles.linkText}>Statystyki Drużyny - Trener</Text>
            </Link>
          </>
        )}
        {!isCoach && (
          <>
            <Link to="/home" style={styles.link}>
              <Text style={styles.linkText}>Statystyki Indywidualne</Text>
            </Link>
            <Link to="/home" style={styles.link}>
              <Text style={styles.linkText}>Statystyki Drużyny</Text>
            </Link>
          </>
        )}
        <Link to="/home" style={styles.link}>
          <Text style={styles.linkText}>Powrót do Home</Text>
        </Link>
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
  calendarContent: {
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default Stats;
