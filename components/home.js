import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const Home = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCalendarPress = (tabName) => {
    console.log(`Przełączono na zakładkę ${tabName}`);
  };

  const handleHover = () => {
    setIsHovered(!isHovered);
  };

  const tabs = [
    { name: 'Kalendarz' },
    { name: 'Drużyna' },
    { name: 'Chat' },
    { name: 'Statystyki' },
    { name: 'Profil' },
    { name: 'Ustawienia' },
  ];

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#9091fd',
    }}>
      <Text style={{ fontSize: 35, color: 'white', fontWeight: 'bold', marginBottom: 20 }}>
        Team App
      </Text>

      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={{
            padding: 20,
            margin: 10,
            backgroundColor: isHovered ? '#9091fd' : 'white',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 3,
            width: '50%',
            transition: 'background-color 0.3s',
          }}
          onPress={() => handleCalendarPress(tab.name)}
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Home;
