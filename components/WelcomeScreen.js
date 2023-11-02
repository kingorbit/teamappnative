import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import LoginForm from './formLogin';
import SignUpForm from './formSignUp';

const WelcomeScreen = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false);

  const handleLoginClick = () => {
    setShowLoginForm(true);
  };

  const handleSignUpClick = () => {
    setShowSignUpForm(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Team App
      </Text>
      {!showLoginForm && !showSignUpForm && (
        <Link to="/home" style={styles.link}>
          <Text style={styles.buttonText} onPress={handleLoginClick}>
            Log In
          </Text>
        </Link>
      )}
      {showLoginForm && <LoginForm />}
      {!showLoginForm && (
        <TouchableOpacity style={styles.button} onPress={handleSignUpClick}>
          <Text style={styles.buttonText}>
            Sign Up
          </Text>
        </TouchableOpacity>
      )}
      {showSignUpForm && <SignUpForm />}
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
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
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
});

export default WelcomeScreen;
