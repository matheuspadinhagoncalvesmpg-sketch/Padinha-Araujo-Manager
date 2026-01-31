import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context';
import { Role, ViewState, Case, CaseDocument, Task } from './types';
import { Calendar } from './components/Calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  Scale,
  Plus,
  Loader2,
  HelpCircle,
  Pencil,
  Eye,
  ChevronRight,
  ChevronLeft,
  FileText,
  Upload,
  Download,
  Save,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

// --- Componente de Logo da Marca (Monograma PA) ---
const BrandLogo: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'lg' }) => {
  const isLarge = size === 'lg';
  return (
    <div className={`flex flex-col items-center justify-center ${isLarge ? 'mb-2' : ''}`}>
      <div className={`${isLarge ? 'w-24 h-24 text-5xl' : 'w-10 h-10 text-xl'} bg-brand-navy text-white font-serif flex items-center justify-center font-bold tracking-tighter border border-gray-700`}>
        <span className="relative" style={{ left: '2px' }}>P</span>
        <span className="relative italic font-light text-gray-400" style={{ fontSize: isLarge ? '0.5em' : '0.5em', margin: '0 -2px' }}>&</span>
        <span className="relative" style={{ right: '2px' }}>A</span>
      </div>
      {isLarge && (
        <div className="mt-4 text-center">
            <h1 className="font-serif text-2xl font-bold text-brand-navy tracking-wide uppercase">Padinha & Araújo</h1>
            <p className="text-xs tracking-[0.2em] text-gray-500 uppercase mt-1">Advogados</p>
        </div>
      )}
    </div>
  );
};

// --- Login Screen ---
const LoginScreen: React.FC = () => {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.INTERN);

  const translateError = (msg: string) => {
      if (msg.includes('Email not confirmed')) return 'E-mail não confirmado. Verifique sua caixa de entrada ou desative a confirmação no Supabase.';
      if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
      if (msg.includes('User already registered')) return 'Email já cadastrado.';
      return msg;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        // Fluxo de Cadastro
        await signup(name, email, password, role);
        
        // Tenta fazer login automático após cadastro
        try {
            await login(email, password);
        } catch (loginErr: any) {
            // Se falhar o login automático (ex: por causa da confirmação de email)
            setIsLogin(true); // Volta para tela de login
            
            if (loginErr.message?.includes('Email not confirmed')) {
                setError('Cadastro criado! Porém, o Supabase exige confirmação de e-mail por padrão.');
                setShowHelp(true); // Mostra ajuda automaticamente
            } else {
                alert("Cadastro realizado! Por favor, faça login.");
            }
        }
      }
    } catch (err: any) {
      setError(translateError(err.message || 'Ocorreu um erro.'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy p-4">
      <div className="bg-white p-8 md:p-10 rounded-sm shadow-2xl w-full max-w-md text-center border-t-4 border-gray-300 relative">
        <div className="mb-6 flex justify-center">
            <BrandLogo size="lg" />
        </div>
        
        <h2 className="text-xl font-serif font-bold text-brand-navy mb-1">
            {isLogin ? 'Bem-vindo de volta' : 'Criar Conta'}
        </h2>
        <p className="text-gray-500 mb-6 font-light text-sm">
            {isLogin ? 'Insira suas credenciais para continuar' : 'Preencha os dados para acesso ao sistema'}
        </p>

        {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded text-left">
                <strong>Erro:</strong> {error}
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {!isLogin && (
                <>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Nome Completo</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-gray-300 rounded focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none" placeholder="Ex: João Silva" />
                    </div>
                     <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Função</label>
                        <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full p-3 border border-gray-300 rounded focus:border-brand-navy outline-none bg-white">
                            <option value={Role.INTERN}>Estagiário</option>
                            <option value={Role.LAWYER}>Advogado</option>
                            <option value={Role.ADMIN}>Administrador</option>
                        </select>
                    </div>
                </>
            )}

            <div>
                <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none" placeholder="seu@email.com" />
            </div>
            
            <div>
                <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Senha</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none" placeholder="••••••••" />
            </div>

            <button disabled={loading} type="submit" className="w-full mt-4 bg-brand-navy text-white font-bold py-3 rounded hover:bg-opacity-90 transition flex justify-center items-center gap-2">
                {loading && <Loader2 className="animate-spin" size={18} />}
                {isLogin ? 'Entrar no Sistema' : 'Cadastrar Usuário'}
            </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-500 hover:text-brand-navy underline">
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
            </button>
        </div>
        
        {/* Help Section for Developers */}
        <div className="mt-4">
             <button onClick={() => setShowHelp(!showHelp)} className="text-xs text-brand-navy flex items-center justify-center w-full gap-1 hover:underline">
                <HelpCircle size={12} /> Ajuda: "Email not confirmed"?
             </button>
             {showHelp && (
                 <div className="mt-3 bg-blue-50 p-3 rounded text-xs text-left text-blue-900 border border-blue-100">
                     <p className="font-bold mb-1">Como resolver:</p>
                     <ol className="list-decimal pl-4 space-y-1">
                         <li>Acesse o painel do seu projeto no Supabase.</li>
                         <li>Vá em <strong>Authentication</strong> &gt; <strong>Providers</strong> &gt; <strong>Email</strong>.</li>
                         <li>Desmarque a opção <strong>"Confirm email"</strong>.</li>
                         <li>Tente fazer login novamente.</li>
                     </ol>
                 </div>
             )}
        </div>

        <div className="mt-8 text-xs text-gray-400">
            &copy; 2024 Padinha & Araújo Manager
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Component ---

const DashboardStats: React.FC = () => {
    const { cases, tasks } = useApp();
    const stats = [
        { label: 'Processos Ativos', value: cases.filter(c => c.status === 'OPEN').length, color: 'bg-brand-navy' },
        { label: 'Tarefas Hoje', value: tasks.filter(t => new Date(t.dueDate).getDate() === new Date().getDate()).length, color: 'bg-emerald-600' },
        { label: 'Tarefas Pendentes', value: tasks.filter(t => t.status !== 'COMPLETED').length, color: 'bg-amber-600' },
    ];
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{s.label}</p>
                        <p className="text-3xl font-serif font-bold text-gray-800 mt-2">{s.value}</p>
                    </div>
                    <div className={`w-1.5 h-12 ${s.color}`}></div>
                </div>
            ))}
        </div>
    );
};

