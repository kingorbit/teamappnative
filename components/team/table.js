// Table.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../../constants/config';
import TableItem from './tableItem';
import Header from '../header'; // Import Header z odpowiedniego katalogu
import NavigationBar from '../navBar';
import { lightTheme, darkTheme } from '../theme';

const Table = () => {
  const [teams, setTeams] = useState([]);
  const windowWidth = useWindowDimensions().width;
  const isSmallScreen = windowWidth < 600;
  const [theme, setTheme] = useState(darkTheme);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const tableRef = collection(firestore, 'table');
        const tableSnapshot = await getDocs(tableRef);
        const tableData = tableSnapshot.docs.map((doc) => doc.data());
  
        // Sortowanie danych: najpierw po punktach, a potem po bramkach strzelonych
        tableData.sort((a, b) => {
          if (a.points !== b.points) {
            return b.points - a.points; // Sortuj malejąco po punktach
          } else {
            return b.goals - a.goals; // Sortuj malejąco po bramkach strzelonych
          }
        });
  
        setTeams(tableData);
  
        // Pobierz ID użytkownika, aby przekazać je do funkcji fetchUserSettings
        const authUser = auth.currentUser;
        if (authUser) {
          fetchUserSettings(authUser.uid);
        } else {
          console.error('Błąd pobierania ID użytkownika');
        }
      } catch (error) {
        console.error('Błąd pobierania danych tabeli', error);
      }
    };
  
    fetchTableData();
  }, []); // Pusta zależność, aby useEffect działał tylko raz po zamontowaniu komponentu
  
  const fetchUserSettings = async (uid) => {
    try {
      const userDocRef = doc(firestore, 'users', uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userDataFromFirestore = userDocSnapshot.data();
        const darkModeEnabled = userDataFromFirestore.darkModeEnabled || false;
        setTheme(darkModeEnabled ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error.message);
    }
  };

  const renderTableHeader = () => {
    const headers = isSmallScreen
      ? ['Lp.', 'Drużyna', 'M', 'W', 'R', 'P', 'B.S.', 'B.St.', 'B.B.', 'Pkt'] // Skrócone nagłówki dla małych ekranów
      : ['Lp.', 'Drużyna', 'Mecze', 'Wygrane', 'Remisy', 'Przegrane', 'Bramki strzelone', 'Bramki stracone', 'Bilans bramkowy', 'Punkty'];
    const cellWidth = windowWidth > 600 ? windowWidth / headers.length : 60;

    return (
      <View style={[styles.tableHeader, { width: windowWidth }]}>
        {headers.map((header, index) => (
          <Text key={index} style={[styles.cell, { width: cellWidth }]}>{header}</Text>
        ))}
      </View>
    );
  };

  return (
<View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Header /> 
        <View style={styles.tablecontainer}>
          <Text style={styles.title}>Tabela</Text>
            {renderTableHeader()}
            <FlatList
              data={teams}
              keyExtractor={(item) => item.teamId}
              renderItem={({ item, index }) => <TableItem team={item} index={index} />}
        />
        </View>
        <NavigationBar></NavigationBar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9091fd',
  },
  tablecontainer:{
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cell: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default Table;
