// Navbar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, useLocation } from 'react-router-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const Navbar = () => {
  const location = useLocation();

  const isTabActive = (tab) => {
    return location.pathname === tab;
  };

  return (
    <View style={styles.navbar}>
      <Link to="/calendar" style={[styles.navItem, isTabActive('/calendar') && styles.activeTab]}>
        <>
          <Icon name="calendar" size={25} color="white" />
          <Text style={[styles.tabText, isTabActive('/calendar') && styles.activeTabText]}>Kalendarz</Text>
        </>
      </Link>
      <Link to="/chat" style={[styles.navItem, isTabActive('/chat') && styles.activeTab]}>
        <>
          <Icon name="comments" size={25} color="white" />
          <Text style={[styles.tabText, isTabActive('/chat') && styles.activeTabText]}>Wiadomości</Text>
        </>
      </Link>
      <Link to="/home" style={[styles.navItem, isTabActive('/home') && styles.activeTab]}>
        <>
          <Icon name="home" size={30} color="white" />
          <Text style={[styles.tabText, isTabActive('/home') && styles.activeTabText]}>Strona Główna</Text>
        </>
      </Link>
      <Link to="/team" style={[styles.navItem, isTabActive('/team') && styles.activeTab]}>
        <>
          <Icon name="users" size={25} color="white" />
          <Text style={[styles.tabText, isTabActive('/team') && styles.activeTabText]}>Twój Zespół</Text>
        </>
      </Link>
      <Link to="/settings" style={[styles.navItem, isTabActive('/settings') && styles.activeTab]}>
        <>
          <Icon name="cog" size={25} color="white" />
          <Text style={[styles.tabText, isTabActive('/settings') && styles.activeTabText]}>Ustawienia</Text>
        </>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#40407a',
    height: 50,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    height: 60,
    backgroundColor: '#24243f', // Kolor aktywnej zakładki
    borderRadius: 15,
  },
  tabText: {
    color: 'white',
    fontSize: 8,
    marginTop: 2,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
});

export default Navbar;