// --- Case Detail Component (Legal One inspired) ---

interface CaseDetailProps {
    caseItem: Case;
    onBack: () => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({ caseItem, onBack }) => {
    const { tasks, updateCase, fetchCaseDocuments, addCaseDocument, uploadFile, addTask, currentUser } = useApp();
    const [activeTab, setActiveTab] = useState<'TASKS' | 'DOCS' | 'OBS'>('TASKS');
    const [observations, setObservations] = useState(caseItem.observations || '');
    const [documents, setDocuments] = useState<CaseDocument[]>([]);
    const [isLoadingDocs, setLoadingDocs] = useState(false);
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    
    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    
    // Task Form State (Mini version)
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');

    useEffect(() => {
        if (activeTab === 'DOCS') {
            setLoadingDocs(true);
            fetchCaseDocuments(caseItem.id)
                .then(setDocuments)
                .finally(() => setLoadingDocs(false));
        }
    }, [activeTab, caseItem.id]);

    const handleSaveObs = async () => {
        await updateCase(caseItem.id, { observations });
        alert('Observações salvas!');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Upload to Storage
            const publicUrl = await uploadFile(file, caseItem.id);
            
            // 2. Save Metadata to DB
            await addCaseDocument({
                caseId: caseItem.id,
                name: file.name,
                url: publicUrl,
                fileType: file.type.split('/')[1] || 'file'
            });

            // 3. Refresh list
            const docs = await fetchCaseDocuments(caseItem.id);
            setDocuments(docs);
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao enviar arquivo: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleQuickTask = async (e: React.FormEvent) => {
        e.preventDefault();
        await addTask({
            title: newTaskTitle,
            description: 'Criada via Painel do Processo',
            dueDate: new Date(newTaskDate),
            status: 'PENDING',
            priority: 'MEDIUM',
            assignedTo: currentUser?.id || '',
            caseId: caseItem.id
        });
        setTaskModalOpen(false);
        setNewTaskTitle('');
        setNewTaskDate('');
    };

    const caseTasks = tasks.filter(t => t.caseId === caseItem.id);

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'COMPLETED': return <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs font-semibold"><CheckCircle size={12}/> Concluído</span>;
            case 'IN_PROGRESS': return <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs font-semibold"><Clock size={12}/> Em Andamento</span>;
            default: return <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs font-semibold"><AlertCircle size={12}/> Pendente</span>;
        }
    }

