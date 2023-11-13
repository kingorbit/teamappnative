import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  where,
  onSnapshot, // Dodajemy onSnapshot
} from 'firebase/firestore';
import Header from '../components/header';
import { firestore, auth } from '../constants/config';
import { useNavigate } from 'react-router-native';

const Chat = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

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
          }
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });

    // Pobierz i ustaw wiadomości z firestore
    const messagesRef = collection(firestore, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(50));

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map((doc) => doc.data());
      setMessages(messagesData);
    });

    return () => {
      unsubscribe();
      unsubscribeMessages();
    };
  }, []);

  const sendMessage = async () => {
    if (!user || !message.trim()) {
      return;
    }

    try {
      const messagesRef = collection(firestore, 'messages');
      await addDoc(messagesRef, {
        userId: user.uid,
        userName: `${user.firstName || ''} ${user.lastName || ''}`,
        message: message.trim(),
        timestamp: serverTimestamp(),
      });

      // Wyczyść pole wiadomości po wysłaniu
      setMessage('');
    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości', error);
    }
  };

  return (
    <View style={styles.container}>
      <Header user={user} />
      <View style={styles.chatContainer}>
        <ScrollView contentContainerStyle={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <View key={index} style={styles.messageContainer}>
              <Text style={styles.messageSender}>{msg.userName}</Text>
              <Text style={styles.messageText}>{msg.message}</Text>
              <Text style={styles.messageTimestamp}>
                {msg.timestamp && new Date(msg.timestamp.toMillis()).toLocaleString()}
              </Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Napisz wiadomość..."
            value={message}
            onChangeText={(text) => setMessage(text)}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Wyślij</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.homeButton} onPress={() => navigate('/home')}>
          <Text style={styles.homeButtonText}>Powrót do Home</Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
    justifyContent: 'space-between',
  },
  homeButton: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    elevation: 3,
    width: '50%',
    backgroundColor: '#f0f0f0',
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  messagesContainer: {
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 10,
  },
  messageSender: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  messageText: {
    fontSize: 14,
    color: 'white',
  },
  messageTimestamp: {
    fontSize: 12,
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
  sendButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default Chat;
