// LoadingPage.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingPage = ({ navigation }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Symulacja ładowania danych
    setTimeout(() => {
      setLoading(false);
    }, 2000); // Ustaw czas na dowolną liczbę milisekund

    // Po zakończeniu ładowania, przejdź do innej strony
    if (!loading) {
      navigation.replace('home'); // Zmień 'Home' na nazwę Twojej głównej strony
    }
  }, [loading, navigation]);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/loadanimation.json')} // Dodaj odpowiedni plik JSON z animacją
        autoPlay
        loop
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingPage;
