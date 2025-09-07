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
import FindTutors from './pages/findTutors';
import AddNewCourse from './tutor/createNewCourse';
import Courses from './pages/showcourses';
import StudentProfile from './pages/student/studentProfile';
import TutorProfile from './tutor/tutorProfile';
import CreateTutorProfile from './tutor/createTutorProfile';
import StartZoom from './tutor/startZoom';
import ScheduleMeeting from './tutor/scheduleMeeting';
// import StripePaymentPage from './student/stripePaymentPage';
import SelectUser from './pages/selectUser';
import UploadVideo from './tutor/uploadvideo';
import MyCourses from './tutor/mycourses';
import NotFound from './pages/notfoundpage';
import { TutorRoute, MassTutorRoute, StudentRoute } from './context/protectRoute';
import LesssonUpload from './tutor/anotherLessonUpload';
import SignupForm from './components/SignupForm';
import AboutUs from './pages/aboutUs';
import MyCalendarPage from './pages/student/myCalender';
import TutorProfilePage from './pages/student/tutorProfile';
import BookSessionPage from './pages/student/bookSession';
import ReportTutorPage from './pages/student/reportTutor';
import PaymentDemoPage from './pages/student/paymentDemo';
import ScrollToTop from './components/scrollToUp';
import PaymentHistoryPage from './pages/student/paymentHistory';
import MassTutorDashboard from './pages/massTutor/masstutordashbord';

// ===== Admin portal imports =====
import AdminAuth from './admin/AdminAuth';
import AdminGate from './admin/AdminGate';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/Dashboard';
import TutorApproval from './admin/TutorApproval';
import TutorSuspend from './admin/TutorSuspend';
import Analytics from './admin/Analytics';
import Broadcast from './admin/Broadcast';
import Policies from './admin/Policies';
import AdminProfile from './admin/Profile';

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
      {/* Enable this if you plan to use admin.localhost */}
      <HostRedirectToAdmin />

      <ScrollToTop />
      <Routes>
        {/* Public site */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/selectuser" element={<SelectUser />} />
        <Route path="/selectuser/student" element={<SignupForm role="student" />} />
        <Route path="/selectuser/individual" element={<SignupForm role="Individual" />} />
        <Route path="/selectuser/mass" element={<SignupForm role="Mass" />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/tutorlists" element={<TutorList />} />
        <Route path="/studentlists" element={<StudentLists />} />
        <Route path="/findtutors" element={<FindTutors />} />
        <Route path="/tutor-profile/:tutorId" element={<TutorProfilePage />} />
        <Route path="/book-session/:tutorId" element={<BookSessionPage />} />
        <Route path="/report-tutor/:tutorId" element={<ReportTutorPage />} />
        <Route path="/courses" element={<Courses />} />

        {/* Student-only */}
        <Route element={<StudentRoute />}>
          <Route path="/studentprofile" element={<StudentProfile />} />
          {/* <Route path="/stripe-payment" element={<StripePaymentPage />} /> */}
          <Route path="/payment-history" element={<PaymentHistoryPage />} />
          <Route path="/mycalendar" element={<MyCalendarPage />} />
          <Route path="/payment-demo" element={<PaymentDemoPage />} />
        </Route>

        {/* Tutor-only */}
        <Route element={<TutorRoute />}>
          <Route path="/addnewcourse" element={<AddNewCourse />} />
          <Route path="/tutorprofile" element={<TutorProfile />} />
          <Route path="/createtutorprofile" element={<CreateTutorProfile />} />
          <Route path="/startzoom" element={<StartZoom />} />
          <Route path="/schedulemeeting" element={<ScheduleMeeting />} />
          <Route path="/uploadvideo" element={<UploadVideo />} />
          <Route path="/mycourses" element={<MyCourses />} />
          <Route path="/anotherLessonUpload" element={<LesssonUpload />} />
          {/* If you want a tutor calendar page later, add it here and import the component */}
          {/* <Route path="/tutorcalendar" element={<TutorCalendar />} /> */}
        </Route>

        {/* Mass tutor-only */}
        <Route element={<MassTutorRoute />}>
          <Route path="/mass-tutor-dashboard" element={<MassTutorDashboard />} />
        </Route>

        {/* ===== Admin portal ===== */}
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route path="/admin" element={<AdminGate />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tutors/approval" element={<TutorApproval />} />
            <Route path="tutors/suspend" element={<TutorSuspend />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="broadcast" element={<Broadcast />} />
            <Route path="policies" element={<Policies />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
