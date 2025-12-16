'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Home() {
  const router = useRouter();
  const [schemaFiles, setSchemaFiles] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Fetch schema files from the schema folder
    async function fetchSchemaFiles() {
      try {
        const response = await fetch('/api/schema-files');
        if (response.ok) {
          const files = await response.json();
          setSchemaFiles(files);
        }
      } catch (error) {
        console.error('Error fetching schema files:', error);
      }
    }
    if (isOpen) {
      fetchSchemaFiles();
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.dbs')) {
      setSelectedFile(file);
    } else {
      alert('Please select a .dbs file');
    }
  };

  const handleLoadFile = (filename: string) => {
    // Navigate to db-edit page with the filename as a query parameter
    router.push(`/db-edit?file=${encodeURIComponent(filename)}`);
  };

  const handleUploadAndLoad = async () => {
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/upload-schema', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          // Navigate with the actual stored filename (which may have timestamp)
          router.push(`/db-edit?file=${encodeURIComponent(data.filename)}`);
        } else {
          const error = await response.json();
          alert(`Upload failed: ${error.error}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file');
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Main Content */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-3xl font-bold text-gray-800">DB Schema Editor</h1>
          <div className="flex gap-3">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="cursor-pointer border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  Load Schema
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Load Schema File</DialogTitle>
                  <DialogDescription>
                    Select a schema file from the schema folder or upload a new one.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Upload Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Upload Schema File (.dbs)
                    </label>
                    <input
                      type="file"
                      accept=".dbs"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedFile && (
                      <Button
                        onClick={handleUploadAndLoad}
                        className="mt-2 w-full"
                      >
                        Load {selectedFile.name}
                      </Button>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>

                  {/* Existing Files Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Select from Schema Folder
                    </label>
                    <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-2">
                      {schemaFiles.length > 0 ? (
                        schemaFiles.map((file) => (
                          <button
                            key={file}
                            onClick={() => handleLoadFile(file)}
                            className="w-full rounded-md bg-gray-50 px-4 py-2 text-left text-sm hover:bg-blue-50"
                          >
                            {file}
                          </button>
                        ))
                      ) : (
                        <p className="py-4 text-center text-sm text-gray-500">
                          No .dbs files found in schema folder
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              className="cursor-pointer border-green-500 text-green-600 hover:bg-green-50"
            >
              New Schema
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
