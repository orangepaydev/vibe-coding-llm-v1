import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Top Panel */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-800">Top Panel</h2>
          <p className="mt-2 text-gray-600">
            This is a panel positioned at the top of the container.
          </p>
        </div>

        {/* Main Content */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-3xl font-bold text-gray-800">Hello world</h1>
          <Button>Click Me</Button>
        </div>
      </div>
    </main>
  );
}
