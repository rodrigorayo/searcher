'use client';

import { useState, useEffect } from 'react';
import { Search, User, BookOpen, Clock, MapPin, GraduationCap, Loader2 } from 'lucide-react';

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

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load students", err);
        setLoading(false);
      });
  }, []);

  // Filter students (searches across name, teacher, and level)
  const filteredStudents = search.trim() === '' 
    ? [] 
    : students.filter(s => {
        const searchTerms = search.toLowerCase().split(/\s+/).filter(Boolean);
        const studentName = s.name.toLowerCase();
        const teacherName = s.teacher.toLowerCase();
        
        // Verifica que CADA palabra de la búsqueda exista en el nombre del estudiante o del profesor
        return searchTerms.every(term => 
          studentName.includes(term) || teacherName.includes(term)
        );
      }).slice(0, 50); // Limit to 50 results for extreme speed/fluidity

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
            <p>Sincronizando base de datos...</p>
          </div>
        )}

        {!loading && search === '' && (
          <div className="text-center py-8 text-blue-200">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-40 text-white" />
            <p className="text-lg font-medium">Escribe un nombre para comenzar.</p>
            <p className="text-xs sm:text-sm mt-2 opacity-70">Sistema cargado: {students.length} registros listos.</p>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div 
                key={student.id} 
                className="bg-white p-5 rounded-2xl shadow-lg border-l-4 border-l-red-500 hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-slate-600 sm:text-right mt-3 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto">
                  <div className="flex items-center sm:justify-end gap-2">
                    <BookOpen className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <span className="truncate">Prof: <strong className="text-[#002b5e]">{student.teacher}</strong></span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-2">
                    <MapPin className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <span>Aula: <strong className="text-[#002b5e]">{student.room}</strong></span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-2 sm:col-span-2">
                    <Clock className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <span>Turno: <strong className="text-[#002b5e]">{student.shift}</strong></span>
                  </div>
                </div>
              </div>
            ))
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
