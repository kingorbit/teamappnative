import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';
import { lightTheme, darkTheme } from '../theme';
import NavigationBar from '../navBar';

const LeaveTeam = () => {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [leaveSuccess, setLeaveSuccess] = useState(false);
  const [theme, setTheme] = useState(darkTheme);
  const navigate = useNavigate();

  useEffect(() => {
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
  
            // Dodane wywołanie funkcji fetchUserSettings
            fetchUserSettings(userData.uid);
          }
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });
  
    return () => unsubscribe();
  }, [leaveSuccess]);

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

  const handleRemoveMember = async (memberUid) => {
    try {
      if (!team) {
        console.error('Brak danych o zespole.');
        return;
      }

      const teamId = team.teamId;
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

      // Aktualizuj lokalny stan team
      setTeam((prevTeam) => {
        return {
          ...prevTeam,
          members: updatedMembers,
        };
      });

      setLeaveSuccess(true);
      Alert.alert('Sukces', 'Członek zespołu został usunięty.');
    } catch (error) {
      console.error('Błąd usuwania członka zespołu', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania członka zespołu.');
    }
  };

  return (
<View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Header user={user} setUser={setUser} />
      <View style={styles.leaveTeamContent}>
        {team ? (
          <>
            <Text style={styles.title}>Opuść Zespół</Text>
            <Text style={[styles.leaveText, { color: theme.textColor }]}>
              Czy na pewno chcesz opuścić zespół "{team.name}"? Po opuszczeniu będziesz musiał dołączyć ponownie.
            </Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.cancel }]} onPress={() => handleRemoveMember(user.uid)}>
              <Text style={styles.leaveButtonText}>Opuść Zespół</Text>
            </TouchableOpacity>
            {leaveSuccess && (
              <Text style={styles.successText}>Zespół został pomyślnie opuszczony!</Text>
            )}
          </>
        ) : (
          <Text style={[styles.info, { color: theme.textColor }]}>Nie jesteś członkiem żadnego zespołu.</Text>
        )}
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={() => navigate('/team')}>
          <Text style={[styles.buttonText, { color: theme.textColor }]}>Powrót</Text>
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
  leaveTeamContent: {
    paddingTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  leaveText: {
    padding: 25,
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
  },
  leaveButton: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    elevation: 3,
    width: '50%',
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
    color: 'black',
  },
});

export default LeaveTeam;
