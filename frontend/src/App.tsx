import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TutorList from './components/TutorList';
import StudentLists from './components/StudentList';
import WelcomePage  from './pages/welcome';
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
import { TutorRoute } from './context/protectRoute';
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

const App = () => {
  return (
    <Router>
      <div>
        <ScrollToTop/>
        <Routes> 
          <Route path="/" element={<WelcomePage />} />
          <Route path="/auth" element={<Auth/>} />   
          <Route path="/selectuser" element={<SelectUser />} />
          <Route path="/selectuser/student" element={<SignupForm role="student" />} />
          <Route path="/selectuser/individual" element={<SignupForm role="Individual" />} />
          <Route path="/selectuser/mass" element={<SignupForm role="Mass" />} />
          <Route path= "/about" element={<AboutUs />} />

          
          <Route path="/tutorlists" element={<TutorList/>} />
          <Route path="/studentlists" element={<StudentLists/>}/>
          <Route path="/findtutors" element={<FindTutors/>}/>
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
          <Route path="/tutorprofile" element={<TutorProfile/>}/>
          <Route path="/startzoom" element={<StartZoom/>}/>
          {/* <Route path="/schedulemeeting" element={<SheduleMeeting/>}/> */}
          <Route path="/uploadvideo" element={<UploadVideo/>} />
          <Route path="/anotherLessonUpload" element={<LesssonUpload/>} />
          <Route path="/manageSchedule" element={<ScheduleMeeting/>} />
        </Route>  
          

        <Route path="*" element={<NotFound/>} />  
          
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
