'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { SchemaCanvas } from '@/components/SchemaCanvas';
import { parseSchemaXML, Schema } from '@/lib/schema-parser';

function DbEditContent() {
  const searchParams = useSearchParams();
  const filename = searchParams.get('file');
  
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filename) {
      setError('No schema file specified');
      setLoading(false);
      return;
    }

    // Load the schema file from the schema folder
    fetch(`/api/schema-files/${encodeURIComponent(filename)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load schema file: ${filename}`);
        return res.text();
      })
      .then((xmlContent) => {
        const parsedSchema = parseSchemaXML(xmlContent);
        setSchema(parsedSchema);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [filename]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading schema...</p>
        </div>
      </main>
    );
  }

  if (error || !schema) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{error || 'Failed to load schema'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <SchemaCanvas schema={schema} layoutIndex={0} />
    </main>
  );
}

export default function DbEdit() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    }>
      <DbEditContent />
    </Suspense>
  );
}
