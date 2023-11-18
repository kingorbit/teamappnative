import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';

const TeamStatsView = () => {
  const [user, setUser] = useState(null);
  const [teamNames, setTeamNames] = useState([]);
  const [teamStats, setTeamStats] = useState({
    total: {
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals: 0,
      goalsLost: 0,
      shots: 0,
      shotsOnTarget: 0,
      ballPossession: 0,
      corners: 0,
      fouls: 0,
      injuries: 0,
      passes: 0,
      tackles: 0,
    },
    home: {
      matchesPlayedHome: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals: 0,
      goalsLost: 0,
      shots: 0,
      shotsOnTarget: 0,
      ballPossession: 0,
      corners: 0,
      fouls: 0,
      injuries: 0,
      passes: 0,
      tackles: 0,
    },
    away: {
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals: 0,
      goalsLost: 0,
      shots: 0,
      shotsOnTarget: 0,
      ballPossession: 0,
      corners: 0,
      fouls: 0,
      injuries: 0,
      passes: 0,
      tackles: 0,
    },
  });

  const [editStatsModalVisible, setEditStatsModalVisible] = useState(false);
  const [teamId, setTeamId] = useState(null);
  const [selectedMode, setSelectedMode] = useState('total'); // 'total', 'home', or 'away'

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

            if (userTeams.length) {
              const coachTeamId = userTeams[0].id;
              setTeamId(coachTeamId);
              const teamStatsRef = doc(firestore, 'teamStats', coachTeamId);
              const teamStatsDoc = await getDoc(teamStatsRef);

              if (teamStatsDoc.exists()) {
                const statsData = teamStatsDoc.data();
                console.log(statsData); // Dodaj tę linię
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

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView>
        <View style={styles.teamStatsContainer}>
          <Text style={styles.title}>Statystyki Drużyny</Text>
          {user && (
            <View style={styles.teamInfo}>
              {teamNames.length > 0 && (
                <View style={styles.teamContainer}>
                  <Text style={styles.teamText}>Drużyny: </Text>
                  <Text style={styles.teamNameText}>{teamNames.join(', ')}</Text>
                </View>
              )}
              { (
                <View>
                  <FlatList
                    data={[
                      { label: 'Total', key: 'total' },
                      { label: 'Home', key: 'home' },
                      { label: 'Away', key: 'away' },
                    ]}
                    keyExtractor={(item) => item.key}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.modeButton, selectedMode === item.key && styles.selectedModeButton]}
                        onPress={() => setSelectedMode(item.key)}
                      >
                        <Text style={styles.modeButtonText}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                    horizontal
                  />
                  <FlatList
                    data={[
                      { label: 'Liczba rozegranych meczów', key: 'matchesPlayed' },
                      { label: 'Liczba wygranych', key: 'wins' },
                      { label: 'Liczba remisów', key: 'draws' },
                      { label: 'Liczba porażek', key: 'losses' },
                      { label: 'Liczba strzelonych bramek', key: 'goals' },
                      { label: 'Liczba straconych bramek', key: 'goalsLost' },
                      { label: 'Liczba strzałów', key: 'shots' },
                      { label: 'Liczba celnych strzałów', key: 'shotsOnTarget' },
                      { label: 'Posiadanie piłki', key: 'ballPossession', unit: '%' },
                      { label: 'Liczba rzutów rożnych', key: 'corners' },
                      { label: 'Liczba fauli', key: 'fouls' },
                      { label: 'Liczba kontuzji', key: 'injuries' },
                      { label: 'Liczba podań', key: 'passes' },
                      { label: 'Liczba odbiorów', key: 'tackles' },
                    ]}
                    keyExtractor={(item) => item.label}
                    renderItem={({ item }) => (
                      <View style={styles.statsItem}>
                        <Text style={styles.statsLabel}>{item.label}</Text>
                        <Text style={styles.statsValue}>
                          {teamStats && teamStats[selectedMode] ? teamStats[selectedMode][item.key] : 'Brak danych'}{item.unit}
                        </Text>
                      </View>
                    )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  teamStatsContainer: {
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  teamContainer:{
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  link: {
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
  linkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  teamContainer: {
    marginTop: 10,
    alignContent: 'center',
    alignItems: 'center',
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
  editStatsButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: 24,
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
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  modeButton: {
    padding: 10,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  selectedModeButton: {
    backgroundColor: '#9091fd',
  },
  modeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default TeamStatsView;
