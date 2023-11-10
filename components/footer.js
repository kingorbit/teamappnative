import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Footer = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>Aplikacja stworzona przez Kuba Fluder</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#40407a',
    padding: 10,
    marginTop: 'auto',
  },
  text: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default Footer;
