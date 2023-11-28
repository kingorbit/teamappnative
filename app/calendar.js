import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import { Agenda } from 'react-native-calendars';
import Header from '../components/header';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firestore, auth } from '../constants/config';
import NavigationBar from '../components/navBar';

const Calendar = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCoach, setIsCoach] = useState(false);
  const [isEventFormVisible, setEventFormVisible] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [teams, setTeams] = useState([]); // Dodane

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
  
            // Uzyskaj teamId
            const teamId = userTeams.length > 0 ? userTeams[0].team.teamId : null;
  
            if (teamId) {
              // Log 1
              console.log('Team ID:', teamId);
  
              // Pobierz wydarzenia po teamId
              const eventsRef = collection(firestore, 'calendars', teamId, 'years', '2023', 'months');
              const eventsQuerySnapshot = await getDocs(eventsRef);
  
              if (!eventsQuerySnapshot.empty) {
                let updatedEvents = {};
  
                for (const monthDoc of eventsQuerySnapshot.docs) {
                  const monthData = monthDoc.data();
  
                  // Log 2
                  console.log('Miesiąc:', monthData);
  
                  const month = monthData.month; // Dodać poprawne pobieranie miesiąca
  
                  const daysRef = collection(monthDoc.ref, 'days');
                  const daysQuerySnapshot = await getDocs(daysRef);
  
                  if (!daysQuerySnapshot.empty) {
                    let monthEvents = {};
  
                    // Log 3
                    console.log('Dni w miesiącu:', daysQuerySnapshot.docs.length);
  
                    for (const dayDoc of daysQuerySnapshot.docs) {
                      const dayData = dayDoc.data();
  
                      // Log 4
                      console.log('Dzień:', dayData);
  
                      monthEvents[dayData.day] = dayData.events; // Dodać poprawne pobieranie wydarzeń dla danego dnia
                    }
  
                    updatedEvents[month] = monthEvents;
                  }
                }
  
                // Log 5
                console.log('Pobrano wszystkie dane:', updatedEvents);
  
                setEvents(updatedEvents);
              } else {
                console.log('Brak wydarzeń dla zespołu');
              }
            } else {
              console.log('Użytkownik nie ma przypisanego zespołu');
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
  }, []);
  

  const addEvent = async () => {
    if (selectedDate && user && isCoach && eventName && eventCategory && eventDate) {
      const event = {
        eventDate: eventDate,
        eventId: `${user.teamId}_${user.uid}_${new Date().getTime()}`,
        eventName: eventName,
        eventCategory: eventCategory,
        teamId: user.teamId,
        uid: user.uid,
      };

      try {
        const docRef = await addDoc(collection(firestore, 'calendars', user.teamId, 'years', '2023', 'months', '11', 'days'), {
          day: 24,
          events: [event],
        });
        console.log('Event added successfully!', docRef.id);
        setEventFormVisible(false);
      } catch (error) {
        console.error('Error adding event:', error);
      }
    }
  };
  

  return (
    <View style={styles.container}>
    <Header user={user} setUser={setUser} />
    <Agenda
      items={formattedEvents}
      renderItem={(item) => (
        <View style={styles.item}>
          {item.map((event) => (
            <Text key={event.eventId}>{event.eventName}</Text>
          ))}
        </View>
      )}
      onDayPress={(day) => {
        setSelectedDate(day.dateString);
        if (user && isCoach) {
          setEventFormVisible(true);
        }
      }}
      pastScrollRange={12}
      futureScrollRange={12}
      hideExtraDays={false}
      style={styles.agenda}
    />
    <TouchableOpacity style={styles.homeButton} onPress={() => navigate('/home')}>
      <Text style={styles.linkText}>Powrót do Home</Text>
    </TouchableOpacity>

    {user && isCoach && (
      <TouchableOpacity style={styles.addButton} onPress={() => setEventFormVisible(true)}>
        <Text style={styles.buttonText}>Dodaj Wydarzenie</Text>
      </TouchableOpacity>
    )}

    <Modal
      animationType="slide"
      transparent={true}
      visible={isEventFormVisible}
      onRequestClose={() => setEventFormVisible(false)}
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Dodaj Wydarzenie</Text>
        <TextInput
          style={styles.input}
          placeholder="Nazwa wydarzenia"
          onChangeText={(text) => setEventName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Kategoria"
          onChangeText={(text) => setEventCategory(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Data (np. 21.11.2023 17:00)"
          onChangeText={(text) => setEventDate(text)}
        />
        <TouchableOpacity style={styles.button} onPress={addEvent}>
          <Text style={styles.buttonText}>Dodaj</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  agenda: {
    flex: 1,
    ...Platform.select({
      ios: {
        paddingTop: 64,
      },
      android: {},
    }),
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default Calendar;
