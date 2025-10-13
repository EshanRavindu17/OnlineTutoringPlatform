import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';

// ===== Existing app imports =====
import TutorList from './components/TutorList';
import StudentLists from './components/StudentList';
import WelcomePage from './pages/welcome';
import Auth from './pages/auth';
import FindTutors from './pages/findTutors'
import Courses from './pages/showcourses'
import { useAuth } from './context/authContext';
import { SocketProvider } from './context/SocketContext';
import StudentProfile from './pages/student/studentProfile';
import TutorProfile from './pages/individualTutor/tutorProfile';
import { ChatPage } from './pages/ChatPage';
// import StartZoom from './pages/individualTutor/startZoom';
import ScheduleMeeting from './pages/individualTutor/ScheduleMeeting';
// import StripePaymentPage from './student/stripePaymentPage';
import SelectUser from './pages/selectUser';
import NotFound from './pages/notfoundpage';
import { TutorRoute, StudentRoute, MassRoute} from './context/protectRoute';
import SignupForm from './components/SignupForm';
import AboutUs from './pages/aboutUs';
import MyCalendarPage from './pages/student/myCalender';
import TutorProfilePage from './pages/student/tutorProfile';
import BookSessionPage from './pages/student/bookSession';
import ReportTutorPage from './pages/student/reportTutor';
import PaymentDemoPage from './pages/student/paymentDemo';
import ScrollToTop from './components/scrollToUp';
import PaymentHistoryPage from './pages/student/paymentHistory';
import TutorPending from './pages/tutorPending';
import TutorSuspended from './pages/tutorSuspended';
import TutorRejected from './pages/individualTutor/TutorRejected';
import EmailVerification from './pages/EmailVerification';

import { massTutorRoutes } from './pages/massTutor/routes';

import MassTutorProfile from './pages/student/massTutorProfile';
import MassClassPage from './pages/student/massClass';


// ===== Admin portal imports =====
import AdminAuth from './admin/AdminAuth';
import AdminSignup from './admin/AdminSignup';
import AdminGate from './admin/AdminGate';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/Dashboard';
import TutorApproval from './admin/TutorApproval';
import TutorSuspend from './admin/TutorSuspend';
import Analytics from './admin/Analytics';
import Broadcast from './admin/Broadcast';
import Complaints from './admin/Complaints';
import Finance from './admin/Finance';
import Policies from './admin/Policies';
import AdminProfile from './admin/Profile';
import Sessions from './admin/Sessions';
import Meetings from './admin/Meetings';

import NotificationPage from './pages/student/notification';
import SavedPage from './pages/student/saved';


// (Optional) If you want http://admin.localhost:5173 to auto-redirect to /admin
function HostRedirectToAdmin() {
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => {
    const onAdminHost = window.location.hostname.startsWith('admin.');
    const alreadyOnAdmin = loc.pathname.startsWith('/admin');
    if (onAdminHost && !alreadyOnAdmin) nav('/admin', { replace: true });
  }, [loc.pathname, nav]);
  return null;
}

const App = () => {
  return (
    <Router>
      <SocketProvider>
        {/* Enable this if you plan to use admin.localhost */}
        <HostRedirectToAdmin />

        <ScrollToTop />
        <Routes>
        {/* Public site */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/selectuser" element={<SelectUser />} />
        <Route path="/selectuser/student" element={<SignupForm role="student" />} />
        <Route path="/selectuser/individual" element={<SignupForm role="Individual" />} />
        <Route path="/selectuser/mass" element={<SignupForm role="Mass" />} />
        <Route path= "/about" element={<AboutUs />} />
        <Route path="/tutorlists" element={<TutorList />} />
        <Route path="/studentlists" element={<StudentLists />} />
        <Route path="/findtutors" element={<FindTutors />} />
        <Route path="/tutor-profile/:tutorId" element={<TutorProfilePage/>}/>
        <Route path="/mass-tutor-profile/:tutorId" element={<MassTutorProfile/>}/>
        <Route path="/book-session/:tutorId" element={<BookSessionPage/>}/>
        <Route path="/report-tutor/:tutorId" element={<ReportTutorPage/>}/>
        <Route path="/courses" element={<Courses/>}/>
        
        {/* Tutor Status Pages */}
        <Route path="/tutor-pending" element={<TutorPending/>}/>
        <Route path="/tutor-suspended" element={<TutorSuspended/>}/>
        <Route path="/tutor-rejected" element={<TutorRejected/>}/>

        {/* Student Protected Routes */}
        <Route element={<StudentRoute />}>          
          <Route path="/studentprofile" element={<StudentProfile/>}/>
          {/* <Route path="/stripe-payment" element={<StripePaymentPage />} /> */}
          <Route path="/payment-history" element={<PaymentHistoryPage />} />
          <Route path="/mycalendar" element={<MyCalendarPage />} />
          <Route path="/payment-demo" element={<PaymentDemoPage />} />
          <Route path="/mass-class/:classId" element={<MassClassPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* Individual Tutor Protected Routes */}
        <Route element={<TutorRoute />}>
          <Route path="/tutorprofile" element={<TutorProfile />} />
          {/* <Route path="/startzoom" element={<StartZoom />} /> */}
          <Route path="/schedulemeeting" element={<ScheduleMeeting />} />
          <Route path="/manageSchedule" element={<ScheduleMeeting />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* Mass Tutor Protected Routes */}
        <Route element={<MassRoute />}>
          {massTutorRoutes()}
          <Route path="/mass-tutor/chat" element={<ChatPage />} />
        </Route>

        {/* ===== Admin portal ===== */}
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin" element={<AdminGate />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tutors/approval" element={<TutorApproval />} />
            <Route path="tutors/suspend" element={<TutorSuspend />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="broadcast" element={<Broadcast />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="finance" element={<Finance />} />
            <Route path="policies" element={<Policies />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="meetings" element={<Meetings />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </SocketProvider>
    </Router>
  );
};

export default App;
