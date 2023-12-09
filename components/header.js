import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../constants/config';
import { useNavigate } from 'react-router-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../constants/config';
import Icon from 'react-native-vector-icons/FontAwesome5';



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

  const navigateToUserProfile = () => {
    navigate('/profil')
  };
  const navigateToHome = () => {
    navigate('/home')
  };
  const navigateToTeam = () => {
    navigate('/yourTeam')
  };




  return (
    <View style={styles.header}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <TouchableOpacity onPress={navigateToHome}>
        <Text style={styles.appTitle}>Team App</Text>
      </TouchableOpacity>
      {user && (
        <View style={styles.userDetails}>
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={navigateToUserProfile}>
              <Text style={styles.userText}>
                <Icon name="user" size={15} color="white" />{' '}
                {user.firstName} {user.lastName}
              </Text>
            </TouchableOpacity>
            {teamNames.length > 0 && (
              <View style={styles.teamContainer}>
                <TouchableOpacity onPress={navigateToTeam}>
                  <Text style={styles.teamNameText}>
                    <Icon name="users" size={15} color="white" />{' '}
                    {teamNames.join(', ')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>
              <Icon name="sign-out-alt" size={20} color="black" />
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#40407a',
    marginBottom: '10%',
    padding: 10,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 15,
  },
  appTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  teamText: {
    color: 'white',
    fontWeight: 'bold',
  },
  teamNameText: {
    marginVertical: 3,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  logoutButton: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  userText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 12,
  },
  teamText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutText: {
    fontSize: 10,
    color: 'black',
  },
});

export default Header;
