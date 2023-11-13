import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, FieldValue, getDoc, arrayRemove } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';

const ManageTeam = () => {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [founderData, setFounderData] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
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

              const membersData = [];
              for (const memberUid of teamData.members) {
                const memberQuery = query(usersRef, where('uid', '==', memberUid));
                const memberSnapshot = await getDocs(memberQuery);

                if (!memberSnapshot.empty) {
                  const memberData = memberSnapshot.docs[0].data();
                  membersData.push(`${memberData.firstName} ${memberData.lastName}`);
                }
              }

              userTeams.push({
                team: teamData,
                members: membersData,
              });
            }
            setTeams(userTeams);
          }
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRemoveMember = async (memberUid) => {
    try {
      if (!teams || teams.length === 0) {
        console.error('Brak danych o zespole.');
        return;
      }
  
      const teamId = teams[0].team.teamId;
  
      // Usuń członka zespołu
      const updatedMembers = teams[0].team.members.filter((member) => member !== memberUid);
  
      // Zaktualizuj kolekcję teams
      await updateDoc(doc(firestore, 'teams', teamId), { members: updatedMembers });
  
      // Aktualizuj lokalny stan teams
      setTeams((prevTeams) => {
        const updatedTeams = [...prevTeams];
        const updatedTeamIndex = updatedTeams.findIndex((team) => team.team.teamId === teamId);
  
        if (updatedTeamIndex !== -1) {
          updatedTeams[updatedTeamIndex] = {
            ...updatedTeams[updatedTeamIndex],
            team: {
              ...updatedTeams[updatedTeamIndex].team,
              members: updatedMembers,
            },
          };
        }
  
        console.log('Updated Teams:', updatedTeams);
  
        return updatedTeams;
      });
  
      console.log('Members after update:', updatedMembers); // Dodaj ten log
  
      Alert.alert('Sukces', 'Członek zespołu został usunięty.');
    } catch (error) {
      console.error('Błąd usuwania członka zespołu', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania członka zespołu.');
      console.log('Teams after update:', teams);
    }
  };
  
  
  
  
  

  const handleUpdateTeamInfo = async () => {
    try {
      const teamRef = doc(firestore, 'teams', teams[0].team.teamId);
      await updateDoc(teamRef, {
        name: newName || teams[0].team.name,
        description: newDescription || teams[0].team.description,
      });
      setNewName('');
      setNewDescription('');
      Alert.alert('Sukces', 'Informacje o zespole zostały zaktualizowane.');
    } catch (error) {
      console.error('Błąd aktualizacji informacji o zespole', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas aktualizacji informacji o zespole.');
    }
  };

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {teams.length > 0 ? (
          <>
            <Text style={styles.title}>Zarządzaj Zespołem</Text>
            {teams.map((team, index) => (
              <View key={index} style={styles.teamInfo}>
                <Text style={styles.info}>Nazwa Zespołu: {team.team.name}</Text>
                <Text style={styles.info}>Opis: {team.team.description}</Text>
                {founderData && (
                  <Text style={styles.info}>Założyciel: {`${founderData.firstName} ${founderData.lastName}`}</Text>
                )}
                <Text style={styles.info}>Kod dołączania do drużyny: {team.team.joinCode}</Text>
                <Text style={styles.membersTitle}>Członkowie:</Text>
                {team.members.map((member, index) => (
                  <View key={index} style={styles.memberContainer}>
                    <Text style={styles.member}>{member}</Text>
                    <TouchableOpacity onPress={() => handleRemoveMember(member)}>
                      <Text style={styles.removeMemberText}>Usuń</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <Text style={styles.info}>Zmień nazwę zespołu:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nowa nazwa zespołu"
                  value={newName}
                  onChangeText={(text) => setNewName(text)}
                />
                <Text style={styles.info}>Zmień opis zespołu:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nowy opis zespołu"
                  value={newDescription}
                  onChangeText={(text) => setNewDescription(text)}
                />
                <TouchableOpacity style={styles.button} onPress={handleUpdateTeamInfo}>
                  <Text style={styles.buttonText}>Zaktualizuj informacje o zespole</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.info}>Nie jesteś członkiem żadnego zespołu.</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={() => navigate('/team')}>
          <Text style={styles.buttonText}>Powrót</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  scrollView: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  teamInfo: {
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  membersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: 'white',
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  member: {
    fontSize: 16,
    marginBottom: 5,
    color: 'white',
  },
  removeMemberText: {
    fontSize: 16,
    color: 'red',
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
  input: {
    height: 40,
    width: '100%',
    borderColor: 'white',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    color: 'white',
  },
});

export default ManageTeam;
