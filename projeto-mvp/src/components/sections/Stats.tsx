import React from 'react';
import { motion } from 'motion/react';

const stats = [
  { 
    value: "Mais de 500", 
    label: "Plataformas analisadas", 
    sub: "Cobertura abrangente" 
  },
  { 
    value: "99,9%", 
    label: "Taxa de precisão", 
    sub: "Resultados verificados" 
  },
  { 
    value: "Relâmpago", 
    label: "Tempo médio de pesquisa", 
    sub: "Resultados em segundos" 
  },
  { 
    value: "24/7", 
    label: "Disponibilidade do serviço", 
    sub: "Sempre online" 
  }
];

export const Stats: React.FC = () => {
  return (
    <section className="py-24 bg-brand-dark-blue text-white overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 border border-brand-lilac rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 border border-brand-lilac rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            UserSpot em Números
          </h2>
          <p className="text-blue-200">
            Utilizado por usuários em todo o mundo, o que garante a descoberta da identidade digital.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 shadow-glass"
            >
              <div className="text-4xl md:text-5xl font-black text-brand-lilac mb-4">
                {stat.value}
              </div>
              <div className="text-lg font-bold mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-blue-300 uppercase tracking-widest font-semibold">
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
