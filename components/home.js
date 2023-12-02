import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth } from '../constants/config';
import Header from './header';
import NavigationBar from './navBar';


const Home = () => {
  const [user, setUser] = useState(null);
  const [coachMessages, setCoachMessages] = useState([]);
  const [upcomingEvent, setUpcomingEvent] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      if (userData) {
        setUser(userData);
        fetchCoachMessages(userData.uid);
        findUpcomingEvent();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCoachMessages = async (userId) => {
    const db = getFirestore();

    const teamsQuery = query(collection(db, 'teams'), where('members', 'array-contains', userId));
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

    const coachMessagesQuery = query(collection(db, 'coachMessages'), where('teamId', '==', userTeamId));

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

  const findUpcomingEvent = async () => {
    const db = getFirestore();

    const eventsQuery = query(
      collection(db, 'events'),
      where('eventDate', '>=', new Date()),
      orderBy('eventDate'),
      limit(1)
    );

    const eventsSnapshot = await getDocs(eventsQuery);

    if (!eventsSnapshot.empty) {
      const upcomingEventData = eventsSnapshot.docs[0].data();
      setUpcomingEvent(upcomingEventData);
    }
  };

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <ScrollView style={styles.contentContainer}>
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

        {upcomingEvent && (
          <View style={styles.upcomingEventContainer}>
            <Text style={styles.sectionTitle}>Nadchodzące Wydarzenie</Text>
            <View style={styles.eventContainer}>
              <Text style={styles.eventTitle}>{upcomingEvent.title}</Text>
              <Text style={styles.eventDate}>{`Data: ${upcomingEvent.date.toDate().toLocaleDateString()}`}</Text>
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
