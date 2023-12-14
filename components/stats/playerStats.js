import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  VirtualizedList,
} from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';

const PlayerStats = () => {
  const [user, setUser] = useState(null);
  const [teamNames, setTeamNames] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState({
    assists: 0,
    assistsAway: 0,
    assistsHome: 0,
    goals: 0,
    goalsAway: 0,
    goalsHome: 0,
    matchesPlayed: 0,
    matchesPlayedAway: 0,
    matchesPlayedHome: 0,
    shots: 0,
    shotsAway: 0,
    shotsHome: 0,
    yellowCards: 0,
    yellowCardsAway: 0,
    yellowCardsHome: 0,
  });

  const [editedStats, setEditedStats] = useState({
    assists: 0,
    assistsAway: 0,
    assistsHome: 0,
    goals: 0,
    goalsAway: 0,
    goalsHome: 0,
    matchesPlayed: 0,
    matchesPlayedAway: 0,
    matchesPlayedHome: 0,
    shots: 0,
    shotsAway: 0,
    shotsHome: 0,
    yellowCards: 0,
    yellowCardsAway: 0,
    yellowCardsHome: 0,
  });

  const [editStatsModalVisible, setEditStatsModalVisible] = useState(false);

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

            console.log('Imię:', userData.firstName);
            console.log('Nazwisko:', userData.lastName);

            const teamsRef = collection(firestore, 'teams');
            const teamsQuery = query(teamsRef, where('members', 'array-contains', userData.uid));
            const teamsSnapshot = await getDocs(teamsQuery);

            const userTeams = [];
            for (const teamDoc of teamsSnapshot.docs) {
              const teamData = teamDoc.data();
              if (teamData.members && teamData.members.includes(userData.uid)) {
                userTeams.push({ id: teamDoc.id, name: teamData.name });
              }
            }
            setTeamNames(userTeams.map((team) => team.name));
            setUserTeams(userTeams);

            if (userTeams.length > 0 && userData.isCoach) {
              const teamId = userTeams[0].id;
              const teamRef = doc(firestore, 'teams', teamId);
              const teamDocSnapshot = await getDoc(teamRef);

              if (teamDocSnapshot.exists()) {
                const teamData = teamDocSnapshot.data();
                setMembers(teamData.members || []);
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

  const fetchUserData = async (uid) => {
    try {
      const userRef = doc(firestore, 'users', uid);
      const userDoc = await getDoc(userRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData;
      } else {
        console.log(`Dane użytkownika o uid ${uid} nie istnieją.`);
        return null;
      }
    } catch (error) {
      console.error('Błąd pobierania danych użytkownika', error);
      return null;
    }
  };

  const fetchDataForPlayer = async (uid) => {
    try {
      const userData = await fetchUserData(uid);

      const playerStatsRef = doc(firestore, 'playerStats', uid, 'seasons', '2023');
      const playerStatsDoc = await getDoc(playerStatsRef);

      if (playerStatsDoc.exists()) {
        console.log('Dokument istnieje, otwieram modal');
        const playerStatsData = playerStatsDoc.data();
        setSelectedPlayer({ id: uid, data: userData });
        setPlayerStats(playerStatsData || {});
        setEditedStats(playerStatsData || {});
        setEditStatsModalVisible(true);
      } else {
        console.log(`Dane statystyk zawodnika o uid ${uid} nie istnieją. Tworzę dokument.`);

        await setDoc(playerStatsRef, {
          assists: 0,
          assistsAway: 0,
          assistsHome: 0,
          goals: 0,
          goalsAway: 0,
          goalsHome: 0,
          matchesPlayed: 0,
          matchesPlayedAway: 0,
          matchesPlayedHome: 0,
          shots: 0,
          shotsAway: 0,
          shotsHome: 0,
          yellowCards: 0,
          yellowCardsAway: 0,
          yellowCardsHome: 0,
        });

        const updatedPlayerDoc = await getDoc(playerStatsRef);
        if (updatedPlayerDoc.exists()) {
          const updatedPlayerData = updatedPlayerDoc.data();
          setSelectedPlayer({ id: uid, data: userData });
          setPlayerStats(updatedPlayerData || {});
          setEditedStats(updatedPlayerData || {});
          setEditStatsModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Błąd pobierania danych zawodnika', error);
    }
  };

  const handleSaveStats = async () => {
    try {
      if (selectedPlayer && selectedPlayer.id) {
        const playerStatsRef = doc(firestore, 'playerStats', selectedPlayer.id, 'seasons', '2023');
        const playerStatsDoc = await getDoc(playerStatsRef);

        const updatedStats = { ...editedStats };

        if (playerStatsDoc.exists()) {
          await updateDoc(playerStatsRef, updatedStats);
        } else {
          await setDoc(playerStatsRef, { ...updatedStats });
        }

        const updatedPlayerDoc = await getDoc(playerStatsRef);
        if (updatedPlayerDoc.exists()) {
          const updatedPlayerData = updatedPlayerDoc.data();
          setPlayerStats(updatedPlayerData || {});
        }

        setEditStatsModalVisible(false);
      } else {
        console.error('Nie znaleziono wybranego zawodnika');
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania statystyk', error);
    }
  };

  const renderPlayerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.playerItem}
      onPress={() => fetchDataForPlayer(item)}
    >
      <Text style={styles.playerName}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView>
        <View style={styles.teamStatsContainer}>
          <Text style={styles.title}>Statystyki Indywidualne</Text>
          {user && (
            <View style={styles.teamInfo}>
              {teamNames.length > 0 && (
                <View style={styles.teamContainer}>
                  <Text style={styles.teamText}>Drużyny: </Text>
                  <Text style={styles.teamNameText}>{teamNames.join(', ')}</Text>
                </View>
              )}
              {user.isCoach && (
                <View>
                  <Text style={styles.title}>Lista zawodników</Text>
                  <VirtualizedList
                    data={members}
                    renderItem={renderPlayerItem}
                    keyExtractor={(item) => item}
                    getItemCount={(data) => data.length}
                    getItem={(data, index) => data[index]}
                  />
                </View>
              )}
            </View>
          )}
          <TouchableOpacity style={styles.link} onPress={() => navigate('/team')}>
            <Text style={styles.linkText}>Powrót</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={editStatsModalVisible}
        onRequestClose={() => setEditStatsModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Edytuj Statystyki</Text>
            <ScrollView>
              <VirtualizedList
                data={[
                  { label: 'Liczba rozegranych meczów', key: 'matchesPlayed' },
                  { label: 'Liczba meczów na wyjeździe', key: 'matchesPlayedHome' },
                  { label: 'Liczba meczów u siebie', key: 'matchesPlayedAway' },
                  { label: 'Liczba strzelonych bramek', key: 'goals' },
                  { label: 'Liczba strzelonych bramek u siebie', key: 'goalsHome' },
                  { label: 'Liczba strzelonych bramek na wyjeździe', key: 'goalsAway' },
                  { label: 'Liczba asyst', key: 'assists' },
                  { label: 'Liczba asyst u siebie', key: 'assistsHome' },
                  { label: 'Liczba asyst na wyjeździe', key: 'assistsAway' },
                  { label: 'Liczba żółtych kartek', key: 'yellowCards' },
                  { label: 'Liczba żółtych kartek u siebie', key: 'yellowCardsHome' },
                  { label: 'Liczba żółtych kartek na wyjeździe', key: 'yellowCardsAway' },
                  { label: 'Liczba strzałów', key: 'shots' },
                  { label: 'Liczba strzałów na bramkę', key: 'shotsOnTarget' },
                ]}
                initialNumToRender={4}
                renderItem={({ item }) => (
                  <View style={styles.editStatItem}>
                    <Text style={styles.editStatLabel}>{item.label}</Text>
                    <TextInput
                      style={styles.editStatInput}
                      keyboardType="numeric"
                      value={(editedStats[item.key] || '').toString()}
                      onChangeText={(text) => {
                        const updatedStats = { ...editedStats, [item.key]: parseInt(text) || 0 };
                        setEditedStats(updatedStats);
                      }}
                    />
                  </View>
                )}
                keyExtractor={(item) => item.key}
                getItemCount={(data) => data.length}
                getItem={(data, index) => data[index]}
              />
            </ScrollView>
<TouchableOpacity style={styles.saveStatsButton} onPress={handleSaveStats}>
<Text style={styles.saveStatsButtonText}>Zapisz</Text>
</TouchableOpacity>
<TouchableOpacity
style={styles.cancelButton}
onPress={() => setEditStatsModalVisible(false)}
>
<Text style={styles.cancelButtonText}>Anuluj</Text>
</TouchableOpacity>
</View>
</View>
</Modal>
</View>
);
};

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#9091fd',
},
teamStatsContainer: {
margin: 20,
},
title: {
fontSize: 24,
fontWeight: 'bold',
marginBottom: 10,
},
teamInfo: {
marginBottom: 20,
},
teamContainer: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 10,
},
teamText: {
fontSize: 16,
fontWeight: 'bold',
},
teamNameText: {
fontSize: 16,
marginLeft: 5,
},
playerItem: {
padding: 10,
margin: 10,
borderRadius: 10,
alignItems: 'center',
justifyContent: 'center',
textAlign: 'center',
elevation: 3,
width: '75%',
backgroundColor: '#f0f0f0',
},
playerName: {
color: 'black',
fontWeight: 'bold',
},
centeredView: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
marginTop: 22,
},
modalView: {
margin: 20,
backgroundColor: 'white',
borderRadius: 10,
padding: 35,
alignItems: 'center',
shadowColor: '#000',
shadowOffset: {
width: 0,
height: 2,
},
shadowOpacity: 0.25,
shadowRadius: 4,
elevation: 5,
},
modalTitle: {
fontSize: 24,
fontWeight: 'bold',
marginBottom: 20,
},
editStatItem: {
flexDirection: 'column',
alignItems: 'flex-start',
marginBottom: 10,
},
editStatLabel: {
fontSize: 16,
marginBottom: 5,
},
editStatInput: {
borderColor: 'gray',
borderWidth: 1,
borderRadius: 5,
padding: 10,
width: '100%',
},
saveStatsButton: {
backgroundColor: '#27ae60',
padding: 10,
borderRadius: 5,
marginTop: 10,
},
saveStatsButtonText: {
color: 'white',
fontWeight: 'bold',
},
cancelButton: {
backgroundColor: '#e74c3c',
padding: 10,
borderRadius: 5,
marginTop: 10,
},
cancelButtonText: {
color: 'white',
fontWeight: 'bold',
},
link: {
padding: 10,
marginTop: 70,
marginLeft: 10,
borderRadius: 10,
alignItems: 'center',
justifyContent: 'center',
textAlign: 'center',
elevation: 3,
width: '75%',
backgroundColor: '#f0f0f0',
},
linkText: {
color: 'black',
fontWeight: 'bold',
},
});

export default PlayerStats;