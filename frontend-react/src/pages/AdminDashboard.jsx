import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminService, requestService, inventoryService } from '../services/api';
import Layout from '../components/Layout';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, reqData, invData] = await Promise.all([
        adminService.getStats(),
        requestService.getAll(),
        inventoryService.get()
      ]);
      setStats(statsData.stats || {});
      setRequests(reqData.data || []);
      setInventory(invData.inventory || []);
    } catch (err) {
      console.error(err.message);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      await requestService.updateStatus(id, status);
      toast(`Status updated to "${status}"`, 'success');
      fetchData();
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
              <h1 className="text-3xl font-extrabold font-clash mb-2">Admin Control Center | {user?.name}</h1>
              <p className="text-gray">Manage requests and monitor life-saving resources.</p>
            </div>
          </div>

          {error && (
            <div className="p-4 mb-6 text-danger bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="bg-white p-8 rounded-[30px] shadow-md text-center border-b-4 border-primary transition-transform hover:-translate-y-2">
              <div className="text-[2.5rem] font-extrabold text-primary mb-1">{stats.totalBloodUnits || 0}</div>
              <div className="text-gray uppercase text-xs font-bold tracking-widest">Total Units</div>
            </div>
            <div className="bg-white p-8 rounded-[30px] shadow-md text-center border-b-4 border-warning transition-transform hover:-translate-y-2">
              <div className="text-[2.5rem] font-extrabold text-warning mb-1">{stats.pendingRequests || 0}</div>
              <div className="text-gray uppercase text-xs font-bold tracking-widest">Pending Requests</div>
            </div>
            <div className="bg-white p-8 rounded-[30px] shadow-md text-center border-b-4 border-success transition-transform hover:-translate-y-2">
              <div className="text-[2.5rem] font-extrabold text-success mb-1">{stats.totalDonors || 0}</div>
              <div className="text-gray uppercase text-xs font-bold tracking-widest">Total Donors</div>
            </div>
            <div className="bg-white p-8 rounded-[30px] shadow-md text-center border-b-4 border-secondary transition-transform hover:-translate-y-2">
              <div className="text-[2.5rem] font-extrabold text-secondary mb-1">{stats.totalHospitals || 0}</div>
              <div className="text-gray uppercase text-xs font-bold tracking-widest">Hospitals</div>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button onClick={() => setActiveTab('requests')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'requests' ? 'bg-linear-to-br from-primary to-primary-light text-white shadow-md' : 'bg-white text-gray hover:bg-[#f0f0f0]'}`}>Active Requests</button>
            <button onClick={() => setActiveTab('inventory')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-linear-to-br from-primary to-primary-light text-white shadow-md' : 'bg-white text-gray hover:bg-[#f0f0f0]'}`}>Inventory Management</button>
          </div>

          {activeTab === 'requests' ? (
            <div className="bg-white p-8 rounded-[30px] shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] text-left">
                      <th className="p-4 font-semibold text-gray">ID</th>
                      <th className="p-4 font-semibold text-gray">Patient</th>
                      <th className="p-4 font-semibold text-gray">Blood</th>
                      <th className="p-4 font-semibold text-gray">Units</th>
                      <th className="p-4 font-semibold text-gray">Urgency</th>
                      <th className="p-4 font-semibold text-gray">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0]">
                    {loading ? (
                      <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>
                    ) : requests.length > 0 ? (
                      requests.map((r, i) => (
                        <tr key={i} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="p-4 font-medium font-mono text-xs">{r._id.toString().slice(-8)}</td>
                          <td className="p-4">{r.requesterName}</td>
                          <td className="p-4 font-bold text-primary">{r.bloodType}</td>
                          <td className="p-4 font-bold">{r.quantity}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              r.urgency === 'emergency' ? 'bg-[#ffebee] text-danger' :
                              r.urgency === 'urgent' ? 'bg-[#fff3e0] text-warning' :
                              'bg-[#e0f2fe] text-[#0ea5e9]'
                            }`}>{r.urgency}</span>
                          </td>
                          <td className="p-4">
                            <select
                              value={r.status}
                              onChange={(e) => updateRequestStatus(r._id, e.target.value)}
                              className="px-3 py-1 bg-white border border-gray/20 rounded-md focus:outline-none focus:border-primary"
                            >
                              {['pending', 'approved', 'rejected', 'fulfilled', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="p-4 text-center text-gray">No requests found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[30px] shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => {
                const item = inventory.find(i => i.bloodType === type);
                return (
                  <div key={type} className="p-6 rounded-2xl bg-linear-to-br from-white to-[#f8fafc] border border-gray/5 text-center shadow-sm relative group hover:-translate-y-1 hover:shadow-lg transition-all">
                    <div className="text-2xl font-bold font-clash text-primary mb-2">{type}</div>
                    <div className="text-[2rem] font-extrabold text-dark mb-1">{item ? item.units : 0}</div>
                    <div className="text-gray uppercase text-[0.6rem] font-bold tracking-widest mb-4">Total Units</div>
                    <div className="h-1.5 w-full bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div className="h-full bg-linear-to-br from-primary to-primary-light" style={{ width: `${item ? (item.units / 100) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
