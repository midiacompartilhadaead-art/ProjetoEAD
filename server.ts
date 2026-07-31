import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini Client server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const UNIMAR_SYSTEM_INSTRUCTION = `Você é o "Assistente Virtual de Mídia Compartilhada da Unimar EAD" (Universidade de Marília).
Sua missão é responder com precisão, gentileza e clareza às dúvidas dos gestores de polos parceiros sobre o programa de Mídia Compartilhada, verbas, limite de CAC, vedações e prestação de contas.

### CONHECIMENTO OFICIAL E REGRAS DO MANUAL UNIMAR EAD:

1. **REGRAS DA VERBA E DIVISÃO 50/50**:
   - A Unimar EAD apoia os polos reembolsando até 50% dos investimentos aprovados em mídia regional e campanhas locais.
   - Teto limite de CAC (Custo de Aquisição de Aluno): R$ 90,00 por aluno matriculado no módulo de referência.
   - Fórmula do Teto de Investimento Total do Polo: (Meta de Alunos * R$ 90,00).
   - Reembolso Unimar (50%): Até metade do investimento comprovado, limitado a (Meta de Alunos * R$ 90,00 * 0.5).
   - Exemplo Prático: Se a meta é 20 alunos, a verba total máxima de investimento é R$ 1.800,00 (20 * R$ 90,00). O reembolso de 50% da Unimar é de até R$ 900,00, caso o polo comprove o investimento de R$ 1.800,00 em NFs e comprovantes válidos do CNPJ.

2. **ITENS PERMITIDOS PARA REEMBOLSO**:
   - Mídia Digital Paga: Meta Ads (Facebook Ads e Instagram Ads), Google Ads, TikTok Ads.
   - Mídia Offline e Tradicional: Rádio local, Out-of-Home (Outdoors, Busdoor), Carro de som, Panfletagem com distribuição direta.
   - Material Gráfico: Impressão de panfletos, banners, faixas do vestibular EAD.
   - Serviços de Agência de Marketing/Publicidade regional (com NF detalhada do serviço).

3. **ITENS VEDADOS / PROIBIDOS (NÃO REEMBOLSÁVEIS)**:
   - Brindes, prêmios, sorteios, camisetas, canecas ou presentes sem autorização formal prévia por escrito da gestão nacional da Unimar EAD.
   - Patrocínio de eventos esportivos ou festas sem alinhamento prévio.
   - Custos operacionais fixos do polo (aluguel, conta de luz, internet, água, salários).
   - Comprovantes ou Notas Fiscais em nome de Pessoa Física (CPF). Devem ser obrigatoriamente emitida no CNPJ do Polo.
   - Boletos sem o comprovante de quitação/liquidação bancária efetivada debitado da conta do CNPJ do polo.

4. **DOCUMENTAÇÃO OBRIGATÓRIA PARA AUDITORIA**:
   - Nota Fiscal emitida do fornecedor/plataforma para o CNPJ do Polo.
   - Comprovante bancário de pagamento do CNPJ (PIX, TED ou boleto quitado).
   - Relatórios e evidências de veiculação (fatura/relatório detalhado de consumo da Meta/Google, foto do outdoor/banner, comprovante de veiculação de rádio).

5. **PRAZOS E PROCEDIMENTOS**:
   - O envio dos documentos pelo Portal deve ser realizado até o **dia 10 do mês subsequente** ao módulo de referência da campanha.
   - O prazo de análise da auditoria é de até 5 dias úteis.
   - Ao enviar pelo formulário do portal, o gestor recebe um Número de Protocolo de Registro imediato.
   - E-mail da auditoria: midiacompartilhada@unimar.br
   - Contato da Central Unimar EAD: (14) 2105-4000.

### DIRETRIZES DE RESPOSTA:
- Responda em Português do Brasil de forma clara, cortês e bem estruturada (use tópicos em negrito quando apropriado).
- Quando o gestor perguntar sobre valores ou como calcular a verba, forneça um exemplo prático claro usando os R$ 90,00 por aluno e a divisão de 50%.
- Reforce sempre que os documentos precisam estar em CNPJ do Polo e ser enviados até o dia 10.
- Mantenha um tom profissional e acolhedor condizente com a Universidade de Marília.
`;

  // API endpoint for AI Chat queries
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, prompt } = req.body;

      let contents: any[] = [];
      if (Array.isArray(messages) && messages.length > 0) {
        contents = messages.map((m: { role: string; content?: string; text?: string }) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content || m.text || '' }],
        }));
      } else if (prompt) {
        contents = [{ role: 'user', parts: [{ text: prompt }] }];
      } else {
        return res.status(400).json({ error: 'Nenhuma pergunta foi enviada.' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contents,
        config: {
          systemInstruction: UNIMAR_SYSTEM_INSTRUCTION,
          temperature: 0.6,
        },
      });

      const replyText = response.text || 'Desculpe, não consegui obter uma resposta no momento. Por favor, tente novamente.';
      return res.json({ reply: replyText });
    } catch (error: any) {
      console.error('Erro na rota /api/chat:', error);
      return res.status(500).json({
        error: 'Erro ao processar mensagem na inteligência artificial.',
        details: error.message || String(error),
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Unimar EAD running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
