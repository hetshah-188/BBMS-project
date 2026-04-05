import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      login(data.user, data.token);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#fce6e6] to-[#ffffff] p-6 font-inter">
      <div className="bg-white rounded-[16px] p-10 max-w-[500px] w-full shadow-xl">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 text-[1.8rem] font-extrabold text-primary no-underline justify-center mb-6 font-clash">
            <i className="fas fa-droplet text-[2rem] animate-drop"></i>
            <span>Life4U</span>
          </Link>
          <h2 className="text-[1.8rem] mb-2 font-clash">Welcome Back</h2>
          <p className="text-gray">Login to your donor/patient account</p>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-5">
            <label className="block mb-2 font-medium">Email Address</label>
            <div className="relative flex items-center">
              <i className="fas fa-envelope absolute left-3 text-gray"></i>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-[12px_12px_12px_40px] border border-[#f0f0f0] rounded-md text-base transition-colors duration-300 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="mb-5">
            <label className="block mb-2 font-medium">Password</label>
            <div className="relative flex items-center">
              <i className="fas fa-lock absolute left-3 text-gray"></i>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-[12px_12px_12px_40px] border border-[#f0f0f0] rounded-md text-base transition-colors duration-300 focus:outline-none focus:border-primary"
              />
              <i
                className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} absolute right-3 cursor-pointer text-gray hover:text-primary transition-colors`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <label className="flex items-center gap-2 cursor-pointer relative pl-6">
              <input type="checkbox" className="absolute opacity-0 cursor-pointer" />
              <span className="absolute left-0 h-[18px] w-[18px] bg-[#f0f0f0] rounded-sm"></span>
              Remember me
            </label>
            <a href="#" className="text-primary no-underline font-medium hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3.5 bg-linear-to-br from-primary to-primary-light text-white border-none rounded-md text-[1.1rem] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hover disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center relative my-8 before:content-[''] before:absolute before:top-1/2 before:left-0 before:w-[calc(50%-70px)] before:h-px before:bg-[#f0f0f0] after:content-[''] after:absolute after:top-1/2 after:right-0 after:w-[calc(50%-70px)] after:h-px after:bg-[#f0f0f0]">
          <span className="bg-white px-4 text-gray">Or continue with</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="p-3 border border-[#f0f0f0] rounded-md bg-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-[#f0f0f0] text-[#DB4437]">
            <i className="fab fa-google"></i> Google
          </button>
          <button className="p-3 border border-[#f0f0f0] rounded-md bg-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-[#f0f0f0] text-[#4267B2]">
            <i className="fab fa-facebook-f"></i> Facebook
          </button>
        </div>

        <div className="text-center mt-6 text-gray">
          Don't have an account? <Link to="/signup" className="text-primary no-underline font-semibold hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
