import React from 'react';
import { Shield, Zap, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    title: "Inteligência Avançada de Nome de Usuário",
    description: "O aplicativo web UserSpot analisa mais de 500 plataformas, incluindo redes sociais, fóruns, sites de jogos e redes profissionais, usando algoritmos de descoberta de ponta.",
    icon: <BrainCircuit className="text-brand-lilac" size={32} />,
    delay: 0.1
  },
  {
    title: "Motor de Descoberta em Tempo Real",
    description: "A tecnologia de processamento paralelo do aplicativo UserSpot oferece resultados completos de nomes de usuário em segundos em todas as plataformas monitoradas.",
    icon: <Zap className="text-brand-lilac" size={32} />,
    delay: 0.2
  },
  {
    title: "Privacidade de nível empresarial",
    description: "O UserSpot Web garante total privacidade com buscas criptografadas, zero retenção de dados e protocolos de segurança avançados.",
    icon: <Shield className="text-brand-lilac" size={32} />,
    delay: 0.3
  }
];

export const Features: React.FC = () => {
  return (
    <section className="py-24 bg-brand-pink/50 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-4">
            Por que o UserSpot gera leads de descoberta de nomes de usuário?
          </h2>
          <div className="w-20 h-1.5 bg-brand-lilac mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay, duration: 0.5 }}
              className="bg-white/40 backdrop-blur-md p-8 rounded-3xl shadow-glass border border-white/40 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-brand-lilac/10 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-brand-dark-blue mb-4">
                {feature.title}
              </h3>
              <p className="text-brand-dark-blue/70 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
