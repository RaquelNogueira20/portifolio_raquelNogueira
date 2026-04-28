# 🤖 Batalha de Modelos & Engenharia de Prompt (XML)

## 📝 Descrição do Projeto

Este projeto consiste num experimento de **Engenharia de Prompt** focado na avaliação da capacidade de diferentes LLMs (*Large Language Models*) em interpretar e executar instruções estruturadas no formato **XML**. O objetivo principal é realizar uma análise crítica da precisão técnica e conformidade de cada inteligência artificial ao gerar uma página HTML *Single Page* com CSS integrado.

Desenvolvido como parte da disciplina de **Engenharia de Prompt e Aplicações em IA**, o laboratório submeteu o mesmo protocolo de execução para diversas ferramentas, testando a fidelidade às tags, diretrizes de design e obrigatoriedades técnicas.



## 🚀 Tecnologias Utilizadas

* **Linguagens:** HTML5, CSS3 e, em alguns modelos, JavaScript.
* **Estrutura de Prompt:** XML (utilização de tags como `<tarefa>`, `<objetivo>` e `<diretrizes_design>`).
* **Modelos Testados:** ChatGPT, Gemini, Claude, Qwen, DeepSeek, Grok e Maritaca.

## 📊 Quadro Comparativo e Resultados

O experimento revelou discrepâncias significativas entre as arquiteturas de IA no que diz respeito à verbosidade e à obediência ao prompt estruturado:

* **Desempenho de Elite:** O **Claude** demonstrou a maior compreensão da estrutura XML, sendo extremamente preciso e adicionando conteúdos relevantes que foram além do solicitado, como a história da loja.
* **Prototipagem vs. Complexidade:** Para **prototipagem rápida**, o **DeepSeek** destacou-se pelo detalhamento e ausência de erros de sintaxe. Para **códigos complexos**, o **Claude** foi a ferramenta escolhida devido à sua precisão superior.
* **Variação de Tokens:** Houve uma diferença massiva na verbosidade entre os modelos para o mesmo objetivo, variando de **350 tokens (Qwen)** até **6.200 tokens (Claude)**.
* **Limitações Identificadas:** Modelos como o **Maritaca** e o **Grok** apresentaram falhas críticas, como a ausência de imagens, links inoperantes ou desvio
