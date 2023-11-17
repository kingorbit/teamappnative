import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';

const TeamStatsView = () => {
    const { user } = useAuth(); // Załóż, że masz hook do autentykacji, który dostarcza dane zalogowanego użytkownika
    const [team, setTeam] = useState(null);
    const [teamStats, setTeamStats] = useState(null);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          // Pobierz dane użytkownika
          const userRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();
  
          // Pobierz zespół użytkownika
          const teamsRef = collection(firestore, 'teams');
          const teamsQuery = query(teamsRef, where('members', 'array-contains', user.uid));
          const teamsSnapshot = await getDocs(teamsQuery);
  
          if (!teamsSnapshot.empty) {
            const userTeam = teamsSnapshot.docs[0].data();
            setTeam(userTeam);
  
            // Pobierz statystyki zespołu
            const teamStatsRef = doc(firestore, 'teamStats', userTeam.id);
            const teamStatsDoc = await getDoc(teamStatsRef);
  
            if (teamStatsDoc.exists()) {
              const teamStatsData = teamStatsDoc.data();
              setTeamStats(teamStatsData);
            }
          }
        } catch (error) {
          console.error('Błąd pobierania danych', error);
        }
      };
  
      fetchData();
    }, [user]);
  
    return (
      <View style={styles.container}>
        {team && <Text>Nazwa zespołu: {team.name}</Text>}
        {teamStats && (
          <>
            <Text>Statystyki zespołu:</Text>
            <Text>Rozegrane mecze: {teamStats.matchesPlayed}</Text>
            {/* Dodaj inne statystyki */}
          </>
        )}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  
  export default TeamStatsView;