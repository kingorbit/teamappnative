import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { collection, doc, getDoc, setDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../../constants/config';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../header';

const TeamStats = () => {
  const [user, setUser] = useState(null);
  const [teamStats, setTeamStats] = useState({
    points: 0,
    wins: 0,
    shots: 0,
    // Dodaj inne statystyki, których chcesz śledzić
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        setUser(userData);
        
        if (userData.isCoach && userData.team) {
          // Sprawdź, czy użytkownik jest trenerem i ma zespół
          fetchTeamStats();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTeamStats = async () => {
    try {
      const teamStatsDocRef = doc(firestore, 'teamStats', user.team);
      const teamStatsDocSnap = await getDoc(teamStatsDocRef);

      if (teamStatsDocSnap.exists()) {
        setTeamStats(teamStatsDocSnap.data());
      } else {
        await setDoc(teamStatsDocRef, {
          points: 0,
          wins: 0,
          shots: 0,
          // Dodaj inne statystyki, których chcesz śledzić
        });
      }
    } catch (error) {
      console.error('Błąd podczas pobierania statystyk drużyny', error);
    }
  };

  const updateTeamStats = async () => {
    try {
      const teamStatsDocRef = doc(firestore, 'teamStats', user.team);
      await setDoc(teamStatsDocRef, {
        ...teamStats,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Błąd podczas aktualizacji statystyk drużyny', error);
    }
  };

  const handleStatChange = (statName, value) => {
    setTeamStats((prevStats) => ({
      ...prevStats,
      [statName]: value,
    }));
  };

  if (!user || !user.isCoach || !user.team) {
    // Jeśli użytkownik nie jest trenerem lub nie ma zespołu, wyświetl odpowiedni komunikat
    return (
      <View style={styles.container}>
        <Header user={user} setUser={setUser} />
        <Text style={styles.errorText}>
          Musisz być trenerem i mieć przypisany zespół, aby edytować statystyki drużyny.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <View style={styles.teamStatsContainer}>
        <Text style={styles.title}>Statystyki Drużyny</Text>
        <View style={styles.statInputContainer}>
          <Text style={styles.statLabel}>Punkty:</Text>
          <TextInput
            style={styles.statInput}
            value={teamStats.points.toString()}
            onChangeText={(text) => handleStatChange('points', parseInt(text) || 0)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.statInputContainer}>
          <Text style={styles.statLabel}>Zwycięstwa:</Text>
          <TextInput
            style={styles.statInput}
            value={teamStats.wins.toString()}
            onChangeText={(text) => handleStatChange('wins', parseInt(text) || 0)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.statInputContainer}>
          <Text style={styles.statLabel}>Strzały:</Text>
          <TextInput
            style={styles.statInput}
            value={teamStats.shots.toString()}
            onChangeText={(text) => handleStatChange('shots', parseInt(text) || 0)}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={updateTeamStats}>
          <Text style={styles.saveButtonText}>Zapisz</Text>
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
  statInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    color: 'white',
  },
  statInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  saveButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginTop: 50,
  },
});

export default TeamStats;
