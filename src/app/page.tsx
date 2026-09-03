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
        const term = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(term) ||
          s.teacher.toLowerCase().includes(term)
        );
      }).slice(0, 50); // Limit to 50 results for extreme speed/fluidity

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Buscador de Estudiantes
          </h1>
          <p className="text-slate-500">
            Encuentra instantáneamente a cualquier estudiante, profesor o nivel.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 rounded-2xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 text-lg shadow-lg bg-white placeholder:text-slate-400 transition-all"
            placeholder="Ej. Juan Perez o Nombre del Docente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Loading State / Initial State */}
        {loading && search === '' && (
          <div className="text-center py-10 text-slate-500 animate-pulse flex flex-col items-center">
            <Loader2 className="h-8 w-8 mb-4 animate-spin text-blue-500" />
            <p>Sincronizando con Google Sheets...</p>
          </div>
        )}

        {!loading && search === '' && (
          <div className="text-center py-10 text-slate-400">
            <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Escribe un nombre para comenzar a buscar.</p>
            <p className="text-sm mt-2 opacity-70">Base de datos cargada: {students.length} estudiantes listos.</p>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div 
                key={student.id} 
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                    <User className="h-5 w-5 text-blue-500" />
                    {student.name}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-medium text-slate-700">{student.course}</span> 
                    &bull; {student.level}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600 sm:text-right">
                  <div className="flex items-center sm:justify-end gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span>Prof: <strong>{student.teacher}</strong></span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>Aula: <strong>{student.room}</strong></span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-2 col-span-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>Turno: <strong>{student.shift}</strong></span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            search.trim() !== '' && !loading && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500">
                <p>No se encontraron estudiantes con &quot;{search}&quot;</p>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
