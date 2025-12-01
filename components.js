import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, push, set } from 'firebase/database';

// Navbar Component
export function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <span>🕌</span>
          <span>Islamic App</span>
        </div>
        
        <ul className="nav-links">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/quran" className="nav-link">Quran</Link></li>
          <li><Link to="/community" className="nav-link">Community</Link></li>
          <li><Link to="/namaz" className="nav-link">Namaz</Link></li>
        </ul>
        
        <div className="user-info">
          <div className="user-avatar">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

// Login Component
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
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
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

// Register Component
export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getDatabase();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save user data to database
      await set(ref(db, 'users/' + user.uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString()
      });
      
      setSuccess('Account created successfully!');
      setTimeout(() => navigate('/'), 2000);
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
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

// Home Component
export function Home({ posts }) {
  const [newPost, setNewPost] = useState('');
  const db = getDatabase();
  const auth = getAuth();

  const handleAddPost = async () => {
    if (!newPost.trim()) return;
    
    const user = auth.currentUser;
    const postsRef = ref(db, 'posts');
    const newPostRef = push(postsRef);
    
    await set(newPostRef, {
      title: 'New Post',
      content: newPost,
      author: user?.email || 'Anonymous',
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0
    });
    
    setNewPost('');
  };

  return (
    <div className="container">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome to Islamic Community</h1>
        <p className="welcome-subtitle">Share, Learn and Grow Together</p>
      </div>
      
      <div className="add-post" style={{ marginBottom: '30px' }}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts..."
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid #ddd',
            marginBottom: '10px',
            fontSize: '16px',
            resize: 'vertical',
            minHeight: '100px'
          }}
        />
        <button
          onClick={handleAddPost}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          Share Post
        </button>
      </div>
      
      <div className="posts-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="post-avatar">
                {post.author?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <div className="post-author">{post.author}</div>
                <div className="post-time">
                  {new Date(post.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <h3 className="post-title">{post.title}</h3>
            <p className="post-content">{post.content}</p>
            
            <div className="post-footer">
              <div className="post-action">
                <span>👍</span>
                <span>{post.likes}</span>
              </div>
              <div className="post-action">
                <span>💬</span>
                <span>{post.comments} comments</span>
              </div>
              <div className="post-action">
                <span>↪️</span>
                <span>Share</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Quran Component
export function Quran({ surahs, fetchSurahs }) {
  const [search, setSearch] = useState('');
  const [playingAudio, setPlayingAudio] = useState(null);

  const filteredSurahs = surahs.filter(surah =>
    surah.englishName?.toLowerCase().includes(search.toLowerCase()) ||
    surah.name?.toLowerCase().includes(search.toLowerCase())
  );

  const playAudio = (surahNumber) => {
    if (playingAudio === surahNumber) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(surahNumber);
      // Audio implementation would go here
      console.log(`Playing Surah ${surahNumber}`);
    }
  };

  return (
    <div className="container">
      <div className="quran-header">
        <h1>📖 The Holy Quran</h1>
        <p>Read, Listen and Reflect</p>
      </div>
      
      <div className="search-box">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Surahs..."
        />
      </div>
      
      <button
        onClick={fetchSurahs}
        style={{
          marginBottom: '30px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '12px 25px',
          borderRadius: '25px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600'
        }}
      >
        Load Surahs
      </button>
      
      <div className="surahs-grid">
        {filteredSurahs.map(surah => (
          <div key={surah.number} className="surah-card">
            <div className="surah-number">{surah.number}</div>
            <div className="surah-name-arabic">{surah.name || 'السورة'}</div>
            <h3 className="surah-name-english">{surah.englishName || 'Surah'}</h3>
            <div className="surah-info">
              {surah.englishNameTranslation && (
                <div>{surah.englishNameTranslation}</div>
              )}
              {surah.numberOfAyahs && (
                <div>{surah.numberOfAyahs} Ayahs</div>
              )}
            </div>
            
            <div className="audio-controls">
              <button
                onClick={() => playAudio(surah.number)}
                className="play-btn"
              >
                {playingAudio === surah.number ? '⏸️' : '▶️'}
              </button>
              <span>Listen to Recitation</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Community Component
export function Community({ communities }) {
  return (
    <div className="container">
      <div className="community-header">
        <h1>🤝 Islamic Community</h1>
        <p>Connect with fellow believers</p>
      </div>
      
      <div className="community-stats">
        <div className="stat-card">
          <div className="stat-number">{communities.length}</div>
          <div className="stat-label">Communities</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {communities.reduce((sum, com) => sum + (com.members || 0), 0)}
          </div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Active Support</div>
        </div>
      </div>
      
      <div className="communities-grid">
        {communities.map(community => (
          <div key={community.id} className="community-card">
            <div className="community-header-card">
              <h3 className="community-title">{community.name}</h3>
              <div className="community-members">
                👥 {community.members || 0} members
              </div>
            </div>
            
            <div className="community-body">
              <p className="community-description">
                {community.description || 'Join this community to learn and grow together'}
              </p>
              <button className="join-btn">
                Join Community
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Namaz Component
export function Namaz({ tutorials }) {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="container">
      <div className="namaz-header">
        <h1>🕌 Namaz Tutorials</h1>
        <p>Learn Salah step by step</p>
        
        {isAdmin && (
          <button
            style={{
              marginTop: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            + Add Tutorial (Admin)
          </button>
        )}
      </div>
      
      <div className="tutorials-grid">
        {tutorials.map(tutorial => (
          <div key={tutorial.id} className="tutorial-card">
            <div className="tutorial-image">
              🕌
            </div>
            
            <div className="tutorial-content">
              <h3 className="tutorial-title">{tutorial.title}</h3>
              <p className="tutorial-description">
                {tutorial.description || 'Learn this prayer with detailed step-by-step instructions'}
              </p>
              
              <div className="tutorial-meta">
                <span className="tutorial-level">
                  {tutorial.level || 'Beginner'}
                </span>
                <span className="tutorial-steps">
                  📝 {tutorial.steps || 10} steps
                </span>
              </div>
              
              <button className="start-btn">
                Start Learning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}