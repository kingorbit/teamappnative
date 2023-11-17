import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';

const PlayerStats = () => {
  const [user, setUser] = useState(null);
  const [teamNames, setTeamNames] = useState([]);
  const [playerStats, setPlayerStats] = useState({
    matchesPlayed: 0,
    matchesPlayedHome: 0,
    matchesPlayedAway: 0,
    goals: 0,
    goalsHome: 0,
    goalsAway: 0,
    assists: 0,
    assistsHome: 0,
    assistsAway: 0,
    yellowCards: 0,
    redCards: 0,
    shots: 0,
    shotsOnTarget: 0,
    passes: 0,
    tackles: 0,
  });
  const [editedStats, setEditedStats] = useState({
    matchesPlayed: 0,
    matchesPlayedHome: 0,
    matchesPlayedAway: 0,
    goals: 0,
    goalsHome: 0,
    goalsAway: 0,
    assists: 0,
    assistsHome: 0,
    assistsAway: 0,
    yellowCards: 0,
    redCards: 0,
    shots: 0,
    shotsOnTarget: 0,
    passes: 0,
    tackles: 0,
  });
  const [editStatsModalVisible, setEditStatsModalVisible] = useState(false);
  const [playerId, setPlayerId] = useState(null);

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
                userTeams.push({ id: teamDoc.id, name: teamData.name });
              }
            }
            setTeamNames(userTeams.map((team) => team.name));

            if (userTeams.length > 0 && !userData.isCoach) {
              const playerId = userData.uid;
              setPlayerId(playerId);
              const playerStatsRef = doc(firestore, 'playerStats', playerId);
              const playerStatsDoc = await getDoc(playerStatsRef);

              if (playerStatsDoc.exists()) {
                const statsData = playerStatsDoc.data();
                setPlayerStats(statsData);
                setEditedStats(statsData); // Dodane do zainicjowania stanu edytowanych statystyk
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

  const handleSaveStats = async () => {
    try {
      console.log('Przed playerId:', playerId);
      if (playerId) {
        const playerStatsRef = doc(firestore, 'playerStats', playerId);
        console.log('playerStatsRef.path:', playerStatsRef.path);
        await setDoc(playerStatsRef, editedStats);
        console.log('Po setDoc');

        // Po zapisaniu statystyk ponownie pobierz dane z bazy danych
        const updatedPlayerStatsDoc = await getDoc(playerStatsRef);
        if (updatedPlayerStatsDoc.exists()) {
          const updatedStatsData = updatedPlayerStatsDoc.data();
          setPlayerStats(updatedStatsData);
        }

        setEditStatsModalVisible(false);
      } else {
        console.error('Nie znaleziono playerId');
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania statystyk', error);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView>
      <View style={styles.teamStatsContainer}>
        <Text style={styles.title}>Statystyki Zawodnika</Text>
        {user && (
          <View style={styles.teamInfo}>
            {teamNames.length > 0 && (
              <View style={styles.teamContainer}>
                <Text style={styles.teamText}>Drużyny: </Text>
                <Text style={styles.teamNameText}>{teamNames.join(', ')}</Text>
              </View>
            )}
            {!user.isCoach && (
              <View>
                <TouchableOpacity
                  style={styles.editStatsButton}
                  onPress={() => {
                    setEditedStats(playerStats); // Dodane do zainicjowania stanu edytowanych statystyk
                    setEditStatsModalVisible(true);
                  }}
                >
                  <Text style={styles.editStatsButtonText}>Edytuj Statystyki</Text>
                </TouchableOpacity>
                <FlatList
                  data={[
                    { label: 'Liczba rozegranych meczów', key: 'matchesPlayed' },
                    { label: 'Liczba meczów na wyjeżdzie', key: 'matchesPlayedHome'},
                    { label: 'Liczba meczów u siebie', key: 'matchesPlayedAway'},
                    { label: 'Liczba strzelonych bramek', key: 'goals'},
                    { label: 'Liczba strzelonych bramek u siebie', key: 'goalsHome'},
                    { label: 'Liczba strzelonych bramek na wyjezdzie', key: 'goalsAway'},
                    { label: 'Liczba asyst', key: 'assists' },
                    { label: 'Liczba asyst u siebie', key: 'assistsHome'},
                    { label: 'Liczba asyst na wyjezdzie', key: 'assistsAway'},
                    { label: 'Liczba żółtych kartek', key: 'yellowCards' },
                    { label: 'Liczba czerwonych kartek', key: 'redCards' },
                    { label: 'Liczba strzałów', key: 'shots' },
                    { label: 'Liczba strzałów na bramkę', key: 'shotsOnTarget' },
                    { label: 'Liczba podań', key: 'passes' },
                    { label: 'Liczba interwencji', key: 'tackles' },
                  ]}
                  renderItem={({ item }) => (
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>{item.label}: </Text>
                      <Text style={styles.statValue}>{playerStats[item.key]}</Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.key}
                />
              </View>
            )}
          </View>
        )}
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
            <FlatList
              data={[
                { label: 'Liczba rozegranych meczów', key: 'matchesPlayed' },
                { label: 'Liczba meczów na wyjeździe', key: 'matchesPlayedHome'},
                { label: 'Liczba meczów u siebie', key: 'matchesPlayedAway'},
                { label: 'Liczba strzelonych bramek', key: 'goals'},
                { label: 'Liczba strzelonych bramek u siebie', key: 'goalsHome'},
                { label: 'Liczba strzelonych bramek na wyjezdzie', key: 'goalsAway'},
                { label: 'Liczba asyst', key: 'assists' },
                { label: 'Liczba asyst u siebie', key: 'assistsHome'},
                { label: 'Liczba asyst na wyjezdzie', key: 'assistsAway'},
                { label: 'Liczba żółtych kartek', key: 'yellowCards' },
                { label: 'Liczba czerwonych kartek', key: 'redCards' },
                { label: 'Liczba strzałów', key: 'shots' },
                { label: 'Liczba strzałów na bramkę', key: 'shotsOnTarget' },
                { label: 'Liczba podań', key: 'passes' },
                { label: 'Liczba interwencji', key: 'tackles' },
              ]}
              renderItem={({ item }) => (
                <View style={styles.editStatItem}>
                  <Text style={styles.editStatLabel}>{item.label}</Text>
                  <TextInput
                    style={styles.editStatInput}
                    keyboardType="numeric"
                    value={editedStats[item.key].toString()}
                    onChangeText={(text) => {
                      const updatedStats = { ...editedStats, [item.key]: parseInt(text) || 0 };
                      setEditedStats(updatedStats);
                    }}
                  />
                </View>
              )}
              keyExtractor={(item) => item.key}
            />
            </ScrollView>
            <TouchableOpacity
              style={styles.saveStatsButton}
              onPress={handleSaveStats}
            >
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
  editStatsButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  editStatsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 16,
    marginLeft: 5,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  editStatLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  editStatInput: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    flex: 1,
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
});

export default PlayerStats;
