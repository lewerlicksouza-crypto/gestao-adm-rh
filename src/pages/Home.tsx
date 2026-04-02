import { useLocation } from "wouter";
import { Button } from "../components/Button";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Cartão de Visita Virtual</h1>
        <p className="text-gray-600 mb-8">
          Sistema de gerenciamento de cartões de visita e funcionários
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => navigate("/card/1")}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Ver Cartão de Visita
          </Button>

          <Button
            onClick={() => navigate("/admin")}
            className="w-full bg-gray-800 hover:bg-gray-900"
          >
            Painel Administrativo
          </Button>
        </div>
      </div>
    </div>
  );
}
