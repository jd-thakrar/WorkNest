import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, LayoutGrid, List, CheckSquare } from "lucide-react";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";

// Components
import TaskCard from "../../components/employee/tasks/TaskCard";
import TaskFilters from "../../components/employee/tasks/TaskFilters";
import TaskSummaryStrip from "../../components/employee/tasks/TaskSummaryStrip";

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Active");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_URL}/employee-self/tasks`, {
          headers: { "Authorization": `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchTasks();
  }, [user]);

  const filteredTasks = tasks.filter(t => activeTab === 'All' || t.status === activeTab);

  // Sync logical counts
  const taskCounts = {
    all: tasks.length,
    active: tasks.filter(t => t.status === "Active").length,
    done: tasks.filter(t => t.status === "Done").length,
    overdue: tasks.filter(t => t.status === "Overdue").length,
    hours: "0h 0m" 
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <EmployeeLayout title="My Tasks & Deliverables">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 pb-20"
      >
        {/* Row 1 — Sync'd Summary Strip */}
        <motion.div variants={itemVariants}>
          <TaskSummaryStrip stats={taskCounts} />
        </motion.div>

        {/* Row 2 — Search and Filter Hub (Sync'd) */}
        <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col xl:flex-row items-center gap-4 w-full xl:w-auto">
             <TaskFilters activeTab={activeTab} setActiveTab={setActiveTab} counts={taskCounts} />
             
             <div className="relative group w-full xl:w-[400px]">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search through 10 deliverables..."
                  className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500/30 transition-all shadow-sm"
                />
             </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
             <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-teal-50 text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-teal-50 text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List size={18} />
                </button>
             </div>
          </div>
        </motion.div>

        {/* Row 3 — Dynamic Task Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab + viewMode}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4 max-w-6xl"}
          >
            {filteredTasks.map((task) => (
              <motion.div key={task.id} variants={itemVariants} layout transition={{ duration: 0.3 }}>
                <TaskCard task={task} viewMode={viewMode} />
              </motion.div>
            ))}
            
            {filteredTasks.length === 0 && (
              <motion.div 
                variants={itemVariants}
                className="col-span-full py-24 text-center bg-white rounded-xl border border-dashed border-slate-200"
              >
                 <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-300 mb-6 border border-slate-100">
                    <CheckSquare size={40} />
                 </div>
                 <h3 className="text-2xl font-bold text-[#042f2e] mb-3">No matching tasks</h3>
                 <p className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Try a different filter or search term</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </EmployeeLayout>
  );
};

export default Tasks;
