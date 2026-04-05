import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { donationService, donorService } from '../services/api';
import Layout from '../components/Layout';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [donorProfile, setDonorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    hospital: '',
    units: 1,
    donationDate: '',
    bloodType: '',
    weight: '',
    notes: ''
  });
  const toast = useToast();

  useEffect(() => {
    fetchDonations();
    fetchDonorProfile();
  }, []);

  const fetchDonorProfile = async () => {
    try {
      // Better: Wait for backend route GET /api/donors/me, but we can filter from all if needed.
      // Assuming we will add GET /api/donors/me to backend:
      const data = await donorService.getAll();
      const myProfile = data.data?.find(d => d.userId?._id === user?.id || d.userId === user?.id);
      setDonorProfile(myProfile || null);
    } catch (err) {
      console.error('Could not load donor profile:', err.message);
    }
  };

  const fetchDonations = async () => {
    try {
      const data = await donationService.getMyDonations();
      setDonations(data.donations || []);
    } catch (err) {
      console.error(err.message);
      setError('Failed to load donation history. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await donationService.create({
        ...formData,
        bloodType: formData.bloodType || user?.bloodType,
        donationDate: formData.donationDate || new Date().toISOString()
      });
      toast('Donation scheduled successfully! 🩸', 'success');
      setFormData({ hospital: '', units: 1, donationDate: '', bloodType: '', weight: '', notes: '' });
      fetchDonations();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <Layout>
      <div className="bg-[#f8fafc] min-h-screen py-10 px-[30px] font-inter">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-extrabold font-clash mb-2">Welcome back, {user?.name}! 👋</h1>
              <p className="text-gray">Manage your donations and see your impact.</p>
            </div>
          </div>

          {error && (
            <div className="p-4 mb-6 text-danger bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-[30px] shadow-md">
                <h3 className="text-xl font-bold mb-6 font-clash">Donor Profile</h3>
                <div className="space-y-4">
                  <div className="flex justify-between p-4 bg-[#f8fafc] rounded-xl">
                    <span className="text-gray">Blood Type</span>
                    <span className="font-bold text-primary text-xl">
                      {donorProfile?.bloodType || user?.bloodType || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between p-4 bg-[#f8fafc] rounded-xl">
                    <span className="text-gray">Total Points</span>
                    <span className="font-bold text-success text-xl">1250</span>
                  </div>
                  <div className="flex justify-between p-4 bg-[#f8fafc] rounded-xl">
                    <span className="text-gray">Donations</span>
                    <span className="font-bold text-dark text-xl">{donations.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[30px] shadow-md">
                <h3 className="text-xl font-bold mb-6 font-clash">Schedule Donation</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Blood Type</label>
                    <select name="bloodType" required value={formData.bloodType} onChange={handleChange} className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary appearance-none">
                      <option value="">Select Blood Type</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Preferred Hospital</label>
                    <input type="text" name="hospital" required value={formData.hospital} onChange={handleChange} placeholder="Hospital name" className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Units</label>
                    <input type="number" name="units" required min="1" max="2" value={formData.units} onChange={handleChange} className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Date</label>
                    <input type="date" name="donationDate" required value={formData.donationDate} onChange={handleChange} className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary" />
                  </div>
                  <button type="submit" className="w-full p-4 bg-linear-to-br from-primary to-primary-light text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-hover transition-all">Schedule Now</button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-[30px] shadow-md h-full">
                <h3 className="text-xl font-bold mb-6 font-clash">My Donation History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] text-left">
                        <th className="p-4 font-semibold text-gray">Date</th>
                        <th className="p-4 font-semibold text-gray">Type</th>
                        <th className="p-4 font-semibold text-gray">Units</th>
                        <th className="p-4 font-semibold text-gray">Hospital</th>
                        <th className="p-4 font-semibold text-gray">Status</th>
                        <th className="p-4 font-semibold text-gray">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {loading ? (
                        <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>
                      ) : donations.length > 0 ? (
                        donations.map((d, i) => (
                          <tr key={i} className="hover:bg-[#f8fafc] transition-colors">
                            <td className="p-4">{new Date(d.donationDate).toLocaleDateString('en-IN')}</td>
                            <td className="p-4">{d.bloodType}</td>
                            <td className="p-4">{d.units} unit(s)</td>
                            <td className="p-4">{d.hospital}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                d.status === 'completed' ? 'bg-[#d1fae5] text-success' :
                                d.status === 'pending' ? 'bg-[#fff3e0] text-warning' :
                                'bg-[#ffebee] text-danger'
                              }`}>{d.status}</span>
                            </td>
                            <td className="p-4">{d.pointsEarned || 0}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="6" className="p-4 text-center text-gray">No donations yet. Start saving lives today!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DonorDashboard;
