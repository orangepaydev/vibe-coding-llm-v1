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
  const [isNewSchemaOpen, setIsNewSchemaOpen] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState('');

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

  const handleCreateNewSchema = async () => {
    if (!newSchemaName.trim()) {
      alert('Please enter a schema name');
      return;
    }

    // Ensure filename ends with .dbs
    const filename = newSchemaName.trim().endsWith('.dbs') 
      ? newSchemaName.trim() 
      : `${newSchemaName.trim()}.dbs`;

    try {
      // Check if file already exists
      const filesResponse = await fetch('/api/schema-files');
      if (filesResponse.ok) {
        const existingFiles = await filesResponse.json();
        if (existingFiles.includes(filename)) {
          alert(`A schema file named "${filename}" already exists. Please choose a different name.`);
          return;
        }
      }

      // Create minimal empty schema
      const emptySchemaXML = `<?xml version="1.0" encoding="utf-8" ?>
<project name="${newSchemaName.trim().replace('.dbs', '')}" database="Generic">
  <schema name="public">
  </schema>
  <layout name="Default" id="Layout-1" show_relation="always">
  </layout>
</project>`;

      // Save the new schema file
      const response = await fetch('/api/save-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          content: emptySchemaXML,
        }),
      });

      if (response.ok) {
        // Navigate to the db-edit page with the new schema
        router.push(`/db-edit?file=${encodeURIComponent(filename)}`);
      } else {
        const error = await response.json();
        alert(`Failed to create schema: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating schema:', error);
      alert('Failed to create schema');
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
            <Dialog open={isNewSchemaOpen} onOpenChange={setIsNewSchemaOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="cursor-pointer border-green-500 text-green-600 hover:bg-green-50"
                >
                  New Schema
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Schema</DialogTitle>
                  <DialogDescription>
                    Enter a name for your new schema file. It will be created in the schema folder.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Schema Name
                    </label>
                    <input
                      type="text"
                      value={newSchemaName}
                      onChange={(e) => setNewSchemaName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateNewSchema();
                      }}
                      placeholder="my-schema.dbs"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500">
                      The .dbs extension will be added automatically if not provided.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsNewSchemaOpen(false);
                        setNewSchemaName('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateNewSchema}
                      disabled={!newSchemaName.trim()}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Create Schema
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </main>
  );
}
