import React from 'react';
import { Route } from 'react-router-dom';
import MassTutorLayout from './Layout';
import MassTutorDashboard from './Dashboard';
import ClassesPage from './Classes';
import ClassDetailPage from './ClassDetail';
import BroadcastPage from './Broadcast';
import RecordingsPage from './Recordings';
import MaterialsPage from './Materials';
import StudentsPage from './Students';
import EarningsPage from './Earnings';
import MassTutorProfile from './Profile';
import SchedulePage from './Schedule';

export function massTutorRoutes() {
  return (
    <Route element={<MassTutorLayout />}>
      <Route path="/mass-tutor-dashboard" element={<MassTutorDashboard />} />
      <Route path="/mass-tutor/classes" element={<ClassesPage />} />
      <Route path="/mass-tutor/class/:classId" element={<ClassDetailPage />} />
      <Route path="/mass-tutor/broadcast" element={<BroadcastPage />} />
      <Route path="/mass-tutor/recordings" element={<RecordingsPage />} />
      <Route path="/mass-tutor/materials" element={<MaterialsPage />} />
      <Route path="/mass-tutor/students" element={<StudentsPage />} />
      <Route path="/mass-tutor/earnings" element={<EarningsPage />} />
      <Route path="/mass-tutor/profile" element={<MassTutorProfile />} />
      <Route path="/mass-tutor/schedule" element={<SchedulePage />} />
    </Route>
  );
}
