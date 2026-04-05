import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestService, inventoryService } from '../services/api';
import Layout from '../components/Layout';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    reqBloodType: '',
    reqUnits: 1,
    reqUrgency: 'normal',
    reqHospital: '',
    reqDate: '',
    reqPurpose: '',
    reqDoctor: '',
    reqContact: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqData, invData] = await Promise.all([
        requestService.getMyRequests(),
        inventoryService.get()
      ]);
      setRequests(reqData.requests || []);
      setInventory(invData.inventory || []);
    } catch (err) {
      console.error(err.message);
      setError('Failed to load data. Please refresh.');
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
      const data = await requestService.create({
        bloodType: formData.reqBloodType,
        units: formData.reqUnits,
        urgency: formData.reqUrgency,
        hospital: formData.reqHospital,
        requiredByDate: formData.reqDate,
        purpose: formData.reqPurpose,
        doctorName: formData.reqDoctor,
        contactNumber: formData.reqContact
      });
      alert(`Request submitted! 📋`);
      setFormData({
        reqBloodType: '',
        reqUnits: 1,
        reqUrgency: 'normal',
        reqHospital: '',
        reqDate: '',
        reqPurpose: '',
        reqDoctor: '',
        reqContact: ''
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await requestService.cancel(id);
      alert('Request cancelled.');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Layout>
      <div className="bg-[#f8fafc] min-h-screen py-10 px-[30px] font-inter">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-extrabold font-clash mb-2">Patient Portal | {user?.name}</h1>
              <p className="text-gray">Request blood and track your status.</p>
            </div>
            <button onClick={logout} className="px-6 py-2.5 bg-white border-2 border-primary text-primary font-semibold rounded-[50px] transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white hover:border-transparent">Logout</button>
          </div>

          {error && (
            <div className="p-4 mb-6 text-danger bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => {
              const item = inventory.find(i => i.bloodType === type);
              return (
                <div key={type} className="bg-white p-6 rounded-[20px] shadow-sm flex items-center justify-between">
                  <div className="text-2xl font-bold font-clash text-primary">{type}</div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{item ? item.units : 0}</div>
                    <div className="text-xs text-gray uppercase tracking-wider">Units</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item && item.units > 20 ? 'bg-[#d1fae5] text-success' : 'bg-[#ffebee] text-danger'
                  }`}>{item && item.units > 20 ? 'Safe' : 'Low'}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[30px] shadow-md sticky top-24">
                <h3 className="text-xl font-bold mb-6 font-clash text-danger">Blood Request Form</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">Blood Type</label>
                    <select name="reqBloodType" required value={formData.reqBloodType} onChange={handleChange} className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary appearance-none">
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Units</label>
                      <input type="number" name="reqUnits" required min="1" value={formData.reqUnits} onChange={handleChange} className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Urgency</label>
                      <select name="reqUrgency" required value={formData.reqUrgency} onChange={handleChange} className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary appearance-none">
                        <option value="routine">Normal</option>
                        <option value="urgent">Urgent</option>
                        <option value="emergency">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">Hospital Name</label>
                    <input type="text" name="reqHospital" required value={formData.reqHospital} onChange={handleChange} placeholder="Hospital name" className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">Required By Date</label>
                    <input type="date" name="reqDate" required value={formData.reqDate} onChange={handleChange} className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">Contact Number</label>
                    <input type="tel" name="reqContact" required value={formData.reqContact} onChange={handleChange} placeholder="Mobile number" className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary" />
                  </div>
                  <button type="submit" className="w-full p-4 bg-linear-to-br from-primary to-primary-light text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-hover transition-all">Submit Request</button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-[30px] shadow-md h-full">
                <h3 className="text-xl font-bold mb-6 font-clash text-dark">My Blood Requests</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] text-left">
                        <th className="p-4 font-semibold text-gray">ID</th>
                        <th className="p-4 font-semibold text-gray">Type</th>
                        <th className="p-4 font-semibold text-gray">Units</th>
                        <th className="p-4 font-semibold text-gray">Urgency</th>
                        <th className="p-4 font-semibold text-gray">Status</th>
                        <th className="p-4 font-semibold text-gray">Date</th>
                        <th className="p-4 font-semibold text-gray">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {loading ? (
                        <tr><td colSpan="7" className="p-4 text-center">Loading...</td></tr>
                      ) : requests.length > 0 ? (
                        requests.map((r, i) => (
                          <tr key={i} className="hover:bg-[#f8fafc] transition-colors">
                            <td className="p-4 font-medium">{r.requestId}</td>
                            <td className="p-4 font-bold text-primary">{r.bloodType}</td>
                            <td className="p-4">{r.units}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                r.urgency === 'critical' ? 'bg-[#ffebee] text-danger' :
                                r.urgency === 'urgent' ? 'bg-[#fff3e0] text-warning' :
                                'bg-[#e0f2fe] text-[#0ea5e9]'
                              }`}>{r.urgency}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                r.status === 'completed' ? 'bg-[#d1fae5] text-success' :
                                r.status === 'cancelled' ? 'bg-[#f3f4f6] text-gray' :
                                'bg-[#fff3e0] text-warning'
                              }`}>{r.status}</span>
                            </td>
                            <td className="p-4">{new Date(r.requiredByDate).toLocaleDateString('en-IN')}</td>
                            <td className="p-4">
                              {r.status !== 'cancelled' && r.status !== 'completed' ? (
                                <button onClick={() => handleCancel(r._id)} className="px-3 py-1 bg-white border border-primary text-primary text-xs rounded hover:bg-primary hover:text-white transition-all">Cancel</button>
                              ) : '—'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="7" className="p-4 text-center text-gray">No requests yet.</td></tr>
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

export default PatientDashboard;
