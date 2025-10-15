import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';

export default function AdminThemeWrapper() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}
