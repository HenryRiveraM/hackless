import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { LoadingBlock } from "./components/Ui";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const EmployeesPage = lazy(() => import("./pages/EmployeesPage"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));
const IncidentsPage = lazy(() => import("./pages/IncidentsPage"));
const TrainingPage = lazy(() => import("./pages/TrainingPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const AuditsPage = lazy(() => import("./pages/AuditsPage"));
const PhishingPage = lazy(() => import("./pages/PhishingPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6"><LoadingBlock /></div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/incidents" element={<IncidentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/audits" element={<AuditsPage />} />
              <Route path="/phishing" element={<PhishingPage />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
