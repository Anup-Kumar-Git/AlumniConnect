import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import API from '../services/api';
import { Book, FileText } from 'lucide-react';

const StudentList = ({ isDark, setIsDark }) => {
  const [dataList, setDataList] = useState([]);
  const role = localStorage.getItem('role') || 'Admin';
  const userName = localStorage.getItem('userName') || role;

  const fetchData = async () => {
    try {
      const res = await API.get('/admin/stats');
      setDataList(res.data.studentList || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (role !== 'Admin') {
    return <DashboardLayout isDark={isDark} role={role} userName={userName}><div className="p-8">Access Denied</div></DashboardLayout>;
  }

  return (
    <DashboardLayout isDark={isDark} role={role} userName={userName}>
      <header className="mb-10">
        <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
          Active Student List
        </h2>
        <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          View all registered students on the platform.
        </p>
      </header>

      <div className="py-8">
        <ul role="list" className="mx-auto grid grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {dataList && dataList.length > 0 ? (
            dataList.map((item) => (
                <li key={item._id} className={`p-6 rounded-[2rem] border transition-all ${isDark ? 'border-white/10 bg-[#0f0f12]/50 hover:bg-white/5' : 'border-slate-200 bg-white hover:shadow-xl'}`}>
                  {item.profilePicture ? (
                    <img className="mx-auto h-24 w-24 rounded-full object-cover" src={item.profilePicture} alt={item.name} />
                  ) : (
                    <div className="mx-auto h-24 w-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-3xl">
                      {item.name ? item.name[0] : 'S'}
                    </div>
                  )}
                  <h3 className={`mt-6 text-base font-semibold leading-7 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h3>
                  <p className="text-sm leading-6 text-slate-500">{item.academicYear ? `Year: ${item.academicYear}` : 'Student'}</p>
                  
                  <div className={`mt-2 text-xs truncate max-w-[150px] mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`} title={item.email}>
                    {item.email}
                  </div>
                  <div className={`text-[10px] truncate max-w-[150px] mx-auto mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} title={item.interestedSubject}>
                    {item.interestedSubject || ''}
                  </div>
                </li>
            ))
          ) : (
            <p className="text-slate-500 italic text-sm col-span-full text-center py-8">
              No students found.
            </p>
          )}
        </ul>
      </div>
    </DashboardLayout>
  );
};

export default StudentList;
