import React, { useState } from 'react';
import { useApp } from '../context';
import { Task, Role } from '../types';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Calendar as CalendarIcon, GripVertical, CheckCircle2, AlertCircle } from 'lucide-react';
import { Chat } from './Chat';

// Modal for Task Details
const TaskModal: React.FC<{ task: Task; onClose: () => void }> = ({ task, onClose }) => {
  const { currentUser } = useApp();
  // Role based access for editing handled conceptually here. 
  // Admin/Intern(owner) can edit status. Lawyer can view only.
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex overflow-hidden">
        {/* Left: Details */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              task.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 
              task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 
              'bg-blue-100 text-blue-700'
            }`}>
              {task.priority === 'HIGH' ? 'Alta' : task.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
            </span>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase">Descrição</label>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">{task.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="text-xs font-semibold text-gray-400 uppercase">Vencimento</label>
                <div className="flex items-center gap-2 mt-1 text-gray-700">
                  <CalendarIcon size={16} />
                  {format(new Date(task.dueDate), "dd 'de' MMMM", { locale: ptBR })}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase">Responsável</label>
                <div className="mt-1 flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                     {task.assignedTo}
                   </div>
                   <span className="text-sm text-gray-600">ID: {task.assignedTo}</span>
                </div>
              </div>
            </div>
            
            {currentUser?.role !== Role.LAWYER && (
              <div className="pt-4 border-t">
                <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  Marcar como Concluída
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat */}
        <div className="w-1/2 bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <MessageSquare size={18} /> Discussão
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    ✕
                </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
                <Chat task={task} />
            </div>
        </div>
      </div>
    </div>
  );
};

export const Calendar: React.FC = () => {
  const { getVisibleTasks, moveTaskToDate, currentUser } = useApp();
  const tasks = getVisibleTasks();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const days = Array.from({ length: 5 }).map((_, i) => addDays(currentWeekStart, i));

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      moveTaskToDate(taskId, date);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const isDraggable = (task: Task) => {
     if (currentUser?.role === Role.ADMIN) return true;
     if (currentUser?.role === Role.INTERN && task.assignedTo === currentUser.id) return true;
     return false;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agenda Semanal</h2>
        <div className="flex gap-2">
            <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))} className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50">Anterior</button>
            <button onClick={() => setCurrentWeekStart(new Date())} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-sm hover:bg-blue-100">Hoje</button>
            <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))} className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50">Próxima</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-4 overflow-hidden min-h-0">
        {days.map((day) => {
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), day));
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={day.toISOString()}
                onDrop={(e) => handleDrop(e, day)}
                onDragOver={handleDragOver}
                className={`flex flex-col h-full rounded-xl border ${isToday ? 'bg-blue-50/30 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className={`p-3 text-center border-b ${isToday ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                  <span className="block text-xs font-bold uppercase tracking-wider">{format(day, 'EEEE', { locale: ptBR })}</span>
                  <span className="block text-lg font-bold">{format(day, 'dd/MM')}</span>
                </div>

                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                   {dayTasks.map(task => {
                       const canDrag = isDraggable(task);
                       return (
                           <div 
                             key={task.id}
                             draggable={canDrag}
                             onDragStart={(e) => canDrag && handleDragStart(e, task.id)}
                             onClick={() => setSelectedTask(task)}
                             className={`bg-white p-3 rounded-lg border shadow-sm group cursor-pointer hover:shadow-md transition-all ${canDrag ? 'cursor-move' : 'cursor-pointer'} ${task.priority === 'HIGH' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'}`}
                           >
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold text-gray-500 line-clamp-1">{task.assignedTo === currentUser?.id ? 'Eu' : `User ${task.assignedTo}`}</span>
                                {task.comments.length > 0 && <MessageSquare size={12} className="text-gray-400" />}
                             </div>
                             <h4 className="text-sm font-medium text-gray-800 leading-tight mb-2">{task.title}</h4>
                             <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className={`px-1.5 py-0.5 rounded ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                                    {task.status === 'COMPLETED' ? 'Feito' : 'Pendente'}
                                </span>
                                {canDrag && <GripVertical size={14} className="opacity-0 group-hover:opacity-100 text-gray-400" />}
                             </div>
                           </div>
                       );
                   })}
                   {dayTasks.length === 0 && (
                       <div className="h-full flex items-center justify-center text-gray-300 text-sm italic">
                           Livre
                       </div>
                   )}
                </div>
              </div>
            );
        })}
      </div>

      {selectedTask && (
          <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};
