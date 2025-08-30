import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TutorList from './components/TutorList';
import StudentLists from './components/StudentList';
import WelcomePage  from './pages/welcome';
import Auth from './pages/auth';
import FindTutors from './pages/findTutors'
import AddNewCourse from './tutor/createNewCourse'
import Courses from './pages/showcourses'
import { useAuth } from './context/authContext';
import StudentProfile from './student/studentProfile';
import TutorProfile from './tutor/tutorProfile';
import CreateTutorProfile from './tutor/createTutorProfile';
import StartZoom from './tutor/startZoom';
import SheduleMeeting from './tutor/scheduleMeeting';
import StripePaymentPage from './student/stripePaymentPage';
import SelectUser from './pages/selectUser';
import UploadVideo from  './tutor/uploadvideo';
import MyCourses from './tutor/mycourses';
import NotFound from './pages/notfoundpage';
import { TutorRoute } from './context/protectRoute';
import { StudentRoute } from './context/protectRoute';
import LesssonUpload from './tutor/anotherLessonUpload';
import TutorCalendar from './tutor/tutorCalender';
import SignupForm from './components/SignupForm';
import AboutUs from './pages/aboutUs';
import MyCalendarPage from './pages/myCalender';

const App = () => {
  return (
    <Router>
      <div>
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
          <Route path="/courses" element={<Courses/>}/>


          
        <Route element={<StudentRoute />}>          
          <Route path="/studentprofile" element={<StudentProfile/>}/>
          <Route path="/stripe-payment" element={<StripePaymentPage />} />
          <Route path="/mycalendar" element={<MyCalendarPage />} />
        </Route>

       
        <Route element={<TutorRoute />}>
          <Route path="/addnewcourse" element={<AddNewCourse/>}/>
          <Route path="/tutorprofile" element={<TutorProfile/>}/>
          <Route path="/createtutorprofile" element={<CreateTutorProfile/>}/>
          <Route path="/startzoom" element={<StartZoom/>}/>
          <Route path="/schedulemeeting" element={<SheduleMeeting/>}/>
          <Route path="/uploadvideo" element={<UploadVideo/>} />
          <Route path="/mycourses" element={<MyCourses/>} />
          <Route path="/anotherLessonUpload" element={<LesssonUpload/>} />
          <Route path="/tutorcalender" element={<TutorCalendar/>} />
        </Route>  
          

        <Route path="*" element={<NotFound/>} />  
          
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
