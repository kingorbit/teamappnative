import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Link } from 'react-router-native';
import Header from '../components/header';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { firestore, auth } from '../constants/config';

const Profil = () => {
  const [user, setUser] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editedData, setEditedData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    uid: '',
    position: '',
    isCoach: '',
    phoneNumber: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        try {
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, where('uid', '==', userData.uid));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            console.log(doc.id, ' => ', doc.data());
            setUser(doc.data());
          });
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async () => {
    try {
      if (user && user.uid) {
        console.log('Przed aktualizacją - user:', user);
  
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userRef = doc(firestore, 'users', userDoc.id);
  
          // Konwertuj wartości na odpowiednie typy danych
          const updatedData = {
            firstName: editedData.firstName !== undefined ? String(editedData.firstName) : user.firstName,
            lastName: editedData.lastName !== undefined ? String(editedData.lastName) : user.lastName,
            email: editedData.email !== undefined ? String(editedData.email) : user.email,
            age: editedData.age !== undefined ? editedData.age : user.age,
            position: editedData.position !== undefined ? String(editedData.position) : user.position,
            phoneNumber: editedData.phoneNumber !== undefined ? String(editedData.phoneNumber) : user.phoneNumber,
            isCoach: editedData.isCoach !== undefined ? (typeof editedData.isCoach === 'boolean' ? editedData.isCoach : user.isCoach) : user.isCoach,
          };
  
          console.log('Przed aktualizacją - updatedData:', updatedData);
  
          await updateDoc(userRef, updatedData);
          console.log('Dane zostały zaktualizowane.');
          setEditModalVisible(false);
  
          // Sprawdź, czy dane zostały zaktualizowane poprawnie
          const updatedUserDoc = await getDoc(userRef);
          const updatedUserData = updatedUserDoc.data();
          console.log('Po aktualizacji - updatedUserDoc:', updatedUserData);
  
          // Zaktualizuj stan użytkownika
          setUser(updatedUserData);
        } else {
          console.error('Nie znaleziono dokumentu użytkownika o podanym uid.');
        }
      } else {
        console.error('Nieprawidłowy obiekt użytkownika lub brak identyfikatora użytkownika.');
      }
    } catch (error) {
      console.error('Błąd aktualizacji danych użytkownika', error);
    }
  };
  
  
  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <View style={styles.profileContent}>
        <Text style={styles.title}>Twój Profil</Text>
        {user && (
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>ID: {user.uid}</Text>
            <Text style={styles.label}>Imię: {user.firstName}</Text>
            <Text style={styles.label}>Nazwisko: {user.lastName}</Text>
            <Text style={styles.label}>Email: {user.email}</Text>
            <Text style={styles.label}>Wiek: {user.age}</Text>
            <Text style={styles.label}>Pozycja: {user.position || 'Brak Pozycji - Trener'}</Text>
            <Text style={styles.label}>
              Trener: {user.isCoach ? (user.position ? 'Tak' : 'Trener') : 'Nie'}
            </Text>
            <Text style={styles.label}>Numer telefonu: {user.phoneNumber || 'Brak Telefonu'}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditedData({
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              email: user?.email || '',
              position: user?.position || '',
              phoneNumber: user?.phoneNumber || '',
              age: user?.age || '',
              uid: user?.uid || '',
              isCoach: user?.isCoach || '',
            });
            setEditModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Edytuj Profil</Text>
        </TouchableOpacity>
        <Link to="/home" style={styles.link}>
          <Text style={styles.linkText}>Powrót do Home</Text>
        </Link>
      </View>

    {/* Modal do edycji profili */}
    <Modal animationType="slide" transparent={true} visible={isEditModalVisible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edytuj Profil</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Imię</Text>
            <TextInput
              style={styles.input}
              value={editedData.firstName}
              onChangeText={(text) => setEditedData({ ...editedData, firstName: text })}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nazwisko</Text>
            <TextInput
              style={styles.input}
              value={editedData.lastName}
              onChangeText={(text) => setEditedData({ ...editedData, lastName: text })}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={editedData.email}
              onChangeText={(text) => setEditedData({ ...editedData, email: text })}
            />
          </View>
          <View style={styles.inputContainer}>
            {!user?.isCoach && (
              <TextInput
                style={styles.input}
                placeholder="Pozycja"
                value={editedData.position}
                onChangeText={(text) => setEditedData({ ...editedData, position: text })}
              />
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Wiek</Text>
            <TextInput
              style={styles.input}
              value={editedData.age.toString()}
              onChangeText={(text) => setEditedData({ ...editedData, age: text })}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Numer telefonu</Text>
            <TextInput
              style={styles.input}
              value={editedData.phoneNumber.toString()}
              onChangeText={(text) => setEditedData({ ...editedData, phoneNumber: text })}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Zapisz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setEditModalVisible(false)}>
            <Text style={styles.buttonText}>Anuluj</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>
);
            }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  inputContainer: {
    marginBottom: 10,
    width: '60%',
  },
  input: {
    width: '100%',
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  link: {
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
  linkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  profileContent: {
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  editButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '5%',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
});

export default Profil;
