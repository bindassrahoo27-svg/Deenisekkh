import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import './App.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDn6V7p5zfY1P4Y7KXGaTvfZkivuYbhhjg",
  authDomain: "raaz-cf574.firebaseapp.com",
  databaseURL: "https://raaz-cf574-default-rtdb.firebaseio.com",
  projectId: "raaz-cf574",
  storageBucket: "raaz-cf574.firebasestorage.app",
  messagingSenderId: "752137866532",
  appId: "1:752137866532:android:bca4edd1ba14605a3a37b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Navbar Component
function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <span>🕌</span>
          <span>Islamic App</span>
        </div>
        {user && (
          <ul className="nav-links">
            <li><Link to="/" className="nav-link">Home</Link></li>
            <li><Link to="/quran" className="nav-link">Quran</Link></li>
            <li><Link to="/community" className="nav-link">Community</Link></li>
            <li><Link to="/namaz" className="nav-link">Namaz</Link></li>
          </ul>
        )}
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

// Login Component
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

// Register Component
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await set(ref(database, 'users/' + user.uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

// Home Component
function Home() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    const postsRef = ref(database, 'posts');
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setPosts(postsArray.reverse());
      }
    });
  }, []);

  const addPost = async () => {
    if (!newPost.trim()) return;
    
    const user = auth.currentUser;
    const postsRef = ref(database, 'posts');
    const newPostRef = ref(database, 'posts/' + Date.now());
    
    await set(newPostRef, {
      content: newPost,
      author: user?.email || 'Anonymous',
      timestamp: new Date().toISOString(),
      likes: 0
    });
    
    setNewPost('');
  };

  return (
    <div className="container">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome to Islamic Community</h1>
        <p className="welcome-subtitle">Share your thoughts and connect with fellow Muslims</p>
      </div>
      
      <div className="add-post">
        <textarea 
          value={newPost} 
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          rows="3"
        />
        <button onClick={addPost}>Share Post</button>
      </div>
      
      <div className="posts-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="post-avatar">{post.author?.[0]}</div>
              <div>
                <div className="post-author">{post.author}</div>
                <div className="post-time">{new Date(post.timestamp).toLocaleString()}</div>
              </div>
            </div>
            <div className="post-content">{post.content}</div>
            <div className="post-footer">
              <button>👍 {post.likes || 0}</button>
              <button>💬 Comment</button>
              <button>↪️ Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Quran Component
function Quran() {
  const [surahs, setSurahs] = useState([
    { number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah' },
    { number: 2, name: 'البقرة', englishName: 'Al-Baqarah' },
    { number: 3, name: 'آل عمران', englishName: 'Ali Imran' },
    { number: 4, name: 'النساء', englishName: 'An-Nisa' },
    { number: 5, name: 'المائدة', englishName: 'Al-Maidah' }
  ]);

  return (
    <div className="container">
      <div className="quran-header">
        <h1>📖 The Holy Quran</h1>
        <p>Read and listen to the divine revelation</p>
      </div>
      
      <div className="surahs-grid">
        {surahs.map(surah => (
          <div key={surah.number} className="surah-card">
            <div className="surah-number">{surah.number}</div>
            <div className="surah-name-arabic">{surah.name}</div>
            <div className="surah-name-english">{surah.englishName}</div>
            <button className="play-btn">▶️ Play Audio</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Community Component
function Community() {
  const [communities, setCommunities] = useState([
    { id: 1, name: 'Quran Study Group', members: 1250, description: 'Daily Quran reading and discussion' },
    { id: 2, name: 'Islamic Learning', members: 850, description: 'Learn authentic Islamic knowledge' },
    { id: 3, name: 'Salah Reminders', members: 3200, description: 'Never miss your prayers' }
  ]);

  return (
    <div className="container">
      <div className="community-header">
        <h1>🤝 Islamic Community</h1>
        <p>Connect with fellow believers</p>
      </div>
      
      <div className="communities-grid">
        {communities.map(community => (
          <div key={community.id} className="community-card">
            <div className="community-header-card">
              <h3>{community.name}</h3>
              <p>👥 {community.members} members</p>
            </div>
            <div className="community-body">
              <p>{community.description}</p>
              <button className="join-btn">Join Community</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Namaz Component
function Namaz() {
  const [tutorials, setTutorials] = useState([
    { id: 1, title: 'Fajr Prayer', steps: 13, level: 'Beginner' },
    { id: 2, title: 'Dhuhr Prayer', steps: 17, level: 'Beginner' },
    { id: 3, title: 'Asr Prayer', steps: 17, level: 'Intermediate' },
    { id: 4, title: 'Maghrib Prayer', steps: 11, level: 'Beginner' },
    { id: 5, title: 'Isha Prayer', steps: 17, level: 'Intermediate' }
  ]);

  return (
    <div className="container">
      <div className="namaz-header">
        <h1>🕌 Namaz Tutorials</h1>
        <p>Learn Salah step by step</p>
      </div>
      
      <div className="tutorials-grid">
        {tutorials.map(tutorial => (
          <div key={tutorial.id} className="tutorial-card">
            <div className="tutorial-image">🕌</div>
            <div className="tutorial-content">
              <h3>{tutorial.title}</h3>
              <p>{tutorial.level} Level • {tutorial.steps} steps</p>
              <button className="start-btn">Start Learning</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/quran" element={user ? <Quran /> : <Navigate to="/login" />} />
        <Route path="/community" element={user ? <Community /> : <Navigate to="/login" />} />
        <Route path="/namaz" element={user ? <Namaz /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;