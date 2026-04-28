import React from 'react';
import { Facebook, Twitter, Github, MessageSquare, Linkedin, Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';

const platforms = [
  { name: 'Facebook', icon: <Facebook size={32} />, color: 'hover:text-brand-lilac' },
  { name: 'Twitter', icon: <Twitter size={32} />, color: 'hover:text-brand-lilac' },
  { name: 'GitHub', icon: <Github size={32} />, color: 'hover:text-brand-lilac' },
  { name: 'Fóruns', icon: <MessageSquare size={32} />, color: 'hover:text-brand-lilac' },
  { name: 'LinkedIn', icon: <Linkedin size={32} />, color: 'hover:text-brand-lilac' },
  { name: 'Jogos', icon: <Gamepad2 size={32} />, color: 'hover:text-brand-lilac' },
];

export const PlatformCoverage: React.FC = () => {
  return (
    <section className="py-20 bg-brand-pink border-t border-white/20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-dark-blue mb-4">
          Cobertura da plataforma UserSpot
        </h2>
        <p className="text-brand-dark-blue/60 mb-12">
          Descoberta abrangente de nomes de usuário em todo o cenário digital.
        </p>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.2, y: -5 }}
              className={`flex flex-col items-center gap-3 text-brand-lilac transition-colors ${platform.color} cursor-help`}
            >
              <div className="p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 shadow-glass">
                {platform.icon}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">{platform.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
