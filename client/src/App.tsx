import { Router, Route, useLocation } from "wouter";
import { useEffect } from "react";
import AdminDashboard from "./pages/AdminDashboard";
import PublicCard from "./pages/PublicCard";
import Home from "./pages/Home";

function RedirectToAdmin() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/admin");
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <Router>
      <Route path="/" component={RedirectToAdmin} />
      <Route path="/home" component={Home} />
      <Route path="/card/:id" component={PublicCard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route
        path="/:rest*"
        component={() => <div className="p-8">Página não encontrada</div>}
      />
    </Router>
  );
}
