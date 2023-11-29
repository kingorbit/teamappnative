import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Header from '../components/header';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firestore, auth } from '../constants/config';
import { useNavigate } from 'react-router-native';
import NavigationBar from '../components/navBar';
import { LocaleConfig } from 'react-native-calendars';
import ModalDropdown from 'react-native-modal-dropdown'; 

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

              if (userTeams.length > 0) {
                setIsCoach(true);
              } else {
                setIsCoach(false);
              }

              // Pobierz wydarzenia po teamId
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
    // ... (reszta kodu)
  };

  const showEventDetails = (event) => {
    setSelectedEventDetails(event);
  };

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <View style={styles.calendarcontainer}>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          const selectedEvent = markedDates[day.dateString]?.eventData;
          if (selectedEvent) {
            showEventDetails(selectedEvent);
          }
        }}
        style={styles.calendar}
        theme={{
          calendarBackground: '#fff', // Kolor tła kalendarza
          textSectionTitleColor: 'black',
          selectedDayBackgroundColor: 'blue',
          selectedDayTextColor: '#ffffff',
          todayTextColor: 'green',
          dayTextColor: 'black',
          textDisabledColor: 'gray',
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
          
        }}
      />

      {user && isCoach && (
        <TouchableOpacity style={styles.addButton} onPress={() => setEventFormVisible(true)}>
          <Text style={styles.buttonText}>Dodaj Wydarzenie</Text>
        </TouchableOpacity>
      )}

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
  homeButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignSelf: 'center',
  },
  linkText: {
    color: 'white',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    margin: 50,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
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
});

export default CalendarScreen;


