'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FileUploaderProps {
  accept?: string;
  maxSize?: number; // in bytes
  onChange: (file: File | null) => void;
  value?: File | null;
  disabled?: boolean;
}

export function FileUploader({
  accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx',
  maxSize = 10 * 1024 * 1024, // 10MB
  onChange,
  value,
  disabled = false,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `Kích thước file vượt quá ${formatFileSize(maxSize)}`;
    }

    const acceptedTypes = accept.split(',').map((type) => type.trim());
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    if (!acceptedTypes.includes(fileExtension) && !acceptedTypes.includes(file.type)) {
      return 'Định dạng file không được hỗ trợ';
    }

    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onChange(null);
      return;
    }

    setError(null);
    onChange(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = () => {
    setError(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {!value ? (
        <div
          className={cn(
            'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            dragActive && 'border-primary bg-primary/5',
            disabled && 'cursor-not-allowed opacity-50',
            !disabled && 'hover:border-primary/50 cursor-pointer'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            className="hidden"
          />

          <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />

          <div className="space-y-2">
            <p className="text-sm font-medium">Kéo thả file vào đây hoặc click để chọn</p>
            <p className="text-muted-foreground text-xs">Hỗ trợ: {accept}</p>
            <p className="text-muted-foreground text-xs">
              Kích thước tối đa: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-3">
            <FileText className="text-primary h-8 w-8" />
            <div>
              <p className="text-sm font-medium">{value.name}</p>
              <p className="text-muted-foreground text-xs">{formatFileSize(value.size)}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
