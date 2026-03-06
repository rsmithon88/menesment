import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useSettings } from "@/hooks/use-settings";
import type { Exam, Student } from "@shared/schema";

export default function AdmitCard() {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const { madrasaName } = useSettings();

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: exams = [], isLoading: examsLoading } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });

  const selectedStudent = students.find((s) => s.id === parseInt(selectedStudentId));
  const selectedExam = exams.find((e) => e.id === parseInt(selectedExamId));

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>প্রবেশপত্র - ${selectedStudent?.nameBn || ""}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; direction: ltr; }
            .admit-card { border: 3px solid #1a5632; padding: 30px; max-width: 600px; margin: auto; }
            .header { text-align: center; border-bottom: 2px solid #1a5632; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { font-size: 24px; color: #1a5632; margin: 0 0 5px; }
            .header h2 { font-size: 18px; color: #333; margin: 0 0 5px; }
            .header p { font-size: 14px; color: #666; margin: 0; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ccc; }
            .info-label { font-weight: bold; color: #333; }
            .info-value { color: #555; }
            .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px solid #1a5632; }
            .footer p { font-size: 12px; color: #888; }
            .signature { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature div { text-align: center; }
            .signature-line { border-top: 1px solid #333; width: 150px; margin-top: 40px; padding-top: 5px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (studentsLoading || examsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64" data-testid="loading-admit-card">
          <Spinner className="h-8 w-8" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">প্রবেশপত্র</h1>
          <p className="text-muted-foreground mt-2">ছাত্রের পরীক্ষার প্রবেশপত্র তৈরি ও প্রিন্ট করুন।</p>
        </div>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">প্রবেশপত্র তৈরি করুন</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>ছাত্র নির্বাচন করুন</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger data-testid="select-admit-student">
                    <SelectValue placeholder="ছাত্র নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={String(student.id)}>
                        {student.nameBn} - {student.studentId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>পরীক্ষা নির্বাচন করুন</Label>
                <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                  <SelectTrigger data-testid="select-admit-exam">
                    <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={String(exam.id)}>
                        {exam.name} - {exam.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedStudent && selectedExam && (
          <>
            <div className="flex justify-end">
              <Button onClick={handlePrint} className="gap-2" data-testid="button-print-admit-card">
                <Printer className="h-4 w-4" />
                প্রিন্ট করুন
              </Button>
            </div>

            <Card className="border-2 border-primary/30 shadow-md" data-testid="admit-card-preview">
              <div ref={printRef}>
                <div className="admit-card" style={{ padding: "30px" }}>
                  <div style={{ textAlign: "center", borderBottom: "2px solid hsl(var(--primary))", paddingBottom: "15px", marginBottom: "20px" }}>
                    <h1 style={{ fontSize: "24px", color: "hsl(var(--primary))", margin: "0 0 5px" }}>{madrasaName}</h1>
                    <h2 style={{ fontSize: "18px", color: "#333", margin: "0 0 5px" }}>প্রবেশপত্র / Admit Card</h2>
                    <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>{selectedExam.name}</p>
                  </div>

                  <div style={{ display: "grid", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #ccc" }}>
                      <span style={{ fontWeight: "bold" }}>ছাত্রের নাম:</span>
                      <span data-testid="text-admit-student-name">{selectedStudent.nameBn}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #ccc" }}>
                      <span style={{ fontWeight: "bold" }}>আইডি নম্বর:</span>
                      <span data-testid="text-admit-student-id">{selectedStudent.studentId}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #ccc" }}>
                      <span style={{ fontWeight: "bold" }}>পিতার নাম:</span>
                      <span>{selectedStudent.fatherName || "-"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #ccc" }}>
                      <span style={{ fontWeight: "bold" }}>বিভাগ:</span>
                      <span>{selectedStudent.department}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #ccc" }}>
                      <span style={{ fontWeight: "bold" }}>রোল নম্বর:</span>
                      <span>{selectedStudent.roll || "-"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #ccc" }}>
                      <span style={{ fontWeight: "bold" }}>সেশন:</span>
                      <span>{selectedStudent.session || "-"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #ccc" }}>
                      <span style={{ fontWeight: "bold" }}>পরীক্ষার তারিখ:</span>
                      <span>{selectedExam.date}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #ccc" }}>
                      <span style={{ fontWeight: "bold" }}>মোট নম্বর:</span>
                      <span>{selectedExam.totalMarks}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: "50px", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ borderTop: "1px solid #333", width: "150px", marginTop: "40px", paddingTop: "5px" }}>
                        পরীক্ষার্থীর স্বাক্ষর
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ borderTop: "1px solid #333", width: "150px", marginTop: "40px", paddingTop: "5px" }}>
                        প্রধান শিক্ষকের স্বাক্ষর
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "10px", borderTop: "2px solid hsl(var(--primary))" }}>
                    <p style={{ fontSize: "12px", color: "#888", margin: "0" }}>এই প্রবেশপত্র পরীক্ষার হলে অবশ্যই সঙ্গে আনতে হবে।</p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {(!selectedStudent || !selectedExam) && (
          <Card className="border shadow-sm">
            <CardContent className="py-16 text-center text-muted-foreground">
              <p data-testid="text-admit-card-empty">ছাত্র এবং পরীক্ষা নির্বাচন করুন প্রবেশপত্র দেখতে।</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
