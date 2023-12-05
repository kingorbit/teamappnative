// TableItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TableItem = ({ team, index }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.cell}>{index}</Text>
      <Text style={styles.cell} numberOfLines={1}>{team.name}</Text>
      <Text style={styles.cell}>{team.matches}</Text>
      <Text style={styles.cell}>{team.wins}</Text>
      <Text style={styles.cell}>{team.draws}</Text>
      <Text style={styles.cell}>{team.losts}</Text>
      <Text style={styles.cell}>{team.goals}</Text>
      <Text style={styles.cell}>{team.goalsLost}</Text>
      <Text style={styles.cell}>{`${team.goals} - ${team.goalsLost}`}</Text>
      <Text style={styles.cell}>{team.points}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginBottom: 10,
    paddingBottom: 10,
  },
  cell: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default TableItem;
