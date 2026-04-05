import React, { useState, useEffect } from 'react';

const BloodStock = ({ onEmergencyRequest }) => {
  const [stocks, setStocks] = useState([
    { type: 'A+', units: 42, status: 'Available', hospital: 'City Hospital', distance: '2 km', percentage: 85 },
    { type: 'O-', units: 15, status: 'Moderate', hospital: 'City Hospital', distance: '2 km', percentage: 30 },
    { type: 'B+', units: 30, status: 'Moderate', hospital: 'General Hospital', distance: '3.5 km', percentage: 60 },
    { type: 'AB+', units: 22, status: 'Moderate', hospital: 'City Hospital', distance: '2 km', percentage: 45 },
    { type: 'A-', units: 12, status: 'Low', hospital: 'General Hospital', distance: '3.5 km', percentage: 25 },
    { type: 'O+', units: 48, status: 'Available', hospital: 'City Hospital', distance: '2 km', percentage: 95 },
    { type: 'B-', units: 10, status: 'Low', hospital: 'General Hospital', distance: '3.5 km', percentage: 20 },
    { type: 'AB-', units: 8, status: 'Critical', hospital: 'City Hospital', distance: '2 km', percentage: 15 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(currentStocks =>
        currentStocks.map(stock => {
          const change = Math.floor(Math.random() * 6) - 3;
          let newPercentage = Math.max(10, Math.min(100, stock.percentage + change));
          return {
            ...stock,
            percentage: newPercentage,
            units: Math.floor(newPercentage / 100 * 50)
          };
        })
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-[#d1fae5] text-success';
      case 'moderate': return 'bg-[#fff3e0] text-warning';
      case 'low':
      case 'critical': return 'bg-[#ffebee] text-danger';
      default: return 'bg-light text-dark';
    }
  };

  return (
    <section className="py-[100px] px-[30px] bg-linear-to-br from-[#FFF5F5] to-[#F0F7FF] relative overflow-hidden" id="blood-stock">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-10 flex-wrap gap-5">
          <h2 className="text-[2.5rem] font-extrabold font-clash">Current <span className="gradient-text">Blood Stock</span></h2>
          <div className="flex items-center gap-2.5 px-[25px] py-2.5 bg-primary/10 rounded-2xl text-primary font-semibold">
            <span className="w-3 h-3 bg-primary rounded-full animate-pulse-live"></span>
            <span>Live Updates Every 30s</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-[30px]">
          {stocks.map((item, i) => (
            <div key={i} className="bg-white rounded-lg p-[25px] shadow-md transition-all duration-300 relative overflow-hidden border border-black/5 hover:-translate-y-1.25 hover:shadow-xl after:content-[''] after:absolute after:top-0 after:right-0 after:w-20 after:h-20 after:bg-linear-to-br after:from-transparent after:to-primary/10 after:rounded-bl-[100%] after:z-[-1]">
              <div className="flex justify-between items-center mb-[15px]">
                <div className="text-[2.5rem] font-extrabold gradient-text font-clash">{item.type}</div>
                <span className={`px-[15px] py-[5px] rounded-2xl text-xs font-semibold ${getStatusClass(item.status)}`}>{item.status}</span>
              </div>
              <div className="my-5">
                <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden mb-[15px]">
                  <div className="h-full bg-linear-to-br from-primary to-primary-light rounded-full transition-[width] duration-500" style={{ width: `${item.percentage}%` }}></div>
                </div>
                <div className="flex justify-between text-gray text-sm mb-2.5">
                  <span><i className="fas fa-tint"></i> {item.units} units</span>
                  <span><i className="fas fa-percentage"></i> {item.percentage}%</span>
                </div>
                <div className="flex items-center gap-1.25 text-gray text-sm mt-2.5">
                  <i className="fas fa-hospital"></i>
                  <span>{item.hospital} • {item.distance}</span>
                </div>
              </div>
              <div className="flex gap-2.5 mt-5">
                <button className="flex-1 p-2.5 bg-light border-none rounded-md text-dark font-semibold cursor-pointer transition-all duration-300 hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white">Request</button>
                <button className="flex-1 p-2.5 bg-linear-to-br from-primary to-primary-light border-none rounded-md text-white font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hover">Donate</button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={onEmergencyRequest}
            className="px-[50px] py-[18px] bg-linear-to-br from-primary to-primary-light border-none rounded-2xl text-white font-bold text-xl cursor-pointer transition-all duration-300 shadow-lg animate-pulse-emergency hover:-translate-y-0.75 hover:shadow-hover"
          >
            <i className="fas fa-exclamation-triangle"></i> EMERGENCY REQUEST
          </button>
        </div>
      </div>
    </section>
  );
};

export default BloodStock;
