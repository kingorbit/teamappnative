import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TouchableHighlight } from 'react-native';
import { Link } from 'react-router-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../../constants/config';
import Header from '../header';
import { getDocs, collection, query, where, doc, getDoc } from 'firebase/firestore';

const PlayerStatsView = () => {
  const [user, setUser] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [userData, setUserData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('2023'); // Domyślny sezon
  const [seasons, setSeasons] = useState([]); // Dostępne sezony
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMemberStats, setSelectedMemberStats] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchData = async (userData) => {
      try {
        console.log('Próba pobrania statystyk dla użytkownika:', userData);
        console.log('UID użytkownika:', userData.uid);
  
        const userStatsRef = doc(firestore, 'playerStats', userData.uid);
        const userStatsDoc = await getDocs(collection(userStatsRef, 'seasons'));
  
        if (!userStatsDoc.empty) {
          // Pobierz dostępne sezony
          const availableSeasons = userStatsDoc.docs.map(doc => doc.id);
          setSeasons(availableSeasons);
  
          const selectedSeasonDoc = userStatsDoc.docs.find(doc => doc.id === selectedSeason);
  
          if (selectedSeasonDoc) {
            const selectedSeasonData = selectedSeasonDoc.data();
            setPlayerStats(selectedSeasonData);
            console.log(`Pobrano statystyki dla sezonu ${selectedSeason}:`, selectedSeasonData);
          } else {
            console.log(`Brak statystyk dla sezonu ${selectedSeason}`);
          }
        } else {
          console.log('Brak statystyk dla użytkownika');
        }
  
        const usersCollectionRef = collection(firestore, 'users');
        const userQuery = query(usersCollectionRef, where('uid', '==', userData.uid));
        const userQuerySnapshot = await getDocs(userQuery);
  
        if (!userQuerySnapshot.empty) {
          const userData = userQuerySnapshot.docs[0].data();
          setUserData(userData);
          console.log('Dane użytkownika:', userData);
  
          if (userData?.teamId) {
            const teamRef = doc(firestore, 'teams', userData.teamId);
            const teamDoc = await getDoc(teamRef);
  
            if (teamDoc.exists()) {
              const teamData = teamDoc.data();
              setTeamData(teamData);
              setTeamMembers(teamData.members); // Dodano pobieranie listy członków zespołu
              console.log('Dane zespołu:', teamData);
            } else {
              console.log('Brak danych dla zespołu');
            }
          } else {
            const teamsRef = collection(firestore, 'teams');
            const teamsQuery = query(teamsRef, where('members', 'array-contains', userData.uid));
            const teamsSnapshot = await getDocs(teamsQuery);
  
            if (!teamsSnapshot.empty) {
              const teamDoc = teamsSnapshot.docs[0];
              const teamData = teamDoc.data();
              setTeamData(teamData);
              setTeamMembers(teamData.members); // Dodano pobieranie listy członków zespołu
              console.log('Dane zespołu:', teamData);
            } else {
              console.log('Brak zespołu dla użytkownika');
            }
          }
        } else {
          console.log('Brak danych dla użytkownika');
        }
      } catch (error) {
        console.error('Błąd pobierania danych:', error);
      }
    };
  
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      if (userData) {
        setUser(userData);
        console.log('Zalogowano użytkownika:', userData);
        fetchData(userData);
      } else {
        console.log('Użytkownik wylogowany');
      }
    });
  
    return () => unsubscribe();
  }, [selectedSeason])
  const handleSeasonChange = (selectedSeason) => {
    setSelectedSeason(selectedSeason);
    setModalVisible(false);
  };

  const handleMemberSelect = async (memberUid) => {
    try {
      const memberStatsRef = doc(firestore, 'playerStats', memberUid);
      const memberStatsDoc = await getDocs(collection(memberStatsRef, 'seasons'));

      if (!memberStatsDoc.empty) {
        const selectedMemberSeasonDoc = memberStatsDoc.docs.find(doc => doc.id === selectedSeason);

        if (selectedMemberSeasonDoc) {
          const selectedMemberSeasonData = selectedMemberSeasonDoc.data();
          setSelectedMemberStats(selectedMemberSeasonData);
          setSelectedMember(memberUid);
          setModalVisible(true);
        } else {
          console.log(`Brak statystyk dla sezonu ${selectedSeason} użytkownika ${memberUid}`);
        }
      } else {
        console.log(`Brak statystyk dla użytkownika ${memberUid}`);
      }
    } catch (error) {
      console.error('Błąd pobierania danych członka zespołu:', error);
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container} >
      <Header />
      <View style={styles.contentContainer}>
        <ScrollView>
        <Text style={styles.title}>Twoje Statystyki</Text>
        <TouchableOpacity onPress={toggleModal} style={styles.seasonButton}>
          <Text>Aktualny sezon: {selectedSeason}</Text>
        </TouchableOpacity>
        {teamMembers.map((member) => (
  <TouchableOpacity key={member.uid} onPress={() => handleMemberSelect(member.uid)}>
    <Text style={styles.textStyle}>{member.name}</Text>
  </TouchableOpacity>
))}
        

          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Wybierz sezon</Text>

                <TouchableHighlight
                  style={{ ...styles.openButton, backgroundColor: '#2196F3' }}
                  onPress={() => handleSeasonChange('2022')}
                >
                  <Text style={styles.textStyle}>Sezon 2022</Text>
                </TouchableHighlight>

                <TouchableHighlight
                  style={{ ...styles.openButton, backgroundColor: '#2196F3' }}
                  onPress={() => handleSeasonChange('2023')}
                >
                  <Text style={styles.textStyle}>Sezon 2023</Text>
                </TouchableHighlight>

                {/* Dodaj inne sezony, jeśli są dostępne */}
              </View>
            </View>
          </Modal>


        {playerStats && userData && teamData && (
          <View style={styles.statsContainer}>
            <Text style={styles.statItem}>Imię: {userData.firstName}</Text>
            <Text style={styles.statItem}>Nazwisko: {userData.lastName}</Text>
            <Text style={styles.statItem}>Pozycja: {userData.position}</Text>
            <Text style={styles.statItem}>Drużyna: {teamData.name}</Text>
            <Text style={styles.statItem}>Mecze rozegrane: {playerStats.matchesPlayed}</Text>
            <Text style={styles.statItem}>Mecze rozegrane u siebie: {playerStats.matchesPlayedHome}</Text>
            <Text style={styles.statItem}>Mecze rozegrane na wyjezdzie {playerStats.matchesPlayedAway}</Text>
            <Text style={styles.statItem}>Bramki: {playerStats.goals}</Text>
            <Text style={styles.statItem}>Bramki u siebie: {playerStats.goalsHome}</Text>
            <Text style={styles.statItem}>Bramki na wyjeżdzie: {playerStats.goalsAway}</Text>
            <Text style={styles.statItem}>Asysty: {playerStats.assists}</Text>
            <Text style={styles.statItem}>Asysty u siebie: {playerStats.assistsHome}</Text>
            <Text style={styles.statItem}>Asysty na wyjezdzie: {playerStats.assistsAway}</Text>
            <Text style={styles.statItem}>Strzały: {playerStats.shots}</Text>
            <Text style={styles.statItem}>Strzały u siebie: {playerStats.shotsHome}</Text>
            <Text style={styles.statItem}>Strzały na wyjezdzie: {playerStats.shotsAway}</Text>
            <Text style={styles.statItem}>Żółte kartki: {playerStats.yellowCards}</Text>
            <Text style={styles.statItem}>Żółte kartki u siebie: {playerStats.yellowCardsHome}</Text>
            <Text style={styles.statItem}>Żółte kartki na wyjezdzie: {playerStats.yellowCardsAway}</Text>

          </View>
        )}
        </ScrollView>
        <Link to="/stats" style={styles.link}>
          <Text style={styles.linkText}>Powrót</Text>
        </Link>

      </View>
      
    </View>
  );
};

const styles = {
  container:{
    backgroundColor: '#9091fd',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  link: {
    padding: 10,
    marginTop: 70,
    marginLeft: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    elevation: 3,
    width: '75%',
    backgroundColor: '#f0f0f0',
    },
    linkText: {
    color: 'black',
    fontWeight: 'bold',
    },
  seasonButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  statsContainer: {
    marginTop: 10,
    width: '100%',
  },
  statItem: {
    fontSize: 18,
    marginBottom: 10,
  },
  noData: {
    fontSize: 18,
    color: 'red',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginBottom: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statsContainer: {
    marginTop: 10,
    width: '100%',
  },
  statItem: {
    fontSize: 18,
    marginBottom: 10,
  },
  link: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    width: '50%',
    backgroundColor: '#f0f0f0',
  },
  linkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
};

export default PlayerStatsView;
