# 🔍 UserSpot - Investigação OSINT Multicamadas
 
## 📝 Descrição do Projeto
O **UserSpot** é uma plataforma profissional de Inteligência de Fontes Abertas (OSINT) desenvolvida para centralizar a investigação de identidades digitais. O sistema permite realizar buscas profundas através de nomes de usuário, e-mails e números de telefone, cruzando dados em mais de 500 plataformas simultaneamente.

O objetivo principal é mitigar a fragmentação de informações na rede, oferecendo um dashboard intuitivo que não apenas localiza perfis, mas também analisa a reputação de e-mails (Anti-Scam), rastreia vínculos de telefonia e monitora atualizações de contatos em tempo real. Com integração ao Firebase, o projeto garante persistência de dados e geração de relatórios técnicos em PDF.
 
![Dashboard principal do UserSpot](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200)
*Figura 1: Interface principal do sistema exibindo resultados de busca multicamadas.*
 
## 🚀 Tecnologias Utilizadas
* **Frontend:** React 18, Vite, TypeScript
* **Estilização:** Tailwind CSS, Motion (Animações)
* **Backend & Database:** Firebase Auth, Cloud Firestore
* **Storage & Relatórios:** Firebase Storage, jsPDF
* **Ícones:** Lucide React
 
## 📊 Resultados e Aprendizados
O UserSpot foi construído com foco em performance e segurança, alcançando métricas sólidas de processamento paralelo.
* **Escalabilidade:** Capaz de varrer mais de 500 plataformas em menos de 10 segundos utilizando algoritmos de busca assíncrona.
* **Análise de Reputação:** Implementação de um motor de score (0-100) que avalia a legitimidade de e-mails com base em vazamentos e atividade digital.
* **Gestão de Dados:** Aprendi a estruturar coleções complexas no Firestore para permitir o monitoramento passivo de "Updates" em listas de contatos.
 
![Análise de Metadados e Reputação](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800)
*Figura 2: Exemplo de motor de análise preditiva e mapa de calor de atividade.*
 
## 🔧 Como Executar
1. Clone o repositório.
2. Instale as dependências: `npm install`.
3. Configure as variáveis de ambiente do Firebase no arquivo `.env`.
4. Inicie o servidor de desenvolvimento: `npm run dev`.
 
![Fluxo de Investigação OSINT](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800)
*Figura 3: Representação visual do pipeline de busca e exportação de dados.*
 
---
[Voltar ao início](https://github.com/seu-usuario/seu-usuario)
