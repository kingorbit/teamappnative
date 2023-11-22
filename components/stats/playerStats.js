import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
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
  const [selectedPlayerData, setSelectedPlayerData] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
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

            // Dodatkowa sekcja do pobierania i wyświetlania firstName i lastName
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
            
                // Dodatkowy kod do pobierania danych użytkowników na podstawie UID z members
                const usersRef = collection(firestore, 'users');
                const membersData = [];
            
                for (const memberUid of teamData.members || []) {
                  const userQuery = query(usersRef, where('uid', '==', memberUid));
                  const userQuerySnapshot = await getDocs(userQuery);
            
                  if (!userQuerySnapshot.empty) {
                    const userData = userQuerySnapshot.docs[0].data();
                    membersData.push(userData);
            
                    // Dodatkowe wyświetlanie danych w konsoli
                    console.log('UID:', userData.uid);
                    console.log('Imię:', userData.firstName);
                    console.log('Nazwisko:', userData.lastName);
                    console.log('Wiek:', userData.age);
                    console.log('---');
                  }
                }
            
                // Tutaj masz dostęp do membersData, które zawiera dane użytkowników
                console.log('Dane użytkowników:', membersData);
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
      const userData = await getUserData(uid);
      return userData;
    } catch (error) {
      console.error('Błąd pobierania danych użytkownika', error);
      return null;
    }
  };

  const handleSaveStats = async () => {
    try {
      if (selectedPlayerId) {
        const playerStatsRef = doc(firestore, 'playerStats', selectedPlayerId, 'seasons', '2023');
        const playerStatsDoc = await getDoc(playerStatsRef);

        const updatedStats = { ...editedStats };

        // Sprawdź, czy dokument istnieje
        if (playerStatsDoc.exists()) {
          // Jeśli dokument istnieje, zaktualizuj go
          await updateDoc(playerStatsRef, updatedStats);
        } else {
          // Jeśli dokument nie istnieje, utwórz go
          await setDoc(playerStatsRef, { ...updatedStats });
        }

        // Po zapisaniu statystyk ponownie pobierz dane z bazy danych
        const updatedPlayerDoc = await getDoc(playerStatsRef);
        if (updatedPlayerDoc.exists()) {
          const updatedPlayerData = updatedPlayerDoc.data();
          setPlayerStats(updatedPlayerData || {});
        }

        setEditStatsModalVisible(false);
      } else {
        console.error('Nie znaleziono selectedPlayerId');
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
              {user.isCoach && (
                <View>
                            <Text style={styles.title}>Lista zawodników</Text>
                            <FlatList
  data={members}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={styles.playerItem}
      onPress={async () => {
        try {
          const playerStatsRef = doc(firestore, 'playerStats', item, 'seasons', '2023');
          const playerStatsDoc = await getDoc(playerStatsRef);

          if (playerStatsDoc.exists()) {
            console.log('Dokument istnieje, otwieram modal');
            const playerStatsData = playerStatsDoc.data();
            setSelectedPlayerId(item);
            setPlayerStats(playerStatsData || {});
            setEditedStats(playerStatsData || {});
            setEditStatsModalVisible(true);
          } else {
            console.log(`Dane statystyk zawodnika o uid ${item} nie istnieją. Tworzę dokument.`);

            // Jeśli dokument nie istnieje, utwórz go z danymi zerowymi
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

            // Pobierz dane po utworzeniu dokumentu
            const updatedPlayerDoc = await getDoc(playerStatsRef);
            if (updatedPlayerDoc.exists()) {
              const updatedPlayerData = updatedPlayerDoc.data();
              setPlayerStats(updatedPlayerData || {});
              setEditedStats(updatedPlayerData || {});
              setEditStatsModalVisible(true);
            }
          }
        } catch (error) {
          console.error('Błąd pobierania danych zawodnika', error);
        }
      }}
    >
      <Text style={styles.playerName}>{item}</Text>
    </TouchableOpacity>
  )}
  keyExtractor={(item) => item}
/>
                </View>
              )}
              <TouchableOpacity style={styles.link} onPress={() => navigate('/stats')}>
                <Text style={styles.linkText}>Powrót</Text>
              </TouchableOpacity>
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
    flexDirection: 'column', // Zmieniono z 'row' na 'column'
    alignItems: 'flex-start', // Dodano do ustawienia tekstu na lewo
    marginBottom: 10,
  },
  editStatLabel: {
    fontSize: 16,
    marginBottom: 5, // Dodano odstęp pomiędzy labelą a inputem
  },
  editStatInput: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    width: '100%', // Zmieniono szerokość na 100%
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
