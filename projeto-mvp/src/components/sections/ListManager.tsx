import React, { useState, useEffect } from 'react';
import { 
  List, 
  Plus, 
  Trash2, 
  Users, 
  Bell, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  User,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, MonitoredList, MonitoredContact } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export const ListManager: React.FC = () => {
  const { user, lists, createList, deleteList, getContactsInList } = useAuth();
  const [newListName, setNewListName] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<MonitoredContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (selectedListId) {
      loadContacts(selectedListId);
    } else {
      setContacts([]);
    }
  }, [selectedListId]);

  const loadContacts = async (listId: string) => {
    setIsLoadingContacts(true);
    try {
      const data = await getContactsInList(listId);
      setContacts(data);
    } catch (error) {
      console.error("Load Contacts Error:", error);
      toast.error("Erro ao carregar contatos.");
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    try {
      await createList(newListName.trim());
      setNewListName('');
      setIsCreating(false);
    } catch (error) {
      console.error("Create List Error:", error);
    }
  };

  const handleDeleteList = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir esta lista?")) {
      await deleteList(id);
      if (selectedListId === id) setSelectedListId(null);
    }
  };

  const simulateUpdateCheck = (contact: MonitoredContact) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Verificando atualizações para ${contact.query}...`,
        success: () => {
          const hasUpdate = Math.random() > 0.7;
          if (hasUpdate) {
            return `Atualização detectada! O padrão de e-mail de ${contact.query} parece ter mudado.`;
          }
          return `Nenhuma atualização detectada para ${contact.query}.`;
        },
        error: 'Erro ao verificar atualizações.'
      }
    );
  };

  if (!user) return null;

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar: Lists */}
            <div className="w-full md:w-1/3 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-brand-dark-blue flex items-center gap-2">
                  <List size={20} className="text-brand-lilac" />
                  Minhas Listas
                </h3>
                <button 
                  onClick={() => setIsCreating(!isCreating)}
                  className="p-2 bg-brand-lilac/10 text-brand-lilac rounded-lg hover:bg-brand-lilac/20 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              <AnimatePresence>
                {isCreating && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCreateList}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 p-1">
                      <input 
                        type="text" 
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Nome da lista..."
                        className="flex-grow px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-lilac focus:border-transparent outline-none"
                        autoFocus
                      />
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-brand-dark-blue text-white rounded-lg text-sm font-bold hover:bg-brand-lilac hover:text-brand-dark-blue transition-all"
                      >
                        Criar
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {lists.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-400">Nenhuma lista criada.</p>
                  </div>
                ) : (
                  lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => setSelectedListId(list.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedListId === list.id 
                        ? 'bg-brand-lilac/10 border-brand-lilac/30 shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-brand-lilac/20 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          selectedListId === list.id ? 'bg-brand-lilac text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Users size={18} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-brand-dark-blue text-sm">{list.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                            {list.contactCount || 0} Contatos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trash2 
                          size={16} 
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          onClick={(e) => handleDeleteList(e, list.id)}
                        />
                        <ChevronRight size={16} className={selectedListId === list.id ? 'text-brand-lilac' : 'text-gray-300'} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Main Content: Contacts */}
            <div className="w-full md:w-2/3">
              {selectedListId ? (
                <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-6 min-h-[400px]">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-2xl font-bold text-brand-dark-blue">
                        {lists.find(l => l.id === selectedListId)?.name}
                      </h4>
                      <p className="text-sm text-gray-400">Gerencie e monitore seus contatos nesta lista.</p>
                    </div>
                    <button 
                      onClick={() => loadContacts(selectedListId)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-brand-dark-blue hover:bg-gray-50 transition-all shadow-sm"
                    >
                      <RefreshCw size={14} className={isLoadingContacts ? 'animate-spin' : ''} />
                      Atualizar
                    </button>
                  </div>

                  {isLoadingContacts ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="animate-spin text-brand-lilac mb-4" size={32} />
                      <p className="text-sm text-gray-400 font-medium">Carregando contatos...</p>
                    </div>
                  ) : contacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                        <Users size={32} />
                      </div>
                      <p className="text-gray-500 font-bold">Esta lista está vazia.</p>
                      <p className="text-sm text-gray-400 max-w-xs mt-2">
                        Adicione contatos a partir dos resultados de busca para começar o monitoramento.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contacts.map((contact) => (
                        <motion.div 
                          key={contact.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              contact.type === 'username' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                            }`}>
                              {contact.type === 'username' ? <User size={20} /> : <Mail size={20} />}
                            </div>
                            <div>
                              <p className="font-bold text-brand-dark-blue">{contact.query}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                  <Clock size={10} />
                                  Verificado: {new Date(contact.lastChecked).toLocaleDateString()}
                                </span>
                                <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                                  contact.status === 'updated' ? 'text-amber-500' : 'text-green-500'
                                }`}>
                                  {contact.status === 'updated' ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />}
                                  {contact.status === 'updated' ? 'Atualização Detectada' : 'Ativo'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => simulateUpdateCheck(contact)}
                              className="p-2 bg-brand-lilac/10 text-brand-lilac rounded-lg hover:bg-brand-lilac/20 transition-colors"
                              title="Verificar atualizações agora"
                            >
                              <Bell size={18} />
                            </button>
                            <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50/30 rounded-3xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-brand-lilac mb-6">
                    <Bell size={40} />
                  </div>
                  <h4 className="text-xl font-bold text-brand-dark-blue mb-2">Monitoramento Ativo</h4>
                  <p className="text-gray-400 max-w-sm">
                    Selecione uma lista à esquerda para gerenciar seus contatos monitorados e receber alertas de atualizações.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <RefreshCw className={`${className} animate-spin`} size={size} />
);
