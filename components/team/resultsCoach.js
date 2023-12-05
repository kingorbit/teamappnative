import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import NavigationBar from '../navBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigate } from 'react-router-native';


const ResultsCoach = () => {
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [isSeasonModalVisible, setSeasonModalVisible] = useState(false);
  const [isRoundModalVisible, setRoundModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [matchInput, setMatchInput] = useState('');
  const [resultInput, setResultInput] = useState('');
  const [modalSelectedSeason, setModalSelectedSeason] = useState(null);
  const [modalSelectedRound, setModalSelectedRound] = useState(null);
  const navigate = useNavigate();

  // ... (reszta kodu)

  const toggleAddModal = () => {  // Dodane
    setAddModalVisible(!isAddModalVisible);
  };

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

  const toggleEditModal = () => {
    setEditModalVisible(!isEditModalVisible);
  };

  const getUserTeamId = async (uid) => {
    try {
      const teamsRef = collection(firestore, 'teams');
      const teamsQuery = query(teamsRef, where('members', 'array-contains', uid));
      const teamsSnapshot = await getDocs(teamsQuery);

      let userTeamId = null;

      teamsSnapshot.forEach((teamDoc) => {
        const teamData = teamDoc.data();
        if (teamData.members.includes(uid)) {
          userTeamId = teamDoc.id;
        }
      });

      return userTeamId;
    } catch (error) {
      console.error('Błąd pobierania teamId użytkownika', error);
      return null;
    }
  };

  const addResult = async () => {
    try {
      if (!modalSelectedSeason || !modalSelectedRound || !matchInput || !resultInput) {
        Alert.alert('Błąd', 'Proszę uzupełnić wszystkie pola.');
        return;
      }
  
      const userTeamId = await getUserTeamId(auth.currentUser.uid);
  
      if (!userTeamId) {
        console.error('Użytkownik nie jest przypisany do żadnego zespołu.');
        return;
      }
  
      const resultCollectionRef = collection(firestore, 'results');
  
      // Utwórz nowy dokument i pobierz przypisane przez Firebase unikalne id (resultId)
      const newResultDocRef = await addDoc(resultCollectionRef, {
        match: matchInput,
        result: resultInput,
        season: modalSelectedSeason,
        round: modalSelectedRound,
        teamId: userTeamId,
      });
  
      const newResultId = newResultDocRef.id;
  
      // Uaktualnij dokument z nowym identyfikatorem (resultId)
      await updateDoc(newResultDocRef, {
        resultId: newResultId,
      });
  
      // Aktualizacja stanu
      setResults((prevResults) => [
        ...prevResults,
        {
          match: matchInput,
          result: resultInput,
          season: modalSelectedSeason,
          round: modalSelectedRound,
          teamId: userTeamId,
          resultId: newResultId, // Ustawienie unikalnego identyfikatora
        },
      ]);
      setMatchInput('');
      setResultInput('');
      setModalSelectedSeason(null);
      setModalSelectedRound(null);
      setSeasonModalVisible(false);
      setRoundModalVisible(false);
      setAddModalVisible(false);
    } catch (error) {
      console.error('Błąd dodawania wyniku', error);
    }
  };

  


  const deleteResult = async (resultId) => {
    try {
      await deleteDoc(doc(firestore, 'results', resultId));

      setResults((prevResults) => prevResults.filter((result) => result.resultId !== resultId));
    } catch (error) {
      console.error('Błąd usuwania wyniku', error);
    }
  };
  

  

  const handleEditResult = async () => {
    try {
      if (!modalSelectedSeason || !modalSelectedRound || !matchInput || !resultInput) {
        Alert.alert('Błąd', 'Proszę uzupełnić wszystkie pola.');
        return;
      }
  
      if (!editingResult || !editingResult.resultId) {
        console.error('Brak danych edytowanego wyniku.');
        return;
      }
  
      const userTeamId = await getUserTeamId(auth.currentUser.uid);
  
      if (!userTeamId) {
        console.error('Użytkownik nie jest przypisany do żadnego zespołu.');
        return;
      }
  
      const updatedResult = {
        match: matchInput,
        result: resultInput,
        season: modalSelectedSeason,
        round: modalSelectedRound,
        teamId: userTeamId,
        resultId: editingResult.resultId,
      };
  
      const resultRef = doc(firestore, 'results', editingResult.resultId);
      await setDoc(resultRef, updatedResult, { merge: true });
  
      setResults((prevResults) => {
        const updatedResults = [...prevResults];
        const index = updatedResults.findIndex((result) => result.resultId === editingResult.resultId);
        updatedResults[index] = { ...updatedResults[index], ...updatedResult };
        return updatedResults;
      });
  
      setEditingResult(null);
      setMatchInput('');
      setResultInput('');
      setSeasonModalVisible(false);
      setRoundModalVisible(false);
      setEditModalVisible(false);
    } catch (error) {
      console.error('Błąd edycji wyniku', error);
    }
  };
  
  
  
  
  

  const handleEditButtonPress = (result) => {
    setEditingResult(result);
    setMatchInput(result.match);
    setResultInput(result.result);
    setModalSelectedSeason(result.season);  // Zaktualizowana nazwa zmiennej
    setModalSelectedRound(result.round);    // Zaktualizowana nazwa zmiennej
    setEditModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.resultsContent}>
          <Text style={styles.title}>Wyniki</Text>

          <View style={styles.addButtonsContainer}>
          <TouchableOpacity style={styles.addButton} onPress={() => {
            setEditingResult(null);
            setMatchInput('');
            setResultInput('');
            toggleAddModal();
          }}>
            <Icon name="plus" size={15} color="white" />
            <Text style={styles.addButtonText}>Dodaj</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigate('/team')}>
          <Icon name="rotate-left" size={15} color="black" />
            <Text style={styles.buttonText}>Powrót</Text>
          </TouchableOpacity>
        </View>
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

      <View style={styles.editDeleteButtonsContainer}>
        <TouchableOpacity onPress={() => handleEditButtonPress(result)}>
          <Text style={styles.editButton}>Edytuj</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteResult(result.resultId)}>
          <Text style={styles.deleteButton}>Usuń</Text>
        </TouchableOpacity>
      </View>
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
    toggleSeasonModal(); // Dodaj tę linijkę, aby schować modal po wybraniu sezonu
  }}
