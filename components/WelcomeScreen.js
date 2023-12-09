import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, ActivityIndicator } from 'react-native';
import { useNavigate } from 'react-router-native';
import LoginForm from './formLogin';
import FormRole from './formRole';


const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    // Symulacja opóźnienia ładowania
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    // Animacja obracającego się koła
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    return () => clearTimeout(loadingTimeout);
  }, [spinValue]);

  const handleLoginClick = () => {
    setShowLoginForm(true);
    setShowSignUpForm(false);
  };

  const handleSignUpClick = () => {
    setShowSignUpForm(true);
    setShowLoginForm(false);
  };

  const handleBack = () => {
    setShowLoginForm(false);
    setShowSignUpForm(false);
    navigate('/');
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />

      {isLoading ? (
        <>
          <ActivityIndicator size="large" color="#9091fd" style={styles.loadingIndicator} />
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
          </Animated.View>
        </>
      ) : (
        <>
          <Text style={styles.title}>Team App</Text>

          {!showLoginForm && !showSignUpForm && (
            <TouchableOpacity style={styles.button} onPress={handleLoginClick}>
              <Text style={styles.buttonText}>Logowanie</Text>
            </TouchableOpacity>
          )}

          {showLoginForm && <LoginForm />}
          {!showLoginForm && !showSignUpForm && (
            <TouchableOpacity style={styles.button} onPress={handleSignUpClick}>
              <Text style={styles.buttonText}>Stwórz Konto</Text>
            </TouchableOpacity>
          )}

          {showSignUpForm && <FormRole />}
          {showLoginForm || showSignUpForm ? (
            <TouchableOpacity style={styles.button} onPress={handleBack}>
              <Text style={styles.buttonText}>Powrót</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#24243f',
  },
  logo: {
    marginVertical: 20,
    width: 150,
    height: 150,
    marginBottom: 10,
    borderRadius: 20,
  },
  loadingIndicator: {
    marginBottom: 20,
  },
  rotatingCircle: {
    width: 50,
    height: 50,
    marginTop: 10,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  button: {
    padding: 20,
    margin: 10,
    backgroundColor: '#9091fd',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    width: '55%',
  },
});

export default WelcomeScreen;
