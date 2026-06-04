"use client";

import { useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Share2, QrCode, Users, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAdminClasses } from "@/lib/hooks/use-admin-data";
import { generateQRToken } from "@/lib/api/qr.api";
import { useLanguage } from "@/lib/i18n/context";

const grades = [
  { id: 1, name: "الصف الأول", color: "from-sky-400 to-blue-500", icon: "🎨", desc: "بداية الرحلة" },
  { id: 2, name: "الصف الثاني", color: "from-blue-400 to-indigo-500", icon: "🚀", desc: "اكتشاف جديد" },
  { id: 3, name: "الصف الثالث", color: "from-indigo-400 to-violet-500", icon: "⭐", desc: "تطور مستمر" },
  { id: 4, name: "الصف الرابع", color: "from-violet-400 to-purple-500", icon: "📚", desc: "خطوات واثقة" },
  { id: 5, name: "الصف الخامس", color: "from-purple-400 to-fuchsia-500", icon: "💡", desc: "إبداع وتميز" },
  { id: 6, name: "الصف السادس", color: "from-fuchsia-400 to-pink-500", icon: "🧠", desc: "تحدي الأفكار" },
  { id: 7, name: "الصف السابع", color: "from-pink-400 to-rose-500", icon: "🏆", desc: "نحو القمة" },
  { id: 8, name: "الصف الثامن", color: "from-rose-400 to-orange-500", icon: "🌟", desc: "تألق دائم" },
  { id: 9, name: "الصف التاسع", color: "from-orange-400 to-amber-500", icon: "🎯", desc: "إنجازات عظيمة" },
];

export default function QRCodePage() {
  const { t, language } = useLanguage();
  const qp = t.qrcodePage;
  const { data: classes = [], isLoading: loading } = useAdminClasses();
  const [selectedGrade, setSelectedGrade] = useState<typeof grades[0] | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const handleSelect = useCallback(async (grade: typeof grades[0]) => {
    setSelectedGrade(grade);
    setSignedUrl(null);
    setQrOpen(true);
    setTokenLoading(true);
    try {
      const result = await generateQRToken(grade.id);
      if (result?.token) {
        setSignedUrl(`${window.location.origin}/?token=${result.token}`);
      } else {
        toast.error(t.dashboard.loadingError);
      }
    } finally {
      setTokenLoading(false);
    }
  }, []);

  const getSignedUrl = () => signedUrl ?? "";

  const downloadQR = () => {
    if (!selectedGrade) return;
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const png = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `qr-${selectedGrade.name}.png`;
      a.href = png;
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${language === "ar" ? "text-right" : "text-left"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{qp.subtitle}</h1>
          <p className="text-muted-foreground mt-1">{qp.noClass}</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/60 px-4 py-2 rounded-lg">
          <QrCode className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{classes.length} {t.classesPage.students}</span>
        </div>
      </div>

      {/* Grades Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {grades.map((grade) => (
          <Card
            key={grade.id}
            className="group cursor-pointer border-border/50 bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            onClick={() => handleSelect(grade)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${grade.color} text-white text-2xl shadow-md`}>
                  {grade.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-foreground">{grade.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{grade.desc}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-muted/80 transition-colors">
                  <QrCode className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* QR Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <QrCode className="h-6 w-6 text-primary" />
              رمز QR - {selectedGrade?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedGrade && (
            <div className="space-y-6 py-4">
              {/* Signed token badge */}
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span>{qp.scanInfo}</span>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-card rounded-2xl border-2 border-border/50 shadow-sm min-h-[224px] flex items-center justify-center">
                  {tokenLoading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                  ) : signedUrl ? (
                    <QRCodeSVG
                      id="qr-code-svg"
                      value={signedUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                      imageSettings={{
                        src: "/icon-light-32x32.png",
                        height: 24,
                        width: 24,
                        excavate: true,
                      }}
                    />
                  ) : (
                    <p className="text-xs text-rose-500">{t.table.noData}</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground text-center">{qp.scanInfo} - {selectedGrade.name}</p>
              </div>

              <div className="bg-muted/60 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{qp.classInfo}:</p>
                <code className="text-xs text-foreground break-all block">
                  {tokenLoading ? "جارٍ الإنشاء..." : getSignedUrl()}
                </code>
              </div>

              <div className="flex gap-2">
                <Button onClick={downloadQR} className="flex-1 gap-2" variant="default" disabled={tokenLoading || !signedUrl}>
                  <Download className="h-4 w-4" /> {qp.download}
                </Button>
                <Button onClick={() => {
                  navigator.clipboard.writeText(getSignedUrl());
                  toast.success(t.actions.download);
                }} className="flex-1 gap-2" variant="outline" disabled={tokenLoading || !signedUrl}>
                  <Share2 className="h-4 w-4" /> {qp.generate}
                </Button>
              </div>
              <Button onClick={() => window.open(getSignedUrl(), "_blank")} className="w-full gap-2" variant="secondary" disabled={tokenLoading || !signedUrl}>
                <Users className="h-4 w-4" /> {qp.selectClass}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
