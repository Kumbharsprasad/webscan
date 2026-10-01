'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');
  const [showFull, setShowFull] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setProgress('Scanning in progress... (this may take up to a minute)');
    setReport(null);
    setShowFull(false);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Scan failed');
      
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const unlockReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !report) return;
    
    // We optionally save the lead by re-triggering just the lead capture 
    // or we can just capture it directly on the frontend by updating the DB.
    // To keep it simple, we'll hit a dedicated route or the same one. 
    // But since it's already generated, let's just make a POST to /api/lead
    await fetch('/api/lead', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, url })
    });
    
    setShowFull(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Webscan</h1>
          <p className="mt-4 text-xl text-gray-500">Instant, intelligent website auditing for agencies.</p>
        </div>

        <form onSubmit={handleScan} className="mt-8 flex justify-center gap-4">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Scan Now'}
          </button>
        </form>

        {loading && (
          <div className="text-center text-blue-600 mt-4 animate-pulse">{progress}</div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-8">
            <div className="flex">
              <div className="ml-3"><p className="text-sm text-red-700">{error}</p></div>
            </div>
          </div>
        )}

        {report && !showFull && (
          <div className="mt-12 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-8 sm:p-10 text-center">
              <h3 className="text-2xl font-bold text-gray-900">Your site scored {report.overallScore}/100</h3>
              <p className="mt-4 text-lg text-gray-500">
                We found {report.categories?.reduce((acc: number, cat: any) => acc + cat.toFix?.length, 0)} strategic issues to fix.
              </p>
              
              <div className="mt-8 max-w-md mx-auto">
                <form onSubmit={unlockReport} className="flex flex-col gap-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email to unlock full report"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 border"
                  />
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Unlock Full Report
                  </button>
                </form>
                <p className="mt-2 text-xs text-gray-400">By entering your email you agree to receive marketing communications.</p>
              </div>
            </div>
          </div>
        )}

        {report && showFull && (
          <div className="mt-12 space-y-8 animate-fade-in">
            <div className="bg-white shadow rounded-lg px-6 py-8">
              <h2 className="text-2xl font-bold mb-4">Agent Summary</h2>
              <p className="text-lg text-gray-700 leading-relaxed border-l-4 border-blue-500 pl-4">{report.summary}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {report.categories?.map((cat: any) => (
                <div key={cat.name} className="bg-white shadow rounded-lg p-6 text-center">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{cat.name}</div>
                  <div className={`mt-2 text-4xl font-extrabold ${cat.score >= 90 ? 'text-green-600' : cat.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {cat.score}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              {report.categories?.map((cat: any, idx: number) => (
                <div key={idx} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">{cat.name} - What to fix</h3>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {cat.toFix?.map((fix: any, fixIdx: number) => (
                      <li key={fixIdx} className="px-6 py-5">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            fix.severity === 'high' ? 'bg-red-100 text-red-800' : 
                            fix.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {fix.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{fix.description}</p>
                      </li>
                    ))}
                    {cat.toFix?.length === 0 && (
                       <li className="px-6 py-5 text-gray-500">No issues found in this category!</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <button onClick={() => window.print()} className="text-blue-600 hover:underline">Download Report as PDF</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
