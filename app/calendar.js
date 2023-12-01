import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Header from '../components/header';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firestore, auth } from '../constants/config';
import { useNavigate } from 'react-router-native';
import NavigationBar from '../components/navBar';
import { LocaleConfig } from 'react-native-calendars';
import ModalDropdown from 'react-native-modal-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import EventNotificationScheduler from '../components/notifications/notificationScheduler';

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
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [isEditFormVisible, setEditFormVisible] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);
  const [userIsInTeam, setUserIsInTeam] = useState(false); // Dodajemy userIsInTeam jako nowy stan


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
                    markedDates[formattedDate] = {
                      selected: true,
                      marked: true,
                      dotColor: 'blacks',
                      eventData: event,
                    };
                  });
                  console.log('Marked dates:', markedDates);
                  setMarkedDates(markedDates);
                  setUserIsInTeam(true);
                }
                else{
                  setUserIsInTeam(false);
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
      const docRef = await addDoc(eventsRef, newEvent);
      const eventId = docRef.id;
  
      // Dodajemy unikalne ID do wydarzenia
      await updateDoc(doc(eventsRef, eventId), { id: eventId });
  
      setEvents((prevEvents) => [...prevEvents, { ...newEvent, id: eventId }]);
  
      const formattedDate = eventDate.split(' ')[0];
      setMarkedDates((prevMarkedDates) => ({
        ...prevMarkedDates,
        [formattedDate]: {
          selected: true,
          marked: true,
          dotColor: 'black',
          eventData: { ...newEvent, id: eventId },
        },
      }));
      setEventName(''); // Wyczyszczenie pola eventName
      setEventCategory(''); // Wyczyszczenie pola eventCategory
      setEventDate(''); // Wyczyszczenie pola eventDate
      // Możesz dodać więcej pól, jeśli to konieczne
  
      setEventFormVisible(false);
    } catch (error) {
      console.error('Błąd dodawania zdarzenia', error);
    }
  };

  const showEventDetails = (event) => {
    setEditedEvent(event);
    setSelectedEventDetails(event);
  };
  
  const updateEvent = async () => {
    try {
      if (editedEvent && editedEvent.id) {
        const eventsRef = collection(firestore, 'events');
        const eventDocRef = doc(eventsRef, editedEvent.id);
  
        // Sprawdź, czy dokument istnieje przed aktualizacją
        const docSnapshot = await getDoc(eventDocRef);
        if (docSnapshot.exists()) {
          await updateDoc(eventDocRef, {
            eventName: editedEvent.eventName,
            eventCategory: editedEvent.eventCategory,
            eventDate: editedEvent.eventDate,
            // Dodaj inne pola, jeśli są potrzebne
          });
  
          // Zaktualizuj stan lokalny
          setEvents((prevEvents) =>
            prevEvents.map((event) =>
              event.id === editedEvent.id ? { ...event, ...editedEvent } : event
            )
          );
  
          // Zaktualizuj markedDates, jeśli data się zmieniła
          if (selectedEventDetails && editedEvent.eventDate !== selectedEventDetails.eventDate) {
            const updatedMarkedDates = { ...markedDates };
            if (selectedEventDetails.eventDate) {
              delete updatedMarkedDates[selectedEventDetails.eventDate.split(' ')[0]];
            }
            updatedMarkedDates[editedEvent.eventDate.split(' ')[0]] = {
              selected: true,
              marked: true,
              dotColor: 'black',
              eventData: editedEvent,
            };
            setMarkedDates(updatedMarkedDates);
          }
  
          setEditedEvent(null);
          setEditFormVisible(false);
        } else {
          console.error('Dokument nie istnieje.');
        }
      }
    } catch (error) {
      console.error('Błąd aktualizacji wydarzenia', error);
    }
  };
  
  const deleteEvent = async () => {
    try {
      if (selectedEventDetails && selectedEventDetails.id) {
        // Usuń zdarzenie z Firestore na podstawie identyfikatora dokumentu
        const eventsRef = collection(firestore, 'events');
        await deleteDoc(doc(eventsRef, selectedEventDetails.id));
  
        // Usuń zdarzenie ze stanu lokalnego
        const updatedEvents = events.filter(
          (event) => event.id !== selectedEventDetails.id
        );
        setEvents(updatedEvents);
  
        // Usuń zdarzenie z markedDates
        const updatedMarkedDates = { ...markedDates };
        delete updatedMarkedDates[selectedEventDetails.eventDate.split(' ')[0]];
  
        setMarkedDates(updatedMarkedDates);
  
        // Zamknij modal potwierdzenia usunięcia
        setDeleteConfirmationVisible(false);
        // Zamknij modal z szczegółami wydarzenia
        setSelectedEventDetails(null);
      }
    } catch (error) {
      console.error('Błąd usuwania zdarzenia', error);
    }
  };
  const renderUpcomingEvents = () => {
    // Sprawdź, czy użytkownik jest w zespole
    if (!userIsInTeam) {
      return (
        <View style={styles.upcomingEventsContainer}>
          <Text style={styles.sectionTitle}>Najbliższe wydarzenia:</Text>
          <View style={styles.joinTeamMessage}>
            <Text style={styles.joinTeamMessageText}>
              Dołącz do zespołu, aby zobaczyć wydarzenia!
            </Text>
          </View>
        </View>
      );
    }
  
    const upcomingEvents = events
      .filter((event) => new Date(event.eventDate) >= new Date())
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
      .slice(0, 5);
  
    return (
      <ScrollView style={styles.upcomingEventsContainer}>
        <Text style={styles.sectionTitle}>Najbliższe wydarzenia:</Text>
        {upcomingEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.upcomingEventButton}
            onPress={() => showEventDetails(event)}
          >
            <View style={styles.upcomingEventDetails}>
              <Text style={styles.upcomingEventText}>{event.eventName}</Text>
              <Text>Kategoria: {event.eventCategory}</Text>
              <Text>Data: {event.eventDate}</Text>
            </View>
            <View style={styles.daysRemainingContainer}>
              <Text style={styles.daysRemainingText}>{calculateDaysRemaining(event.eventDate)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  
  // Funkcja do obliczania pozostałych dni do zdarzenia
  const calculateDaysRemaining = (eventDate) => {
    const today = new Date();
    const eventDateTime = new Date(eventDate);
  
    // Oblicz różnicę między dzisiaj a datą wydarzenia
    const timeDifference = eventDateTime.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  
    return daysRemaining > 0 ? `Za ${daysRemaining} dni` : 'Dziś';
  };
  


  return (
    <View style={styles.container}>
          <ScrollView style={styles.childcontainer}>
      <Header user={user} setUser={setUser} />
      <Text style={styles.title}>Kalendarz</Text>
      <EventNotificationScheduler events={events} />
      <View style={styles.calendarcontainer}>
      <Calendar
  markedDates={markedDates}
  onDayPress={(day) => {
    setSelectedDate(day.dateString);
    const selectedEvent = markedDates[day.dateString]?.eventData;
    if (selectedEvent) {
      showEventDetails(selectedEvent);
    }

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
  }}
/>
        {user && isCoach && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setEventFormVisible(true)}>
              <Icon name="plus" size={17} color="black" />
              <Text style={styles.buttonText}>Dodaj Wydarzenie </Text>
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
        options={categories}
        style={styles.dropdown}
        textStyle={styles.dropdownText}
        dropdownStyle={styles.dropdownOptions}
        dropdownTextStyle={styles.dropdownOptionText}
        defaultValue="Wybierz kategorię"
        onSelect={(index, value) => setEventCategory(value)}
      />
<TextInput
  style={styles.input}
  placeholder="Wybierz datę"
  value={eventDate}
  onChangeText={(text) => {
    // Sprawdź, czy tekst zawiera tylko dozwolone znaki
    const sanitizedText = text.replace(/[^0-9.\-]/g, ''); // Pozbądź się niedozwolonych znaków

    // Sprawdź, czy liczba kropek jest mniejsza niż 2, a my musimy mieć co najmniej jedno cyfrowe
    if (
      sanitizedText.split('.').length <= 2 &&
      /^[0-9]*([.\-]?[0-9]*)*$/.test(sanitizedText)
    ) {
      setEventDate(sanitizedText);
    }
  }}
  keyboardType="numeric"
/>
      <TouchableOpacity style={[styles.addButton, { backgroundColor: '#4BB543' }]} onPress={addEvent}>
   <Text style={[styles.buttonText, { color: 'white' }]}>Dodaj</Text>
      </TouchableOpacity>
      <TouchableOpacity
  style={[styles.closeButton, { backgroundColor: 'red' }]} // Dodano styl o kolorze czerwonym
  onPress={() => setEventFormVisible(false)}
>
<Text style={[styles.buttonText, { color: 'white' }]}>Zamknij</Text>
</TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal
  visible={!!selectedEventDetails}
  transparent={true}
  animationType="slide"
  onRequestClose={() => {
    setSelectedEventDetails(null);
    setEditFormVisible(false);
  }}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {selectedEventDetails && (
        <View>
          <Text style={styles.modalTitle}>Szczegóły</Text>
          <Text>Nazwa: {selectedEventDetails.eventName}</Text>
          <Text>Kategoria: {selectedEventDetails.eventCategory}</Text>
          <Text>Data: {selectedEventDetails.eventDate}</Text>
          {isCoach && (
            <View>
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: 'red' }]}
                onPress={() => setDeleteConfirmationVisible(true)}
              >
                <Text style={[styles.buttonText, { color: 'white' }]}>Usuń</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: 'orange' }]}
                onPress={() => {
                  setEditFormVisible(true);
                  setDeleteConfirmationVisible(false);
                  setSelectedEventDetails(null);
                }}
              >
                <Text style={[styles.buttonText, { color: 'white' }]}>Edytuj</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: '#198754' }]}
            onPress={() => setSelectedEventDetails(null)}
          >
            <Text style={[styles.buttonText, { color: 'white' }]}>Zamknij</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  </View>
