import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthForm = ({ onAuthSuccess }) => {
  // Add this prop
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      }
      onAuthSuccess(userCredential.user);
    } catch (error) {
      let errorMessage = 'Authentication failed';
      switch (error.code) {
        case 'auth/weak-password':
          errorMessage = 'Password must be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/user-not-found':
          errorMessage = 'User not found';
          break;
        default:
          errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-['Courier_New']">
      {/* Authentication Mode Toggle */}
      <div className='flex space-x-2 border-2 border-gray-400 p-2 bg-[#fffff0]'>
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 p-2 font-mono text-sm border-2 transition-all
            ${
              isLogin
                ? 'bg-green-700 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-gray-200 border-gray-400'
            }`}
          type='button'>
          【 LOGIN 】
          <div className='text-xs mt-1'>
            {isLogin && '► '}EXISTING CLEARANCE
          </div>
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 p-2 font-mono text-sm border-2 transition-all
            ${
              !isLogin
                ? 'bg-blue-700 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-gray-200 border-gray-400'
            }`}
          type='button'>
          【 REGISTER 】
          <div className='text-xs mt-1'>{!isLogin && '► '}NEW CLEARANCE</div>
        </button>
      </div>

      <form onSubmit={handleAuth} className='space-y-4'>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm mb-1'>EMAIL:</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full p-2 font-mono border-2 border-gray-400 bg-[#fffff0]'
              required
            />
          </div>

          <div>
            <label className='block text-sm mb-1'>PASSWORD:</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full p-2 font-mono border-2 border-gray-400 bg-[#fffff0]'
              required
            />
          </div>
        </div>

        {error && (
          <div className='text-red-700 text-sm border-2 border-red-700 bg-red-100 p-2'>
            SYSTEM ERROR: {error}
          </div>
        )}

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-gradient-to-b from-green-700 to-green-800 text-white p-3 
                   font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                   hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                   hover:translate-x-[1px] hover:translate-y-[1px]
                   active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
                   disabled:opacity-50'>
          {loading
            ? '【 AUTHENTICATING... 】'
            : isLogin
            ? '【 PROCEED TO LOGIN 】'
            : '【 PROCEED TO REGISTER 】'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
