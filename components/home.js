import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';

const Home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Team App
      </Text>

      <Link to="/calendar" style={styles.link}>
        <Text style={styles.linkText}>
          Kalendarz
        </Text>
      </Link>

      <Link to="/team" style={styles.link}>
        <Text style={styles.linkText}>
          Drużyna
        </Text>
      </Link>

      <Link to="/chat" style={styles.link}>
        <Text style={styles.linkText}>
          Chat
        </Text>
      </Link>
      <Link to="/profil" style={styles.link}>
        <Text style={styles.linkText}>
          Profil
        </Text>
      </Link>
      <Link to="/stats" style={styles.link}>
        <Text style={styles.linkText}>
          Statystyki
        </Text>
      </Link>
      <Link to="/settings" style={styles.link}>
        <Text style={styles.linkText}>
          Ustawienia
        </Text>
      </Link>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9091fd',
  },
  title: {
    fontSize: 35,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  link: {
    padding: 20,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    width: '50%',
  },
  linkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default Home;
