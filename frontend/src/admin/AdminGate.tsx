import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { adminApi } from './api';

export default function AdminGate() {
  const [ok, setOk] = useState<null | boolean>(null);

  useEffect(() => {
    let mounted = true;
    adminApi.me().then(()=> mounted && setOk(true)).catch(()=> mounted && setOk(false));
    return () => { mounted = false; };
  }, []);

  if (ok === null) return <div className="p-6">Checking admin session…</div>;
  if (!ok) return <Navigate to="/admin/auth" replace />;
  return <Outlet />;
}
