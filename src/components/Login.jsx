import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // ✅ Make sure this is correct path

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // <-- Add this line
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true); // <-- Add this line
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Store session locally (optional)
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', user.email);

      // ✅ Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err.code, err.message);
      setError(err.message); // Show actual error
    } finally {
      setLoading(false); // <-- Add this line
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900/60 to-purple-900/60 px-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">🔐 Orinexa Client Login</h2>
        <input
          className="w-full border px-3 py-2 mb-3 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full border px-3 py-2 mb-3 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          disabled={loading} // <-- Add this line
        >
          {loading ? "Logging in..." : "Login"} {/* <-- Add this line */}
        </button>
      </div>
    </div>
  );
};

export default Login;