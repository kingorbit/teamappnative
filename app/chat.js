import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
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
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';  // Dodano import storage
import { firestore, auth, storage } from '../constants/config';  // Dodano import storage
import { useNavigate } from 'react-router-native';
import * as ImagePicker from 'expo-image-picker';

import Header from '../components/header';

const Chat = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
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

  const chooseImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        alert('Potrzebujemy dostępu do twojej biblioteki multimedialnej, aby wybrać obraz!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync();

      if (!result.canceled) {
        setImage(result.assets[0].uri);
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
        // Jeżeli istnieje obraz, przesyłamy go na Storage
        const imageRef = ref(storage, `images/${Date.now()}_${user.uid}`);
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);

        // Dodajemy wiadomość z obrazem
        const messagesRef = collection(firestore, 'messages');
        await addDoc(messagesRef, {
          userId: user.uid,
          userName: `${user.firstName || ''} ${user.lastName || ''}`,
          message: message.trim(),
          imageUrl,
          timestamp: serverTimestamp(),
        });

        // Czyścimy pola po wysłaniu
        setMessage('');
        setImage(null);
      } else {
        // Jeżeli nie ma obrazu, dodajemy wiadomość tekstową
        const messagesRef = collection(firestore, 'messages');
        await addDoc(messagesRef, {
          userId: user.uid,
          userName: `${user.firstName || ''} ${user.lastName || ''}`,
          message: message.trim(),
          timestamp: serverTimestamp(),
        });

        // Czyścimy pole wiadomości po wysłaniu
        setMessage('');
      }
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
              {msg.imageUrl && <Image source={{ uri: msg.imageUrl }} style={styles.messageImage} />}
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
          <TouchableOpacity style={styles.chooseImageButton} onPress={chooseImage}>
            <Text style={styles.chooseImageButtonText}>Wybierz obraz</Text>
          </TouchableOpacity>
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
  chooseImageButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginTop: 10,
  },
  chooseImageButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
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
  messageImage: {
    width: 200,
    height: 200,
    marginVertical: 10,
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
    marginVertical: 10,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default Chat;
