import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView, Modal } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, setDoc,deleteDoc, addDoc } from 'firebase/firestore';
import Header from '../header';
import { firestore, auth } from '../../constants/config';
import { useNavigate } from 'react-router-native';

const ManageTeam = () => {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [founderData, setFounderData] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [coachMessages, setCoachMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(''); // Nowy stan dla treści nowej wiadomości
  const [isModalVisible, setModalVisible] = useState(false);
  const [newMessageTitle, setNewMessageTitle] = useState('');
  const [messages, setMessages] = useState([]); // Upewnij się, że masz zdefiniowane useState
  const [editedMessage, setEditedMessage] = useState('');
  const [editedMessageTitle, setEditedMessageTitle] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedMessageId, setEditedMessageId] = useState('');

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

            const teamsRef = collection(firestore, 'teams');
            const teamsQuery = query(teamsRef, where('members', 'array-contains', userData.uid));
            const teamsSnapshot = await getDocs(teamsQuery);

            const userTeams = [];
            for (const teamDoc of teamsSnapshot.docs) {
              const teamData = teamDoc.data();

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

            // Fetch coach messages
            const coachMessagesRef = collection(firestore, 'coachMessages');
            const coachMessagesQuery = query(coachMessagesRef, where('teamId', '==', userTeams[0].team.teamId));
            const coachMessagesSnapshot = await getDocs(coachMessagesQuery);
            const messagesData = coachMessagesSnapshot.docs.map((doc) => doc.data());
            setCoachMessages(messagesData);
          }
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);
  

  const handleRemoveMember = async (memberUid) => {
    try {
      if (!teams || teams.length === 0) {
        console.error('Brak danych o zespole.');
        return;
      }
  
      const teamId = teams[0].team.teamId;
  
      // Usuń członka zespołu
      const updatedMembers = teams[0].team.members.filter((member) => member !== memberUid);
  
      // Zaktualizuj kolekcję teams
      await updateDoc(doc(firestore, 'teams', teamId), { members: updatedMembers });
  
      // Aktualizuj lokalny stan teams
      setTeams((prevTeams) => {
        const updatedTeams = [...prevTeams];
        const updatedTeamIndex = updatedTeams.findIndex((team) => team.team.teamId === teamId);
  
        if (updatedTeamIndex !== -1) {
          updatedTeams[updatedTeamIndex] = {
            ...updatedTeams[updatedTeamIndex],
            team: {
              ...updatedTeams[updatedTeamIndex].team,
              members: updatedMembers,
            },
          };
        }
  
        console.log('Updated Teams:', updatedTeams);
  
        return updatedTeams;
      });
  
      console.log('Members after update:', updatedMembers); // Dodaj ten log
  
      Alert.alert('Sukces', 'Członek zespołu został usunięty.');
    } catch (error) {
      console.error('Błąd usuwania członka zespołu', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania członka zespołu.');
      console.log('Teams after update:', teams);
    }
  };
  
  const handleUpdateTeamInfo = async () => {
    try {
      const teamRef = doc(firestore, 'teams', teams[0].team.teamId);
      await updateDoc(teamRef, {
        name: newName || teams[0].team.name,
        description: newDescription || teams[0].team.description,
      });
      setNewName('');
      setNewDescription('');
      Alert.alert('Sukces', 'Informacje o zespole zostały zaktualizowane.');
    } catch (error) {
      console.error('Błąd aktualizacji informacji o zespole', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas aktualizacji informacji o zespole.');
    }
  };


// ...


const handleAddMessage = async () => {
  try {
    if (!teams || teams.length === 0) {
      console.error('Brak danych o zespole.');
      return;
    }

    const teamId = teams[0].team.teamId;

    // Uzyskaj obecną datę i czas w formacie "YYYY-MM-DD HH-MM-SS"
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate
      .getHours()
      .toString()
      .padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;

    // Dodaj nową wiadomość do kolekcji coachMessages
    const newMessageData = {
      teamId,
      name: newMessageTitle,
      messages: newMessage,
      data: formattedDate,
    };

    const newMessageRef = await addDoc(collection(firestore, 'coachMessages'), newMessageData);

    // Ustaw unikalny identyfikator (messageId) w nowo utworzonym dokumencie
    await setDoc(doc(firestore, 'coachMessages', newMessageRef.id), { messageId: newMessageRef.id }, { merge: true });

    // Aktualizuj lokalny stan coachMessages
    setCoachMessages((prevMessages) => [
      ...prevMessages,
      { messageId: newMessageRef.id, ...newMessageData },
    ]);

    setNewMessageTitle('');
    setNewMessage('');
    setModalVisible(false);

    Alert.alert('Sukces', 'Nowa wiadomość została dodana.');
  } catch (error) {
    console.error('Błąd dodawania nowej wiadomości', error);
    Alert.alert('Błąd', 'Wystąpił błąd podczas dodawania nowej wiadomości.');
  }
};

const handleRemoveMessage = async (messageId) => {
  try {
    // Usuń wiadomość z kolekcji coachMessages na podstawie messageId
    await deleteDoc(doc(firestore, 'coachMessages', messageId));

    // Aktualizuj lokalny stan coachMessages, usuwając usuniętą wiadomość
    setCoachMessages((prevMessages) => prevMessages.filter((message) => message.messageId !== messageId));

    Alert.alert('Sukces', 'Wiadomość została usunięta.');
  } catch (error) {
    console.error('Błąd usuwania wiadomości', error);
    Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania wiadomości.');
  }
};

const handleOpenEditModal = (messageId, messageTitle, messageText) => {
  setEditedMessageId(messageId);
  setEditedMessageTitle(messageTitle);
  setEditedMessage(messageText);
  setEditModalVisible(true);
};

const handleEditMessage = async () => {
  try {
    if (!editedMessageId) {
      console.error('Brak identyfikatora wiadomości do edycji.');
      return;
    }

    const messageRef = doc(firestore, 'coachMessages', editedMessageId);
    await updateDoc(messageRef, { messages: editedMessage, name: editedMessageTitle });

    setCoachMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.messageId === editedMessageId
          ? { ...message, messages: editedMessage, name: editedMessageTitle }
          : message
      )
    );

    setEditModalVisible(false);

    Alert.alert('Sukces', 'Wiadomość została zaktualizowana.');
  } catch (error) {
    console.error('Błąd edycji wiadomości', error);
    Alert.alert('Błąd', 'Wystąpił błąd podczas edycji wiadomości.');
  }
};




  
  

  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser} />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {teams.length > 0 ? (
          <>
            <Text style={styles.title}>Zarządzaj Zespołem</Text>
            {teams.map((team, index) => (
              <View key={index} style={styles.teamInfo}>
                <Text style={styles.info}>Nazwa Zespołu: {team.team.name}</Text>
                <Text style={styles.info}>Opis: {team.team.description}</Text>
                {founderData && (
                  <Text style={styles.info}>Założyciel: {`${founderData.firstName} ${founderData.lastName}`}</Text>
                )}
                <Text style={styles.info}>Kod dołączania do drużyny: {team.team.joinCode}</Text>
                <Text style={styles.membersTitle}>Członkowie:</Text>
                {team.members.map((member, index) => (
                  <View key={index} style={styles.memberContainer}>
                    <Text style={styles.member}>{member}</Text>
                    <TouchableOpacity onPress={() => handleRemoveMember(member)}>
                      <Text style={styles.removeMemberText}>Usuń</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <Text style={styles.info}>Zmień nazwę zespołu:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nowa nazwa zespołu"
                  value={newName}
                  onChangeText={(text) => setNewName(text)}
                />
                <Text style={styles.info}>Zmień opis zespołu:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nowy opis zespołu"
                  value={newDescription}
                  onChangeText={(text) => setNewDescription(text)}
                />
                <TouchableOpacity style={styles.button} onPress={handleUpdateTeamInfo}>
                  <Text style={styles.buttonText}>Zaktualizuj informacje o zespole</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.info}>Nie jesteś członkiem żadnego zespołu.</Text>
        )}
      {coachMessages.length > 0 && (
        <View style={styles.messageContainer}>
          <Text style={styles.membersTitle}>Wiadomości od trenera:</Text>
          {coachMessages.map((message) => (
            <View key={message.messageId} style={styles.messageContainer}>
               <Text style={styles.messageText}>{message.name}</Text>
              <Text style={styles.messageText}>{message.messages}</Text>
              <Text style={styles.messageDate}>{message.data}</Text>
              <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => handleOpenEditModal(message.messageId, message.name, message.messages)}>
          <Text style={styles.editMessageText}>Edytuj</Text>
        </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeMessageButton}
                  onPress={() => handleRemoveMessage(message.messageId)}
                >
                  <Text style={styles.removeMessageText}>Usuń</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
  </View>
)}
         {/* Button to open the modal */}
         <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Dodaj nową wiadomość</Text>
        </TouchableOpacity>

        {/* Modal for adding a new message */}
        <Modal
  animationType="slide"
  transparent={true}
  visible={isModalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Dodaj nową wiadomość</Text>
      <TextInput
  style={[styles.input, { color: 'black' }]}
  placeholder="Tytuł wiadomości"
  value={newMessageTitle}
  onChangeText={(text) => setNewMessageTitle(text)}
/>
      <TextInput
        style={[styles.input, { color: 'black' }]} 
        placeholder="Treść wiadomości"
        value={newMessage}
        onChangeText={(text) => setNewMessage(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddMessage}>
        <Text style={styles.buttonText}>Dodaj wiadomość</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
        <Text style={styles.buttonText}>Anuluj</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
<Modal
  animationType="slide"
  transparent={true}
  visible={editModalVisible}
  onRequestClose={() => setEditModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Edytuj wiadomość</Text>
      <TextInput
        style={[styles.input, { color: 'black' }]}
        placeholder="Tytuł wiadomości"
        value={editedMessageTitle}  // Dodaj to pole value
        onChangeText={(text) => setEditedMessageTitle(text)}
      />
      <TextInput
        style={[styles.input, { color: 'black' }]}
        placeholder="Treść wiadomości"
        value={editedMessage}
        onChangeText={(text) => setEditedMessage(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleEditMessage}>
        <Text style={styles.buttonText}>Zaktualizuj wiadomość</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'red' }]}
        onPress={() => setEditModalVisible(false)}
      >
        <Text style={styles.buttonText}>Anuluj</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


        <TouchableOpacity style={styles.button} onPress={() => navigate('/team')}>
          <Text style={styles.buttonText}>Powrót</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  scrollView: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  teamInfo: {
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  membersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: 'white',
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  member: {
    fontSize: 16,
    marginBottom: 5,
    color: 'white',
  },
  removeMemberText: {
    fontSize: 16,
    color: 'red',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'white',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    color: 'white',
  },
  membersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: 'black',
  },
  messageContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  messageDate: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  removeMessageText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },

  editMessageButton: {
    backgroundColor: 'blue', // Kolor przycisku edycji
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  removeMessageButton: {
    backgroundColor: 'red', // Czerwone tło dla przycisku usuwania
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    width: '50%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default ManageTeam;
