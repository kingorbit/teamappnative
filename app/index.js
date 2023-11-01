import * as React from 'react';
import { NativeRouter, Routes, Route } from "react-router-native";
import WelcomeScreen from '../components/WelcomeScreen';
import Home from '../components/home';

const App = () => {
  return (
    <NativeRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </NativeRouter>
  );
};

export default App;
