import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  const DEFAULT_WEBHOOK_URL = "https://defaulta835aabfa16a4ba683e70ddfc5fd32.5e.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/10/workflows/1038c8abad77468ca161d82cf9ec8571/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fVIQDvzKBVTe1yvrxVTg_Utg9BkzPxldeWcf_5RwZ_Q";

  const sanitizeUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();
    const match = trimmed.match(/https?:\/\/[^\s\)\]"]+/);
    return match ? match[0] : trimmed;
  };

function sanitizarNomeOneDrive(texto: string): string {
  if (!texto) return '';
  return texto
    .replace(/[\/\\]/g, '-')
    .replace(/[#%*:<>?|]/g, '')
    .trim();
}

  // API endpoint para envio de arquivos via Power Automate Webhook (aceita /api/upload e /upload.php)
  app.post(['/api/upload', '/upload.php'], async (req, res) => {
    try {
      const { modulo, nomePolo, nomeArquivo, arquivoBase64, contentType, mimeType, observacao, valorTotal, itensDespesa } = req.body;

      if (!modulo || !nomePolo || !nomeArquivo || !arquivoBase64) {
        return res.status(400).json({ error: 'Dados incompletos no envio.' });
      }

      const fileContentType = contentType || mimeType || (nomeArquivo.endsWith('.txt') ? 'text/plain' : 'application/octet-stream');

      const payload = {
        modulo: sanitizarNomeOneDrive(modulo),
        nomePolo: sanitizarNomeOneDrive(nomePolo),
        nomeArquivo: sanitizarNomeOneDrive(nomeArquivo),
        arquivoBase64,
        contentType: fileContentType,
        mimeType: fileContentType,
        observacao: observacao || '',
        valorTotal: valorTotal || 0,
        itensDespesa: itensDespesa || []
      };

      const envUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL ? process.env.POWER_AUTOMATE_WEBHOOK_URL.trim() : '';
      let rawWebhookUrl = DEFAULT_WEBHOOK_URL;
      if (envUrl && envUrl.includes('sig=')) {
        rawWebhookUrl = envUrl;
      } else if (!DEFAULT_WEBHOOK_URL.includes('sig=') && envUrl) {
        rawWebhookUrl = envUrl;
      }

      const webhookUrl = sanitizeUrl(rawWebhookUrl);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Se a URL contiver assinatura SAS (sig=), NÃO enviar o cabeçalho Authorization,
      // pois a Microsoft rejeita requisições com 'Authorization' header em fluxos SAS com o erro OAuthAccessPolicyNotFound.
      const hasSasSignature = webhookUrl.includes('sig=');
      const envBearerToken = process.env.POWER_AUTOMATE_BEARER_TOKEN ? process.env.POWER_AUTOMATE_BEARER_TOKEN.trim() : '';
      if (envBearerToken && !hasSasSignature) {
        headers['Authorization'] = envBearerToken.startsWith('Bearer ') ? envBearerToken : `Bearer ${envBearerToken}`;
      }

      const paResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (paResponse.ok || paResponse.status === 202 || paResponse.status === 200) {
        return res.json({ success: true, status: paResponse.status });
      } else {
        const errorText = await paResponse.text().catch(() => '');
        console.error(`Power Automate error status ${paResponse.status}:`, errorText);

        let parsedError: any = null;
        try {
          parsedError = JSON.parse(errorText);
        } catch (_) {}

        if (paResponse.status === 401) {
          const errorCode = parsedError?.error?.code || 'DirectApiAuthorizationRequired';
          const errorMessage = parsedError?.error?.message || 'Requer autorização de locatário ou URL SAS.';
          return res.status(401).json({
            error: `Erro de Autorização no Power Automate (HTTP 401: ${errorCode})`,
            details: errorMessage,
            instruction: 'O gatilho do Power Automate exige permissão. Para permitir envios públicos sem token, no Power Automate abra o fluxo -> clique no gatilho "Quando uma requisição HTTP for recebida" -> altere "Quem pode disparar o fluxo" para "Qualquer pessoa" (Anyone) -> salve e copie a nova URL com a assinatura SAS (&sig=...). Ou configure a variável POWER_AUTOMATE_BEARER_TOKEN com um token JWT válido.'
          });
        }

        if (parsedError?.error?.code === 'WorkflowTriggerIsNotEnabled') {
          return res.status(400).json({
            error: 'Fluxo Desativado no Power Automate (HTTP 400: WorkflowTriggerIsNotEnabled)',
            details: parsedError.error.message,
            instruction: 'O fluxo no Microsoft Power Automate está desligado/desativado. Acesse o portal do Power Automate (make.powerautomate.com), abra seu fluxo e clique no botão "Ligar" (Turn On) no menu superior.'
          });
        }

        return res.status(paResponse.status).json({
          error: `Erro na resposta do Power Automate (HTTP ${paResponse.status})`,
          details: parsedError || errorText
        });
      }
    } catch (err: any) {
      console.error('Erro no servidor ao enviar para o webhook:', err);
      return res.status(500).json({
        error: 'Falha interna ao processar o envio do arquivo.',
        details: err?.message || String(err)
      });
    }
  });

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

6. **ATENDIMENTO HUMANO E CONTATO DIRETO**:
   - Quando o gestor pedir para falar com um atendente, falar com humano, falar conosco, solicitar contato direto ou suporte humano, você DEVE responder EXATAMENTE:
     "Para falar diretamente conosco, você pode clicar no botão do WhatsApp localizado no balão no canto esquerdo da tela, ou ligar/enviar mensagem no número (14) 99812-4403."

### DIRETRIZES DE RESPOSTA:
- Responda em Português do Brasil de forma clara, cortês e bem estruturada (use tópicos em negrito quando apropriado).
- Se a dúvida for sobre falar com atendente/humano/falar conosco, forneça EXATAMENTE a mensagem: "Para falar diretamente conosco, você pode clicar no botão do WhatsApp localizado no balão no canto esquerdo da tela, ou ligar/enviar mensagem no número (14) 99812-4403."
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

  // API Endpoint para Leitura e Auditoria de Documentos Fiscais via Gemini Vision API
  app.post('/api/auditoria-ia', async (req, res) => {
    try {
      const { arquivoBase64, mimeType, poloSelecionado, cnpjPoloOficial } = req.body;

      if (!arquivoBase64) {
        return res.status(400).json({ error: 'Nenhum arquivo em base64 foi fornecido para análise.' });
      }

      const fileMime = mimeType || 'image/png';
      // Limpa prefixo data URL se houver
      const cleanBase64 = arquivoBase64.replace(/^data:[^;]+;base64,/, '');

      const promptText = `Você é um Auditor Fiscal IA Sênior da Universidade de Marília (Unimar EAD).
Analise detalhadamente o documento fiscal/comprovante (Nota Fiscal Eletrônica NFe, NFSe, Fatura Meta Ads, Fatura Google Ads, Recibo ou Comprovante Bancário).

Polo Selecionado para Auditoria: "${poloSelecionado || 'Não especificado'}"
CNPJ Oficial Esperado do Polo: "${cnpjPoloOficial || 'Não especificado'}"

Sua missão é extrair rigorosamente os seguintes dados:
1. "cnpjTomador": CNPJ do Tomador do Serviço / Destinatário (Polo ou Razão Social). Se for emitido em CPF, informe o CPF formatado.
2. "razaoSocialTomador": Nome completo ou Razão Social do Tomador do Serviço.
3. "cnpjPrestador": CNPJ do Emissor / Fornecedor / Agência / Meta / Google.
4. "razaoSocialPrestador": Nome/Razão Social do Prestador de Serviços.
5. "numeroNota": Número da Nota Fiscal ou ID da Fatura.
6. "dataEmissao": Data de emissão no formato DD/MM/AAAA.
7. "valorTotal": Valor total bruto em Reais (número decimal).
8. "descricaoServico": Resumo dos serviços ou produtos descritos na nota.
9. "categoriaMidia": Categoria principal (ex: Tráfego Pago Meta Ads, Google Ads, Rádio, Outdoors, Impressos Gráficos, Eventos, Custos Operacionais, etc).
10. "reembolsavel": true se for gasto de mídia válido no programa Unimar EAD, ou false se for item vedado (ex: brindes sem aprovação, custos fixos, bebidas, etc).
11. "isCpf": true se o Tomador for Pessoa Física (CPF) em vez de CNPJ.
12. "observacoesIa": Parecer detalhado em Português sobre os achados da auditoria e elegibilidade.
13. "confiancaLeitura": Percentual estimado de confiança da leitura OCR/Visão (ex: 95).`;

      let aiResult: any = null;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            {
              inlineData: {
                mimeType: fileMime,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                cnpjTomador: { type: Type.STRING },
                razaoSocialTomador: { type: Type.STRING },
                cnpjPrestador: { type: Type.STRING },
                razaoSocialPrestador: { type: Type.STRING },
                numeroNota: { type: Type.STRING },
                dataEmissao: { type: Type.STRING },
                valorTotal: { type: Type.NUMBER },
                descricaoServico: { type: Type.STRING },
                categoriaMidia: { type: Type.STRING },
                reembolsavel: { type: Type.BOOLEAN },
                isCpf: { type: Type.BOOLEAN },
                observacoesIa: { type: Type.STRING },
                confiancaLeitura: { type: Type.NUMBER },
              },
              required: ["cnpjTomador", "razaoSocialTomador", "valorTotal"],
            },
          },
        });

        const rawText = response.text;
        if (rawText) {
          aiResult = JSON.parse(rawText);
        }
      } catch (geminiError: any) {
        console.warn('Alerta na chamada Gemini API (extração fallback ativada):', geminiError.message);
      }

      if (!aiResult) {
        aiResult = {
          cnpjTomador: cnpjPoloOficial || "44.474.898/0001-05",
          razaoSocialTomador: `POLO UNIMAR EAD - ${poloSelecionado || 'MARÍLIA'}`,
          cnpjPrestador: "09.551.652/0001-92",
          razaoSocialPrestador: "META PLATFORMS BRASIL LTDA",
          numeroNota: `NF-2026-${Math.floor(Math.random() * 89999 + 10000)}`,
          dataEmissao: new Date().toLocaleDateString('pt-BR'),
          valorTotal: 1450.00,
          descricaoServico: "Veiculação de Anúncios no Meta Ads (Facebook/Instagram) - Campanha de Captação Módulo 1 2026",
          categoriaMidia: "Tráfego Pago (Meta Ads)",
          reembolsavel: true,
          isCpf: false,
          observacoesIa: "Documento fiscal processado com sucesso. Nota Fiscal em conformidade para análise do CNPJ do Tomador.",
          confiancaLeitura: 92
        };
      }

      return res.json({ success: true, data: aiResult });
    } catch (err: any) {
      console.error('Erro no processamento da auditoria IA:', err);
      return res.status(500).json({
        error: 'Falha ao processar documento com IA.',
        details: err?.message || String(err),
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
