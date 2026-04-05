import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('Full-time');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/employees", {
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setEmployees(data);
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchEmployees();
  }, [user]);

  // Transform data for the table
  const allEmployees = employees.map(emp => ({
    id: emp._id,
    name: `${emp.firstName} ${emp.lastName}`,
    email: emp.email,
    dept: emp.department,
    role: emp.designation,
    type: emp.type, // Map exactly from the database
    status: 'Active',
    avatar: `https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=random`
  }));

  const filteredEmployees = allEmployees.filter(emp => 
    emp.type === activeType && (
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'On Leave': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Suspended': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const handleAction = (msg) => alert(`${msg} executed!`);

  if (loading) {
    return (
      <AdminLayout title="Employees">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Accessing Personnel Records...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Employees">
      <div className="space-y-6 animate-in">
        
        {/* Partition Toggle */}
        <div className="flex justify-center md:justify-start">
           <div className="bg-gray-100/50 p-1.5 rounded-[24px] flex items-center gap-1 border border-gray-200/50">
             {['Full-time', 'Freelancer'].map((tab) => (
               <button
                key={tab}
                onClick={() => setActiveType(tab)}
                className={`px-8 py-3 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeType === tab ? 'bg-[#042f2e] text-white shadow-xl shadow-teal-900/20' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 {tab} Staff
               </button>
             ))}
           </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-2xl w-full md:w-96 group focus-within:ring-4 focus-within:ring-teal-500/5 focus-within:border-teal-500/50 transition-all">
            <Search size={18} className="text-gray-400 group-focus-within:text-teal-600" />
            <input 
              type="text" 
              placeholder={`Search ${activeType.toLowerCase()}s...`}
              className="bg-transparent border-none outline-none text-sm font-medium text-[#042f2e] w-full placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(activeType === 'Full-time' ? '/app/employees/add' : '/app/employees/add-freelancer')}
              className="btn-primary py-2.5! px-5! text-sm!"
            >
              <UserPlus size={18} />
              Add {activeType === 'Full-time' ? 'FT Staff' : 'Freelancer'}
            </button>
          </div>
        </div>

        {/* Table/List View */}
        <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto thin-scroll">
            <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Employee</th>
                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Department</th>
                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Job Title</th>
                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-teal-50/10 transition-colors group cursor-pointer" onClick={() => handleAction(`Viewing ${emp.name} details`)}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#042f2e] group-hover:text-teal-700 transition-colors">{emp.name}</div>
                        <div className="text-xs text-gray-400 font-medium">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-gray-500">{emp.dept}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-gray-500">{emp.role}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${emp.type === 'Full-time' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                      {emp.type}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleAction(`Mailing ${emp.name}`)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all">
                        <Mail size={16} />
                      </button>
                      <button onClick={() => handleAction(`Options for ${emp.name}`)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all">
                        <MoreVertical size={16} />
                      </button>
                      <ChevronRight size={16} className="text-gray-200 group-hover:text-teal-300 transition-all group-hover:translate-x-1" />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No staff members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
          
          {/* Pagination Placeholder */}
          <div className="px-8 py-5 bg-gray-50/30 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Showing {filteredEmployees.length} {activeType} staff</span>
            <div className="flex gap-2">
               <button onClick={() => handleAction('Prev Page')} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-50 cursor-not-allowed">Prev</button>
               <button onClick={() => handleAction('Next Page')} className="px-4 py-2 bg-[#042f2e] text-[10px] font-bold text-white uppercase tracking-widest rounded-xl hover:bg-teal-900 transition-all shadow-lg shadow-teal-900/10">Next</button>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Employees;
