import React from 'react';
import { Search, User, Mail as MailIcon, Globe, Loader2, AlertCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchResult } from './SearchResults';
import { toast } from 'sonner';

const PLATFORMS_LIST = [
  { name: "Instagram", url: "https://www.instagram.com/{}" },
  { name: "X (Twitter)", url: "https://x.com/{}" },
  { name: "GitHub", url: "https://github.com/{}" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/{}" },
  { name: "Reddit", url: "https://www.reddit.com/user/{}" },
  { name: "Twitch", url: "https://www.twitch.com/{}" },
  { name: "Steam", url: "https://steamcommunity.com/id/{}" },
  { name: "Pinterest", url: "https://www.pinterest.com/{}" },
  { name: "Behance", url: "https://www.behance.net/{}" },
  { name: "Medium", url: "https://medium.com/@{}" },
  { name: "Linktree", url: "https://linktr.ee/{}" },
  { name: "TikTok", url: "https://www.tiktok.com/@{}" },
  { name: "Letterboxd", url: "https://letterboxd.com/{}" },
  { name: "Strava", url: "https://www.strava.com/athletes/{}" }
];

const BREACHES_LIST = [
  { name: "Adobe (2013)", url: "https://haveibeenpwned.com/PwnedWebsites#Adobe" },
  { name: "LinkedIn (2016)", url: "https://haveibeenpwned.com/PwnedWebsites#LinkedIn" },
  { name: "Canva (2019)", url: "https://haveibeenpwned.com/PwnedWebsites#Canva" },
  { name: "Dropbox (2012)", url: "https://haveibeenpwned.com/PwnedWebsites#Dropbox" },
  { name: "MySpace (2016)", url: "https://haveibeenpwned.com/PwnedWebsites#MySpace" },
  { name: "Wattpad (2020)", url: "https://haveibeenpwned.com/PwnedWebsites#Wattpad" },
  { name: "Zynga (2019)", url: "https://haveibeenpwned.com/PwnedWebsites#Zynga" },
  { name: "Evite (2019)", url: "https://haveibeenpwned.com/PwnedWebsites#Evite" },
  { name: "Verifications.io", url: "https://haveibeenpwned.com/PwnedWebsites#VerificationsIO" },
  { name: "Collection #1", url: "https://haveibeenpwned.com/PwnedWebsites#Collection1" }
];

const PHONE_LIST = [
  { name: "WhatsApp", url: "https://wa.me/{}" },
  { name: "Telegram", url: "https://t.me/{}" },
  { name: "Truecaller", url: "https://www.truecaller.com/search/br/{}" },
  { name: "Sync.ME", url: "https://sync.me/search/?number={}" },
  { name: "TudoSobreTodos", url: "https://tudosobretodos.info/{}" },
  { name: "Cadastro Nacional", url: "https://www.cadastronacional.com.br/consulta/{}" },
  { name: "Operadora (Simulado)", url: "#" },
  { name: "Vínculo Bancário (Simulado)", url: "#" }
];

const PHONE_LIST = [
  { name: "WhatsApp", url: "https://wa.me/{}" },
  { name: "Telegram", url: "https://t.me/{}" },
  { name: "Truecaller", url: "https://www.truecaller.com/search/br/{}" },
  { name: "Sync.ME", url: "https://sync.me/search/?number={}" },
  { name: "TudoSobreTodos", url: "https://tudosobretodos.info/{}" },
  { name: "Cadastro Nacional", url: "https://www.cadastronacional.com.br/consulta/{}" },
  { name: "Operadora (Simulado)", url: "#" },
  { name: "Vínculo Bancário (Simulado)", url: "#" }
];

import { useAuth } from '../../contexts/AuthContext';

interface HeroProps {
  onSearch: (query: string, results: SearchResult[], type: 'username' | 'email' | 'phone', searchingOverride?: boolean) => void;
  isSearching: boolean;
}

interface SearchHistoryItem {
  query: string;
  type: 'username' | 'email' | 'phone';
  timestamp: number;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, isSearching }) => {
  const [searchType, setSearchType] = React.useState<'username' | 'email' | 'phone'>('username');
  const [query, setQuery] = React.useState('');
  const [lastError, setLastError] = React.useState<string | null>(null);
  const [localHistory, setLocalHistory] = React.useState<SearchHistoryItem[]>([]);
  const { user, preferences, saveSearch } = useAuth();

  // Load local history from localStorage on mount
  React.useEffect(() => {
    const savedHistory = localStorage.getItem('userspot_search_history');
    if (savedHistory) {
      try {
        setLocalHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }
  }, []);

  // Use preferences from Firebase if logged in, otherwise use local history
  const history = user && preferences ? preferences.lastSearches : localHistory;

  const saveToHistory = async (term: string, type: 'username' | 'email' | 'phone') => {
    if (user) {
      await saveSearch(term, type);
    } else {
      const newItem: SearchHistoryItem = {
        query: term,
        type,
        timestamp: Date.now()
      };

      // Remove duplicates and keep only the last 5 unique searches
      const updatedHistory = [
        newItem,
        ...localHistory.filter(item => !(item.query === term && item.type === type))
      ].slice(0, 5);

      setLocalHistory(updatedHistory);
      localStorage.setItem('userspot_search_history', JSON.stringify(updatedHistory));
    }
  };

  const handleHistoryClick = (item: SearchHistoryItem) => {
    setQuery(item.query);
    setSearchType(item.type);
    toast.info(`Termo "${item.query}" carregado. Clique em pesquisar para iniciar.`);
  };

  const clearHistory = () => {
    if (user) {
      toast.info("O histórico em nuvem é gerenciado automaticamente.");
    } else {
      setLocalHistory([]);
      localStorage.removeItem('userspot_search_history');
      toast.success("Histórico local limpo.");
    }
  };

  const handleSearch = async () => {
    await handleSearchInternal(query, searchType);
  };

  const handleSearchInternal = async (searchTerm: string, type: 'username' | 'email' | 'phone') => {
    const trimmedQuery = searchTerm.trim();
    setLastError(null);
    if (!trimmedQuery) {
      toast.error("Por favor, insira um termo de busca.");
      return;
    }

    // Validação básica
    if (type === 'username' && trimmedQuery.length < 3) {
      toast.warning("Nomes de usuário geralmente têm pelo menos 3 caracteres.");
    }

    if (type === 'email' && !trimmedQuery.includes('@')) {
      toast.error("Por favor, insira um endereço de e-mail válido.");
      return;
    }

    if (type === 'phone') {
      const phoneDigits = trimmedQuery.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        toast.error("Por favor, insira um número de telefone válido (com DDD).");
        return;
      }
    }
    
    // Salvar no histórico
    await saveToHistory(trimmedQuery, type);

    // Iniciar busca
    onSearch(trimmedQuery, [], type, true); 
    
    const simulatedResults: SearchResult[] = [];
    const listToSearch = type === 'username' ? PLATFORMS_LIST : type === 'email' ? BREACHES_LIST : PHONE_LIST;
    
    try {
      // Simular erro de API se o usuário digitar "timeout" ou "error"
      if (trimmedQuery.toLowerCase() === 'timeout' || trimmedQuery.toLowerCase() === 'error') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        throw new Error("O servidor OSINT demorou muito para responder. Tente novamente mais tarde.");
      }

      // Simular processamento paralelo
      for (let i = 0; i < listToSearch.length; i++) {
        const item = listToSearch[i];
        
        // Delay aleatório para simular rede
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        
        // Lógica de simulação de descoberta
        const isFound = Math.random() > (type === 'username' ? 0.7 : type === 'email' ? 0.8 : 0.6); 
        
        let details = undefined;
        let predictiveReach = undefined;

        if (isFound) {
          if (type === 'username') {
            const years = ['2018', '2019', '2020', '2021', '2022'];
            const months = ['Jan', 'Mar', 'Jun', 'Set', 'Dez'];
            details = {
              createdDate: `${months[Math.floor(Math.random() * months.length)]} de ${years[Math.floor(Math.random() * years.length)]}`,
              osintClue: Math.random() > 0.5 ? "Username vinculado a conta de e-mail secundária." : "Atividade recente detectada nos últimos 30 dias.",
              description: `O perfil @${trimmedQuery} nesta plataforma apresenta padrões de uso consistentes com a identidade digital investigada.`
            };

            // Generate Predictive Reach Data
            const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
            const bestDay = days[Math.floor(Math.random() * days.length)];
            const bestHour = 8 + Math.floor(Math.random() * 12);
            
            predictiveReach = {
              bestTime: `${bestDay} às ${bestHour}:00`,
              bestChannel: item.name === 'LinkedIn' ? 'LinkedIn Message' : item.name === 'X (Twitter)' ? 'Direct Message' : 'E-mail',
              heatmapData: days.flatMap(day => 
                Array.from({ length: 24 }).map((_, hour) => ({
                  day,
                  hour,
                  probability: day === bestDay && Math.abs(hour - bestHour) < 3 ? 0.7 + Math.random() * 0.3 : Math.random() * 0.4
                }))
              )
            };
          } else if (type === 'email') {
            const allExposed = ['E-mail', 'Senha (Hash)', 'Endereço IP', 'Nome Completo', 'Telefone', 'Data de Nascimento'];
            const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
            
            // Reputation Logic
            const score = 30 + Math.floor(Math.random() * 65);
            const level = score > 85 ? 'Verificada' : score > 65 ? 'Alta' : score > 45 ? 'Média' : 'Baixa';
            
            details = {
              exposedData: allExposed.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 3)),
              breachDate: `${Math.floor(Math.random() * 28) + 1}/0${Math.floor(Math.random() * 9) + 1}/202${Math.floor(Math.random() * 4)}`,
              ipAddress: Math.random() > 0.3 ? randomIP : undefined,
              reputation: {
                score,
                level,
                factors: [
                  { label: 'Consistência de Nome', status: Math.random() > 0.3 ? 'positive' : 'neutral' },
                  { label: 'Atividade em Redes Sociais', status: Math.random() > 0.4 ? 'positive' : 'negative' },
                  { label: 'Domínio de E-mail Confiável', status: trimmedQuery.endsWith('.com') || trimmedQuery.endsWith('.com.br') ? 'positive' : 'neutral' },
                  { label: 'Histórico de Spam', status: Math.random() > 0.8 ? 'negative' : 'positive' }
                ],
                verdict: score > 70 
                  ? "Este e-mail apresenta uma pegada digital consistente e legítima. Baixo risco de fraude." 
                  : "A pegada digital é limitada ou inconsistente. Recomendamos cautela em transações comerciais."
              },
              description: `Este vazamento originou-se de uma falha de segurança em um banco de dados de terceiros, expondo informações sensíveis.`
            };
          } else {
            // Phone Details
            const operators = ['Vivo', 'Claro', 'TIM', 'Oi'];
            const states = ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Paraná', 'Bahia'];
            details = {
              description: `Vínculo detectado para o número ${trimmedQuery}. Operadora: ${operators[Math.floor(Math.random() * operators.length)]}. Localização: ${states[Math.floor(Math.random() * states.length)]}.`,
              osintClue: "Número associado a perfis de redes sociais e cadastros em marketplaces."
            };
          }
        }

        simulatedResults.push({
          platform: item.name,
          url: type === 'username' ? (item as any).url.replace('{}', trimmedQuery) : (item as any).url.replace('{}', trimmedQuery.replace(/\D/g, '')),
          status: isFound ? 'found' : 'not_found',
          confidence: isFound ? 'ALTA' : 'N/A',
          details,
          predictiveReach
        });
        
        // Atualizar resultados progressivamente
        onSearch(trimmedQuery, [...simulatedResults], type);
      }

      toast.success(`Busca concluída! ${simulatedResults.filter(r => r.status === 'found').length} resultados encontrados.`);
      onSearch(trimmedQuery, [...simulatedResults], type, false);
    } catch (error: any) {
      console.error("Search error:", error);
      const msg = error.message || "Ocorreu um erro inesperado durante a varredura.";
      toast.error(msg);
      setLastError(msg);
      // Resetar estado de busca no App.tsx passando resultados vazios e finalizando
      onSearch(trimmedQuery, [], type, false);
    }
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-brand-pink">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-lilac/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-64 h-64 bg-brand-lilac/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-md text-brand-dark-blue text-xs font-bold uppercase tracking-wider mb-8 border border-white/20 shadow-sm">
            <Globe size={14} />
            Ferramentas OSINT Profissionais
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark-blue mb-6 leading-tight">
            Ferramentas OSINT e plataforma de busca OSINT por e-mail - <span className="text-brand-dark-pink">UserSpot</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-brand-dark-blue/80 mb-12 leading-relaxed max-w-3xl mx-auto">
            UserSpot - Foco em encontrar o usuário exato. Descubra nomes de usuário em mais de 500 plataformas e realize análises OSINT de e-mails com o conjunto de ferramentas OSINT avançadas do UserSpot.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button 
              onClick={() => setSearchType('username')}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-md border border-white/20 backdrop-blur-md ${
                searchType === 'username' 
                ? 'bg-brand-lilac/80 text-brand-dark-blue shadow-xl shadow-brand-lilac/30 scale-105' 
                : 'bg-white/40 text-brand-dark-blue hover:bg-white/60'
              }`}
            >
              <User size={20} />
              Verificador de nome de usuário
            </button>
            <button 
              onClick={() => setSearchType('email')}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-md border border-white/20 backdrop-blur-md ${
                searchType === 'email' 
                ? 'bg-brand-lilac/80 text-brand-dark-blue shadow-xl shadow-brand-lilac/30 scale-105' 
                : 'bg-white/40 text-brand-dark-blue hover:bg-white/60'
              }`}
            >
              <MailIcon size={20} />
              Verificador de e-mail
            </button>
            <button 
              onClick={() => setSearchType('phone')}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-md border border-white/20 backdrop-blur-md ${
                searchType === 'phone' 
                ? 'bg-brand-lilac/80 text-brand-dark-blue shadow-xl shadow-brand-lilac/30 scale-105' 
                : 'bg-white/40 text-brand-dark-blue hover:bg-white/60'
              }`}
            >
              <Phone size={20} />
              Verificador de telefone
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-sm text-brand-dark-blue/60 mb-6 font-medium">
            {searchType === 'username' 
              ? 'Insira qualquer nome de usuário para pesquisar em mais de 500 plataformas.' 
              : searchType === 'email'
                ? 'Para verificar vazamentos de e-mail, insira o endereço abaixo.'
                : 'Insira um número de telefone para rastrear vínculos e operadoras.'}
          </p>

          {/* Prominent Search Input */}
          <div className="relative max-w-2xl mx-auto group">
            {/* Dynamic Glow Effect */}
            <div className={`absolute inset-0 bg-brand-lilac/30 blur-2xl rounded-full transition-all duration-700 ${
              isSearching ? 'opacity-100 scale-110 animate-pulse' : 'opacity-0 group-focus-within:opacity-100'
            }`}></div>
            
            <div className={`relative flex items-center bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-2 shadow-glass transition-all duration-300 ${
              isSearching ? 'border-brand-lilac shadow-brand-lilac/20 shadow-2xl scale-[1.02]' : 'group-focus-within:border-brand-lilac group-focus-within:shadow-xl'
            }`}>
              {/* Scanning Line Animation */}
              {isSearching && (
                <motion.div 
                  initial={{ left: '0%' }}
                  animate={{ left: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-brand-lilac to-transparent z-20 opacity-50"
                />
              )}

              <div className={`pl-4 transition-colors duration-300 ${isSearching ? 'text-brand-lilac' : 'text-gray-400'}`}>
                {isSearching ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
              </div>
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isSearching}
                placeholder={
                  searchType === 'username' 
                    ? "Enter username (e.g. tech_nomad)" 
                    : searchType === 'email'
                      ? "Enter email address (e.g. user@example.com)"
                      : "Enter phone number (e.g. +55 11 99999-9999)"
                }
                className="w-full bg-transparent border-none focus:ring-0 text-lg py-4 px-4 text-brand-dark-blue placeholder:text-gray-300 disabled:opacity-70"
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className={`relative overflow-hidden bg-brand-dark-blue text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center gap-2 disabled:cursor-not-allowed ${
                  isSearching ? 'bg-brand-lilac text-brand-dark-blue pr-10' : 'hover:bg-brand-lilac hover:text-brand-dark-blue'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isSearching ? (
                    <motion.span
                      key="searching"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-2"
                    >
                      Buscando...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="search"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      Pesquisar
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {isSearching && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute right-3"
                  >
                    <Loader2 size={18} />
                  </motion.div>
                )}
              </button>
            </div>
            
            {/* Search Status Indicator */}
            <AnimatePresence>
              {isSearching ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-brand-lilac text-xs font-bold uppercase tracking-widest"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-lilac opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-lilac"></span>
                  </span>
                  Varredura Multicamadas Ativa
                </motion.div>
              ) : lastError ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 px-4 py-2 rounded-full border border-red-100 whitespace-nowrap"
                >
                  <AlertCircle size={14} />
                  {lastError}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Search History Section */}
          <AnimatePresence>
            {history.length > 0 && !isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-16 max-w-2xl mx-auto"
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-sm font-bold text-brand-dark-blue uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-4 bg-brand-lilac rounded-full"></div>
                    Buscas Recentes
                  </h3>
                  <button 
                    onClick={clearHistory}
                    className="text-[10px] uppercase font-bold text-brand-lilac hover:text-brand-dark-blue transition-colors tracking-widest"
                  >
                    Limpar Tudo
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {history.map((item, index) => (
                    <motion.button
                      key={`${item.query}-${item.timestamp}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleHistoryClick(item)}
                      className="group flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md border border-white/40 rounded-full shadow-glass hover:bg-white/60 hover:border-brand-lilac/30 transition-all"
                    >
                      <div className="text-brand-lilac group-hover:text-brand-dark-blue transition-colors">
                        {item.type === 'username' ? <User size={14} /> : item.type === 'email' ? <MailIcon size={14} /> : <Phone size={14} />}
                      </div>
                      <span className="text-sm font-medium text-brand-dark-blue truncate max-w-[150px]">
                        {item.query}
                      </span>
                    </motion.button>
                  ))}
                  
                  {/* Secondary Search Button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: history.length * 0.05 }}
                    onClick={handleSearch}
                    disabled={isSearching || !query}
                    className="flex items-center gap-2 px-6 py-2 bg-brand-dark-blue text-white rounded-full font-bold text-sm shadow-lg hover:bg-brand-lilac hover:text-brand-dark-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                  >
                    <Search size={14} />
                    Pesquisar Seleção
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
