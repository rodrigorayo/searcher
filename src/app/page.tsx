'use client';

import { useState, useEffect } from 'react';
import { Search, User, BookOpen, Clock, MapPin, GraduationCap, Loader2, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  course: string;
  teacher: string;
  level: string;
  room: string;
  shift: string;
  sheet: string;
}

interface KardexRecord {
  date: string;
  student: string;
  observation: string;
  felicitation: string;
  detail: string;
  group: string;
  teacher: string;
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [kardex, setKardex] = useState<KardexRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(res => res.json()),
      fetch('/api/kardex').then(res => res.json())
    ]).then(([studentsData, kardexData]) => {
      setStudents(studentsData);
      setKardex(kardexData);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load data", err);
      setLoading(false);
    });
  }, []);

  const filteredStudents = search.trim() === '' 
    ? [] 
    : students.filter(s => {
        const searchTerms = search.toLowerCase().split(/\s+/).filter(Boolean);
        const studentName = s.name.toLowerCase();
        const teacherName = s.teacher.toLowerCase();
        
        return searchTerms.every(term => 
          studentName.includes(term) || teacherName.includes(term)
        );
      }).slice(0, 50);

  // Helper to get kardex for a specific student
  const getStudentKardex = (studentName: string) => {
    const normalizedTarget = studentName.toLowerCase().trim();
    return kardex.filter(k => {
        const kName = String(k.student).toLowerCase().trim();
        return kName === normalizedTarget || normalizedTarget.includes(kName) || kName.includes(normalizedTarget);
    });
  };

  return (
    <main className="min-h-screen bg-[#002b5e] text-slate-900 font-sans pb-12">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
            Educación Adventista
          </h1>
          <h2 className="text-lg sm:text-xl font-bold text-red-500 tracking-wide uppercase">
            Departamento de Inglés
          </h2>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 shadow-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3.5 rounded-2xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-red-500 text-lg shadow-lg bg-white placeholder:text-slate-400 transition-all"
            placeholder="Buscar por estudiante o docente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Loader2 className="h-6 w-6 text-red-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Loading / Empty States */}
        {loading && search === '' && (
          <div className="text-center py-8 text-blue-200 animate-pulse flex flex-col items-center">
            <Loader2 className="h-8 w-8 mb-3 animate-spin text-red-500" />
            <p>Sincronizando bases de datos...</p>
          </div>
        )}

        {!loading && search === '' && (
          <div className="text-center py-8 text-blue-200">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-40 text-white" />
            <p className="text-lg font-medium">Escribe un nombre para comenzar.</p>
            <p className="text-xs sm:text-sm mt-2 opacity-70">Sistema listo. Base de alumnos y Kárdex sincronizados.</p>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => {
              const studentKardex = getStudentKardex(student.name);
              const isExpanded = expandedId === student.id;

              return (
                <div key={student.id} className="bg-white rounded-2xl shadow-lg border-l-4 border-l-red-500 transition-all overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <h3 className="text-lg font-bold text-[#002b5e] flex items-center gap-2 mb-1">
                        <User className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <span className="leading-tight">{student.name}</span>
                      </h3>
                      <p className="text-sm text-slate-600 flex items-center gap-2 mt-1.5">
                        <GraduationCap className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-800">{student.course}</span> 
                        <span className="text-slate-300">&bull;</span> {student.level}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end gap-2 text-sm text-slate-600 mt-2 sm:mt-0 w-full sm:w-1/2">
                      <div className="flex items-start sm:justify-end gap-2">
                        <BookOpen className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-left sm:text-right leading-snug text-balance">Prof: <strong className="text-[#002b5e]">{student.teacher}</strong></span>
                      </div>
                      <div className="flex items-start sm:justify-end gap-2">
                        <MapPin className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-left sm:text-right leading-snug">Aula: <strong className="text-[#002b5e]">{student.room}</strong></span>
                      </div>
                      <div className="flex flex-row items-center w-full justify-between sm:justify-end sm:gap-4 mt-2 pt-3 border-t sm:border-0 sm:pt-0">
                          <span className="flex items-center gap-1 text-[#002b5e]"><Clock className="h-4 w-4 text-red-400"/> <strong>{student.shift}</strong></span>
                          <button 
                              onClick={() => setExpandedId(isExpanded ? null : student.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm ${studentKardex.length > 0 ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'}`}
                          >
                              <FileText className="h-4 w-4" />
                              Kárdex ({studentKardex.length})
                          </button>
                      </div>
                    </div>
                  </div>

                  {/* KARDEX EXPANDABLE SECTION */}
                  {isExpanded && (
                    <div className="bg-slate-50 p-5 border-t border-slate-100">
                      <h4 className="font-bold text-[#002b5e] mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-red-500" />
                        Historial de Kárdex
                      </h4>
                      
                      {studentKardex.length === 0 ? (
                        <p className="text-sm text-slate-500 italic px-2">No hay observaciones registradas para este estudiante.</p>
                      ) : (
                        <div className="space-y-3">
                          {studentKardex.map((record, i) => (
                            <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-sm">
                              <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                                <span className="font-semibold text-slate-500 text-xs bg-slate-100 px-2 py-0.5 rounded-md">{record.date}</span>
                                {record.felicitation && record.felicitation !== "undefined" && record.felicitation.toLowerCase() !== "false" ? (
                                    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3"/> Felicitación</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full"><AlertCircle className="h-3 w-3"/> Observación</span>
                                )}
                              </div>
                              
                              {record.observation && record.observation !== "undefined" && (
                                <p className="font-bold text-slate-800 mb-1">{record.observation}</p>
                              )}
                              {record.detail && record.detail !== "undefined" && (
                                <p className="text-slate-600">{record.detail}</p>
                              )}
                              <p className="text-xs text-slate-400 mt-2 italic">Reportado por: {record.teacher}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          ) : (
            search.trim() !== '' && !loading && (
              <div className="text-center py-10 bg-[#001f44] rounded-2xl border border-dashed border-blue-800 text-blue-200 shadow-inner">
                <p>No se encontraron resultados para &quot;{search}&quot;</p>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