>
  <Text style={styles.modalItem}>{season}</Text>
</TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setSelectedSeason(null)}>
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
    toggleRoundModal(); // Dodaj tę linijkę, aby schować modal po wybraniu kolejki
  }}
>
  <Text style={styles.modalItem}>{round}</Text>
</TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setSelectedRound(null)}>
                  <Text style={styles.modalItem}>Wszystkie</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={isAddModalVisible}
            onRequestClose={toggleAddModal}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
              <TextInput
  style={styles.input}
  placeholder="Sezon (maks. 4 cyfry)"
  value={modalSelectedSeason}
  onChangeText={(text) => {
    // Ogranicza wprowadzane wartości do maksymalnie 4 cyfr
    const sanitizedText = text.replace(/[^0-9]/g, '').slice(0, 4);
    setModalSelectedSeason(sanitizedText);
  }}
  keyboardType="numeric" // Ogranicza wprowadzane wartości do cyfr
/>
<TextInput
  style={styles.input}
  placeholder="Kolejka"
  value={modalSelectedRound}
  onChangeText={(text) => {
    // Ogranicza wprowadzane wartości do cyfr
    const sanitizedText = text.replace(/[^0-9]/g, '');
    setModalSelectedRound(sanitizedText);
  }}
  keyboardType="numeric" // Ogranicza wprowadzane wartości do cyfr
/>
                <TextInput
                  style={styles.input}
                  placeholder="Mecz"
                  value={matchInput}
                  onChangeText={setMatchInput}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Wynik"
                  value={resultInput}
                  onChangeText={setResultInput}
                />
