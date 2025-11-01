"use client"

export default function NotFound() {
  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen bg-yellow-50">
        <h2 className="text-2xl font-bold text-yellow-700 mb-4">404 - Page Not Found</h2>
        <p className="text-yellow-800 mb-4">Sorry, the page you are looking for does not exist.</p>
        <a href="/" className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Go Home</a>
      </body>
    </html>
  );
}
