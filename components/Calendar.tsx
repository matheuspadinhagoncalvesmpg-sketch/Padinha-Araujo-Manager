import React, { useState } from 'react';
import { useApp } from '../context';
import { Task, Role } from '../types';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Calendar as CalendarIcon, GripVertical, CheckCircle2, AlertCircle, Plus, Link as LinkIcon, Briefcase } from 'lucide-react';
import { Chat } from './Chat';

// Modal for Task Details (View/Edit Status)
const TaskModal: React.FC<{ task: Task; onClose: () => void }> = ({ task, onClose }) => {
  const { currentUser, cases } = useApp();
  // Encontra o processo vinculado, se houver
  const linkedCase = task.caseId ? cases.find(c => c.id === task.caseId) : null;
  
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

            {linkedCase && (
                <div className="bg-brand-navy/5 p-3 rounded border border-brand-navy/10">
                    <label className="text-xs font-semibold text-brand-navy uppercase flex items-center gap-1 mb-1">
                        <Briefcase size={12} /> Processo Vinculado
                    </label>
                    <p className="text-sm font-medium text-gray-800">{linkedCase.title}</p>
                    <p className="text-xs text-gray-500 font-mono">{linkedCase.number}</p>
                </div>
            )}

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
                     {task.assignedTo ? task.assignedTo.substring(0, 2).toUpperCase() : 'NA'}
                   </div>
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

// Modal for Creating New Task
const NewTaskModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addTask, cases, currentUser } = useApp();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [priority, setPriority] = useState<'LOW'|'MEDIUM'|'HIGH'>('MEDIUM');
    const [caseId, setCaseId] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !title) return;

        await addTask({
            title,
            description,
            dueDate: new Date(date),
            status: 'PENDING',
            priority,
            assignedTo: currentUser?.id || 'unknown',
            caseId: caseId || undefined
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <h3 className="text-xl font-serif font-bold mb-6 text-brand-navy">Novo Prazo / Compromisso</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Título</label>
                        <input required className="w-full p-2 border border-gray-300 rounded focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Audiência Trabalhista" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Data e Hora</label>
                        <input required type="datetime-local" className="w-full p-2 border border-gray-300 rounded focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div>
                         <label className="block text-xs uppercase text-gray-500 font-semibold mb-1 flex items-center gap-2">
                             <Briefcase size={12} /> Vincular a Processo (Opcional)
                         </label>
                         <select className="w-full p-2 border border-gray-300 rounded focus:border-brand-navy outline-none" value={caseId} onChange={e => setCaseId(e.target.value)}>
                             <option value="">-- Sem vínculo (Geral) --</option>
                             {cases.map(c => (
                                 <option key={c.id} value={c.id}>
                                     {c.number} - {c.title}
                                 </option>
                             ))}
                         </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Prioridade</label>
                             <select className="w-full p-2 border border-gray-300 rounded focus:border-brand-navy outline-none" value={priority} onChange={e => setPriority(e.target.value as any)}>
                                 <option value="LOW">Baixa</option>
                                 <option value="MEDIUM">Média</option>
                                 <option value="HIGH">Alta</option>
                             </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Descrição</label>
                        <textarea className="w-full p-2 border border-gray-300 rounded focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none h-20 resize-none" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-brand-navy text-white rounded hover:bg-opacity-90 transition">Criar na Agenda</button>
                </div>
             </form>
        </div>
    )
}

export const Calendar: React.FC = () => {
  const { getVisibleTasks, moveTaskToDate, currentUser, cases } = useApp();
  const tasks = getVisibleTasks();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskOpen, setNewTaskOpen] = useState(false);

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
        <div className="flex gap-4">
             <button onClick={() => setNewTaskOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-sm font-semibold rounded shadow-sm hover:bg-opacity-90 transition">
                 <Plus size={16} /> Novo Prazo / Tarefa
             </button>
             <div className="flex gap-2 border-l pl-4 ml-2">
                <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))} className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50">Anterior</button>
                <button onClick={() => setCurrentWeekStart(new Date())} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-sm hover:bg-blue-100">Hoje</button>
                <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))} className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50">Próxima</button>
            </div>
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
                       const hasCase = !!task.caseId;
                       return (
                           <div 
                             key={task.id}
                             draggable={canDrag}
                             onDragStart={(e) => canDrag && handleDragStart(e, task.id)}
                             onClick={() => setSelectedTask(task)}
                             className={`bg-white p-3 rounded-lg border shadow-sm group cursor-pointer hover:shadow-md transition-all ${canDrag ? 'cursor-move' : 'cursor-pointer'} ${task.priority === 'HIGH' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'}`}
                           >
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold text-gray-500 line-clamp-1 flex items-center gap-1">
                                    {hasCase && <LinkIcon size={10} className="text-brand-navy" />}
                                    {task.assignedTo === currentUser?.id ? 'Eu' : `User`}
                                </span>
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
      {isNewTaskOpen && (
          <NewTaskModal onClose={() => setNewTaskOpen(false)} />
      )}
    </div>
  );
};