    return (
        <div className="bg-white min-h-[calc(100vh-8rem)] rounded-lg shadow-sm flex flex-col">
            {/* Header / Breadcrumb */}
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
                <button onClick={onBack} className="text-sm text-brand-navy hover:underline flex items-center gap-1">
                    <ChevronLeft size={16} /> Voltar para a pesquisa
                </button>
                <div className="text-xs text-gray-400 font-mono">ID: {caseItem.id.substring(0,8)}</div>
            </div>

            {/* Case Info Header */}
            <div className="px-6 py-6 border-b border-gray-200">
                <h1 className="text-2xl font-serif font-bold text-brand-navy mb-4">
                    Visualizando: {caseItem.title}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                    <div>
                        <span className="block font-bold text-gray-500 uppercase text-xs mb-1">Número</span>
                        <span className="font-mono text-gray-800">{caseItem.number}</span>
                    </div>
                    <div>
                        <span className="block font-bold text-gray-500 uppercase text-xs mb-1">Partes</span>
                        <div className="text-gray-800 truncate" title={`${caseItem.clientName} x ${caseItem.opposingParty}`}>
                            <span className="text-brand-navy font-semibold">{caseItem.clientName}</span> <span className="text-gray-400 mx-1">x</span> {caseItem.opposingParty}
                        </div>
                    </div>
                     <div>
                        <span className="block font-bold text-gray-500 uppercase text-xs mb-1">Responsável</span>
                        <span className="text-gray-800">Isabela (Demo)</span>
                    </div>
                    <div>
                        <span className="block font-bold text-gray-500 uppercase text-xs mb-1">Status</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${
                             caseItem.status === 'OPEN' ? 'text-green-700 bg-green-50' : 'text-gray-600 bg-gray-100'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${caseItem.status === 'OPEN' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            {caseItem.status === 'OPEN' ? 'Ativo' : 'Arquivado'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-gray-200 flex gap-8">
                {[
                    { id: 'TASKS', label: 'Compromissos e Tarefas' },
                    { id: 'OBS', label: 'Observações' },
                    { id: 'DOCS', label: 'GED / Arquivos' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.id 
                            ? 'border-brand-navy text-brand-navy' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1 bg-gray-50/30">
                
                {/* --- TASKS TAB --- */}
                {activeTab === 'TASKS' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700">Compromissos e tarefas encontrados: {caseTasks.length}</h3>
                            <button onClick={() => setTaskModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-brand-navy text-brand-navy rounded hover:bg-brand-navy hover:text-white transition text-sm font-medium">
                                <Plus size={16} /> Adicionar
                            </button>
                        </div>

                        {caseTasks.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-gray-400">
                                <CalendarDays size={48} className="mb-4 opacity-50" />
                                <p>Não existem registros a serem exibidos.</p>
                            </div>
                        ) : (
                             <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Data</th>
                                            <th className="px-4 py-3 text-left">Descrição</th>
                                            <th className="px-4 py-3 text-left">Prioridade</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {caseTasks.map(t => (
                                            <tr key={t.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-brand-navy font-semibold">
                                                    {format(new Date(t.dueDate), "dd/MM/yyyy HH:mm")}
                                                </td>
                                                <td className="px-4 py-3">{t.title}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                                        t.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                                                    }`}>{t.priority === 'HIGH' ? 'Alta' : t.priority === 'MEDIUM' ? 'Média' : 'Baixa'}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(t.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        )}

                        {isTaskModalOpen && (
                             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <form onSubmit={handleQuickTask} className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                                    <h3 className="font-bold text-lg mb-4 text-brand-navy">Adicionar Tarefa Rápida</h3>
                                    <div className="space-y-3">
                                        <input required className="w-full p-2 border rounded" placeholder="Título" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                                        <input required type="datetime-local" className="w-full p-2 border rounded" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button type="button" onClick={() => setTaskModalOpen(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                        <button type="submit" className="px-3 py-1.5 bg-brand-navy text-white rounded">Salvar</button>
                                    </div>
                                </form>
                             </div>
                        )}
                    </div>
                )}

                {/* --- OBS TAB --- */}
                {activeTab === 'OBS' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-gray-700">Anotações Internas</h3>
                             <button onClick={handleSaveObs} className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded hover:bg-opacity-90 text-sm">
                                 <Save size={16} /> Salvar Alterações
                             </button>
                        </div>
                        <textarea 
                            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-brand-navy focus:border-brand-navy outline-none shadow-sm resize-none text-gray-700 leading-relaxed"
                            placeholder="Escreva aqui detalhes do caso, estratégias ou histórico..."
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                        />
                    </div>
                )}

                {/* --- GED TAB --- */}
                {activeTab === 'DOCS' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-700">Acervo Jurídico (GED)</h3>
                            <label className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded cursor-pointer hover:bg-gray-50 transition shadow-sm text-sm font-medium ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                {isUploading ? 'Enviando...' : 'Upload Arquivo'}
                                <input disabled={isUploading} type="file" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>

                        {isLoadingDocs ? (
                            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-navy" /></div>
                        ) : documents.length === 0 ? (
                             <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-gray-400">
                                <FileText size={48} className="mb-4 opacity-50" />
                                <p>Nenhum documento anexado.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {documents.map(doc => (
                                    <div key={doc.id} className="bg-white p-4 rounded border border-gray-200 shadow-sm flex items-start gap-3 hover:border-brand-navy transition group">
                                        <div className="p-2 bg-gray-100 rounded text-brand-navy">
                                            <FileText size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 truncate" title={doc.name}>{doc.name}</p>
                                            <p className="text-xs text-gray-400 mt-1">{format(new Date(doc.createdAt), "dd/MM/yyyy HH:mm")}</p>
                                            <p className="text-[10px] uppercase text-gray-400 mt-0.5">{doc.fileType}</p>
                                        </div>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-brand-navy hover:bg-gray-50 rounded">
                                            <Download size={16} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Case List (Updated to navigate to Detail) ---

interface CaseListProps {
    onOpenCase: (c: Case) => void;
}

const CaseList: React.FC<CaseListProps> = ({ onOpenCase }) => {
    const { cases, addCase, updateCase, canEdit, currentUser } = useApp();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingCaseId, setEditingCaseId] = useState<string | null>(null);

    const [formData, setFormData] = useState({ 
        title: '', 
        number: '', 
        clientName: '', 
        opposingParty: '', 
        status: 'OPEN' as 'OPEN' | 'ARCHIVED' | 'SUSPENDED',
        observations: '' 
    });

    const openCreateModal = () => {
        setEditingCaseId(null);
        setFormData({ title: '', number: '', clientName: '', opposingParty: '', status: 'OPEN', observations: '' });
        setModalOpen(true);
    };

    const openEditModal = (c: Case) => {
        setEditingCaseId(c.id);
        setFormData({
            title: c.title,
            number: c.number,
            clientName: c.clientName,
            opposingParty: c.opposingParty,
            status: c.status,
            observations: c.observations || ''
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCaseId) {
            await updateCase(editingCaseId, formData);
        } else {
            await addCase({ 
                ...formData, 
                responsibleLawyerId: currentUser?.id || '1' 
            });
        }
        setModalOpen(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-serif font-bold text-brand-navy">Processos</h2>
                {canEdit && (
                    <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded hover:bg-opacity-90 transition shadow-sm">
                        <Plus size={18} /> Novo Processo
                    </button>
                )}
            </div>
            <table className="w-full">
                <thead className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4 text-left font-medium">Número</th>
                        <th className="px-6 py-4 text-left font-medium">Título</th>
                        <th className="px-6 py-4 text-left font-medium">Cliente</th>
                        <th className="px-6 py-4 text-left font-medium">Status</th>
                        <th className="px-6 py-4 text-right font-medium">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {cases.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">{c.number}</td>
                            <td className="px-6 py-4 font-medium text-gray-800">
                                {c.title}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{c.clientName}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    c.status === 'OPEN' ? 'bg-green-100 text-green-800' : 
                                    c.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-800'
                                }`}>
                                    {c.status === 'OPEN' ? 'Ativo' : c.status === 'ARCHIVED' ? 'Arquivado' : 'Suspenso'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <button 
                                    onClick={() => onOpenCase(c)}
                                    className="text-brand-navy hover:bg-blue-50 p-1.5 rounded transition flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                                >
                                    <Eye size={16} /> Abrir
                                </button>
                                {(canEdit || currentUser?.role === Role.LAWYER) && (
                                    <button 
                                        onClick={() => openEditModal(c)}
                                        className="text-gray-400 hover:text-brand-navy p-1.5 rounded hover:bg-gray-100 transition"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {cases.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">Nenhum processo cadastrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-serif font-bold mb-6 text-brand-navy">
                            {editingCaseId ? 'Editar Processo' : 'Novo Processo'}
                        </h3>
                        {/* Form fields simplified for brevity, similar to original */}
                        <div className="space-y-4">
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Número</label><input required className="w-full p-2 border rounded" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Título</label><input required className="w-full p-2 border rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Cliente</label><input required className="w-full p-2 border rounded" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Parte Contrária</label><input required className="w-full p-2 border rounded" value={formData.opposingParty} onChange={e => setFormData({...formData, opposingParty: e.target.value})} /></div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                <select className="w-full p-2 border rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                                    <option value="OPEN">Ativo</option><option value="SUSPENDED">Suspenso</option><option value="ARCHIVED">Arquivado</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Observações Iniciais</label>
                                <textarea className="w-full p-2 border rounded h-20" value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-brand-navy text-white rounded">{editingCaseId ? 'Salvar' : 'Criar'}</button>
                        </div>
                    </form>
                 </div>
            )}
        </div>
    );
};

// --- Contact List (Unchanged mostly) ---
const ContactList: React.FC = () => {
    const { contacts, canEdit, addContact } = useApp();
    const [isModalOpen, setModalOpen] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', type: 'CLIENT' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addContact(newContact as any);
        setModalOpen(false);
        setNewContact({ name: '', email: '', phone: '', type: 'CLIENT' });
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-serif font-bold text-brand-navy">Contatos</h2>
                {canEdit && (
                    <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded hover:bg-opacity-90 transition shadow-sm">
                        <Plus size={18} /> Novo Contato
                    </button>
                )}
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contacts.map(c => (
                    <div key={c.id} className="p-5 border border-gray-200 rounded-lg hover:border-brand-navy transition bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-gray-800">{c.name}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase tracking-wider">{c.type}</span>
                        </div>
                        <p className="text-sm text-gray-600">Email: {c.email}</p>
                        <p className="text-sm text-gray-600">Tel: {c.phone}</p>
                    </div>
                ))}
            </div>
             {isModalOpen && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleAdd} className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-xl font-serif font-bold mb-6 text-brand-navy">Novo Contato</h3>
                        <div className="space-y-4">
                            <input required className="w-full p-2 border rounded" placeholder="Nome" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
                            <select className="w-full p-2 border rounded" value={newContact.type} onChange={e => setNewContact({...newContact, type: e.target.value})}>
                                <option value="CLIENT">Cliente</option><option value="OPPOSING">Parte Contrária</option><option value="PARTNER">Parceiro</option>
                            </select>
                            <input required className="w-full p-2 border rounded" placeholder="Email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} />
                            <input required className="w-full p-2 border rounded" placeholder="Telefone" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} />
                        </div>
                        <div className="mt-6 flex justify-end gap-3"><button type="submit" className="px-4 py-2 bg-brand-navy text-white rounded">Salvar</button></div>
                    </form>
                 </div>
            )}
        </div>
    );
}

const UserList: React.FC = () => {
    const { users } = useApp();
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
             <div className="p-6 border-b border-gray-100 bg-gray-50"><h2 className="text-xl font-serif font-bold text-brand-navy">Usuários</h2></div>
            <div className="p-6">
                <table className="w-full">
                    <thead className="text-left text-sm text-gray-500 uppercase"><tr><th className="pb-4">Usuário</th><th className="pb-4">Email</th><th className="pb-4">Perfil</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">{users.map(u => (<tr key={u.id}><td className="py-4 font-medium">{u.name}</td><td className="py-4 text-gray-600">{u.email}</td><td className="py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs uppercase">{u.role}</span></td></tr>))}</tbody>
                </table>
            </div>
        </div>
    )
}

// --- Main Layout ---

const MainApp: React.FC = () => {
  const { currentUser, logout } = useApp();
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'AGENDA', label: 'Agenda & Tarefas', icon: CalendarDays },
    { id: 'CASES', label: 'Processos', icon: Scale },
    { id: 'CONTACTS', label: 'Contatos', icon: Users },
  ];

  if (currentUser?.role === Role.ADMIN) {
      navItems.push({ id: 'USERS', label: 'Usuários', icon: Settings });
  }

  const handleOpenCase = (c: Case) => {
      setSelectedCase(c);
      setView('CASE_DETAIL');
  };

  const handleBackToCases = () => {
      setSelectedCase(null);
      setView('CASES');
  };

  const handleNavClick = (id: string) => {
      setView(id as ViewState);
      if (id !== 'CASE_DETAIL') setSelectedCase(null);
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-navy text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 flex flex-col items-center justify-center border-b border-gray-800 bg-[#0a1529]">
           <BrandLogo size="sm" />
           <span className="mt-3 text-lg font-serif font-bold tracking-wide text-center leading-tight">Padinha &<br/>Araújo</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 ${
                (view === item.id || (view === 'CASE_DETAIL' && item.id === 'CASES'))
                  ? 'bg-white/10 text-white shadow-inner border-l-4 border-white' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span className="font-medium text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-[#0a1529]">
          <div className="flex items-center gap-3 mb-4 px-2">
             <img src={currentUser?.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-gray-600 grayscale" />
             <div className="flex-1 min-w-0">
                 <p className="text-sm font-semibold truncate text-gray-200">{currentUser?.name}</p>
                 <p className="text-[10px] text-gray-400 uppercase tracking-wider">{currentUser?.role}</p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-300 hover:bg-white/5 rounded transition"
          >
            <LogOut size={16} /> <span className="text-xs uppercase tracking-wider font-semibold">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between shrink-0 shadow-sm">
            <h1 className="text-xl font-serif font-bold text-brand-navy">
                {view === 'CASE_DETAIL' ? 'Detalhes do Processo' : navItems.find(n => n.id === view)?.label}
            </h1>
            <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider rounded-full">
                    {currentUser?.role === Role.ADMIN ? 'Acesso Total' : 
                     currentUser?.role === Role.LAWYER ? 'Advogado' : 'Estagiário'}
                </span>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                {view === 'DASHBOARD' && <><DashboardStats /><div className="text-center text-gray-400 mt-20 font-serif italic text-lg">"Justiça e excelência em cada detalhe."</div></>}
                {view === 'AGENDA' && <Calendar />}
                {view === 'CASES' && <CaseList onOpenCase={handleOpenCase} />}
                {view === 'CASE_DETAIL' && selectedCase && <CaseDetail caseItem={selectedCase} onBack={handleBackToCases} />}
                {view === 'CONTACTS' && <ContactList />}
                {view === 'USERS' && <UserList />}
            </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, loading } = useApp();
  
  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-navy text-white">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-white/50" />
            <p className="font-serif tracking-widest text-xs uppercase opacity-50">Carregando Sistema...</p>
        </div>
    )
  }

  return currentUser ? <MainApp /> : <LoginScreen />;
}

export default App;