import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  return (
    <div className="space-y-4">
        <div
            {...getRootProps()}
            className={`w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300
            ${isDragActive ? 'border-cyan-accent bg-cyber-navy-light/50' : 'border-slate-dark hover:border-cyan-accent/70'}
            `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
            <svg className="w-12 h-12 text-slate-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-4m0 0l3 3m-3-3L9 15" />
            </svg>
            {isDragActive ? (
                <p className="text-slate-light">Drop the file here ...</p>
            ) : (
                <p className="text-slate-medium">Drag & drop a CSV file here, or click to select a file</p>
            )}
            </div>
        </div>
        {uploadedFile && (
            <div className="text-center text-slate-light p-4 bg-cyber-navy-light/50 rounded-lg">
                <p>Uploaded file: <span className="font-bold text-cyan-accent">{uploadedFile.name}</span></p>
            </div>
        )}
    </div>
  );
};

export default FileUpload;
