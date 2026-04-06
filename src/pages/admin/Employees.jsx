import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Search,
  Filter,
  MoreVertical,
  Mail,
  ChevronRight,
  UserPlus,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState("Full-time");

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
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

  useEffect(() => {
    if (user) fetchEmployees();
  }, [user]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this employee? This will also disable their login access.")) return;
    
    try {
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        setEmployees(employees.filter(emp => emp._id !== id));
      } else {
        alert("Failed to delete employee");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "On Leave":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "Suspended":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const filteredEmployees = employees.filter(
    (emp) => {
      const type = emp.type || emp.basic?.type || "Full-time";
      const fName = emp.firstName || emp.basic?.firstName || "";
      const lName = emp.lastName || emp.basic?.lastName || "";
      const email = emp.email || emp.basic?.email || "";
      
      return type === activeType &&
      (`${fName} ${lName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()));
    }
  );

  if (loading) {
    return (
      <AdminLayout title="Employees">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
              Accessing Personnel Records...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Employees">
      <div className="space-y-6 animate-in">
        <div className="flex justify-center md:justify-start">
          <div className="bg-gray-100/50 p-1.5 rounded-[24px] flex items-center gap-1 border border-gray-200/50 shadow-sm">
            {["Full-time", "Freelancer"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveType(tab)}
                className={`px-8 py-3 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeType === tab ? "bg-[#042f2e] text-white shadow-xl shadow-teal-900/20" : "text-gray-400 hover:text-gray-600"}`}
              >
                {tab} Staff
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-2.5 rounded-2xl w-full md:w-96 group shadow-sm focus-within:ring-4 focus-within:ring-teal-500/5 focus-within:border-teal-500/50 transition-all">
            <Search size={18} className="text-gray-400 group-focus-within:text-teal-600" />
            <input
              type="text"
              placeholder={`Search ${activeType.toLowerCase()}s...`}
              className="bg-transparent border-none outline-none text-sm font-medium text-[#042f2e] w-full placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => navigate(activeType === "Full-time" ? "/app/employees/add" : "/app/employees/add-freelancer")}
            className="btn-primary py-2.5! px-5! text-sm!"
          >
            <UserPlus size={18} />
            Add {activeType === "Full-time" ? "FT Staff" : "Freelancer"}
          </button>
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto thin-scroll">
            <table className="w-full text-left border-collapse min-w-[1000px]">
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
                  <tr
                    key={emp._id}
                    className="hover:bg-teal-50/10 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/app/employees/edit/${emp._id}`)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                          <img
                            src={`https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=random`}
                            alt={emp.firstName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#042f2e] group-hover:text-teal-700 transition-colors">
                            {emp.firstName || emp.basic?.firstName} {emp.lastName || emp.basic?.lastName}
                          </div>
                          <div className="text-xs text-gray-400 font-medium">{emp.email || emp.basic?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 pl-12"><span className="text-sm font-bold text-gray-500">{emp.department || emp.basic?.department}</span></td>
                    <td className="px-6 py-5"><span className="text-sm font-semibold text-gray-500">{emp.designation || emp.basic?.designation}</span></td>
                    <td className="px-6 py-5">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase border ${(emp.type || emp.basic?.type) === "Full-time" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"}`}>
                         {emp.type || emp.basic?.type || "Full-time"}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`px-3 py-1 rounded-xl text-[9px] font-bold uppercase border ${getStatusColor("Active")}`}>Active</span>
                    </td>
                    <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/app/employees/edit/${emp._id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={(e) => handleDelete(e, emp._id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={16} className="text-gray-200 group-hover:text-teal-300 transition-all group-hover:translate-x-1" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-5 bg-gray-50/30 flex items-center justify-between border-t border-gray-100 italic">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredEmployees.length} staff members</span>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Global Sync Active</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Employees;
