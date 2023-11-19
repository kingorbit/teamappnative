import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Picker } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../../constants/config';
import Header from '../../components/header';

const EventForm = () => {
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventCategory, setEventCategory] = useState('Trening');
  const [eventDetails, setEventDetails] = useState('');
  const [teamId, setTeamId] = useState('');
  const [uid, setUid] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      if (userData) {
        setUser(userData);
      }
    });

    // Pobierz dane użytkownika, w tym isCoach
    // (Musisz dostosować strukturę swojej bazy danych Firebase)
    if (user && user.uid) {
      firestore.collection('users').doc(user.uid).get()
        .then((doc) => {
          const userData = doc.data();
          setUid(user.uid);
          setTeamId(userData.teamId);
        })
        .catch((error) => {
          console.error('Error getting user data:', error);
        });
    }

    return () => unsubscribe();
  }, [user]);

  const createEvent = () => {
    // Tutaj dodaj logikę zapisu do kolekcji "calendars" w Firebase
    // (Musisz dostosować strukturę swojej bazy danych Firebase)
    if (uid && teamId) {
      const event = {
        eventDate: new Date().toISOString(), // Możesz dostosować, aby pobierać datę z formularza
        eventId: `${teamId}_${uid}_${new Date().getTime()}`, // Automatyczne generowanie eventId
        eventName,
        eventCategory,
        eventDetails,
        teamId,
        uid,
      };

      firestore.collection('calendars').add(event)
        .then(() => {
          console.log('Event created successfully!');
          setModalVisible(false);
        })
        .catch((error) => {
          console.error('Error creating event:', error);
        });
    }
  };

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      {user && user.isCoach && (
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Dodaj Wydarzenie</Text>
        </TouchableOpacity>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Dodaj Wydarzenie</Text>
          <TextInput
            style={styles.input}
            placeholder="Nazwa wydarzenia"
            onChangeText={(text) => setEventName(text)}
          />
          <Picker
            selectedValue={eventCategory}
            onValueChange={(value) => setEventCategory(value)}
            style={styles.picker}
          >
            <Picker.Item label="Trening" value="Trening" />
            <Picker.Item label="Mecz Ligowy" value="Mecz Ligowy" />
            <Picker.Item label="Mecz Pucharowy" value="Mecz Pucharowy" />
            <Picker.Item label="Sparing" value="Sparing" />
            <Picker.Item label="Inne" value="Inne" />
          </Picker>
          <TextInput
            style={styles.input}
            placeholder="Szczegóły wydarzenia"
            onChangeText={(text) => setEventDetails(text)}
          />
          <TouchableOpacity style={styles.button} onPress={createEvent}>
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
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 5,
    backgroundColor: 'white',
  },
  picker: {
    height: 40,
    width: '80%',
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default EventForm;
