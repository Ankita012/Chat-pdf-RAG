import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chat with Your PDF Documents
          </h1>
          <p className="text-gray-600">
            Upload a PDF document and start asking questions about its content
          </p>
        </div>

        {/* 2-Column Layout with Fixed Height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ height: 'calc(100vh - 250px)' }}>
          {/* Left Column - File Upload */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Document
              </h2>
              <p className="text-gray-600 text-sm">
                Select a PDF file to start chatting
              </p>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <FileUploadComponent />
            </div>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat Assistant
              </h2>
              <p className="text-gray-600 text-sm">
                Ask questions about your uploaded document
              </p>
            </div>
            
            <div className="flex-1 min-h-0">
              <ChatComponent />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to use:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
              <div>
                <p className="font-medium text-blue-900">Upload PDF</p>
                <p className="text-blue-700">Click or drag & drop your PDF document</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
              <div>
                <p className="font-medium text-blue-900">Wait for Processing</p>
                <p className="text-blue-700">The AI will analyze and index your document</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
              <div>
                <p className="font-medium text-blue-900">Start Chatting</p>
                <p className="text-blue-700">Ask questions and get AI-powered answers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}