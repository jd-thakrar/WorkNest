import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/layout/Layout";

// Marketing Pages
import Home from "./pages/Home";
import Product from "./pages/Product";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin Panel Pages
import Dashboard from "./pages/admin/Dashboard";
import Employees from "./pages/admin/Employees";
import Tasks from "./pages/admin/Tasks";
import Attendance from "./pages/admin/Attendance";
import Payroll from "./pages/admin/Payroll";
import Reports from "./pages/admin/modules/Reports";
import Notifications from "./pages/admin/modules/Notifications";
import Settings from "./pages/admin/modules/Settings";
import Profile from "./pages/admin/modules/Profile";
import AddEmployee from "./pages/admin/AddEmployee";
import EditEmployee from "./pages/admin/EditEmployee";
import AddFreelancer from "./pages/admin/AddFreelancer";
import Teams from "./pages/admin/Teams";

// Employee Portal Pages
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeAttendance from "./pages/employee/Attendance";
import EmployeeTasks from "./pages/employee/Tasks";
import EmployeeTimeOff from "./pages/employee/TimeOff";
import EmployeeFinance from "./pages/employee/Finance";
import EmployeeDocuments from "./pages/employee/Documents";
import EmployeeSettings from "./pages/employee/Settings";
import EmployeeNotifications from "./pages/employee/Notifications";

import { ThemeProvider } from "./context/ThemeContext";
import { GlobalProvider } from "./context/GlobalProvider";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <GlobalProvider>
        <Router>
          <Routes>
            {/* Marketing/Client Routes */}
            <Route element={<Layout><section className="animate-in"><Home /></section></Layout>} path="/" />
            <Route element={<Layout><Product /></Layout>} path="/product" />
            <Route element={<Layout><Pricing /></Layout>} path="/pricing" />
            <Route element={<Layout><About /></Layout>} path="/about" />
            <Route element={<Layout><Resources /></Layout>} path="/resources" />
            <Route element={<Layout><Contact /></Layout>} path="/contact" />
            <Route element={<Login />} path="/login" />
            <Route element={<Register />} path="/register" />

            {/* Admin Panel Routes */}
            <Route path="/app">
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="employees/add" element={<AddEmployee />} />
              <Route path="employees/edit/:id" element={<EditEmployee />} />
              <Route path="employees/add-freelancer" element={<AddFreelancer />} />
              <Route path="teams" element={<Teams />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="reports" element={<Reports />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Employee Portal Routes */}
            <Route path="/employee">
              <Route index element={<Navigate to="/employee/dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="tasks" element={<EmployeeTasks />} />
              <Route path="time-off" element={<EmployeeTimeOff />} />
              <Route path="finance" element={<EmployeeFinance />} />
              <Route path="documents" element={<EmployeeDocuments />} />
              <Route path="notifications" element={<EmployeeNotifications />} />
              <Route path="settings" element={<EmployeeSettings />} />
            </Route>
          </Routes>
        </Router>
        </GlobalProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
