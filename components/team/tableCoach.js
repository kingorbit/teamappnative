import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { collection, getDocs, addDoc, doc, setDoc, query, where, deleteDoc } from 'firebase/firestore';
import { firestore, auth } from '../../constants/config';
import TableItem from './tableItem';
import Header from '../header';
import NavigationBar from '../navBar';


const TableCoach = () => {
  const [teams, setTeams] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamMatches, setNewTeamMatches] = useState(0);
  const [newTeamWins, setNewWins] = useState(0);
  const [newTeamDraws, setNewDraws] = useState(0);
  const [newTeamLosts, setNewLosts] = useState(0);
  const [newTeamGoals, setNewGoals] = useState(0);
  const [newTeamGoalsLost, setNewTeamGoalsLost] = useState(0);
  const [editTeam, setEditTeam] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editedTeam, setEditedTeam] = useState(null);
  const [refreshTable, setRefreshTable] = useState(false);
  




  


  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          console.error('Użytkownik nie jest zalogowany.');
          return;
        }

        // Pobierz zespoły, do których należy aktualnie zalogowany użytkownik
        const teamsRef = collection(firestore, 'teams');
        const teamsQuery = query(teamsRef, where('members', 'array-contains', user.uid));
        const teamsSnapshot = await getDocs(teamsQuery);

        const userTeams = [];
        for (const teamDoc of teamsSnapshot.docs) {
          const teamData = teamDoc.data();
          userTeams.push(teamData.teamId);
        }

        // Pobierz dane zespołów z tabeli
        const tableRef = collection(firestore, 'table');
        const tableSnapshot = await getDocs(tableRef);
        const tableData = tableSnapshot.docs.map((doc) => doc.data());

        // Wybierz tylko zespoły, do których należy aktualnie zalogowany użytkownik
        const userTableData = tableData.filter((team) => userTeams.includes(team.teamId));

        // Sortowanie danych: najpierw po punktach, a potem po bramkach strzelonych
        userTableData.sort((a, b) => {
          if (a.points !== b.points) {
            return b.points - a.points; // Sortuj malejąco po punktach
          } else {
            return b.goals - a.goals; // Sortuj malejąco po bramkach strzelonych
          }
        });

        setTeams(userTableData);
      } catch (error) {
        console.error('Błąd pobierania danych tabeli', error);
      }
    };

    fetchTableData();
  }, [isModalVisible]); // Dodaj zależność, aby odświeżać tabelę po dodaniu nowego zespołu

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  

  
  const calculatePoints = (wins, draws) => {
    const winPoints = 3;
    const drawPoints = 1;
  
    return wins * winPoints + draws * drawPoints;
  };

  const addNewTeam = async () => {
    try {
      // Sprawdź, czy użytkownik jest zalogowany
      const user = auth.currentUser;
      if (!user) {
        console.error('Użytkownik nie jest zalogowany.');
        return;
      }
  
      // Pobierz teamId użytkownika z kolekcji 'teams'
      const teamsRef = collection(firestore, 'teams');
      const userTeamsQuery = query(teamsRef, where('members', 'array-contains', user.uid));
      const userTeamsSnapshot = await getDocs(userTeamsQuery);
  
      if (userTeamsSnapshot.empty) {
        console.error('Użytkownik nie należy do żadnego zespołu.');
        return;
      }
  
      // Załóżmy, że użytkownik należy tylko do jednego zespołu
      const userTeamId = userTeamsSnapshot.docs[0].data().teamId;
  
      if (!userTeamId) {
        console.error('Nie udało się znaleźć teamId dla użytkownika.');
        return;
      }
  
      // Dodaj nowy zespół do tabeli
      const newTeam = {
        name: newTeamName,
        wins: newTeamWins,
        draws: newTeamDraws,
        losts: newTeamLosts,
        goals: newTeamGoals,
        goalsLost: newTeamGoalsLost,
        points: calculatePoints(newTeamWins, newTeamDraws),
        teamId: userTeamId,
      };
  
      // Dodaj dokument do kolekcji "table" z automatycznie generowanym identyfikatorem
      const tableRef = collection(firestore, 'table');
      const newTeamRef = await addDoc(tableRef, newTeam);
  
      // Dodaj pole 'id' jako identyfikator dokumentu
      await setDoc(doc(firestore, 'table', newTeamRef.id), { id: newTeamRef.id, teamId: userTeamId }, { merge: true });
  
      // Zamknij modal
      toggleModal();
    } catch (error) {
      console.error('Błąd dodawania nowego zespołu', error);
    }
  };
  
  const toggleEditModal = (team) => {
    setEditedTeam(team);
    setNewTeamName(team.name);
    setNewTeamMatches(team.matches);
    setNewWins(team.wins);
    setNewDraws(team.draws);
    setNewLosts(team.losts);
    setNewGoals(team.goals);
    setNewTeamGoalsLost(team.goalsLost);
    setEditModalVisible(true);
  };
  
  const addOrUpdateTeam = async () => {
    try {
      // Sprawdź, czy użytkownik jest zalogowany
      const user = auth.currentUser;
      if (!user) {
        console.error('Użytkownik nie jest zalogowany.');
        return;
      }
  
      // Pobierz teamId użytkownika z kolekcji 'teams'
      const teamsRef = collection(firestore, 'teams');
      const userTeamsQuery = query(teamsRef, where('members', 'array-contains', user.uid));
      const userTeamsSnapshot = await getDocs(userTeamsQuery);
  
      if (userTeamsSnapshot.empty) {
        console.error('Użytkownik nie należy do żadnego zespołu.');
        return;
      }
  
      // Załóżmy, że użytkownik należy tylko do jednego zespołu
      const userTeamId = userTeamsSnapshot.docs[0].data().teamId;
  
      if (!userTeamId) {
        console.error('Nie udało się znaleźć teamId dla użytkownika.');
        return;
      }
  
      console.log('userTeamId:', userTeamId);
  
      // Sprawdź, czy edytujemy istniejący zespół
      console.log('editedTeam:', editedTeam);
      if (editedTeam) {
        console.log('Edytujemy zespół:', editedTeam);
  
        // Edytuj istniejący zespół
        const updatedTeam = {
          name: newTeamName,
          wins: newTeamWins,
          draws: newTeamDraws,
          losts: newTeamLosts,
          goals: newTeamGoals,
          goalsLost: newTeamGoalsLost,
          points: calculatePoints(newTeamWins, newTeamDraws),
          teamId: userTeamId,
        };
  
        // Zaktualizuj dokument w kolekcji "table"
        const teamDocRef = doc(firestore, 'table', editedTeam.id);
        await setDoc(teamDocRef, updatedTeam, { merge: true });
  
        // Zamknij modal
        setEditModalVisible(false);
  
        // Ustaw nową wartość dla refreshTable
        setRefreshTable(prevValue => !prevValue);
      } else {
        console.error('Brak zespołu do edycji.');
      }
    } catch (error) {
      console.error('Błąd edycji zespołu', error);
    }
  };
  
  

  const deleteTeam = async (id) => {
    try {
      // Usuń zespół z kolekcji "table" na podstawie jego id
      const teamDocRef = doc(firestore, 'table', id);
      await deleteDoc(teamDocRef);
  
      // Odśwież listę po usunięciu
      const updatedTeams = teams.filter(team => team.id !== id);
      setTeams(updatedTeams);
  
      console.log('Zespół został pomyślnie usunięty.');
    } catch (error) {
      console.error('Błąd podczas usuwania zespołu', error);
    }
  };
  
  
  

  return (
    <View style={styles.container}>
            <Header />
          <View style={styles.tablecoachcontainer}>
      <Text style={styles.title}>Tabela</Text>
      <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
        <Text style={styles.addButtonText}>Dodaj zespół</Text>
      </TouchableOpacity>

      {/* Modal do dodawania nowego zespołu */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dodaj zespół</Text>
            <TextInput
              style={styles.input}
              placeholder="Nazwa zespołu"
              onChangeText={(text) => setNewTeamName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Mecze rozegrane"
              keyboardType="numeric"
              onChangeText={(text) => setNewTeamMatches(Number(text))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Wygrane"
              keyboardType="numeric"
              onChangeText={(text) => setNewWins(Number(text))}
            />
            <TextInput
              style={styles.input}
              placeholder="Remisy"
              keyboardType="numeric"
              onChangeText={(text) => setNewDraws(Number(text))}
            />
                        <TextInput
              style={styles.input}
              placeholder="Porazki"
              keyboardType="numeric"
              onChangeText={(text) => setNewLosts(Number(text))}
            />
                                    <TextInput
              style={styles.input}
              placeholder="Bramki strzelone"
              keyboardType="numeric"
              onChangeText={(text) => setNewGoals(Number(text))}
            />
            <TextInput
              style={styles.input}
              placeholder="Bramki stracone"
              keyboardType="numeric"
              onChangeText={(text) => setNewTeamGoalsLost(Number(text))}
            />
            <TouchableOpacity style={styles.modalButton} onPress={addNewTeam}>
              <Text style={styles.modalButtonText}>Dodaj</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
              <Text style={styles.modalButtonText}>Anuluj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
  animationType="slide"
  transparent={true}
  visible={isEditModalVisible}
  onRequestClose={() => setEditModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Edytuj zespół</Text>
      <Text style={styles.label}>Mecze rozegrane</Text>
<TextInput
  style={styles.input}
  keyboardType="numeric"
  value={newTeamMatches !== undefined ? newTeamMatches.toString() : ''}
  onChangeText={(text) => setNewTeamMatches(Number(text))}
/>

<Text style={styles.label}>Wygrane</Text>
<TextInput
  style={styles.input}
  keyboardType="numeric"
  value={newTeamWins !== undefined ? newTeamWins.toString() : ''}
  onChangeText={(text) => setNewWins(Number(text))}
/>

<Text style={styles.label}>Remisy</Text>
<TextInput
  style={styles.input}
  keyboardType="numeric"
  value={newTeamDraws !== undefined ? newTeamDraws.toString() : ''}
  onChangeText={(text) => setNewDraws(Number(text))}
/>
<Text style={styles.label}>Porażki</Text>
<TextInput
  style={styles.input}
  keyboardType="numeric"
  value={newTeamLosts !== undefined ? newTeamLosts.toString() : ''}
  onChangeText={(text) => setNewLosts(Number(text))}
/>
<Text style={styles.label}>Bramki strzelone</Text>
<TextInput
  style={styles.input}
  keyboardType="numeric"
  value={newTeamGoals !== undefined ? newTeamGoals.toString() : ''}
  onChangeText={(text) => setNewGoals(Number(text))}
/>
<Text style={styles.label}>Bramki stracone</Text>
<TextInput
  style={styles.input}
  keyboardType="numeric"
  value={newTeamGoalsLost !== undefined ? newTeamGoalsLost.toString() : ''}
  onChangeText={(text) => setNewTeamGoalsLost(Number(text))}
/>
      <TouchableOpacity style={styles.modalButton} onPress={addOrUpdateTeam}>
        <Text style={styles.modalButtonText}>Zapisz zmiany</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.modalButton} onPress={() => setEditModalVisible(false)}>
        <Text style={styles.modalButtonText}>Anuluj</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<FlatList
  data={teams}
  key={refreshTable} // Dodaj ten klucz
  keyExtractor={(item) => item.id}
  renderItem={({ item, index }) => (
    <View>
      <TouchableOpacity
        onPress={() => toggleEditModal(item)}
      >
        <TableItem team={item} index={index+1}/>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteTeam(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>Usuń</Text>
      </TouchableOpacity>
    </View>
  )}
/>
</View>
<NavigationBar></NavigationBar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  tablecoachcontainer:{
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  deleteButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  modalButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default TableCoach;