</Modal>
<Modal
  visible={isDeleteConfirmationVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setDeleteConfirmationVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Potwierdź Usunięcie</Text>
      <TouchableOpacity
        style={[styles.confirmDeleteButton, { backgroundColor: 'red' }]}
        onPress={deleteEvent}
      >
        <Text style={[styles.buttonText, { color: 'white' }]}>Usuń</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: '#198754' }]}
        onPress={() => setDeleteConfirmationVisible(false)}
      >
        <Text style={[styles.buttonText, { color: 'white' }]}>Anuluj</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
<Modal
  visible={isEditFormVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setEditFormVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Edytuj Wydarzenie</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa wydarzenia"
        value={editedEvent?.eventName}
        onChangeText={(text) => setEditedEvent((prev) => ({ ...prev, eventName: text }))}
      />
      <ModalDropdown
        options={categories}
        style={styles.dropdown}
        textStyle={styles.dropdownText}
        dropdownStyle={styles.dropdownOptions}
        dropdownTextStyle={styles.dropdownOptionText}
        defaultValue={editedEvent?.eventCategory || "Wybierz kategorię"}
        onSelect={(index, value) => setEditedEvent((prev) => ({ ...prev, eventCategory: value }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Wybierz datę"
        value={editedEvent?.eventDate}
        onChangeText={(text) => setEditedEvent((prev) => ({ ...prev, eventDate: text }))}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: '#4BB543' }]}
        onPress={updateEvent}
      >
        <Text style={[styles.buttonText, { color: 'white' }]}>Zapisz zmiany</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: 'red' }]}
        onPress={() => setEditFormVisible(false)}
      >
        <Text style={[styles.buttonText, { color: 'white' }]}>Anuluj</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      </View>
      {renderUpcomingEvents()}
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
    width: 75,
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
    padding: 25,
    borderRadius: 10,
    elevation: 5,
  },
  closeButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
    width: 75,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  joinTeamMessage: {
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  joinTeamMessageText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'white',
    alignSelf: 'center',
  },

  upcomingEventsContainer: {
    margin: 10,
    padding: 20,
  },

  upcomingEventButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  upcomingEventDetails: {
    flex: 1,
  },
  upcomingEventText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  daysRemainingContainer: {
    backgroundColor: 'green',
    borderRadius: 5,
    padding: 10,
    marginLeft: 10,
    width: '27%',
    height: 40,
  },
  daysRemainingText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dropdown: {
    height: 35,
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 15,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  dropdownText: {
    textAlign: 'center',
    fontSize: 13
    ,
  },
  dropdownOptions: {
    textAlign: 'center',
    width: '50%',
    borderRadius: 5,
  },
  dropdownOptionText: {
    textAlign: 'center',
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
    width: 75,
  },
  editButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
    width: 75,
  },
  confirmDeleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
    width: 75,
    marginBottom: 10,
  }
});

export default CalendarScreen;


