import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';

const ResultsCoach = () => {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('2023');
  const [selectedRound, setSelectedRound] = useState('1');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const teamsRef = collection(firestore, 'teams');
          const teamsQuery = query(teamsRef, where('members', 'array-contains', authUser.uid));
          const teamsSnapshot = await getDocs(teamsQuery);

          const userTeams = [];
          teamsSnapshot.forEach((teamDoc) => {
            const teamData = teamDoc.data();
            const teamId = teamDoc.id;

            userTeams.push({
              teamId: teamId,
              team: teamData,
            });
          });

          setTeams(userTeams);
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const teamIds = teams.map((team) => team.teamId);
        if (teamIds.length > 0) {
          const resultsRef = collection(
            firestore,
            `seasons/${selectedSeason}/rounds/${selectedRound}/matches`
          );
          const resultsQuery = query(resultsRef, where('teamId', 'in', teamIds));
          const resultsSnapshot = await getDocs(resultsQuery);
  
          const resultsData = [];
          resultsSnapshot.forEach((resultDoc) => {
            const resultData = resultDoc.data();
            const resultId = resultDoc.id;
  
            resultsData.push({
              id: resultId,
              ...resultData,
            });
          });
  
          setResults(resultsData);
        } else {
          console.warn('Brak zespołów.');
        }
      } catch (error) {
        console.error('Błąd pobierania wyników', error);
      }
    };
  
    fetchResults();
  }, [selectedSeason, selectedRound, teams]);

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <View style={styles.teamContent}>
        {/* Wybór sezonu */}
        <Text>Wybierz sezon:</Text>
        <TouchableOpacity onPress={() => setSelectedSeason('2022')}>
          <Text>2022</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedSeason('2023')}>
          <Text>2023</Text>
        </TouchableOpacity>

        {/* Wybór kolejki */}
        <Text>Wybierz kolejkę:</Text>
        <TouchableOpacity onPress={() => setSelectedRound('1')}>
          <Text>Kolejka 1</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedRound('2')}>
          <Text>Kolejka 2</Text>
        </TouchableOpacity>

        {/* Lista wyników */}
        <Text>Wyniki Trener</Text>
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <Text>Nazwa Meczu: {item.matchName}</Text>
              <Text>Wynik: {item.result}</Text>
            </View>
          )}
        />

        {/* Przycisk powrotu */}
        <TouchableOpacity style={styles.button} onPress={() => navigate('/team')}>
          <Text style={styles.buttonText}>Powrót</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  teamContent: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default ResultsCoach;
