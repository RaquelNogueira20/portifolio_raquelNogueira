import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-brand-lilac transition-colors"
      >
        <span className="text-lg font-bold text-brand-dark-blue">{question}</span>
        {isOpen ? <ChevronUp className="text-brand-lilac" /> : <ChevronDown className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-brand-dark-blue/70 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "Como funciona a descoberta de nomes de usuário no UserSpot?",
      answer: "O UserSpot utiliza algoritmos de busca avançados e processamento paralelo para verificar a existência de um nome de usuário em mais de 500 plataformas simultaneamente, analisando respostas de servidores e perfis públicos em tempo real."
    },
    {
      question: "Quão precisos são os resultados de busca do UserSpot?",
      answer: "Nossa taxa de precisão é de 99,9%. Utilizamos métodos de verificação multicamadas para garantir que o perfil encontrado realmente corresponda ao nome de usuário pesquisado, minimizando falsos positivos."
    },
    {
      question: "O UserSpot é totalmente gratuito?",
      answer: "Sim, o UserSpot oferece funcionalidades básicas de pesquisa de forma gratuita para a comunidade OSINT. Também possuímos planos empresariais para investigações de alto volume e integrações via API."
    },
    {
      question: "O que faz do UserSpot a plataforma líder em descoberta de nomes de usuário?",
      answer: "Nossa combinação de cobertura abrangente (500+ plataformas), velocidade relâmpago e compromisso com a privacidade de nível empresarial nos torna a escolha preferida de investigadores digitais e profissionais de segurança em todo o mundo."
    }
  ];

  return (
    <section className="py-24 bg-brand-pink">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-4">
            UserSpot - Perguntas Frequentes
          </h2>
          <div className="w-20 h-1.5 bg-brand-lilac mx-auto rounded-full"></div>
        </div>

        <div className="bg-white/40 backdrop-blur-md rounded-3xl p-4 md:p-8 border border-white/40 shadow-glass">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};
