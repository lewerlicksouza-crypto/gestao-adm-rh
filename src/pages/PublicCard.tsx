import { Mail, Phone, MessageCircle, Globe, MapPin, Download } from "lucide-react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { Button } from "../components/Button";
import { useRef } from "react";

const contactData = {
  fullName: "Sebastião Expedito De Freitas Neto",
  jobTitle: "Consultor Técnico",
  company: "CONTA Soluções em Gestão",
  email: "sebastiaofreitas@contasolucoes.com.br",
  phone: "(22) 3822-2919",
  whatsapp: "(22) 99228-0464",
  address: "Rua Thomas Teixeira dos Santos, 98 - sala 411, Cidade Nova, CEP. 28300-000, Itaperuna - RJ",
  website: "www.contasolucoes.com.br",
};

export default function PublicCard() {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "qrcode.png";
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">{contactData.fullName}</h1>
          <p className="text-blue-100">{contactData.jobTitle}</p>
          <p className="text-sm text-blue-100">{contactData.company}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Contact Info */}
          <div className="space-y-3">
            <a
              href={`mailto:${contactData.email}`}
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
            >
              <Mail className="w-5 h-5" />
              <span className="text-sm">{contactData.email}</span>
            </a>

            <a
              href={`tel:${contactData.phone}`}
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
            >
              <Phone className="w-5 h-5" />
              <span className="text-sm">{contactData.phone}</span>
            </a>

            <a
              href={`https://wa.me/5522992280464`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{contactData.whatsapp}</span>
            </a>

            <a
              href={`https://${contactData.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm">{contactData.website}</span>
            </a>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(contactData.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-700 hover:text-red-600 transition"
            >
              <MapPin className="w-5 h-5" />
              <span className="text-xs">{contactData.address}</span>
            </a>
          </div>

          {/* QR Code */}
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-600 text-center mb-3">QR Code para este cartão</p>
            <div ref={qrRef} className="flex justify-center">
              <QRCode value={window.location.href} size={150} level="H" includeMargin={true} />
            </div>
            <Button
              onClick={handleDownloadQR}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
