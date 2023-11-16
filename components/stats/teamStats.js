import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, FieldValue, getDoc, arrayRemove } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';
const TeamStats = () => {
  const [user, setUser] = useState(null);
  const [teamNames, setTeamNames] = useState([]);
  const [teamStats, setTeamStats] = useState({
    draws: 0,
    losses: 0,
    matchesPlayed: 0,
    wins: 0,
  });
  const [editStatsModalVisible, setEditStatsModalVisible] = useState(false); // Definicja zmiennej editStatsModalVisible
  const [teamId, setTeamId] = useState(null);
  const [editedStats, setEditedStats] = useState({
    draws: 0,
    losses: 0,
    matchesPlayed: 0,
    wins: 0,
  });

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
            const teamsQuery = query(
              teamsRef,
              where('members', 'array-contains', userData.uid)
            );
            const teamsSnapshot = await getDocs(teamsQuery);

            const userTeams = [];
            for (const teamDoc of teamsSnapshot.docs) {
              const teamData = teamDoc.data();
              if (teamData.members && teamData.members.includes(userData.uid)) {
                userTeams.push({ id: teamDoc.id, name: teamData.name });
              }
            }
            setTeamNames(userTeams.map((team) => team.name));

            if (userTeams.length > 0 && userData.isCoach) {
              const coachTeamId = userTeams[0].id;
              setTeamId(coachTeamId);
              const teamStatsRef = doc(firestore, 'teamStats', coachTeamId);
              const teamStatsDoc = await getDoc(teamStatsRef);

              if (teamStatsDoc.exists()) {
                const statsData = teamStatsDoc.data();
                setTeamStats(statsData);
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
      console.log('Przed teamId:', teamId);
      if (teamId) {
        const teamStatsRef = doc(firestore, 'teamStats', teamId);
        console.log('teamStatsRef.path:', teamStatsRef.path);
        await setDoc(teamStatsRef, editedStats);
        console.log('Po setDoc');
  
        // Po zapisaniu statystyk ponownie pobierz dane z bazy danych
        const updatedTeamStatsDoc = await getDoc(teamStatsRef);
        if (updatedTeamStatsDoc.exists()) {
          const updatedStatsData = updatedTeamStatsDoc.data();
          setTeamStats(updatedStatsData);
        }
  
        setEditStatsModalVisible(false);
      } else {
        console.error('Nie znaleziono teamId');
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania statystyk', error);
    }
  };

  const handleCancelEditStats = () => {
    // W przypadku anulowania edycji przywróć pierwotne statystyki
    setEditedStats(teamStats);
    setEditStatsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.teamStatsContainer}>
        <Text style={styles.title}>Statystyki Drużyny</Text>
        {user && (
          <View style={styles.teamInfo}>
            <Text style={styles.userText}>
              Zalogowany: {user.firstName} {user.lastName}
            </Text>
            {teamNames.length > 0 && (
              <View style={styles.teamContainer}>
                <Text style={styles.teamText}>Drużyny: </Text>
                <Text style={styles.teamNameText}>{teamNames.join(', ')}</Text>
              </View>
            )}
            {user.isCoach && (
              <View>
                <TouchableOpacity
                  style={styles.editStatsButton}
                  onPress={() => {
                    setEditedStats(teamStats);
                    setEditStatsModalVisible(true);
                  }}
                >
                  <Text style={styles.editStatsButtonText}>Edytuj Statystyki</Text>
                </TouchableOpacity>
                <FlatList
                  data={[
                    { label: 'Liczba rozegranych meczów', value: teamStats.matchesPlayed },
                    { label: 'Liczba wygranych', value: teamStats.wins },
                    { label: 'Liczba remisów', value: teamStats.draws },
                    { label: 'Liczba porażek', value: teamStats.losses },
                  ]}
                  keyExtractor={(item) => item.label}
                  renderItem={({ item }) => (
                    <View style={styles.statsItem}>
                      <Text style={styles.statsLabel}>{item.label}</Text>
                      <Text style={styles.statsValue}>{item.value}</Text>
                    </View>
                  )}
                />
              </View>
            )}
          </View>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={editStatsModalVisible}
        onRequestClose={() => setEditStatsModalVisible(false)}
      >
        <View style={styles.editStatsContainer}>
          <Text style={styles.editStatsTitle}>Edytuj Statystyki</Text>
          <TextInput
            style={styles.input}
            value={editedStats.matchesPlayed.toString()}
            onChangeText={(text) =>
              setEditedStats({ ...editedStats, matchesPlayed: parseInt(text) || 0 })
            }
          />
          {/* Dodaj więcej pól do edycji w zależności od potrzeb */}
          <TouchableOpacity style={styles.editStatsButton} onPress={handleSaveStats}>
            <Text style={styles.editStatsButtonText}>Zapisz</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editStatsButton}
            onPress={handleCancelEditStats}
          >
            <Text style={styles.editStatsButtonText}>Anuluj</Text>
          </TouchableOpacity>
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
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  teamInfo: {
    fontSize: 18,
    color: 'white',
  },
  userText: {
    color: 'white',
  },
  teamContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  teamText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  teamNameText: {
    fontSize: 18,
    color: 'white',
  },
  statsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  statsValue: {
    fontSize: 16,
    color: 'white',
  },
  editStatsButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  editStatsButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  editStatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  editStatsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 5,
    backgroundColor: 'white',
  },
});

export default TeamStats;