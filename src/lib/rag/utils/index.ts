import { SupportedDocumentType } from '../types';

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getDocumentTypeColor = (type: SupportedDocumentType): string => {
  const mapping: Record<SupportedDocumentType, string> = {
    PDF: 'bg-red-500/10 text-red-500 border-red-500/20',
    DOCX: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    TXT: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    Markdown: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    CSV: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Excel: 'bg-green-500/10 text-green-500 border-green-500/20',
    JSON: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };
  return mapping[type] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
};
