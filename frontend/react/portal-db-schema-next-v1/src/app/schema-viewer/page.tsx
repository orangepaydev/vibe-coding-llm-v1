"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SchemaCanvas } from "@/components/SchemaCanvas";
import { parseSchemaXML, Schema } from "@/lib/schema-parser";

export default function SchemaViewerPage() {
  const searchParams = useSearchParams();
  const dbFile = searchParams.get("db-edit");
  
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");

  useEffect(() => {
    if (!dbFile) {
      setError("No database file specified. Please provide a 'db-edit' URL parameter.");
      setLoading(false);
      return;
    }

    // Load the schema file from the specified path
    setFilename(dbFile);
    fetch(`/${dbFile}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load schema file: ${dbFile}`);
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
  }, [dbFile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">No schema loaded</p>
      </div>
    );
  }
filename={filename} 
  return <SchemaCanvas schema={schema} layoutIndex={0} />;
}
