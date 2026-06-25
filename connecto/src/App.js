/**
 * App.js — Root Router
 * MVC + MVVM Hybrid Architecture
 *
 * Routing (Controller layer) wires Views to URLs.
 * Each page uses a ViewModel hook for logic, keeping Views pure.
 */

import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './Component/ProtectedRoute';
import AppLayout      from './views/layout/AppLayout/AppLayout';
import HomePage       from './views/pages/HomePage/HomePage';
import AuthPage       from './views/pages/AuthPage/AuthPage';
import ProfilePage    from './views/pages/ProfilePage/ProfilePage';
import ChatPage       from './views/pages/ChatPage/ChatPage';
import Newsfeed       from './Component/Newsfeed';
import Timelineabout  from './Component/Timelineabout';
import Reels          from './Component/Reels';
import Explore        from './Component/Explore';
import HashtagPage    from './Component/HashtagPage';
import Activity       from './Component/Activity';
import './styles/globals.css';
import './styles/mixins/neomorphism.css';

const SearchRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/explore${location.search}`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
       
        <Route path="/landing" element={<AuthPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="profile"         element={<ProfilePage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="newsfeed"          element={<Newsfeed />} />
          <Route path="timelineabout"     element={<Timelineabout />} />
          <Route path="reels"             element={<Reels />} />
          <Route path="explore"           element={<Explore />} />
          <Route path="explore/tag/:tag"  element={<HashtagPage />} />
          <Route path="activity"          element={<Activity />} />
          <Route path="search"            element={<SearchRedirect />} />
        </Route>

        <Route path="*" element={<AuthPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;