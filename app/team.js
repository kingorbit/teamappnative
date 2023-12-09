import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import Header from '../components/header';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { firestore, auth } from '../constants/config';
import NavigationBar from '../components/navBar';
import { lightTheme, darkTheme } from '../components/theme';

const Team = () => {
  const [user, setUser] = useState(null);
  const [isCoach, setIsCoach] = useState(false);
  const [isInTeam, setIsInTeam] = useState(false);
  const [theme, setTheme] = useState(darkTheme);

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
  
            const teamsRef = collection(firestore, 'teams');
            const teamsQuery = query(teamsRef, where('members', 'array-contains', authUser.uid));
            const teamsSnapshot = await getDocs(teamsQuery);
  
            if (!teamsSnapshot.empty) {
              setIsInTeam(true);
            } else {
              setIsInTeam(false);
            }
  
            fetchUserSettings(authUser.uid);
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
  

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Header user={user} setUser={setUser} />
      <View style={styles.teamContent}>
      <Text style={[styles.title, { color: theme.textColor }]}>Zarządzanie Zespołami</Text>

        {user && (
          // Pozostałe linki dostępne dla wszystkich zalogowanych użytkowników
          <>
          </>
        )}
        {user && user.isCoach && (
          <>
            {/* Linki dla trenera */}
            <Link to="/manageTeam" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
            <Text style={[styles.linkText, { color: theme.textColor }]}>Zarządzaj Drużyną</Text>
            </Link>
            <Link to="/createTeam" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
              <Text style={[styles.linkText, { color: theme.textColor }]}>Utwórz Zespół</Text>
            </Link>
            <Link to="/listTeam" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
              <Text style={[styles.linkText, { color: theme.textColor }]}>Lista Zespołów</Text>
            </Link>
            <Link to="/deleteTeam" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
              <Text style={[styles.linkText, { color: theme.textColor }]}>Usuń Drużynę</Text>
            </Link>
            <Link to="/resultsCoach" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
              <Text style={[styles.linkText, { color: theme.textColor }]}>Wyniki - Trener</Text>
            </Link>
            <Link to="/tableCoach" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
              <Text style={[styles.linkText, { color: theme.textColor }]}>Tabela - Trener</Text>
            </Link>    
            <Link to="/playerStats" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
              <Text style={[styles.linkText, { color: theme.textColor }]}>Indywidualne - Trener</Text>
            </Link>
            <Link to="/teamStats" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
              <Text style={[styles.linkText, { color: theme.textColor }]}>Drużyny - Trener</Text>
            </Link>           
          </>
        )}
        {user && !isCoach && !isInTeam && (
          // Link tylko dla zwykłego użytkownika
          <Link to="/joinTeam" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
            <Text style={[styles.linkText, { color: theme.textColor }]}>Dołącz do Zespołu</Text>
          </Link>
        )}
        {user && !isCoach && isInTeam && (
          // Link tylko dla zwykłego użytkownika będącego w zespole
          <>
            <Link to="/yourTeam" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
              <Text style={[styles.linkText, { color: theme.textColor }]}>Skład</Text>
            </Link>
          <Link to="/results" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
            <Text style={[styles.linkText, { color: theme.textColor }]}>Wyniki</Text>
          </Link>
          <Link to="/table" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
            <Text style={[styles.linkText, { color: theme.textColor }]}>Tabela</Text>
          </Link>
          <Link to="/leaveTeam" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
            <Text style={[styles.linkText, { color: theme.textColor }]}>Opuść Zespół</Text>
          </Link>
          <Link to="/teamStatsView" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
            <Text style={[styles.linkText, { color: theme.textColor }]}>Statystyki Drużyny</Text>
          </Link>
          <Link to="/playerStatsView" style={[styles.link, { backgroundColor: theme.buttonColor }]}>
              <Text style={[styles.linkText, { color: theme.textColor }]}>Statystyki Indywidualne</Text>
          </Link>
          </>
        )}
      </View>
      <NavigationBar></NavigationBar>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
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
  },
  linkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  teamContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default Team;
