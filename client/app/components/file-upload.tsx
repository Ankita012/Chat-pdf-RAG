'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
  filename?: string;
}

const FileUploadComponent: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    message: 'Upload a PDF to start chatting'
  });
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      setUploadStatus({
        status: 'error',
        message: 'Please upload a valid PDF file'
      });
      return;
    }

    setUploadStatus({
      status: 'uploading',
      message: 'Uploading PDF...'
    });

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('http://localhost:8000/upload/pdf', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus({
          status: 'processing',
          message: 'Processing PDF... This may take a few moments',
          filename: result.file
        });

        // Poll for processing completion (optional enhancement)
        setTimeout(() => {
          setUploadStatus({
            status: 'success',
            message: 'PDF processed successfully! You can now chat about its content.',
            filename: result.file
          });
        }, 3000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus.status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Upload className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus.status) {
      case 'uploading':
      case 'processing':
        return 'border-blue-300 bg-blue-50';
      case 'success':
        return 'border-green-300 bg-green-50';
      case 'error':
        return 'border-red-300 bg-red-50';
      default:
        return dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${getStatusColor()}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleChange}
          disabled={uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {uploadStatus.status === 'idle' ? 'Upload PDF Document' : uploadStatus.message}
            </p>
            
            {uploadStatus.filename && (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>{uploadStatus.filename}</span>
              </div>
            )}
            
            {uploadStatus.status === 'idle' && (
              <p className="text-sm text-gray-500 mt-2">
                Drag and drop your PDF here, or click to browse
              </p>
            )}
          </div>
        </div>
      </div>
      
      {uploadStatus.status === 'success' && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-sm text-green-800">
            🎉 Ready to chat! Your PDF has been processed and indexed. 
            You can now ask questions about its content.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;