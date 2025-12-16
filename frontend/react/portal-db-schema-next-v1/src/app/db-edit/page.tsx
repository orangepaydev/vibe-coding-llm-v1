'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function DbEditContent() {
  const searchParams = useSearchParams();
  const filename = searchParams.get('file');

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 p-4">
      <div className="w-full">
        {/* Panel for DB Editor */}
        <div className="rounded-lg bg-white shadow-md">
          <span className="mb-6 font-bold text-gray-800 ">DB Schema Editor
          {filename && (
            <span className='pl-8'>{filename}</span>
          )}
          </span>
          <div className="min-h-[400px] rounded-md border border-gray-200 p-6">
            <p className="text-gray-600">Schema editor panel will be displayed here.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DbEdit() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DbEditContent />
    </Suspense>
  );
}
