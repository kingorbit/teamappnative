import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Header from '../components/header';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firestore, auth } from '../constants/config';
import { useNavigate } from 'react-router-native';
import NavigationBar from '../components/navBar';
import { LocaleConfig } from 'react-native-calendars';
import ModalDropdown from 'react-native-modal-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import DatePicker from 'react-native-datepicker';

LocaleConfig.locales['pl'] = {
  monthNames: [
    'Styczeń',
    'Luty',
    'Marzec',
    'Kwiecień',
    'Maj',
    'Czerwiec',
    'Lipiec',
    'Sierpień',
    'Wrzesień',
    'Październik',
    'Listopad',
    'Grudzień',
  ],
  monthNamesShort: [
    'Styczeń',
    'Luty',
    'Marzec',
    'Kwiecień',
    'Maj',
    'Czerwiec',
    'Lipiec',
    'Sierpień',
    'Wrzesień',
    'Październik',
    'Listopad',
    'Grudzień',
  ],
  dayNames: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
  dayNamesShort: ['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'],
};
const categoryColors = {
  'Mecz Pucharowy': 'red',
  'Mecz Ligowy': 'green',
  'Trening': 'blue',
  // Dodaj inne kategorie i kolory według potrzeb
};

LocaleConfig.defaultLocale = 'pl';

const CalendarScreen = () => {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCoach, setIsCoach] = useState(false);
  const [isEventFormVisible, setEventFormVisible] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const categories = ['Mecz Ligowy', 'Mecz Pucharowy', 'Sparing', 'Trening', 'Siłownia'];
  const [eventDate, setEventDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (userData) => {
        if (userData) {
          try {
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('uid', '==', userData.uid));
            const querySnapshot = await getDocs(q);
  
            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data();
              setUser(userData);
  
              // Ustaw isCoach na podstawie pola isCoach w danych użytkownika
              setIsCoach(userData.isCoach);
  
              // Sprawdź, czy użytkownik jest w zespołach
              const teamsRef = collection(firestore, 'teams');
              const teamsQuery = query(teamsRef, where('members', 'array-contains', userData.uid));
              const teamsSnapshot = await getDocs(teamsQuery);
  
              const userTeams = [];
              for (const teamDoc of teamsSnapshot.docs) {
                const teamData = teamDoc.data();
  
                // Pobierz imiona i nazwiska członków zespołu
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
  
              // Pobierz wydarzenia po teamId
              if (userTeams[0] && userTeams[0].team.teamId) {
                const eventsRef = collection(firestore, 'events');
                const eventsQuery = query(eventsRef, where('teamId', '==', userTeams[0].team.teamId));
                const eventsSnapshot = await getDocs(eventsQuery);
  
                if (!eventsSnapshot.empty) {
                  const teamEvents = [];
                  eventsSnapshot.forEach((eventDoc) => {
                    const eventData = eventDoc.data();
                    teamEvents.push(eventData);
                  });
                  console.log('Team events:', teamEvents);
                  setEvents(teamEvents);
  
                  // Dodaj console log, aby sprawdzić, czy dane są poprawnie przekazywane
                  const markedDates = {};
                  teamEvents.forEach((event) => {
                    // Przekształć datę do odpowiedniego formatu
                    const formattedDate = event.eventDate.split(' ')[0];
                    let selectedDayBackgroundColor = 'black'; // Kolor domyślny
                  switch (event.eventCategory) {
    case 'Mecz Pucharowy':
      selectedDayBackgroundColor = 'red';
      break;
    case 'Mecz Ligowy':
      selectedDayBackgroundColor = 'green';
      break;
    case 'Trening':
      selectedDayBackgroundColor = 'blue';
      break;
    // Dodaj inne przypadki dla innych kategorii
    default:
      break;
  }

                    markedDates[formattedDate] = {
                      selected: true,
                      marked: true,
                      dotColor: 'blacks',
                      eventData: event,
                    };
                  });
                  console.log('Marked dates:', markedDates);
                  setMarkedDates(markedDates);
                }
              }
            }
          } catch (error) {
            console.error('Błąd pobierania danych użytkownika', error);
          }
        }
      });
  
      return () => {
        unsubscribe();
      };
    };
  
    fetchData();
  }, []);

  const addEvent = async () => {
    try {
      if (!eventCategory || !eventName || !eventDate) {
        console.error('Proszę wypełnić wszystkie pola');
        return;
      }

      const newEvent = {
        eventName,
        eventCategory,
        eventDate,
        teamId: teams.length > 0 ? teams[0].team.teamId : '', // Ustawia teamId na pierwszy zespół trenera
        // Dodaj inne pola, jeśli są potrzebne
      };

      const eventsRef = collection(firestore, 'events');
      await addDoc(eventsRef, newEvent);

      setEvents((prevEvents) => [...prevEvents, newEvent]);

      const formattedDate = eventDate.split(' ')[0];
      setMarkedDates((prevMarkedDates) => ({
        ...prevMarkedDates,
        [formattedDate]: {
          selected: true,
          marked: true,
          dotColor: 'blacks',
          eventData: newEvent,
        },
      }));

      setEventFormVisible(false);
    } catch (error) {
      console.error('Błąd dodawania zdarzenia', error);
    }
  };

  const showEventDetails = (event) => {
    setSelectedEventDetails(event);
  };


  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <Text style={styles.title}>Kalendarz</Text>
      <View style={styles.calendarcontainer}>
      <Calendar
  markedDates={markedDates}
  onDayPress={(day) => {
    setSelectedDate(day.dateString);
    const selectedEvent = markedDates[day.dateString]?.eventData;
    if (selectedEvent) {
      showEventDetails(selectedEvent);
    }

    // Dodaj dynamiczną zmianę koloru tła w zależności od kategorii
    const categoryColor = categoryColors[selectedEvent?.eventCategory];
    if (categoryColor) {
      const updatedMarkedDates = { ...markedDates };
      updatedMarkedDates[day.dateString] = {
        ...updatedMarkedDates[day.dateString],
        selectedDayBackgroundColor: categoryColor,
      };
      setMarkedDates(updatedMarkedDates);
    }
  }}
  style={styles.calendar}
  theme={{
    // ... inne ustawienia tematu
    dotColor: 'yellow',
    selectedDotColor: '#ffffff',
    arrowColor: 'black',
    monthTextColor: 'black',
    textDayFontFamily: 'monospace',
    textMonthFontFamily: 'monospace',
    textDayHeaderFontFamily: 'monospace',
    textDayFontWeight: '300',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '300',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 16,
    // Dodaj nową sekcję do ustawiania kolorów kropek
    todayTextColor: 'green',
    dayTextColor: 'black',
    textDisabledColor: 'gray',
    // Dostosuj kolory kropek w zależności od kategorii
    markedDates: markedDates,
    markingType: 'period',
    periodStyles: {
      // Dodaj tę sekcję
      MeczPucharowy: {
        selectedDayBackgroundColor: 'blue',
        color: 'white',
      },
      MeczLigowy: {
        selectedDayBackgroundColor: 'blue',
        color: 'white',
      },
      Trening: {
        selectedDayBackgroundColor: 'blue',
        color: 'white',
      },
      // Dodaj inne kategorie według potrzeb
    },
  }}
