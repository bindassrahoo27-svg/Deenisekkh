import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import axios from 'axios';
import './App.css';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Quran from './components/Quran';
import Community from './components/Community';
import Namaz from './components/Namaz';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        fetchPosts();
        fetchCommunities();
        fetchTutorials();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPosts = () => {
    const postsRef = ref(db, 'posts');
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setPosts(postsArray.reverse());
      } else {
        // Sample posts
        setPosts([
          {
            id: '1',
            title: 'Welcome to Islamic Community',
            content: 'Share your thoughts and connect with fellow Muslims.',
            author: 'Admin',
            timestamp: new Date().toISOString(),
            likes: 25,
            comments: 5
          }
        ]);
      }
    });
  };

  const fetchSurahs = async () => {
    try {
      const response = await axios.get('https://api.alquran.cloud/v1/surah');
      setSurahs(response.data.data);
    } catch (error) {
      // Fallback data
      setSurahs([
        { number: 1, englishName: 'Al-Fatihah', name: 'الفاتحة' },
        { number: 2, englishName: 'Al-Baqarah', name: 'البقرة' },
        { number: 3, englishName: 'Ali Imran', name: 'آل عمران' }
      ]);
    }
  };

  const fetchCommunities = () => {
    const communitiesRef = ref(db, 'community');
    onValue(communitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const communitiesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setCommunities(communitiesArray);
      } else {
        setCommunities([
          {
            id: '1',
            name: 'Daily Quran Study',
            members: 1250,
            description: 'Join us in daily Quran reading'
          }
        ]);
      }
    });
  };

  const fetchTutorials = () => {
    const tutorialsRef = ref(db, 'namaz_tutorials');
    onValue(tutorialsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tutorialsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setTutorials(tutorialsArray);
      } else {
        setTutorials([
          {
            id: '1',
            title: 'Fajr Prayer Tutorial',
            description: 'Learn how to pray Fajr',
            steps: 13
          }
        ]);
      }
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <Routes>
          <Route 
            path="/" 
            element={user ? <Home posts={posts} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" /> : <Register />} 
          />
          <Route 
            path="/quran" 
            element={user ? <Quran surahs={surahs} fetchSurahs={fetchSurahs} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/community" 
            element={user ? <Community communities={communities} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/namaz" 
            element={user ? <Namaz tutorials={tutorials} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;