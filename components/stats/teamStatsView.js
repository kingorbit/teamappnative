import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableHighlight } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../../constants/config';
import { getDocs, collection, query, where, doc, getDoc } from 'firebase/firestore';
import Header from '../header';
import { useNavigate } from 'react-router-native';
import { lightTheme, darkTheme } from '../theme';

const TeamStatsView = () => {
  const [user, setUser] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [teamStats, setTeamStats] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('2023'); // Domyślny sezon
  const [theme, setTheme] = useState(darkTheme);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async (userData) => {
      try {
        console.log('Próba pobrania danych zespołu dla użytkownika:', userData);
        console.log('UID użytkownika:', userData.uid);

        const teamsRef = collection(firestore, 'teams');
        const teamsQuery = query(teamsRef, where('members', 'array-contains', userData.uid));
        const teamsSnapshot = await getDocs(teamsQuery);

        if (!teamsSnapshot.empty) {
          // Zakładamy, że użytkownik należy do jednego zespołu (możesz dostosować ten fragment, jeśli użytkownik może należeć do wielu zespołów)
          const teamDoc = teamsSnapshot.docs[0];
          const teamData = teamDoc.data();
          setTeamData(teamData);
          console.log('Dane zespołu:', teamData);

          // Pobierz dane zespołowe
          const teamStatsRef = doc(firestore, 'teamStats', teamDoc.id, 'seasons', selectedSeason);
          const teamStatsDoc = await getDoc(teamStatsRef);

          if (teamStatsDoc.exists()) {
            const teamStatsData = teamStatsDoc.data();
            setTeamStats(teamStatsData);
            console.log('Dane zespołowe:', teamStatsData);
          } else {
            console.log('Brak danych zespołowych dla wybranego sezonu');
          }
        } else {
          console.log('Brak zespołu dla użytkownika');
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
        fetchUserSettings(userData.uid, setTheme);
      } else {
        console.log('Użytkownik wylogowany');
      }
    });

    return () => unsubscribe();
  }, [selectedSeason]); // Dodane selectedSeason do zależności useEffect

  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
    setModalVisible(!isModalVisible);
  };

  const fetchUserSettings = async (uid, setTheme) => {
    try {
      const userDocRef = doc(firestore, 'users', uid);
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (userDocSnapshot.exists()) {
        const userDataFromFirestore = userDocSnapshot.data();
        const darkModeEnabled = userDataFromFirestore.darkModeEnabled || false;
        setTheme(darkModeEnabled ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error.message);
    }
  };
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  if (!teamData) {
    return <Text style={styles.noData}>Brak danych zespołu</Text>;
  }

  return (
<View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Header />
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.textColor }]}>Statystyki Zespołowe</Text>

        <TouchableOpacity  onPress={toggleModal}style={[styles.seasonButton, { backgroundColor: theme.buttonColor }]}>
          <Text style={[styles.linkText, { color: theme.textColor }]}>Aktualny sezon: {selectedSeason}</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => {
            setModalVisible(!isModalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { backgroundColor: theme.buttonColor }]}>
              <Text style={[styles.modalText, { color: theme.textColor }]}>Wybierz sezon</Text>

              <TouchableHighlight
                style={{ ...styles.openButton, backgroundColor: '#2196F3' }}
                onPress={() => handleSeasonChange('2022')}
              >
                <Text style={[styles.textStyle, { color: theme.textColor }]}>Sezon 2022</Text>
              </TouchableHighlight>

              <TouchableHighlight
                style={{ ...styles.openButton, backgroundColor: '#2196F3' }}
                onPress={() => handleSeasonChange('2023')}
              >
                <Text style={[styles.textStyle, { color: theme.textColor }]}>Sezon 2023</Text>
              </TouchableHighlight>
            </View>
            
          </View>
        </Modal>

        {teamStats ? (
          <View style={styles.statsContainer}>
            <Text style={[styles.statItem, { color: theme.textColor }]}>Mecze zespołu: {teamStats.matchesPlayed}</Text>
            <Text style={[styles.statItem, { color: theme.textColor }]}>Mecze zespołu u siebie: {teamStats.matchesPlayedHome}</Text>
            <Text style={[styles.statItem, { color: theme.textColor }]}>Mecze zespołu na wyjeżdzie: {teamStats.matchesPlayedAway}</Text>
            <Text style={[styles.statItem, { color: theme.textColor }]}>Wygrane zespołu: {teamStats.wins}</Text>
            <Text style={[styles.statItem, { color: theme.textColor }]}>Wygrane zespołu u siebie: {teamStats.winsHome}</Text>
            <Text style={[styles.statItem, { color: theme.textColor }]}>Wygrane zespołu na wyjezdzie: {teamStats.winsAway}</Text>
            <Text style={[styles.statItem, { color: theme.textColor }]}>Remisy zespołu: {teamStats.draws}</Text>
            <Text style={[styles.statItem, { color: theme.textColor }]}>Remisy zespołu u siebie: {teamStats.drawsHome}</Text>
            <Text style={[styles.statItem, { color: theme.textColor }]}>Remisy zespołu na wyjezdzie: {teamStats.drawsAway}</Text>
            <Text style={[styles.statItem, { color: theme.textColor }]}>Porazki zespołu: {teamStats.losses}</Text>
            <Text style={[styles.statItem, { color: theme.textColor }]}>Porazki zespołu u siebie: {teamStats.lossesHome}</Text>
            <Text style={[styles.statItem, { color: theme.textColor }]}>Porazki zespołu na wyjezdzie: {teamStats.lossesAway}</Text>

          </View>
        ) : (
          <Text style={styles.noData}>Brak danych zespołowych dla wybranego sezonu</Text>
        )}
          <TouchableOpacity style={[styles.link, { backgroundColor: theme.buttonColor }]} onPress={() => navigate('/team')}>
            <Text style={[styles.linkText, { color: theme.textColor }]}>Powrót</Text>
          </TouchableOpacity>
      </View>
      
    </View>
  );
};

const styles = {
  container: {
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
  // Modal styles
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
};

export default TeamStatsView;
