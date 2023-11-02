import "expo-router/entry";
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../components/WelcomeScreen';
import Home from '../components/home';
import Calendar from './calendar';
import Chat from './chat';
import Team from './team';
import Stats from './stats';
import Profil from './profil';
import Settings from './settings';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Calendar" component={Calendar} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="Team" component={Team} />
        <Stack.Screen name="Stats" component={Stats} />
        <Stack.Screen name="Profil" component={Profil} />
        <Stack.Screen name="Settings" component={Settings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

