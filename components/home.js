import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { firestore } from '../constants/config';
import { getFirestore, collection, query, where, onSnapshot, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { auth } from '../constants/config';
import Header from './header';
import NavigationBar from './navBar';

const Home = () => {
  const [user, setUser] = useState(null);
  const [userAdditionalData, setUserAdditionalData] = useState(null);
  const [coachMessages, setCoachMessages] = useState([]);
  const [upcomingEvent, setUpcomingEvent] = useState(null);

  const fetchUserData = async (userId) => {
    const userDocRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData;
    }

    return null;
  };

  const fetchLatestEvent = async () => {
    const currentDate = new Date().toISOString();
    const eventsQuery = query(
      collection(getFirestore(), 'events'),
      where('eventDate', '>=', currentDate),
      orderBy('eventDate'),
      limit(1)
    );
  
    const eventsSnapshot = await getDocs(eventsQuery);
  
    if (!eventsSnapshot.empty) {
      const latestEventData = eventsSnapshot.docs[0].data();
      return latestEventData;
    }
  
    return null;
  };
  

  const fetchLatestEventData = async () => {
    const latestEvent = await fetchLatestEvent();
    setUpcomingEvent(latestEvent);
  };

  const calculateDaysRemaining = (eventDate) => {
    const today = new Date();
    const eventDateTime = new Date(eventDate);

    // Oblicz różnicę między dzisiaj a datą wydarzenia
    const timeDifference = eventDateTime.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysRemaining > 0 ? `Za ${daysRemaining} dni` : 'Dziś';
  };

  const fetchCoachMessages = async (userId) => {
    const teamsQuery = query(collection(firestore, 'teams'), where('members', 'array-contains', userId));
    const teamsSnapshot = await getDocs(teamsQuery);

    let userTeamId = null;
    teamsSnapshot.forEach((doc) => {
      const data = doc.data();
      userTeamId = doc.id;
    });

    if (!userTeamId) {
      console.error('Użytkownik nie jest członkiem żadnego zespołu:', userId);
      return;
    }

    const coachMessagesQuery = query(collection(firestore, 'coachMessages'), where('teamId', '==', userTeamId));

    const unsubscribe = onSnapshot(coachMessagesQuery, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({ id: doc.id, ...data });
      });

      const limitedMessages = messages.slice(-5);

      setCoachMessages(limitedMessages);
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        const { uid } = userData;
        setUser(userData);
        const userAdditionalData = await fetchUserData(uid);
        setUserAdditionalData(userAdditionalData);
        fetchCoachMessages(uid);
        fetchLatestEventData();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.welcomeText}>
          {`Witaj ${userAdditionalData ? `${userAdditionalData.firstName} ${userAdditionalData.lastName}` : ''} w Team App!`}
        </Text>

        <Text style={styles.sectionTitle}>Najnowsze Wiadomości od Trenera</Text>
        <View style={styles.messagesContainer}>
          {coachMessages.map((message) => (
            <View key={message.id} style={styles.messageContainer}>
              <Text style={styles.messageTitle}>{message.name}</Text>
              <Text style={styles.messageText}>{message.messages}</Text>
              <Text style={styles.messageDate}>{`Dodane: ${message.data}`}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Najbliższe wydarzenie!</Text>
        {upcomingEvent && (
          <View style={styles.upcomingEventContainer}>
            <View style={styles.eventContainer}>
              <Text style={styles.eventTitle}>{upcomingEvent.title}</Text>
              <Text style={styles.eventTitle}>{upcomingEvent.eventName}</Text>
              <Text style={styles.eventDate}>{`Data: ${new Date(upcomingEvent.eventDate).toDateString()}`}</Text>
              <Text style={styles.daysRemainingText}>{calculateDaysRemaining(upcomingEvent.eventDate)}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      <NavigationBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  contentContainer: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    alignSelf: 'center',
  },
  messagesContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  messageContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    alignSelf: 'center',
  },
  messageText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
    alignSelf: 'center',
  },
  messageDate: {
    marginTop: 20,
    fontSize: 14,
    color: 'gray',
    textAlign: 'right',
  },
  upcomingEventContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  eventContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    alignSelf: 'center',
  },
  eventDate: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
    alignSelf: 'center',
  },
});

export default Home;
