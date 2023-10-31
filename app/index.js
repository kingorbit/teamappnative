import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const styles = {
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#9091fd',
    },
    menuItem: {
      padding: 20,
      margin: 10,
      backgroundColor: 'white',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      width: '80%', // Szerokość 80% szerokości ekranu
    },
    menuItemText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
  };

const Home = () => {
    const handleCalendarPress = () => {
      console.log('Przełączono na zakładkę Kalendarz');
    };
  
    return (
      <View style={styles.container}>
        <Text style={{fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 20}}>Team App</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleCalendarPress}>
          <Text style={styles.menuItemText}>Kalendarz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleCalendarPress}>
          <Text style={styles.menuItemText}> Drużyna </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleCalendarPress}>
          <Text style={styles.menuItemText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleCalendarPress}>
          <Text style={styles.menuItemText}>Statystyki</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleCalendarPress}>
          <Text style={styles.menuItemText}>Profil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleCalendarPress}>
          <Text style={styles.menuItemText}>Ustawienia</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  export default Home;