import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from "@/lib/auth";
import RoleSelect from "./pages/RoleSelect";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import OperatorDashboard from "./pages/OperatorDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import Villages from "./pages/Villages";
import Farmers from "./pages/Farmers";
import CropYield from "./pages/CropYield";
import DailyReports from "./pages/DailyReports";
import TravelBills from "./pages/TravelBills";
import Attendance from "./pages/Attendance";
import SalaryManagement from "./pages/SalaryManagement";
import FarmerPayments from "./pages/FarmerPayments";
import Supervisors from "./pages/Supervisors";
import LeaveManagement from "./pages/LeaveManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/operator" element={<ProtectedRoute allowedRoles={["operator"]}><OperatorDashboard /></ProtectedRoute>} />
          <Route path="/supervisor" element={<ProtectedRoute allowedRoles={["supervisor"]}><SupervisorDashboard /></ProtectedRoute>} />
          <Route path="/organizer" element={<ProtectedRoute allowedRoles={["organizer"]}><OrganizerDashboard /></ProtectedRoute>} />
          <Route path="/villages" element={<ProtectedRoute><Villages /></ProtectedRoute>} />
          <Route path="/farmers" element={<ProtectedRoute><Farmers /></ProtectedRoute>} />
          <Route path="/crop-yield" element={<ProtectedRoute allowedRoles={["operator", "supervisor"]}><CropYield /></ProtectedRoute>} />
          <Route path="/daily-reports" element={<ProtectedRoute allowedRoles={["supervisor"]}><DailyReports /></ProtectedRoute>} />
          <Route path="/travel-bills" element={<ProtectedRoute allowedRoles={["operator", "supervisor"]}><TravelBills /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/salary" element={<ProtectedRoute allowedRoles={["operator"]}><SalaryManagement /></ProtectedRoute>} />
          <Route path="/farmer-payments" element={<ProtectedRoute allowedRoles={["organizer"]}><FarmerPayments /></ProtectedRoute>} />
          <Route path="/supervisors" element={<ProtectedRoute allowedRoles={["operator"]}><Supervisors /></ProtectedRoute>} />
          <Route path="/leaves" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
