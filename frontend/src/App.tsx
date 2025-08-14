import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// @ts-ignore - Components not yet converted to TypeScript
import TutorList from './components/TutorList.jsx';
// @ts-ignore - Components not yet converted to TypeScript
import TutorList from './components/TutorList';
import StudentLists from './components/StudentList';
import WelcomePage from './pages/welcome';
import Auth from './pages/auth';
import FindTutors from './pages/findTutors';
import AddNewCourse from './tutor/createNewCourse';
import Courses from './pages/showcourses';
import TutorProfile from './tutor/tutorProfile';
import CreateTutorProfile from './tutor/createTutorProfile';
import StartZoom from './tutor/startZoom';
import SheduleMeeting from './tutor/scheduleMeeting';
import StripePaymentPage from './student/stripePaymentPage';
import SelectUser from './pages/selectUser';
import UploadVideo from './tutor/uploadvideo';
import MyCourses from './tutor/mycourses';
import NotFound from './pages/notfoundpage';
import { TutorRoute } from './context/protectRoute';
import { StudentRoute } from './context/protectRoute';
import LesssonUpload from './tutor/anotherLessonUpload';
import TutorCalendar from './tutor/tutorCalender';
import SignupForm from './components/SignupForm';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/selectuser" element={<SelectUser />} />
      <Route path="/selectuser/student" element={<SignupForm role="student" />} />
      <Route path="/selectuser/individual" element={<SignupForm role="individual" />} />
      <Route path="/selectuser/mass" element={<SignupForm role="mass" />} />
      <Route path="/tutorlists" element={<TutorList />} />
      <Route path="/studentlists" element={<StudentLists />} />
      <Route path="/findtutors" element={<FindTutors />} />
      <Route path="/courses" element={<Courses />} />
      <Route element={<StudentRoute />}> 
        <Route path="/stripe-payment" element={<StripePaymentPage />} />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>
);

export default App;
