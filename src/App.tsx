/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Mail, Eye, EyeOff, ArrowRight, Github, Chrome, 
  User, UserPlus, Wallet, Eye as ViewIcon, UserCircle, 
  ArrowUpCircle, ArrowDownCircle, LogOut, Bell, TrendingUp
} from 'lucide-react';

// Types
interface UserData {
  name: string;
  email: string;
  password: string;
  balance: number;
}

export default function App() {
  // Auth State
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState<'dashboard' | 'deposit' | 'withdraw' | 'profile' | 'ads'>('dashboard');
  
  // Transaction/Ad State
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bkash');
  const [adTimer, setAdTimer] = useState(0);
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  // Load user from localStorage on mount (optional: auto-login)
  useEffect(() => {
    const savedSession = localStorage.getItem('activeUser');
    if (savedSession) {
      setCurrentUser(JSON.parse(savedSession));
      setIsLoggedIn(true);
    }
  }, []);

  // Update user in localStorage whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('activeUser', JSON.stringify(currentUser));
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: UserData) => u.email === currentUser.email ? currentUser : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  }, [currentUser]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না!');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.find((u: UserData) => u.email === email);

      if (userExists) {
        setError('এই ইমেইলটি ইতিমধ্যে নিবন্ধিত!');
        setIsLoading(false);
        return;
      }

      const newUser: UserData = { name, email, password, balance: 500 }; // Default balance 500
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      setIsLoading(false);
      setIsRegistering(false);
      setEmail('');
      setPassword('');
      alert('নিবন্ধন সফল হয়েছে! এখন লগ ইন করুন।');
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: UserData) => u.email === email && u.password === password);

      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('activeUser', JSON.stringify(user));
      } else {
        setError('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়!');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('activeUser');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const depAmount = parseFloat(amount);
    if (isNaN(depAmount) || depAmount <= 0) {
      alert('সঠিক পরিমাণ লিখুন');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setCurrentUser({ ...currentUser, balance: currentUser.balance + depAmount });
      setIsLoading(false);
      setAmount('');
      setActiveView('dashboard');
      alert(`৳${depAmount} সফলভাবে ডিপোজিট করা হয়েছে!`);
    }, 1500);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const withAmount = parseFloat(amount);
    if (isNaN(withAmount) || withAmount <= 0) {
      alert('সঠিক পরিমাণ লিখুন');
      return;
    }
    if (withAmount > currentUser.balance) {
      alert('আপনার ব্যালেন্স পর্যাপ্ত নয়');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setCurrentUser({ ...currentUser, balance: currentUser.balance - withAmount });
      setIsLoading(false);
      setAmount('');
      setActiveView('dashboard');
      alert(`৳${withAmount} উত্তোলনের অনুরোধ সফল হয়েছে!`);
    }, 1500);
  };

  const startAd = () => {
    setIsAdPlaying(true);
    setAdTimer(15); // 15 seconds ad
  };

  useEffect(() => {
    let timer: any;
    if (isAdPlaying && adTimer > 0) {
      timer = setInterval(() => {
        setAdTimer((prev) => prev - 1);
      }, 1000);
    } else if (isAdPlaying && adTimer === 0) {
      setIsAdPlaying(false);
      if (currentUser) {
        setCurrentUser({ ...currentUser, balance: currentUser.balance + 10 }); // Earn 10 per ad
        alert('অভিনন্দন! আপনি বিজ্ঞাপন দেখে ৳১০ আয় করেছেন।');
      }
    }
    return () => clearInterval(timer);
  }, [isAdPlaying, adTimer, currentUser]);

  // --- DASHBOARD VIEW ---
  if (isLoggedIn && currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        {/* Navigation */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('dashboard')}>
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-indigo-600">EarnPro</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-sm font-bold text-slate-900">{currentUser.name}</span>
                  <span className="text-xs text-slate-500">{currentUser.email}</span>
                </div>
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Welcome & Balance Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2 bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                    <div className="relative z-10">
                      <h2 className="text-3xl font-bold mb-2">স্বাগতম, {currentUser.name}!</h2>
                      <p className="text-indigo-100 mb-6">আজকের দিনটি আপনার জন্য লাভজনক হোক।</p>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setActiveView('ads')}
                          className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
                        >
                          কাজ শুরু করুন
                        </button>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-500 font-medium">বর্তমান ব্যালেন্স</span>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                          <Wallet className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-4xl font-black text-slate-900">
                        ৳{currentUser.balance.toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-green-600 text-sm font-bold">
                      <TrendingUp className="w-4 h-4" />
                      <span>গত ২৪ ঘণ্টায় +৳৫০ বৃদ্ধি পেয়েছে</span>
                    </div>
                  </div>
                </div>

                {/* Action Grid */}
                <h3 className="text-xl font-bold text-slate-900 mb-6">আপনার জন্য অপশনসমূহ</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { id: 'ads', icon: <ViewIcon />, label: 'ভিউ অ্যাড', color: 'bg-blue-500', desc: 'বিজ্ঞাপন দেখে আয় করুন' },
                    { id: 'profile', icon: <UserCircle />, label: 'মাই প্রোফাইল', color: 'bg-purple-500', desc: 'তথ্য আপডেট করুন' },
                    { id: 'deposit', icon: <ArrowDownCircle />, label: 'ডিপোজিট', color: 'bg-emerald-500', desc: 'টাকা জমা দিন' },
                    { id: 'withdraw', icon: <ArrowUpCircle />, label: 'উইথড্র', color: 'bg-orange-500', desc: 'টাকা উত্তোলন করুন' },
                  ].map((item, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ y: -5 }}
                      onClick={() => setActiveView(item.id as any)}
                      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-left group transition-all hover:shadow-md hover:border-indigo-100"
                    >
                      <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform`}>
                        {React.cloneElement(item.icon as React.ReactElement, { className: "w-6 h-6" })}
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1">{item.label}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Recent Activity (Placeholder) */}
                <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">সাম্প্রতিক লেনদেন</h3>
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                            <ArrowDownCircle className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">বোনাস রিওয়ার্ড</p>
                            <p className="text-xs text-slate-500">০৫ এপ্রিল, ২০২৬</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">+৳২৫.০০</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'deposit' && (
              <motion.div
                key="deposit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
              >
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowRight className="w-6 h-6 rotate-180" />
                  </button>
                  <h2 className="text-2xl font-bold text-slate-900">টাকা ডিপোজিট করুন</h2>
                </div>

                <form onSubmit={handleDeposit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">পেমেন্ট মেথড সিলেক্ট করুন</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['Bkash', 'Nagad', 'Rocket'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-3 px-4 rounded-xl border-2 transition-all font-bold ${paymentMethod === method ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">পরিমাণ (৳)</label>
                    <input 
                      type="number" 
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="৫০০ - ২৫০০০"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-700 text-sm">
                    <p className="font-bold mb-1">নির্দেশনা:</p>
                    <p>১. আমাদের পার্সোনাল নাম্বারে সেন্ড মানি করুন।</p>
                    <p>২. ট্রানজেকশন আইডি এবং পরিমাণ দিয়ে সাবমিট করুন।</p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70"
                  >
                    {isLoading ? 'প্রসেসিং হচ্ছে...' : 'ডিপোজিট রিকোয়েস্ট পাঠান'}
                  </button>
                </form>
              </motion.div>
            )}

            {activeView === 'withdraw' && (
              <motion.div
                key="withdraw"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
              >
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowRight className="w-6 h-6 rotate-180" />
                  </button>
                  <h2 className="text-2xl font-bold text-slate-900">টাকা উত্তোলন করুন</h2>
                </div>

                <div className="mb-8 p-6 bg-slate-900 rounded-3xl text-white">
                  <p className="text-slate-400 text-sm mb-1">উত্তোলনযোগ্য ব্যালেন্স</p>
                  <p className="text-3xl font-black">৳{currentUser.balance.toLocaleString()}</p>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">পেমেন্ট মেথড</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option>Bkash</option>
                      <option>Nagad</option>
                      <option>Rocket</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">পরিমাণ (৳)</label>
                    <input 
                      type="number" 
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="মিনিমাম ৫০০"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">আপনার নাম্বার</label>
                    <input 
                      type="text" 
                      required
                      placeholder="০১৭XXXXXXXX"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-70"
                  >
                    {isLoading ? 'প্রসেসিং হচ্ছে...' : 'উইথড্র রিকোয়েস্ট পাঠান'}
                  </button>
                </form>
              </motion.div>
            )}

            {activeView === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
              >
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowRight className="w-6 h-6 rotate-180" />
                  </button>
                  <h2 className="text-2xl font-bold text-slate-900">আমার প্রোফাইল</h2>
                </div>

                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg">
                    <UserCircle className="w-16 h-16" />
                  </div>
                  <h3 className="text-xl font-bold">{currentUser.name}</h3>
                  <p className="text-slate-500">{currentUser.email}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">মোট ব্যালেন্স</p>
                    <p className="font-bold text-lg">৳{currentUser.balance.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">অ্যাকাউন্ট স্ট্যাটাস</p>
                    <p className="font-bold text-lg text-green-600">Active</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">মোট উইথড্র</p>
                    <p className="font-bold text-lg">৳০.০০</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">জয়েনিং ডেট</p>
                    <p className="font-bold text-lg">০৫ এপ্রিল, ২০২৬</p>
                  </div>
                </div>

                <button className="w-full mt-8 py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                  পাসওয়ার্ড পরিবর্তন করুন
                </button>
              </motion.div>
            )}

            {activeView === 'ads' && (
              <motion.div
                key="ads"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowRight className="w-6 h-6 rotate-180" />
                  </button>
                  <h2 className="text-2xl font-bold text-slate-900">বিজ্ঞাপন দেখুন এবং আয় করুন</h2>
                </div>

                {!isAdPlaying ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((ad) => (
                      <div key={ad} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                            <ViewIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold">ভিডিও অ্যাড #{ad}</h4>
                            <p className="text-xs text-slate-500">সময়: ১৫ সেকেন্ড | আয়: ৳১০</p>
                          </div>
                        </div>
                        <button 
                          onClick={startAd}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                        >
                          প্লে করুন
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-3xl aspect-video flex flex-col items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <img 
                        src="https://picsum.photos/seed/ads/1920/1080" 
                        alt="Ad" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                      <h3 className="text-2xl font-bold mb-2">বিজ্ঞাপন রানিং...</h3>
                      <p className="text-slate-400">দয়া করে অপেক্ষা করুন</p>
                      <div className="mt-8 text-6xl font-black text-indigo-500">
                        {adTimer}s
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // --- AUTH VIEW (Login/Register) ---
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Side - Visual/Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-indigo-600 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center mb-8">
              {isRegistering ? <UserPlus className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              {isRegistering ? 'নতুন একটি যাত্রা শুরু করুন' : 'আপনার ডিজিটাল যাত্রা শুরু হোক এখান থেকেই'}
            </h1>
            <p className="text-indigo-100 text-lg max-w-md">
              {isRegistering 
                ? 'আমাদের কমিউনিটির অংশ হতে আজই নিবন্ধন করুন এবং বিশেষ সুবিধাগুলো উপভোগ করুন।' 
                : 'আমাদের প্ল্যাটফর্মে যোগ দিন এবং আপনার সৃজনশীলতাকে নতুন উচ্চতায় নিয়ে যান। নিরাপদ এবং দ্রুত এক্সেস নিশ্চিত করুন।'}
            </p>
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img 
                  key={i}
                  src={`https://picsum.photos/seed/${i + 30}/100/100`} 
                  alt="User" 
                  className="w-10 h-10 rounded-full border-2 border-indigo-600 object-cover"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
            <p className="text-sm text-indigo-100 font-medium">
              ১০,০০০+ ব্যবহারকারী আমাদের বিশ্বাস করেন
            </p>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full -ml-48 -mb-48 blur-3xl" />
        </div>

        {/* Right Side - Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={isRegistering ? 'register' : 'login'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {isRegistering ? 'অ্যাকাউন্ট তৈরি করুন' : 'লগ ইন করুন'}
                  </h2>
                  <p className="text-slate-500">
                    {isRegistering ? 'আপনার তথ্য দিয়ে নিবন্ধন সম্পন্ন করুন' : 'আপনার অ্যাকাউন্টে প্রবেশ করতে তথ্য দিন'}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {error}
                  </div>
                )}

                <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
                  {isRegistering && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 block ml-1">আপনার নাম</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <input 
                          type="text" 
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="আপনার নাম লিখুন"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block ml-1">ইমেইল ঠিকানা</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-sm font-semibold text-slate-700">পাসওয়ার্ড</label>
                      {!isRegistering && (
                        <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">পাসওয়ার্ড ভুলে গেছেন?</a>
                      )}
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {isRegistering && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 block ml-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isRegistering ? 'নিবন্ধন করুন' : 'লগ ইন করুন'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-8 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">অথবা {isRegistering ? 'নিবন্ধন' : 'লগ ইন'} করুন</span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700">
                    <Chrome className="w-5 h-5 text-red-500" />
                    Google
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700">
                    <Github className="w-5 h-5" />
                    GitHub
                  </button>
                </div>

                <p className="mt-10 text-center text-slate-600">
                  {isRegistering ? (
                    <>
                      ইতিমধ্যে অ্যাকাউন্ট আছে? <button onClick={toggleMode} className="font-bold text-indigo-600 hover:text-indigo-700">লগ ইন করুন</button>
                    </>
                  ) : (
                    <>
                      অ্যাকাউন্ট নেই? <button onClick={toggleMode} className="font-bold text-indigo-600 hover:text-indigo-700">নতুন অ্যাকাউন্ট তৈরি করুন</button>
                    </>
                  )}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
