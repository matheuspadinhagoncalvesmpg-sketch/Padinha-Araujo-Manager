import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Task, Case, Contact, Comment } from './types';
import { supabase } from './supabaseClient';

interface AppContextType {
  currentUser: User | null;
  loading: boolean;
  users: User[];
  cases: Case[];
  tasks: Task[];
  contacts: Contact[];
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  addCase: (c: Omit<Case, 'id'>) => Promise<void>;
  updateCase: (id: string, data: Partial<Case>) => Promise<void>;
  addTask: (t: Omit<Task, 'id' | 'comments'>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<void>;
  moveTaskToDate: (taskId: string, newDate: Date) => Promise<void>;
  addContact: (c: Omit<Contact, 'id'>) => Promise<void>;
  
  // Permission Helpers
  canEdit: boolean; 
  getVisibleTasks: () => Task[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // --- Initial Load & Auth Listener ---
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfileAndData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfileAndData(session.user.id);
      } else {
        setCurrentUser(null);
        setCases([]);
        setTasks([]);
        setContacts([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfileAndData = async (userId: string) => {
    try {
      setLoading(true);
      
      // 1. Fetch Current User Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      setCurrentUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as Role,
        avatar: profile.avatar
      });

      // 2. Fetch All Data (Parallel)
      await Promise.all([
        fetchUsers(),
        fetchCases(),
        fetchContacts(),
        fetchTasks()
      ]);

    } catch (error) {
      console.error('Error loading data:', error);
      alert('Erro ao carregar dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  // --- Fetchers ---

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) {
      setUsers(data.map(u => ({ ...u, role: u.role as Role })));
    }
  };

  const fetchCases = async () => {
    const { data } = await supabase.from('cases').select('*').order('created_at', { ascending: false });
    if (data) {
      setCases(data.map(c => ({
        id: c.id,
        number: c.number,
        title: c.title,
        clientName: c.client_name,
        opposingParty: c.opposing_party,
        status: c.status,
        responsibleLawyerId: c.responsible_lawyer_id,
        observations: c.observations // Mapeia observações
      })));
    }
  };

  const fetchContacts = async () => {
    const { data } = await supabase.from('contacts').select('*').order('name');
    if (data) setContacts(data as Contact[]);
  };

  const fetchTasks = async () => {
    // Fetch tasks AND their comments
    const { data } = await supabase
      .from('tasks')
      .select(`
        *,
        comments (
          id, content, timestamp, user_id, 
          profiles (name)
        )
      `)
      .order('due_date');

    if (data) {
      const formattedTasks: Task[] = data.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        caseId: t.case_id,
        assignedTo: t.assigned_to,
        dueDate: new Date(t.due_date), // Convert string to Date
        status: t.status,
        priority: t.priority,
        comments: t.comments.map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          userName: c.profiles?.name || 'Usuário',
          content: c.content,
          timestamp: new Date(c.timestamp)
        })).sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime())
      }));
      setTasks(formattedTasks);
    }
  };

  // --- Auth Actions ---

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (name: string, email: string, password: string, role: Role) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f1f3a&color=fff`
        }
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // --- Logic Helpers ---

  const canEdit = currentUser?.role === Role.ADMIN;

  const getVisibleTasks = () => {
    if (!currentUser) return [];
    if (currentUser.role === Role.ADMIN || currentUser.role === Role.LAWYER) {
      return tasks;
    }
    return tasks.filter(t => t.assignedTo === currentUser.id);
  };

  // --- CRUD Actions ---

  const addCase = async (c: Omit<Case, 'id'>) => {
    const dbCase = {
      number: c.number,
      title: c.title,
      client_name: c.clientName,
      opposing_party: c.opposingParty,
      status: c.status,
      responsible_lawyer_id: c.responsibleLawyerId,
      observations: c.observations // Salva observações
    };
    const { error } = await supabase.from('cases').insert(dbCase);
    if (error) { console.error(error); alert('Erro ao salvar processo'); }
    else await fetchCases();
  };

  const updateCase = async (id: string, data: Partial<Case>) => {
    // Removed strict permission check here to allow Lawyers to edit observations if needed, 
    // or keep strictly for Admin based on logic. Keeping consistent with UI.
    const dbData: any = {};
    if (data.title) dbData.title = data.title;
    if (data.number) dbData.number = data.number;
    if (data.clientName) dbData.client_name = data.clientName;
    if (data.opposingParty) dbData.opposing_party = data.opposingParty;
    if (data.status) dbData.status = data.status;
    if (data.observations !== undefined) dbData.observations = data.observations;
    
    const { error } = await supabase.from('cases').update(dbData).eq('id', id);
    if (error) { console.error(error); alert('Erro ao atualizar processo'); }
    else await fetchCases();
  };

  const addTask = async (t: Omit<Task, 'id' | 'comments'>) => {
    const dbTask = {
      title: t.title,
      description: t.description,
      case_id: t.caseId || null, // Garante null se for string vazia
      assigned_to: t.assignedTo,
      due_date: t.dueDate.toISOString(),
      status: t.status,
      priority: t.priority
    };
    const { error } = await supabase.from('tasks').insert(dbTask);
    if (error) { console.error(error); alert('Erro ao criar tarefa'); }
    else await fetchTasks();
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    const dbData: any = {};
    if (data.status) dbData.status = data.status;
    if (data.dueDate) dbData.due_date = data.dueDate.toISOString();
    
    const { error } = await supabase.from('tasks').update(dbData).eq('id', id);
    if (!error) await fetchTasks();
  };

  const moveTaskToDate = async (taskId: string, newDate: Date) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (currentUser?.role === Role.LAWYER) return; 
    if (currentUser?.role === Role.INTERN && task.assignedTo !== currentUser.id) return;

    const updated = new Date(newDate);
    updated.setHours(task.dueDate.getHours());
    updated.setMinutes(task.dueDate.getMinutes());

    await updateTask(taskId, { dueDate: updated } as any);
  };

  const addComment = async (taskId: string, content: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from('comments').insert({
      task_id: taskId,
      user_id: currentUser.id,
      content
    });
    if (!error) await fetchTasks();
  };

  const addContact = async (c: Omit<Contact, 'id'>) => {
    if (!canEdit) return;
    const { error } = await supabase.from('contacts').insert(c);
    if (error) { console.error(error); alert('Erro ao criar contato'); }
    else await fetchContacts();
  };

  return (
    <AppContext.Provider value={{
      currentUser, loading, users, cases, tasks, contacts,
      login, signup, logout,
      addCase, updateCase,
      addTask, updateTask, addComment, moveTaskToDate,
      addContact,
      canEdit, getVisibleTasks
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};