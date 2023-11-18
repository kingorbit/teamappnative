import "expo-router/entry";
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
import CreateTeam from "../components/team/createTeam";
import TeamsList from "../components/team/listTeam";
import FormSignUp from "../components/formSignUp";
import FormSignUpCoach from "../components/formCoach";
import JoinTeam from "../components/team/joinTeam";
import YourTeam from "../components/team/yourTeam";
import LeaveTeam from "../components/team/leaveTeam";
import DeleteTeam from "../components/team/deleteTeam";
import ManageTeam from "../components/team/manageTeam";
import TeamStats from "../components/stats/teamStats";
import TeamStatsView from "../components/stats/teamStatsView";
import PlayerStats from "../components/stats/playerStats";
import PlayerStatsView from "../components/stats/playerStatsView";

 


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
        <Route path="/createTeam" element={<CreateTeam />} />
        <Route path="/listTeam" element={<TeamsList/>} />
        <Route path="/formSignUp" element={<FormSignUp />} />
        <Route path="/formCoach" element={<FormSignUpCoach />} />
        <Route path="/joinTeam" element={<JoinTeam />} />
        <Route path="/yourTeam" element={<YourTeam />} />
        <Route path="/leaveTeam" element={<LeaveTeam />} />
        <Route path="/deleteTeam" element={<DeleteTeam />} />
        <Route path="/manageTeam" element={<ManageTeam />} />
        <Route path="/teamStats" element={<TeamStats />} />
        <Route path="/teamStatsView" element={<TeamStatsView />} />
        <Route path="/playerStats" element={<PlayerStats />} />
        <Route path="/playerStatsView" element={<PlayerStatsView />} />

      </Routes>
    </NativeRouter>
  );
};

export default App;