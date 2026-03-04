import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "../store/authSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.auth);
  useEffect(() => { if (token && !user) dispatch(fetchMe()); }, [token, user, dispatch]);
  if (!token) return <Navigate to="/login" />;
  return children;
}
