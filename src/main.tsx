import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles.css";

import { AuthProvider } from "@/contexts/AuthContext";
import { TrackingScripts } from "@/components/TrackingScripts";

import LandingPage from "@/pages/LandingPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminLayout from "@/pages/AdminLayout";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFoundPage from "@/pages/NotFoundPage";

const queryClient = new QueryClient();

// Restore the original deep-link path that 404.html stashed (GitHub Pages SPA fallback).
try {
  const stashed = sessionStorage.getItem("spa_redirect_path");
  if (stashed && stashed !== "/" && stashed !== window.location.pathname) {
    sessionStorage.removeItem("spa_redirect_path");
    window.history.replaceState(null, "", stashed);
  }
} catch {}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TrackingScripts />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
            </Route>
            <Route path="/index.html" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
