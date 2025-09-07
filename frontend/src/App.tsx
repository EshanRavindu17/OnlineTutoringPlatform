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
import StudentProfile from './pages/student/studentProfile';
import TutorProfile from './individualTutor/tutorProfile';
import StartZoom from './individualTutor/startZoom';
import ScheduleMeeting from './individualTutor/ScheduleMeeting';
// import StripePaymentPage from './student/stripePaymentPage';
import SelectUser from './pages/selectUser';
import UploadVideo from  './individualTutor/uploadvideo';
import NotFound from './pages/notfoundpage';
import { TutorRoute, StudentRoute } from './context/protectRoute';
import { MassTutorRoute, TutorRoute } from './context/protectRoute';
import { StudentRoute } from './context/protectRoute';
import LesssonUpload from './individualTutor/anotherLessonUpload';
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
import TutorRejected from './individualTutor/TutorRejected';
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
      { <HostRedirectToAdmin /> }

        <ScrollToTop/>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/selectuser" element={<SelectUser />} />
        <Route path="/selectuser/student" element={<SignupForm role="student" />} />
        <Route path="/selectuser/individual" element={<SignupForm role="Individual" />} />
        <Route path="/selectuser/mass" element={<SignupForm role="Mass" />} />
          <Route path= "/about" element={<AboutUs />} />
        <Route path="/tutorlists" element={<TutorList />} />
        <Route path="/studentlists" element={<StudentLists />} />
        <Route path="/findtutors" element={<FindTutors />} />
          <Route path="/tutor-profile/:tutorId" element={<TutorProfilePage/>}/>
          <Route path="/book-session/:tutorId" element={<BookSessionPage/>}/>
          <Route path="/report-tutor/:tutorId" element={<ReportTutorPage/>}/>
          <Route path="/courses" element={<Courses/>}/>
          
          {/* Tutor Status Pages */}
          <Route path="/tutor-pending" element={<TutorPending/>}/>
          <Route path="/tutor-suspended" element={<TutorSuspended/>}/>
          <Route path="/tutor-rejected" element={<TutorRejected/>}/>

          
        <Route element={<StudentRoute />}>          
          <Route path="/studentprofile" element={<StudentProfile/>}/>
          {/* <Route path="/stripe-payment" element={<StripePaymentPage />} /> */}
          <Route path="/payment-history" element={<PaymentHistoryPage />} />
          <Route path="/mycalendar" element={<MyCalendarPage />} />
          <Route path="/payment-demo" element={<PaymentDemoPage />} />
        </Route>

       
        <Route element={<TutorRoute />}>
          <Route path="/addnewcourse" element={<AddNewCourse />} />
          <Route path="/tutorprofile" element={<TutorProfile />} />
          <Route path="/createtutorprofile" element={<CreateTutorProfile />} />
          <Route path="/startzoom" element={<StartZoom />} />
          <Route path="/schedulemeeting" element={<SheduleMeeting />} />
          <Route path="/uploadvideo" element={<UploadVideo />} />
          <Route path="/mycourses" element={<MyCourses />} />
          <Route path="/anotherLessonUpload" element={<LesssonUpload />} />
          <Route path="/tutorcalender" element={<TutorCalendar />} />
        </Route>

        {/* ===== Admin portal (UI only for now) ===== */}
        {/* Admin auth page (login/sign up for admins) */}
        <Route path="/admin/auth" element={<AdminAuth />} />

        {/* Admin routes (Dashboard + feature pages) */}
        {/* Later we can wrap this with an <AdminGate /> to enforce Admin-only access */}
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
          <Route path="/tutorprofile" element={<TutorProfile/>}/>
          <Route path="/startzoom" element={<StartZoom/>}/>
          {/* <Route path="/schedulemeeting" element={<SheduleMeeting/>}/> */}
          <Route path="/uploadvideo" element={<UploadVideo/>} />
          <Route path="/anotherLessonUpload" element={<LesssonUpload/>} />
          <Route path="/manageSchedule" element={<ScheduleMeeting/>} />
        </Route>

        <Route element={<MassTutorRoute />}>
          {/* <Route path="/mass-tutor-profile" element={<MassTutorProfile />} />
          <Route path="/mass-tutor-sessions" element={<MassTutorSessions />} /> */}
          <Route path='/mass-tutor-dashboard' element={<MassTutorDashboard />} />
        </Route>
        <Route path="*" element={<NotFound/>} />  
          
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
