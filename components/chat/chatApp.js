// ChatApp.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore, auth } from '../../constants/config';

const ChatApp = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (user) {
      const messagesRef = collection(firestore, 'messages');
      const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMessages(newMessages);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  const handleSend = async () => {
    if (newMessage.trim() === '') {
      return;
    }

    try {
      const messagesRef = collection(firestore, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        timestamp: serverTimestamp(),
        userId: user.uid,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.message}>
            <Text>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={(text) => setNewMessage(text)}
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  input: {
    flex: 1,
    marginRight: 8,
    padding: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
});

export default ChatApp;
