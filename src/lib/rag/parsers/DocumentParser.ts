import { Document, DocumentChunk, SupportedDocumentType } from '../types';

export class DocumentParser {
  /**
   * Simulates parsing a raw file into a structured Document with its associated DocumentChunks.
   */
  public static parse(
    fileName: string,
    fileType: SupportedDocumentType,
    fileSize: number,
    customContent?: string,
  ): { document: Document; chunks: DocumentChunk[] } {
    // Generate a mathematically unique ID using Date.now and a random suffix to avoid duplicates during fast sync seeding
    const documentId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const timestamp = new Date().toISOString();

    const rawContent = customContent || this.getMockContentForType(fileType, fileName);

    const chunks = this.splitTextIntoChunks(rawContent, documentId, fileName);

    const document: Document = {
      id: documentId,
      name: fileName,
      size: fileSize,
      type: fileType,
      content: rawContent,
      chunksCount: chunks.length,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'indexed',
      metadata: {
        title: fileName.replace(/\.[^/.]+$/, ''),
        author: 'Sistema (Mock Parser)',
        subject: `Auto-parseado como ${fileType}`,
        createdDate: timestamp,
      },
    };

    return { document, chunks };
  }

  /**
   * Helper to split text into simulated semantic chunks (e.g. by double-newlines or length constraint).
   */
  private static splitTextIntoChunks(
    text: string,
    documentId: string,
    documentName: string,
  ): DocumentChunk[] {
    const paragraphs = text
      .split(/(?:\r?\n){2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const chunks: DocumentChunk[] = [];
    let pageCount = 1;
    let lineIndex = 1;

    paragraphs.forEach((paragraph, idx) => {
      if (idx > 0 && idx % 3 === 0) {
        pageCount++;
      }

      const wordCount = paragraph.split(/\s+/).length;

      const chunk: DocumentChunk = {
        id: `${documentId}-chunk-${idx + 1}`,
        documentId,
        content: paragraph,
        metadata: {
          documentId,
          pageNumber: pageCount,
          lineNumber: lineIndex,
          sectionTitle: `Seção Simulada ${pageCount}.${idx + 1}`,
          wordCount,
          documentName,
        },
      };

      chunks.push(chunk);
      lineIndex += paragraph.split(/\n/).length + 2;
    });

    return chunks;
  }

  /**
   * Generates interesting, contextually rich mock text matching the document type.
   */
  private static getMockContentForType(type: SupportedDocumentType, name: string): string {
    switch (type) {
      case 'PDF':
        return `POLÍTICA DE PRIVACIDADE E TRATAMENTO DE DADOS (LGPD) - AGENTOPS STUDIO
Versão: 1.2 | Data: Janeiro de 2025

Este documento define as diretrizes regulatórias e termos de compliance para armazenamento de chaves de API e preferências de agentes inteligentes.

Capítulo 1: Coleta de Consentimento e Chaves Simétricas
O estúdio AgentOps AI Studio utiliza criptografia simétrica local para salvar chaves privadas de provedores de IA como OpenAI, Anthropic e Gemini de forma localmente segura (localStorage).
Todas as credenciais sensíveis e chaves de API nunca são expostas a servidores intermediários sem expressa instrução de roteamento de inferência do usuário.

Capítulo 2: Direitos do Titular dos Dados (LGPD)
Qualquer usuário do estúdio pode revogar o consentimento, limpar o banco de dados local ou realizar download integral de suas atividades e logs em formato estruturado.`;

      case 'DOCX':
        return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS COGNITIVOS DE INTELIGÊNCIA ARTIFICIAL

Este contrato define a cooperação comercial entre a Contratante e os Agentes Virtuais de IA operando no workspace.

Cláusula 1 - Objeto do Contrato
A Contratada prestará serviços de análise estatística, auditoria de queries SQL e modelagem de negócios por meio do AgentOps Studio.
O SLA acordado estabelece que a latência média de inferência cognitiva deve se manter abaixo de 1500 milissegundos para modelos GPT-4o e Claude 3.5 Sonnet.

Cláusula 2 - Penalidades e Multas por Quebra de SLA
Se a indisponibilidade ou latência exceder 5000 milissegundos consecutivos por mais de 4 horas, aplicar-se-á uma dedução proporcional de créditos no balanço da conta.`;

      case 'Markdown':
        return `# AgentOps Studio - Guia de Deploy de Agentes

Esse guia prático detalha as melhores práticas de deploy e arquitetura de agentes no estúdio.

## 1. System Prompts Eficientes
Ao configurar um System Prompt, sempre declare de forma explícita:
- O papel principal (Role) do agente.
- O formato de retorno esperado (Ex: JSON, Código, Tabela).
- As restrições e limites de conhecimento.

## 2. Parâmetros de Temperatura
- Use **Temperatura 0.0** para queries SQL e relatórios financeiros (alta precisão).
- Use **Temperatura 0.7** para redação criativa e geração de campanhas de e-mail marketing.`;

      case 'CSV':
        return `ID,Produto,Categoria,Preco,Quantidade,DataVenda
1,Teclado Mecânico RGB,Periféricos,299.90,12,2025-02-10
2,Monitor UltraWide 29",Monitores,1299.00,5,2025-02-12
3,Mouse Gamer Sem Fio,Periféricos,189.90,20,2025-02-15
4,Cadeira Ergonômica Pro,Escritório,949.00,3,2025-02-18
5,Headset Gamer 7.1,Áudio,349.90,15,2025-02-20`;

      case 'JSON':
        return `{
  "system_config": {
    "version": "1.0.0",
    "environment": "production",
    "features": {
      "stream_responses": true,
      "enable_rag": true,
      "encryption_level": "AES-256"
    }
  }
}`;

      case 'Excel':
        return `Planilha de Faturamento Mensal - 2025
Mês | Faturamento Esperado | Faturamento Real | Desvio | Status
Janeiro | 50000.00 | 52300.00 | +2300.00 | Acima da Meta
Fevereiro | 55000.00 | 54200.00 | -800.00 | Dentro do Esperado
Março | 60000.00 | 65100.00 | +5100.00 | Meta Superada`;

      default:
        return `Documento de texto simples: ${name}
Este é o conteúdo simulado gerado pelo Mock Parser. Ele contém dados estruturados e parágrafos de exemplo para testar as capacidades de segmentação e indexação RAG de forma local e ágil.`;
    }
  }
}

export default DocumentParser;