<View style={styles.modalButtonContainer}>
        <TouchableOpacity onPress={addResult}>
          <Text style={styles.addButtonMod}>Dodaj</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleAddModal}>
          <Text style={styles.cancelButton}>Anuluj</Text>
        </TouchableOpacity>
      </View>
              </View>
            </View>
          </Modal>

          {/* Modal for Edit */}
          <Modal
  animationType="slide"
  transparent={true}
  visible={isEditModalVisible}
  onRequestClose={toggleEditModal}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <TextInput
        style={styles.input}
        placeholder="Mecz"
        value={matchInput}
        onChangeText={setMatchInput}
      />
      <TextInput
        style={styles.input}
        placeholder="Wynik"
        value={resultInput}
        onChangeText={setResultInput}
      />
      <TextInput
        style={styles.input}
        placeholder="Sezon (maks. 4 cyfry)"
        value={modalSelectedSeason || ''}
        onChangeText={(text) => {
          // Ogranicza wprowadzane wartości do maksymalnie 4 cyfr
          const sanitizedText = text.replace(/[^0-9]/g, '').slice(0, 4);
          setModalSelectedSeason(sanitizedText);
        }}
        keyboardType="numeric" // Ogranicza wprowadzane wartości do cyfr
      />
      <TextInput
        style={styles.input}
        placeholder="Kolejka"
        value={modalSelectedRound || ''}
        onChangeText={(text) => {
          // Ogranicza wprowadzane wartości do cyfr
          const sanitizedText = text.replace(/[^0-9]/g, '');
          setModalSelectedRound(sanitizedText);
        }}
        keyboardType="numeric" // Ogranicza wprowadzane wartości do cyfr
      />
<View style={styles.modalButtonContainer}>
  <TouchableOpacity onPress={handleEditResult}>
    <Text style={styles.editButton}>Edytuj</Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={toggleEditModal}>
    <Text style={styles.cancelButton}>Anuluj</Text>
  </TouchableOpacity>
</View>
    </View>
  </View>
</Modal>
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
  scrollViewContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  resultsContent: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    backgroundColor: 'white',
    justifyContent: 'center', // Wycentrowanie przycisków
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '70%',
  },
  resultText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
    alignSelf: 'center',
  },
  editDeleteButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Wycentrowanie przycisków
    marginTop: 10,
  },

  editButton: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 5,
    color: 'white',
    fontWeight: 'bold',
  },

  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
    color: 'white',
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
    margin: 15,
    fontWeight: 'bold',
  },
  selectedFilter: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  addButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: 'green',  // Kolor tła - zielony
    padding: 10,  // Dodatkowy padding
    borderRadius: 10,  // Zaokrąglenie rogów
    alignItems: 'center',  // Wyśrodkowanie zawartości w pionie
    justifyContent: 'center',  // Wyśrodkowanie zawartości w poziomie
    marginTop: 20,  // Dodatkowy margines od góry
    width: '25%',
    marginRight: 25,
  },

  addButtonText: {
    color: 'white',  // Kolor tekstu - biały
    fontSize: 15,  // Rozmiar tekstu
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#FFA500',  // Pomarańczowy kolor
    color: 'white',
    padding: 10,
    borderRadius: 5,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF0000',  // Czerwony kolor
    color: 'white',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,  // Dodatkowy margines od lewej strony
    fontWeight: 'bold',
  },
  addButtonMod: {
    backgroundColor: 'green',  // Czerwony kolor
    color: 'white',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,  // Dodatkowy margines od lewej strony
    fontWeight: 'bold',
  },
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
  button: {
    width: '25%',
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',  // Wyśrodkowanie zawartości w pionie
    justifyContent: 'center',  // Wyśrodkowanie zawartości w poziomie
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  // Styles for Edit Modal
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    width: 250,
    textAlign: 'center',
  },
  modalButton: {
    fontSize: 16,
    color: 'blue',
    marginBottom: 10,
  },
});

export default ResultsCoach;
