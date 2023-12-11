import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
} from 'react-native';
import {
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  where,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Header from '../components/header';
import { firestore, auth, storage } from '../constants/config';
import { useNavigate } from 'react-router-native';
import ImagePicker from 'react-native-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import NavigationBar from '../components/navBar';
import { lightTheme, darkTheme } from '../components/theme';

const Chat = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [teamChat, setTeamChat] = useState(false);
  const [userTeam, setUserTeam] = useState(null);
  const [messagesToLoad, setMessagesToLoad] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();
  const scrollViewRef = useRef();
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);
  const [scrolledUp, setScrolledUp] = useState(false);
  const [isInputFocused, setInputFocused] = useState(false);
  const [theme, setTheme] = useState(darkTheme);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
  
        if (!user) {
          console.error('Użytkownik nie jest zalogowany.');
          return;
        }
  
        // Pobierz dane użytkownika
        const usersRef = collection(firestore, 'users');
        const userQuery = query(usersRef, where('uid', '==', user.uid));
        const userQuerySnapshot = await getDocs(userQuery);
  
        if (!userQuerySnapshot.empty) {
          const userData = userQuerySnapshot.docs[0].data();
          setUser(userData);
          setUserTeam(userData.team);
        }
  
        // Dodane wywołanie funkcji fetchUserSettings
        fetchUserSettings(user.uid, setTheme);
  
        // Pobierz wiadomości
        const messagesRef = collection(
          firestore,
          teamChat ? `teamChats/${userTeam}/messages` : 'messages'
        );
        const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(messagesToLoad));
  
        const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
          const messagesData = querySnapshot.docs.map((doc) => doc.data());
          setMessages(messagesData.reverse()); // Reverse the order to display the latest messages at the bottom
          setLoadingMore(false);
        });
  
        return () => {
          unsubscribeMessages();
        };
      } catch (error) {
        console.error('Błąd pobierania danych użytkownika', error);
      }
    };
  
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        fetchData();
      }
    });
  
    return () => {
      unsubscribe();
    };
  }, [teamChat, userTeam, messagesToLoad]);
  

  const chooseImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        alert('Potrzebujemy dostępu do twojego aparatu, aby wybrać obraz!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync();

      if (!result.cancelled) {
        const imageUri = result.uri;
        const response = await fetch(imageUri);
        const blob = await response.blob();

        setImage(blob);
      }
    } catch (error) {
      console.error('Błąd podczas wybierania obrazu', error);
    }
  };

  const sendMessage = async () => {
    if (!user || (!message.trim() && !image)) {
      return;
    }

    try {
      if (image) {
        const imageRef = ref(storage, `images/${Date.now()}_${user.uid}`);
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);

        const messagesRef = collection(
          firestore,
          teamChat ? `teamChats/${userTeam}/messages` : 'messages'
        );

        await addDoc(messagesRef, {
          userId: user.uid,
          userName: `${user.firstName || ''} ${user.lastName || ''}`,
          message: message.trim(),
          imageUrl,
          timestamp: serverTimestamp(),
        });

        setMessage('');
        setImage(null);
      } else {
        const messagesRef = collection(
          firestore,
          teamChat ? `teamChats/${userTeam}/messages` : 'messages'
        );

        await addDoc(messagesRef, {
          userId: user.uid,
          userName: `${user.firstName || ''} ${user.lastName || ''}`,
          message: message.trim(),
          timestamp: serverTimestamp(),
        });

        setMessage('');
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }
    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości', error);
    }
  };

  const loadMoreMessages = () => {
    setLoadingMore(true);
    setMessagesToLoad((prev) => prev + 20);
  };

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtTop = contentOffset.y === 0;
    const isAtBottom = contentOffset.y >= contentSize.height - layoutMeasurement.height;

    if (isAtTop && !scrolledUp) {
      setShowLoadMoreButton(true);
      setScrolledUp(true);
    } else if (!isAtTop && scrolledUp) {
      setScrolledUp(false);
    }

    if (isAtBottom && showLoadMoreButton) {
      setShowLoadMoreButton(false);
    }
  };

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  const handleKeyboardHide = () => {
    setInputFocused(false);
  };

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      handleKeyboardHide
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  
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
  

  return (
<View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Header user={user} />
      <Text style={styles.title}>Chat</Text>
      <View style={styles.chatContainer}>
        <View style={styles.hrLine}></View>
        {showLoadMoreButton && (
          <TouchableOpacity
            onPress={loadMoreMessages}
            disabled={loadingMore}
            style={[styles.loadMoreButton, { backgroundColor: theme.buttonColor }]} 
          >
            <Text style={[styles.leadMoreButtonText, { color: theme.textColor }]}>Więcej</Text>
          </TouchableOpacity>
        )}
        <ScrollView
          contentContainerStyle={styles.messagesContainer}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
          onScroll={handleScroll}
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageContainer,
                user && user.uid === msg.userId ? styles.currentUserMessage : styles.otherUserMessage,
              ]}
            >
              <View style={styles.messageContent}>
                <Text style={styles.messageSender}>{msg.userName}</Text>
                <Text style={styles.messageText}>{msg.message}</Text>
                {msg.imageUrl && <Image source={{ uri: msg.imageUrl }} style={styles.messageImage} />}
                <Text style={styles.messageTimestamp}>
                  {msg.timestamp && new Date(msg.timestamp.toMillis()).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Napisz wiadomość..."
            value={message}
            onChangeText={(text) => setMessage(text)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <TouchableOpacity
           style={[styles.chooseImageButton, { backgroundColor: theme.buttonColor }]}
            onPress={chooseImage}
            disabled={teamChat}
          >
            <FontAwesome name="image" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.buttonColor }]} onPress={sendMessage}>
            <FontAwesome name="send" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {!isInputFocused && (
          <>
            <TouchableOpacity
             style={[styles.toggleButton, { backgroundColor: theme.buttonColor }]}
              onPress={() => setTeamChat((prev) => !prev)}
            >
              <Text style={[styles.toggleButtonText, { color: theme.textColor }]}>
                {teamChat ? 'Chat ogólny' : 'Chat Zespołu'}
              </Text>
            </TouchableOpacity>
          </>
        )}
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
  chatContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  hrLine: {
    height: 5,
    backgroundColor: 'white',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  chooseImageButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    margin: 10,
  },
  chooseImageButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  currentUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#acadfe',
    marginLeft: 10,
    marginRight: '50%',
    borderRadius: 15,
  },
  otherUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#48497f',
    marginLeft: '50%',
    marginRight: 10,
    borderRadius: 15,
  },
  messageContent: {
    padding: 10,
    borderRadius: 15,
  },
  homeButton: {
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  linkText:{
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  messagesContainer: {
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  messageText: {
    fontSize: 12,
    color: 'white',
    paddingVertical: 7,
  },
  messageImage: {
    width: 150,
    height: 150,
    marginVertical: 5,
  },
  messageTimestamp: {
    fontSize: 9,
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  loadMoreButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadMoreButtonText:{
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  sendButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  toggleButton: {
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default Chat;
