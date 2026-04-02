import { Router, Route } from "wouter";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import PublicCard from "./pages/PublicCard";

export default function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/card/:id" component={PublicCard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/:rest*" component={() => <div className="p-8">Página não encontrada</div>} />
    </Router>
  );
}
