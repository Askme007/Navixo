//src\components\ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      setIsAuth(!!data.session);
      setChecking(false);
    }

    checkAuth();
  }, []);

  if (checking)
    return (
      <div className="text-white flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  if (!isAuth) return <Navigate to="/auth" replace />;

  return children;
}
