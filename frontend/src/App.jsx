import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TutorList from './components/TutorList.jsx';
import StudentLists from './components/StudentList.jsx';
import WelcomePage  from './pages/welcome.jsx';
import Auth from './pages/auth.jsx';
import FindTutors from './pages/findTutors.jsx'
import AddNewCourse from './tutor/createNewCourse.jsx'
import Courses from './pages/showcourses.jsx'
import { useAuth } from './context/authContext.jsx';
import StudentProfile from './student/studentProfile.jsx';
import TutorProfile from './tutor/tutorProfile.jsx';
import CreateTutorProfile from './tutor/createTutorProfile.jsx';
import StartZoom from './tutor/startZoom.jsx';
import SheduleMeeting from './tutor/scheduleMeeting.jsx';
import StripePaymentPage from './student/stripePaymentPage.jsx';
import SelectUser from './pages/selectUser.jsx';
import UploadVideo from  './tutor/uploadvideo.jsx';
import MyCourses from './tutor/mycourses.jsx';
import NotFound from './pages/notfoundpage.jsx';
import { TutorRoute } from './context/protectRoute.jsx';
import { StudentRoute } from './context/protectRoute.jsx';
import LesssonUpload from './tutor/anotherLessonUpload.jsx';
import TutorCalendar from './tutor/tutorCalender.jsx';
import SignupForm from './components/SignupForm';

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

          
          <Route path="/tutorlists" element={<TutorList/>} />
          <Route path="/studentlists" element={<StudentLists/>}/>
          <Route path="/findtutors" element={<FindTutors/>}/>
          <Route path="/courses" element={<Courses/>}/>


          
        <Route element={<StudentRoute />}>          
          <Route path="/studentprofile" element={<StudentProfile/>}/>
          <Route path="/stripe-payment" element={<StripePaymentPage />} />
          
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
