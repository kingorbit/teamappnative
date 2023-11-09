import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import Header from '../components/header';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../constants/config';

const Team = () => {
  const [user, setUser] = useState(null);
  return (
    <View style={styles.container}>
      <Header user={user} setUser={setUser}/>
      <View style={styles.teamContent}>
        <Text style={styles.title}>Zarządzanie Zespołami</Text>
        <Link to="/listTeam" style={styles.link}>
          <Text style={styles.linkText}>Lista Zespołów</Text>
        </Link>
        <Link to="/createTeam" style={styles.link}>
          <Text style={styles.linkText}>Utwórz Zespół</Text>
        </Link>
        <Link to="/createTeam" style={styles.link}>
          <Text style={styles.linkText}>Dołącz do Zespółu</Text>
        </Link>
        <Link to="/home" style={styles.link}>
          <Text style={styles.linkText}>Twoja Drużyna</Text>
        </Link>
        <Link to="/home" style={styles.link}>
          <Text style={styles.linkText}>Zarządzaj Drużyną</Text>
        </Link>
        <Link to="/home" style={styles.link}>
          <Text style={styles.linkText}>Powrót do Home</Text>
        </Link>

      </View>
    </View>
  );
};
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
  },
  input: {
    width: '90%',
    height: 35,
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  button: {
    padding: 20,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
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
  teamContent: {
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default Team;
