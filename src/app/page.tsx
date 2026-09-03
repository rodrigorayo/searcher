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
    <main className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header Section EA */}
        <div className="bg-[#003b73] rounded-3xl p-6 sm:p-10 mb-8 shadow-xl text-center relative overflow-hidden">
          {/* Decoración sutil */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 rounded-full bg-[#004b93] opacity-60"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-[#004b93] opacity-60"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Educación <span className="text-[#f2a900]">Adventista</span>
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-lg mx-auto font-medium">
              Portal académico de búsqueda rápida. Encuentra aulas, niveles y docentes al instante.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 rounded-2xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-[#003b73] text-lg shadow-lg bg-white placeholder:text-slate-400 transition-all"
            placeholder="Buscar por estudiante o docente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Loader2 className="h-6 w-6 text-[#003b73] animate-spin" />
            </div>
          )}
        </div>

        {/* Loading / Empty States */}
        {loading && search === '' && (
          <div className="text-center py-10 text-slate-500 animate-pulse flex flex-col items-center">
            <Loader2 className="h-8 w-8 mb-4 animate-spin text-[#003b73]" />
            <p>Sincronizando base de datos académica...</p>
          </div>
        )}

        {!loading && search === '' && (
          <div className="text-center py-10 text-slate-400">
            <GraduationCap className="h-14 w-14 mx-auto mb-3 opacity-20 text-[#003b73]" />
            <p>Escribe un nombre para comenzar a buscar.</p>
            <p className="text-xs sm:text-sm mt-2 opacity-70">Sistema cargado: {students.length} registros listos.</p>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div 
                key={student.id} 
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-[#003b73] flex items-center gap-2 mb-1">
                    <User className="h-5 w-5 text-[#f2a900] flex-shrink-0" />
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
                    <BookOpen className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">Prof: <strong className="text-slate-800">{student.teacher}</strong></span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span>Aula: <strong className="text-slate-800">{student.room}</strong></span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-2 sm:col-span-2">
                    <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span>Turno: <strong className="text-slate-800">{student.shift}</strong></span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            search.trim() !== '' && !loading && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500">
                <p>No se encontraron resultados para &quot;{search}&quot;</p>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
