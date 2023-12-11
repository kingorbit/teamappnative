import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';

const TeamStats = () => {
  const [user, setUser] = useState(null);
  const [teamNames, setTeamNames] = useState([]);
  const [teamStats, setTeamStats] = useState({
    matchesPlayed: 0,
    matchesPlayedHome: 0,
    matchesPlayedAway: 0,
    wins: 0,
    winsHome: 0,
    winsAway: 0,
    draws: 0,
    drawsHome: 0,
    drawsAway: 0,
    losses: 0,
    lossesHome: 0,
    lossesAway: 0,
    goals: 0,
    goalsHome: 0,
    goalsAway: 0,
    goalsLost: 0,
    goalsLostHome: 0,
    goalsLostAway: 0,
    shots: 0,
    shotsHome: 0,
    shotsAway: 0,
    shotsOnTarget: 0,
    shotsOnTargetHome: 0,
    shotsOnTargetAway: 0,
    ballPossesion: 0,
    ballPossesionHome: 0,
    ballPossesionAway: 0,
    corners: 0,
    cornersHome: 0,
    cornersAway: 0,
    Fouls: 0,
    FoulsHome: 0,
    FoulsAway: 0,
    Injury: 0,
    InjuryHome: 0,
    InjuryAway: 0,
    Pass: 0,
    PassHome: 0,
    PassAway: 0,
    Tackles: 0,
    TacklesHome: 0,
    TacklesAway: 0,



  });
  const [editedStats, setEditedStats] = useState({
    matchesPlayed: 0,
    matchesPlayedHome: 0,
    matchesPlayedAway: 0,
    wins: 0,
    winsHome: 0,
    winsAway: 0,
    draws: 0,
    drawsHome: 0,
    drawsAway: 0,
    losses: 0,
    lossesHome: 0,
    lossesAway: 0,
    goals: 0,
    goalsHome: 0,
    goalsAway: 0,
    goalsLost: 0,
    goalsLostHome: 0,
    goalsLostAway: 0,
    shots: 0,
    shotsHome: 0,
    shotsAway: 0,
    shotsOnTarget: 0,
    shotsOnTargetHome: 0,
    shotsOnTargetAway: 0,
    ballPossesion: 0,
    ballPossesionHome: 0,
    ballPossesionAway: 0,
    corners: 0,
    cornersHome: 0,
    cornersAway: 0,
    Fouls: 0,
    FoulsHome: 0,
    FoulsAway: 0,
    Injury: 0,
    InjuryHome: 0,
    InjuryAway: 0,
    Pass: 0,
    PassHome: 0,
    PassAway: 0,
    Tackles: 0,
    TacklesHome: 0,
    TacklesAway: 0,
  });
  const [editStatsModalVisible, setEditStatsModalVisible] = useState(false);
  const [teamId, setTeamId] = useState(null);

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

            if (userTeams.length > 0 && userData.isCoach) {
  const coachTeamId = userTeams[0].id;
  setTeamId(coachTeamId);
  const currentSeason = new Date().getFullYear(); // zakładam, że sezon to rok kalendarzowy
  const teamStatsRef = doc(firestore, 'teamStats', coachTeamId, 'seasons', currentSeason.toString());
  
  const teamStatsDoc = await getDoc(teamStatsRef);
  
  if (teamStatsDoc.exists()) {
    const statsData = teamStatsDoc.data();
    setTeamStats(statsData);
    setEditedStats(statsData);
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
      if (teamId) {
        const currentSeason = new Date().getFullYear(); // zakładam, że sezon to rok kalendarzowy
        const teamStatsRef = doc(firestore, 'teamStats', teamId, 'seasons', currentSeason.toString());
        
        await setDoc(teamStatsRef, editedStats);
        
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
            {user.isCoach && (
              <View>
                <TouchableOpacity
                  style={styles.editStatsButton}
                  onPress={() => {
                    setEditedStats(teamStats); // Dodane do zainicjowania stanu edytowanych statystyk
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
                    { label: 'Liczba wygranych', key: 'wins' },
                    { label: 'Liczba wygranych u siebie', key: 'winsHome'},
                    { label: 'Liczba wygranych na wyjezdzie', key: 'winsAway'},
                    { label: 'Liczba remisów', key: 'draws' },
                    { label: 'Liczba remisów u siebie', key: 'drawsHome'},
                    { label: 'Liczba remisów na wyjezdzie', key: 'drawsAway'},
                    { label: 'Liczba porażek', key: 'losses' },
                    { label: 'Liczba porażek u siebie', key: 'lossesHome'},
                    { label: 'Liczba porażek na wyjezdzie', key: 'lossesAway'},
                    { label: 'Liczba strzelonych bramek', key: 'goals'},
                    { label: 'Liczba strzelonych bramek u siebie', key: 'goalsHome'},
                    { label: 'Liczba strzelonych bramek na wyjezdzie', key: 'goalsAway'},
                    { label: 'Liczba straconych bramek', key: 'goalsLost'},
                    { label: 'Liczba straconych bramek u siebie', key: 'goalsLostHome'},
                    { label: 'Liczba straconych bramek na wyjezdzie', key: 'goalsLostAway'},
                    { label: 'Liczba strzałów', key: 'shots'},
                    { label: 'Liczba strzałów u siebie', key: 'shotsHome'},
                    { label: 'Liczba strzałów na wyjezdzie', key: 'shotsAway'},
                    { label: 'Liczba celnych strzałów', key: 'shotsOnTarget'},
                    { label: 'Liczba celnych strzałów u siebie', key: 'shotsOnTargetHome'},
                    { label: 'Liczba celnych strzałów na wyjezdzie', key: 'shotsOnTargetAway'},
                    { label: 'Posiadanie piłki', key: 'ballPossesion', unit: '%'},
                    { label: 'Posiadanie piłki u siebie', key: 'ballPossesionHome', unit: '%'},
                    { label: 'Posiadanie piłki na wyjezdzie', key: 'ballPosessionAway', unit: '%'},
                    { label: 'Liczba rzutów roznych', key: 'corners'},
                    { label: 'Liczba rzutów roznych u siebie', key: 'cornersHome'},
                    { label: 'Liczba rzutów roznych na wyjezdzie', key: 'cornersAway'},
                    { label: 'Liczba fauli', key: 'Fouls'},
                    { label: 'Liczba fauli u siebie', key: 'FoulsHome'},
                    { label: 'Liczba fauli na wyjezdzie', key: 'FoulsAway'},
                    { label: 'Liczba kontuzji', key: 'Injury'},
                    { label: 'Liczba kontuzji u siebie', key: 'InjuryHome'},
                    { label: 'Liczba kontuzji na wyjezdzie', key: 'InjuryAway'},
                    { label: 'Liczba podan', key: 'Pass'},
                    { label: 'Liczba podan u siebie', key: 'PassHome', unit: '%'},
                    { label: 'Liczba podan na wyjezdzie', key: 'PassAway'},
                    { label: 'Liczba odbiorów', key: 'Tackles'},
                    { label: 'Liczba odbiorów u siebie', key: 'TacklesHome'},
                    { label: 'Liczba odbiorów na wyjezdzie', key: 'TacklesAway'},
                  ]}
                  
                  keyExtractor={(item) => item.label}
                  renderItem={({ item }) => (
                    <View style={styles.statsItem}>
                      <Text style={styles.statsLabel}>{item.label}</Text>
                      <Text style={styles.statsValue}>{teamStats[item.key]}{item.unit}</Text>
                    </View>
                    
                  )}
                />
              </View>
              
            )}
            <TouchableOpacity style={styles.link} onPress={() => navigate('/team')}>
          <Text style={styles.linkText}>Powrót</Text>
        </TouchableOpacity>
          </View>
        )}
      </View>
      <Modal
  animationType="slide"
  transparent={true}
  visible={editStatsModalVisible}
  onRequestClose={() => setEditStatsModalVisible(false)}
>
  <ScrollView style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Edytuj Statystyki</Text>
      
      {Object.entries(editedStats).map(([key, value]) => (
        <View key={key} style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{key}</Text>
          <TextInput
            style={styles.input}
            value={value.toString()}
            onChangeText={(text) =>
              setEditedStats({
                ...editedStats,
                [key]: parseInt(text) || 0,
              })
            }
          />
        </View>
      ))}

      <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={handleSaveStats}>
        <Text>Zapisz</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'red' }]}
        onPress={() => setEditStatsModalVisible(false)}
      >
        <Text>Powrót</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
</Modal>
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
  inputLabel:{
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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    margin: 20,
  },
  inputContainer: {
    marginBottom: 15,
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
});

export default TeamStats;
