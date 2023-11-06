import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useNavigate } from 'react-router-native';
import LoginForm from './formLogin';
import SignUpForm from './formSignUp';




const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false);

  const handleLoginClick = () => {
    setShowLoginForm(true);
    setShowSignUpForm(false); // Tutaj resetujemy stan formularza SignUp
  };

  const handleSignUpClick = () => {
    setShowSignUpForm(true);
    setShowLoginForm(false); // Tutaj resetujemy stan formularza Login
  };

  const handleBack = () => {
    setShowLoginForm(false);
    setShowSignUpForm(false);

    navigate('/'); // Przykładowe użycie nawigacji do ekranu głównego
  };

  return (
    <View style={styles.container}>
    <Text style={styles.title}>
      Team App
    </Text>
    {!showLoginForm && !showSignUpForm && (
      <TouchableOpacity style={styles.button} onPress={handleLoginClick}>
        <Text style={styles.buttonText}>
          Log In
        </Text>
      </TouchableOpacity>
    )}
    {showLoginForm && <LoginForm />}
    {!showLoginForm && !showSignUpForm && (
      <TouchableOpacity style={styles.button} onPress={handleSignUpClick}>
        <Text style={styles.buttonText}>
          Sign Up
        </Text>
      </TouchableOpacity>
    )}
    {showSignUpForm && <SignUpForm />}
    {showLoginForm || showSignUpForm ? (
      <TouchableOpacity style={styles.button} onPress={handleBack}>
        <Text style={styles.buttonText}>
          Back
        </Text>
      </TouchableOpacity>
    ) : null}
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
    color: 'white',
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
    width: '30%',
  },
});

export default WelcomeScreen;
