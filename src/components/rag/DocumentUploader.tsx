import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { SupportedDocumentType } from '@/lib/rag/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export interface DocumentUploaderProps {
  onUpload: (
    name: string,
    type: SupportedDocumentType,
    size: number,
    content?: string,
  ) => Promise<void>;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUpload }) => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<SupportedDocumentType>('PDF');
  const [fileContent, setFileContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const types: SupportedDocumentType[] = ['PDF', 'DOCX', 'TXT', 'Markdown', 'CSV', 'Excel', 'JSON'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    setUploading(true);
    setStatus('idle');

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockSize = fileContent ? fileContent.length : 15400;

      await onUpload(fileName.trim(), fileType, mockSize, fileContent.trim() || undefined);

      setStatus('success');
      setFileName('');
      setFileContent('');

      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-border bg-card rounded-2xl border p-5 space-y-4 text-left select-none">
      <div className="flex items-center gap-2 pb-1 border-b border-border/40">
        <UploadCloud className="h-4.5 w-4.5 text-primary shrink-0 animate-bounce" />
        <h3 className="text-text-primary text-xs font-bold uppercase tracking-wider">
          Upload e Indexador RAG (Simulado)
        </h3>
      </div>

      <div className="space-y-3.5">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-1">
            <label className="text-text-secondary text-[11px] font-bold uppercase">
              Nome do Arquivo
            </label>
            <Input
              type="text"
              placeholder="Ex: relatorio_anual_2024.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
              disabled={uploading}
              className="h-10 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-text-secondary text-[11px] font-bold uppercase">
              Tipo
            </label>
            <Select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as SupportedDocumentType)}
              disabled={uploading}
              className="h-10 text-xs"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-text-secondary text-[11px] font-bold uppercase">
              Conteúdo de Texto do Arquivo (Opcional)
            </label>
            <span className="text-[10px] text-text-muted">
              Será dividido em retalhos semânticos (chunks)
            </span>
          </div>
          <Textarea
            placeholder="Digite ou cole o texto que deseja indexar. Se deixado em branco, o sistema gerará um texto técnico de exemplo de forma inteligente."
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            disabled={uploading}
            rows={4}
            className="text-xs"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs">
            {uploading && (
              <span className="text-primary font-semibold flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Extraindo texto e indexando em vetores locais...
              </span>
            )}
            {status === 'success' && (
              <span className="text-success font-semibold flex items-center gap-1.5 animate-bounce">
                <CheckCircle className="h-4.5 w-4.5" />
                Indexado com sucesso no Local Store!
              </span>
            )}
            {status === 'error' && (
              <span className="text-danger font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4.5 w-4.5" />
                Ocorreu um erro no parsing do arquivo.
              </span>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={uploading}
            disabled={!fileName.trim() || uploading}
            className="w-full sm:w-auto self-end"
          >
            Análise e Indexação RAG
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DocumentUploader;
