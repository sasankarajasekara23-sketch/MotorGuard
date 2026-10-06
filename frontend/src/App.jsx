import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Public Pages
import LandingPage from './pages/LandingPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Pages
import Navbar from './components/Navbar';
import OverviewPage from './pages/customer/OverviewPage';
import ProfilePage from './pages/customer/ProfilePage';
import VehiclesPage from './pages/customer/VehiclesPage';
import PoliciesPage from './pages/customer/PoliciesPage';
import ClaimsPage from './pages/customer/ClaimsPage';
import DocumentsPage from './pages/customer/DocumentsPage';
import FeedbackPage from './pages/customer/FeedbackPage';
import PaymentsPage from './pages/customer/PaymentsPage';

// Staff Pages
import StaffLayout from './pages/staff/StaffLayout';
import DashboardPage from './pages/staff/DashboardPage';
import CustomerSearchPage from './pages/staff/CustomerSearchPage';
import ClaimsQueuePage from './pages/staff/ClaimsQueuePage';
import PoliciesManagementPage from './pages/staff/PoliciesManagementPage';
import VehiclesListPage from './pages/staff/VehiclesListPage';
import DocumentsMonitorPage from './pages/staff/DocumentsMonitorPage';
import ReportsPage from './pages/staff/ReportsPage';
import FeedbackOverviewPage from './pages/staff/FeedbackOverviewPage';
import PaymentsLedgerPage from './pages/staff/PaymentsLedgerPage';

const CustomerLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-950 ambient-bg">
    <Navbar />
    <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in">
      {children}
    </main>
  </div>
);

function App() {
  const { user, role } = useAuth();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            user ? <Navigate to={role === 'CUSTOMER' ? '/overview' : '/staff/dashboard'} replace /> : <LandingPage />
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer Routes */}
          <Route path="/overview" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><OverviewPage /></CustomerLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><ProfilePage /></CustomerLayout></ProtectedRoute>} />
          <Route path="/vehicles" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><VehiclesPage /></CustomerLayout></ProtectedRoute>} />
          <Route path="/policies" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><PoliciesPage /></CustomerLayout></ProtectedRoute>} />
          <Route path="/claims" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><ClaimsPage /></CustomerLayout></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><PaymentsPage /></CustomerLayout></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><DocumentsPage /></CustomerLayout></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><FeedbackPage /></CustomerLayout></ProtectedRoute>} />

          {/* Staff Routes */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['SUPERVISOR', 'CLAIMS_OFFICER', 'OPERATIONS_MANAGER', 'BRANCH_MANAGER', 'FINANCE_EXECUTIVE']}><StaffLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="customers" element={<ProtectedRoute allowedRoles={['SUPERVISOR', 'OPERATIONS_MANAGER', 'BRANCH_MANAGER']}><CustomerSearchPage /></ProtectedRoute>} />
            <Route path="claims" element={<ProtectedRoute allowedRoles={['CLAIMS_OFFICER', 'SUPERVISOR', 'OPERATIONS_MANAGER', 'FINANCE_EXECUTIVE']}><ClaimsQueuePage /></ProtectedRoute>} />
            <Route path="policies" element={<ProtectedRoute allowedRoles={['OPERATIONS_MANAGER']}><PoliciesManagementPage /></ProtectedRoute>} />
            <Route path="vehicles" element={<ProtectedRoute allowedRoles={['OPERATIONS_MANAGER', 'SUPERVISOR']}><VehiclesListPage /></ProtectedRoute>} />
            <Route path="documents" element={<ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'SUPERVISOR', 'CLAIMS_OFFICER']}><DocumentsMonitorPage /></ProtectedRoute>} />
            <Route path="payments" element={<ProtectedRoute allowedRoles={['FINANCE_EXECUTIVE', 'OPERATIONS_MANAGER', 'SUPERVISOR']}><PaymentsLedgerPage /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute allowedRoles={['OPERATIONS_MANAGER', 'FINANCE_EXECUTIVE']}><ReportsPage /></ProtectedRoute>} />
            <Route path="feedback" element={<ProtectedRoute allowedRoles={['SUPERVISOR']}><FeedbackOverviewPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to={role === 'CUSTOMER' ? "/overview" : role ? "/staff/dashboard" : "/"} />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="bottom-right" />
    </ErrorBoundary>
  );
}

export default App;
