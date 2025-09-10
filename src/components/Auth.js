import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';

const Auth = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setMessage(`✅ Welcome ${currentUser.email}!`);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('🎉 Login successful!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('🎉 Account created successfully!');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setMessage('👋 Signed out successfully!');
      setEmail('');
      setPassword('');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  if (user) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h2>🔥 NutriBridge Firebase Connected!</h2>
        <p><strong>User:</strong> {user.email}</p>
        <p><strong>UID:</strong> {user.uid}</p>
        <button 
          onClick={handleSignOut}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#ff4757', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
        {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>🔥 NutriBridge Authentication</h2>
      
      <form onSubmit={handleAuth}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '5px', 
              border: '1px solid #ddd' 
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '5px', 
              border: '1px solid #ddd' 
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#2ed573', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? '⏳ Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => setIsLogin(!isLogin)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#007bff', 
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {isLogin ? 'Sign Up' : 'Sign In'}
        </button>
      </p>

      {message && (
        <p style={{ 
          color: message.includes('❌') ? 'red' : 'green', 
          marginTop: '10px',
          textAlign: 'center'
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Auth;