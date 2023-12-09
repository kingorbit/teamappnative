import "expo-router/entry";
import * as React from 'react';
import { NativeRouter, Routes, Route } from "react-router-native";
import NotificationPermissionHandler from '../components/notifications/notificationPermision'; // Dodane
import EventNotificationScheduler from '../components/notifications/notificationScheduler'; // Dodane
import WelcomeScreen from '../components/WelcomeScreen';
import Home from '../components/home';
import CalendarScreen from './calendar';
import Chat from './chat';
import Team from './team';
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
import ForgetPass from "../components/forgetpass";
import NavigationBar from '../components/navBar';
import Results from "../components/team/results";
import Table from "../components/team/table";
import ResultsCoach from "../components/team/resultsCoach";
import TableCoach from "../components/team/tableCoach";

const App = () => {
  return (
    <NativeRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/calendar" element={<CalendarScreen />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/team" element={<Team />} />
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
        <Route path="/forgetpass" element={<ForgetPass />} />
        <Route path="/navBar" element={<NavigationBar />} />
        <Route path="/table" element={<Table />} />
        <Route path="/tableCoach" element={<TableCoach />} />
        <Route path="/results" element={<Results />} />
        <Route path="/resultsCoach" element={<ResultsCoach />} />

        {/* Dodane: Obsługa powiadomień */}
        <Route
          path="/notificationPermision"
          element={<NotificationPermissionHandler />}
        />
        <Route
          path="/notificationScheduler"
          element={<EventNotificationScheduler />}
        />

      </Routes>
    </NativeRouter>
  );
};

export default App;
