import React, { useState } from 'react';
import { useApp } from '../context';
import { Task } from '../types';
import { Send, User as UserIcon } from 'lucide-react';

interface ChatProps {
  task: Task;
}

export const Chat: React.FC<ChatProps> = ({ task }) => {
  const { addComment, currentUser } = useApp();
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    addComment(task.id, message);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-3 bg-gray-50 border-b font-medium text-gray-700 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        Chat da Tarefa
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-60 bg-gray-50/50">
        {task.comments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center italic">Nenhum comentário ainda.</p>
        ) : (
          task.comments.map((comment) => {
            const isMe = comment.userId === currentUser?.id;
            return (
              <div key={comment.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 ${isMe ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}>
                  <div className="flex justify-between items-baseline mb-1 gap-4">
                    <span className={`text-xs font-bold ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>{comment.userName}</span>
                    <span className={`text-[10px] ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          disabled={!message.trim()}
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
