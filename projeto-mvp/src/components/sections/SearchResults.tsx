import React from 'react';
import { CheckCircle2, XCircle, Loader2, ExternalLink, AlertCircle, ChevronDown, ChevronUp, Calendar, Info, ShieldAlert, Zap, Clock, MessageSquare, Globe, ShieldCheck, ShieldAlert as ShieldAlertIcon, Fingerprint, FileDown, Share2, ListPlus, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

export interface SearchResult {
  platform: string;
  url: string;
  status: 'found' | 'not_found' | 'error';
  confidence: string;
  details?: {
    createdDate?: string;
    osintClue?: string;
    exposedData?: string[];
    breachDate?: string;
    ipAddress?: string;
    reputation?: {
      score: number; // 0 to 100
      level: 'Baixa' | 'Média' | 'Alta' | 'Verificada';
      factors: { label: string; status: 'positive' | 'negative' | 'neutral' }[];
      verdict: string;
    };
    description?: string;
  };
  predictiveReach?: {
    bestTime: string;
    bestChannel: string;
    heatmapData: { day: string; hour: number; probability: number }[];
  };
}

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  query: string;
  type: 'username' | 'email' | 'phone';
}

const PredictiveReachHeatmap: React.FC<{ data: { day: string; hour: number; probability: number }[] }> = ({ data }) => {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const hours = [0, 4, 8, 12, 16, 20];

  return (
    <div className="mt-6 p-4 bg-brand-dark-blue/5 rounded-2xl border border-brand-lilac/10">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-brand-lilac" />
        <h5 className="text-xs font-bold text-brand-dark-blue uppercase tracking-widest">Mapa de Calor: Probabilidade de Resposta</h5>
      </div>
      
      <div className="flex flex-col gap-1">
        {days.map(day => (
          <div key={day} className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 w-8">{day}</span>
            <div className="flex-grow grid grid-cols-[repeat(24,minmax(0,1fr))] gap-0.5 h-3">
              {Array.from({ length: 24 }).map((_, hour) => {
                const point = data.find(p => p.day === day && p.hour === hour);
                const prob = point ? point.probability : 0;
                return (
                  <div 
                    key={hour}
                    className="h-full rounded-sm transition-all hover:scale-110 cursor-help"
                    style={{ 
                      backgroundColor: prob > 0.8 ? '#d8b4fe' : prob > 0.5 ? '#e9d5ff' : prob > 0.2 ? '#f5f3ff' : 'rgba(255,255,255,0.5)',
                      opacity: prob > 0 ? 1 : 0.2
                    }}
                    title={`${day}, ${hour}h: ${(prob * 100).toFixed(0)}% de chance`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 px-10">
        {hours.map(h => (
          <span key={h} className="text-[8px] font-bold text-gray-400">{h}h</span>
        ))}
      </div>
    </div>
  );
};

export const SearchResults: React.FC<SearchResultsProps> = ({ results, isSearching, query, type }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [showListSelector, setShowListSelector] = React.useState(false);
  const { user, lists, addContactToList, createList } = useAuth();
  const foundCount = results.filter(r => r.status === 'found').length;
  const totalItems = type === 'username' ? 14 : 10;
  const progress = (results.length / totalItems) * 100;

  const handleAddToList = async (listId: string) => {
    try {
      await addContactToList(listId, query, type);
      setShowListSelector(false);
    } catch (error) {
      console.error("Add to List Error:", error);
    }
  };

  const exportToPDF = async () => {
    if (results.length === 0) return;
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(26, 26, 46); // brand-dark-blue
      doc.text('UserSpot - Relatório OSINT', 14, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Data: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
      doc.text(`Termo de Busca: ${query}`, 14, 38);
      doc.text(`Tipo: ${type === 'username' ? 'Nome de Usuário' : type === 'email' ? 'E-mail' : 'Telefone'}`, 14, 46);
      doc.text(`Resultados Encontrados: ${foundCount}`, 14, 54);
      
      // Table
      const tableData = results.map(r => [
        r.platform,
        r.status === 'found' ? 'Encontrado' : 'Não Encontrado',
        r.confidence,
        r.url
      ]);
      
      autoTable(doc, {
        startY: 65,
        head: [['Plataforma', 'Status', 'Confiança', 'URL']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] }, // brand-lilac
      });
      
      // Generate Blob
      const pdfBlob = doc.output('blob');
      
      // Upload to Firebase Storage if user is logged in
      if (user) {
        const fileName = `reports/${user.uid}/${Date.now()}_${query.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        const storageRef = ref(storage, fileName);
        
        toast.loading("Fazendo upload do relatório para o Cloud Storage...", { id: 'export-pdf' });
        await uploadBytes(storageRef, pdfBlob);
        const downloadURL = await getDownloadURL(storageRef);
        
        toast.success("Relatório salvo com sucesso no Cloud Storage!", { id: 'export-pdf' });
        window.open(downloadURL, '_blank');
      } else {
        // Just download locally if not logged in
        doc.save(`UserSpot_Report_${query}.pdf`);
        toast.success("Relatório gerado e baixado localmente.");
      }
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Erro ao gerar ou salvar o relatório.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isSearching && results.length === 0) return null;

  return (
    <section className="py-12 bg-brand-pink border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Stats */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-brand-dark-blue">
                Resultados para: <span className="text-brand-lilac">{type === 'username' ? `@${query}` : query}</span>
              </h3>
              <p className="text-brand-dark-blue/60 text-sm">
                {isSearching 
                  ? `Varredura de ${type === 'username' ? 'identidade' : type === 'email' ? 'vazamentos' : 'vínculos'} em tempo real...` 
                  : `Varredura concluída. ${foundCount} ${type === 'username' ? 'perfis encontrados' : type === 'email' ? 'vazamentos detectados' : 'vínculos encontrados'}.`}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {!isSearching && results.length > 0 && (
                <div className="flex items-center gap-2">
                  {user && (
                    <div className="relative">
                      <button 
                        onClick={() => setShowListSelector(!showListSelector)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-lilac text-brand-dark-blue border border-brand-lilac/40 rounded-xl text-sm font-bold hover:bg-brand-lilac/80 transition-all shadow-sm"
                      >
                        <ListPlus size={18} />
                        Monitorar
                      </button>
                      
                      <AnimatePresence>
                        {showListSelector && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50"
                          >
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest p-2">Selecionar Lista</p>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {lists.length === 0 ? (
                                <button 
                                  onClick={() => createList("Minha Primeira Lista")}
                                  className="w-full text-left p-3 text-sm text-brand-lilac hover:bg-brand-lilac/5 rounded-xl transition-colors font-medium"
                                >
                                  + Criar Nova Lista
                                </button>
                              ) : (
                                lists.map(list => (
                                  <button 
                                    key={list.id}
                                    onClick={() => handleAddToList(list.id)}
                                    className="w-full text-left p-3 text-sm text-brand-dark-blue hover:bg-brand-lilac/10 rounded-xl transition-colors flex items-center justify-between group"
                                  >
                                    <span className="font-medium">{list.name}</span>
                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-lilac" />
                                  </button>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <button 
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl text-sm font-bold text-brand-dark-blue hover:bg-brand-lilac/20 transition-all shadow-sm disabled:opacity-50"
                  >
                    {isExporting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <FileDown size={18} />
                    )}
                    {user ? 'PDF' : 'Baixar PDF'}
                  </button>
                </div>
              )}

              {isSearching && (
                <div className="flex items-center gap-3 bg-brand-lilac/10 px-4 py-2 rounded-full border border-brand-lilac/20">
                  <Loader2 className="animate-spin text-brand-lilac" size={18} />
                  <span className="text-sm font-bold text-brand-lilac uppercase tracking-wider">
                    {type === 'username' ? 'Processamento Paralelo' : type === 'email' ? 'Análise de Brechas' : 'Rastreamento de Vínculos'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isSearching && (
            <div className="w-full h-2 bg-gray-200 rounded-full mb-12 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={`h-full shadow-[0_0_10px_rgba(216,180,254,0.5)] ${type === 'username' ? 'bg-brand-lilac' : type === 'email' ? 'bg-red-500' : 'bg-green-500'}`}
              />
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {results.map((result, index) => (
                <motion.div
                  key={result.platform}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                  onClick={() => result.status === 'found' && setExpandedId(expandedId === result.platform ? null : result.platform)}
                  className={`p-4 rounded-2xl border backdrop-blur-md transition-all cursor-pointer ${
                    result.status === 'found' 
                    ? `bg-white/60 shadow-glass hover:shadow-xl ${type === 'username' ? 'border-brand-lilac/30' : type === 'email' ? 'border-red-100' : 'border-green-100'}` 
                    : 'bg-white/20 border-white/10 opacity-60 cursor-default'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        result.status === 'found' 
                          ? (type === 'username' ? 'bg-brand-lilac/10 text-brand-lilac' : 'bg-red-100 text-red-600') 
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {result.status === 'found' 
                          ? (type === 'username' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />) 
                          : <XCircle size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-dark-blue">{result.platform}</h4>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          {type === 'username' ? `Confiança: ${result.confidence}` : type === 'email' ? 'Status: VAZADO' : 'Status: VINCULADO'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {result.status === 'found' && (
                        <>
                          <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`p-2 rounded-lg transition-colors ${type === 'username' ? 'text-brand-lilac hover:bg-brand-lilac/10' : 'text-red-500 hover:bg-red-50'}`}
                          >
                            <ExternalLink size={18} />
                          </a>
                          {expandedId === result.platform ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedId === result.platform && result.details && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                          {type === 'username' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {result.details.createdDate && (
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-brand-pink rounded-lg text-brand-lilac">
                                    <Calendar size={16} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Data de Criação</p>
                                    <p className="text-sm text-brand-dark-blue">{result.details.createdDate}</p>
                                  </div>
                                </div>
                              )}
                              {result.details.osintClue && (
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-brand-pink rounded-lg text-brand-lilac">
                                    <Info size={16} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pista OSINT</p>
                                    <p className="text-sm text-brand-dark-blue">{result.details.osintClue}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-50 rounded-lg text-red-500">
                                  <ShieldAlert size={16} />
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Dados Expostos</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {result.details.exposedData?.map((data, i) => (
                                      <span key={i} className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-md border border-red-100">
                                        {data}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {result.details.breachDate && (
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                                    <Calendar size={16} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Data do Vazamento</p>
                                    <p className="text-sm text-brand-dark-blue">{result.details.breachDate}</p>
                                  </div>
                                </div>
                              )}
                              {result.details.ipAddress && (
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                                    <Globe size={16} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Endereço IP Associado</p>
                                    <p className="text-sm font-mono text-brand-dark-blue">{result.details.ipAddress}</p>
                                  </div>
                                </div>
                              )}

                              {/* Reputation & Anti-Scam Section */}
                              {result.details.reputation && (
                                <div className="pt-4 border-t border-gray-100">
                                  <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheck size={18} className={result.details.reputation.score > 70 ? "text-green-500" : "text-amber-500"} />
                                    <h5 className="text-xs font-bold text-brand-dark-blue uppercase tracking-widest">Análise de Reputação (Anti-Scam)</h5>
                                    <div className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                                      result.details.reputation.level === 'Verificada' ? 'bg-green-100 text-green-700 border border-green-200' :
                                      result.details.reputation.level === 'Alta' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                      'bg-amber-100 text-amber-700 border border-amber-200'
                                    }`}>
                                      Selo: {result.details.reputation.level}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Score de Confiança</span>
                                        <span className="text-sm font-bold text-brand-dark-blue">{result.details.reputation.score}/100</span>
                                      </div>
                                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${result.details.reputation.score}%` }}
                                          className={`h-full ${
                                            result.details.reputation.score > 70 ? 'bg-green-500' : 
                                            result.details.reputation.score > 40 ? 'bg-amber-500' : 'bg-red-500'
                                          }`}
                                        />
                                      </div>
                                      <p className="text-[11px] text-gray-500 leading-relaxed">
                                        <span className="font-bold text-brand-dark-blue">Veredito:</span> {result.details.reputation.verdict}
                                      </p>
                                    </div>

                                    <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                        <Fingerprint size={12} /> Fatores de Verificação
                                      </p>
                                      <div className="space-y-1.5">
                                        {result.details.reputation.factors.map((factor, i) => (
                                          <div key={i} className="flex items-center justify-between">
                                            <span className="text-[10px] text-brand-dark-blue/70">{factor.label}</span>
                                            {factor.status === 'positive' ? (
                                              <CheckCircle2 size={12} className="text-green-500" />
                                            ) : factor.status === 'negative' ? (
                                              <ShieldAlertIcon size={12} className="text-red-500" />
                                            ) : (
                                              <div className="w-2 h-2 rounded-full bg-gray-300" />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Reputation & Anti-Scam Section */}
                              {result.details.reputation && (
                                <div className="pt-4 border-t border-gray-100">
                                  <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheck size={18} className={result.details.reputation.score > 70 ? "text-green-500" : "text-amber-500"} />
                                    <h5 className="text-xs font-bold text-brand-dark-blue uppercase tracking-widest">Análise de Reputação (Anti-Scam)</h5>
                                    <div className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                                      result.details.reputation.level === 'Verificada' ? 'bg-green-100 text-green-700 border border-green-200' :
                                      result.details.reputation.level === 'Alta' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                      'bg-amber-100 text-amber-700 border border-amber-200'
                                    }`}>
                                      Selo: {result.details.reputation.level}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Score de Confiança</span>
                                        <span className="text-sm font-bold text-brand-dark-blue">{result.details.reputation.score}/100</span>
                                      </div>
                                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${result.details.reputation.score}%` }}
                                          className={`h-full ${
                                            result.details.reputation.score > 70 ? 'bg-green-500' : 
                                            result.details.reputation.score > 40 ? 'bg-amber-500' : 'bg-red-500'
                                          }`}
                                        />
                                      </div>
                                      <p className="text-[11px] text-gray-500 leading-relaxed">
                                        <span className="font-bold text-brand-dark-blue">Veredito:</span> {result.details.reputation.verdict}
                                      </p>
                                    </div>

                                    <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                        <Fingerprint size={12} /> Fatores de Verificação
                                      </p>
                                      <div className="space-y-1.5">
                                        {result.details.reputation.factors.map((factor, i) => (
                                          <div key={i} className="flex items-center justify-between">
                                            <span className="text-[10px] text-brand-dark-blue/70">{factor.label}</span>
                                            {factor.status === 'positive' ? (
                                              <CheckCircle2 size={12} className="text-green-500" />
                                            ) : factor.status === 'negative' ? (
                                              <ShieldAlertIcon size={12} className="text-red-500" />
                                            ) : (
                                              <div className="w-2 h-2 rounded-full bg-gray-300" />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {result.details.description && (
                            <p className="text-xs text-gray-500 leading-relaxed italic">
                              "{result.details.description}"
                            </p>
                          )}

                          {/* Predictive Reach Section */}
                          {result.predictiveReach && (
                            <div className="pt-4 border-t border-gray-100">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-brand-lilac/10 rounded-lg text-brand-lilac">
                                    <Clock size={16} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Melhor Horário</p>
                                    <p className="text-sm text-brand-dark-blue font-semibold">{result.predictiveReach.bestTime}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-brand-lilac/10 rounded-lg text-brand-lilac">
                                    <MessageSquare size={16} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Canal Recomendado</p>
                                    <p className="text-sm text-brand-dark-blue font-semibold">{result.predictiveReach.bestChannel}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <PredictiveReachHeatmap data={result.predictiveReach.heatmapData} />
                              
                              <p className="mt-3 text-[10px] text-brand-dark-blue/50 leading-tight">
                                <span className="font-bold">Insight IA:</span> A análise de padrões públicos sugere que este usuário tem maior taxa de engajamento no canal e horário indicados acima.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {!isSearching && results.length > 0 && foundCount === 0 && (
            <div className="mt-12 p-8 bg-white/50 rounded-3xl text-center border border-dashed border-gray-200">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h4 className="text-xl font-bold text-brand-dark-blue mb-2">
                {type === 'username' ? 'Nenhum perfil público indexado' : type === 'email' ? 'Nenhum vazamento detectado' : 'Nenhum vínculo encontrado'}
              </h4>
              <p className="text-brand-dark-blue/60">
                {type === 'username' 
                  ? 'Não encontramos correspondências exatas para este nome de usuário nas plataformas monitoradas.'
                  : type === 'email' 
                    ? 'Este e-mail não foi encontrado em nossa base de dados de vazamentos conhecidos.'
                    : 'Não encontramos vínculos públicos para este número de telefone.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
