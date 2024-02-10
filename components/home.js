import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, ActivityIndicator, Image } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { firestore } from '../constants/config';
import { getFirestore, collection, query, where, onSnapshot, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { auth } from '../constants/config';
import Header from './header';
import NavigationBar from './navBar';
import { lightTheme, darkTheme } from '../components/theme';

const Home = () => {
  const [user, setUser] = useState(null);
  const [userAdditionalData, setUserAdditionalData] = useState(null);
  const [coachMessages, setCoachMessages] = useState([]);
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const spinValue = new Animated.Value(0);
  const [theme, setTheme] = useState(darkTheme);

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

  const fetchUserSettings = async (uid) => {
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
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
  
        if (!user) {
          console.error('Użytkownik nie jest zalogowany.');
          return;
        }
  
        const { uid } = user;
  
        // Dodane wywołanie funkcji fetchUserSettings
        fetchUserSettings(uid, setTheme);
  
        setUser(user);
        const userAdditionalData = await fetchUserData(uid);
        setUserAdditionalData(userAdditionalData);
        fetchCoachMessages(uid);
        fetchLatestEventData();
      } catch (error) {
        console.error('Błąd pobierania danych użytkownika', error);
      }
    };
  
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      if (userData) {
        fetchData();
      }
    });
  
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Symulacja opóźnienia ładowania
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Animacja obracającego się koła
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    return () => clearTimeout(loadingTimeout);
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  
  return (
<View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
                  <Image source={require('../assets/logo.png')} style={styles.logo} />
          <ActivityIndicator size="large" color="#acadfe" style={styles.loadingIndicator} />
          <Animated.View style={{ transform: [{ rotate: spin }] }}>

          </Animated.View>
        </View>
      ) : (
        <>
          <Header user={user} setUser={setUser} />
          <ScrollView style={styles.contentContainer}>
            <Text style={styles.welcomeText}>
              {`Witaj ${userAdditionalData ? `${userAdditionalData.firstName} ${userAdditionalData.lastName}` : ''}!`}
            </Text>
  
            <Text style={styles.sectionTitle}>Wiadomości od Trenera!</Text>
            
              {coachMessages.map((message) => (
                <View key={message.id} style={[styles.messageContainer, { backgroundColor: theme.buttonColor }]}>
                  <Text style={[styles.messageTitle, { color: theme.textColor }]}>{message.name}</Text>
                  <Text style={[styles.messageText, { color: theme.textColor }]}>{message.messages}</Text>
                  <Text style={styles.messageDate}>{`Dodane: ${message.data}`}</Text>
                </View>
              ))}

            <Text style={styles.sectionTitle}>Najbliższe wydarzenie!</Text>
            {upcomingEvent && (
             
                <View style={[styles.eventContainer, { backgroundColor: theme.buttonColor }]}>
                  <Text style={[styles.eventTitle, { color: theme.textColor }]}>{upcomingEvent.eventName}</Text>
                  <Text style={[styles.eventTitle, { color: theme.textColor }]}>{upcomingEvent.eventCategory}</Text>
                  <Text style={[styles.eventDate, { color: theme.textColor }]}>{`Data: ${new Date(upcomingEvent.eventDate).toDateString()}`}</Text>
                  <View style={styles.daysRemainingContainer}>
                  <Text style={[styles.daysRemaining, { color: theme.textColor }]}>{calculateDaysRemaining(upcomingEvent.eventDate)}</Text>
                  </View>
                </View>

            )}
          </ScrollView>
          <NavigationBar />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#24243f',
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
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    alignSelf: 'center',
    textAlign: 'center',
    marginVertical: 20,
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
    color: '#E1D9D1',
    textAlign: 'right',
  },
  upcomingEventContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 70,
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
  daysRemainingContainer: {
    backgroundColor: 'green',
    borderRadius: 5,
    padding: 10,
    marginLeft: 10,
    width: '27%',
    height: 40,
    alignItems: 'center',
    alignSelf: 'center',

  },
  daysRemaining: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginBottom: 20,
  },
  logo: {
    width: 150, 
    height: 150,
    resizeMode: 'contain',
    borderRadius: 15,
  },
  rotatingCircle: {
    width: 50,
    height: 50,
    marginTop: 20,
  },
});

export default Home;
