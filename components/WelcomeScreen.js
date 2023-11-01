import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';

const WelcomeScreen = () => {
  const handleButtonClick = () => {
    console.log('Ten przycisk nie wykonuje żadnej akcji');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Team App
      </Text>
      <Link to="/home" style={styles.button}>
          <Text style={styles.buttonText}>
            Login In
          </Text>

      </Link>
      <TouchableOpacity onPress={handleButtonClick}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Sign In
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
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
  button: {
    padding: 20,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    width: '50%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default WelcomeScreen;
