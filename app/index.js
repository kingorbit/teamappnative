import * as React from 'react';
import { NativeRouter, Routes, Route } from "react-router-native";
import WelcomeScreen from '../components/WelcomeScreen';
import Home from '../components/home';
import Calendar from './calendar';
import Chat from './chat';
import Team from './team';
import Stats from './stats'
import Profil from './profil';
import Settings from './settings'

const App = () => {
  return (
    <NativeRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/team" element={<Team />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </NativeRouter>
  );
};

export default App;
