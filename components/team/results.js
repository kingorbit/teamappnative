import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import NavigationBar from '../navBar';
import { useNavigate } from 'react-router-native';

const Results = () => {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [isSeasonModalVisible, setSeasonModalVisible] = useState(false);
  const [isRoundModalVisible, setRoundModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const usersRef = collection(firestore, 'users');
          const teamsRef = collection(firestore, 'teams');
          const teamsQuery = query(teamsRef, where('members', 'array-contains', authUser.uid));
          const teamsSnapshot = await getDocs(teamsQuery);

          let userTeamId = null;

          teamsSnapshot.forEach((teamDoc) => {
            const teamData = teamDoc.data();
            if (teamData.members.includes(authUser.uid)) {
              userTeamId = teamDoc.id;
            }
          });

          if (!userTeamId) {
            console.error('Użytkownik nie jest członkiem żadnego zespołu:', authUser.uid);
            return;
          }

          const q = query(usersRef, where('uid', '==', authUser.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            setUser(userData);

            const resultsRef = collection(firestore, 'results');
            const resultsQuery = query(resultsRef, where('teamId', '==', userTeamId));
            const resultsSnapshot = await getDocs(resultsQuery);

            const userResults = [];
            resultsSnapshot.forEach((resultDoc) => {
              const resultData = resultDoc.data();
              userResults.push(resultData);
            });

            setResults(userResults);

            const uniqueSeasons = Array.from(new Set(userResults.map(result => result.season)));
            setSeasons(uniqueSeasons);

            const uniqueRounds = Array.from(new Set(userResults.map(result => result.round)));
            setRounds(uniqueRounds);
          }
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleSeasonModal = () => {
    setSeasonModalVisible(!isSeasonModalVisible);
  };

  const toggleRoundModal = () => {
    setRoundModalVisible(!isRoundModalVisible);
  };

 
  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.resultsContent}>
          <Text style={styles.title}>Wyniki</Text>

          <View style={styles.filtersContainer}>
            <TouchableOpacity onPress={toggleSeasonModal}>
              <View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Sezon:</Text>
                <Text style={styles.selectedFilter}>{selectedSeason || 'Wszystkie'}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleRoundModal}>
              <View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Kolejka:</Text>
                <Text style={styles.selectedFilter}>{selectedRound || 'Wszystkie'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {results
            .filter((result) => (
              (selectedSeason === null || result.season === selectedSeason) &&
              (selectedRound === null || result.round === selectedRound)
            ))
            .map((result) => (
              <View key={result.resultId} style={styles.resultContainer}>
                <Text style={styles.resultText}>{`Sezon: ${result.season}`}</Text>
                <Text style={styles.resultText}>{`Kolejka: ${result.round}`}</Text>
                <Text style={styles.resultText}>{`${result.match}`}</Text>
                <Text style={styles.resultText}>{`Wynik: ${result.result}`}</Text>
              </View>
            ))}

          {/* Modal for Season */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isSeasonModalVisible}
            onRequestClose={toggleSeasonModal}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {seasons.map((season) => (
                  <TouchableOpacity
                    key={season}
                    onPress={() => {
                      setSelectedSeason(season);
                      toggleSeasonModal();
                    }}
                  >
                    <Text style={styles.modalItem}>{season}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => {
                  setSelectedSeason(null);
                  toggleSeasonModal();
                }}>
                  <Text style={styles.modalItem}>Wszystkie</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Modal for Round */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isRoundModalVisible}
            onRequestClose={toggleRoundModal}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {rounds.map((round) => (
                  <TouchableOpacity
                    key={round}
                    onPress={() => {
                      setSelectedRound(round);
                      toggleRoundModal();
                    }}
                  >
                    <Text style={styles.modalItem}>{round}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => {
                  setSelectedRound(null);
                  toggleRoundModal();
                }}>
                  <Text style={styles.modalItem}>Wszystkie</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <TouchableOpacity style={styles.button} onPress={() => navigate('/team')}>
          <Text style={styles.buttonText}>Powrót</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
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
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  resultsContent: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterContainer: {
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 18,
    color: 'white',
    margin: 20,
    
  },
  selectedFilter: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  // Styles for Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalItem: {
    fontSize: 16,
    marginVertical: 10,
  },
});

export default Results;