/>
        {user && isCoach && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setEventFormVisible(true)}>
              <Icon name="plus" size={17} color="black" />
              <Text style={styles.buttonText}>Dodaj</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <Icon name="gear" size={17} color="black" />
              <Text style={styles.buttonText}>Edytuj</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <Icon name="ban" size={17} color="black" />
              <Text style={styles.buttonText}>Usuń</Text>
            </TouchableOpacity>
          </View>
        )}
       
<Modal
  visible={isEventFormVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setEventFormVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Dodaj Wydarzenie</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa wydarzenia"
        value={eventName}
        onChangeText={(text) => setEventName(text)}
      />
      <ModalDropdown
        style={styles.input}
        options={categories}
        defaultValue="Wybierz kategorię"
        onSelect={(index, value) => setEventCategory(value)}
      />
      {/* Zastąp TextInput komponentem DatePicker */}
      <DatePicker
        style={styles.input}
        date={eventDate}
        mode="date"
        placeholder="Wybierz datę"
        format="YYYY-MM-DD"
        minDate="2000-01-01"
        maxDate="2100-12-31"
        confirmBtnText="Potwierdź"
        cancelBtnText="Anuluj"
        customStyles={{
          dateInput: {
            borderWidth: 0,
          },
          // Możesz dostosować pozostałe style według potrzeb
        }}
        onDateChange={(date) => setEventDate(date)}
      />
      <TouchableOpacity style={styles.addButton} onPress={addEvent}>
        <Text style={styles.buttonText}>Dodaj</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setEventFormVisible(false)}
      >
        <Text style={styles.buttonText}>Anuluj</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      <Modal
        visible={!!selectedEventDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedEventDetails(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedEventDetails && (
              <View>
                <Text>Nazwa: {selectedEventDetails.eventName}</Text>
                <Text>Kategoria: {selectedEventDetails.eventCategory}</Text>
                <Text>Data: {selectedEventDetails.eventDate}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedEventDetails(null)}
                >
                  <Text style={styles.buttonText}>Zamknij</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  calendarcontainer: {
    flex: 1,

  },
  calendar: {
    marginBottom: 10, // Dodano margines na dole kalendarza
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginBottom: 15,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  iconButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: '27%',
  },
  addButton: {
    padding: 10,
    borderRadius: 5,
    margin: 10,
    width: '50%',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
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
    elevation: 5,
  },
  closeButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default CalendarScreen;


