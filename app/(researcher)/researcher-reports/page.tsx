'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/shared/main-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';
import type { User, Report } from '@/types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Check auth session from localStorage
    const session = getAuthSession();

    if (!session || session.role !== 'researcher') {
      router.push('/login');
      return;
    }

    const supabase = createClient();

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.email)
      .single();

    if (!userData || userData.role !== 'researcher') {
      router.push('/login');
      return;
    }

    setUser(userData as User);

    // Get reports
    const { data: reportsData } = await supabase
      .from('reports')
      .select('*')
      .eq('researcher_id', userData.id)
      .order('created_at', { ascending: false });

    setReports((reportsData as Report[]) || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <MainLayout userRole="researcher" userName={user.email}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Reports
          </h1>
          <p className="text-gray-600">
            All reports you have generated with anonymized data
          </p>
        </div>

        {reports.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-2">You don't have any reports yet</h3>
            <p className="text-gray-600 mb-6">
              Use the AI Chat to define your criteria and generate your first report
            </p>
            <Button onClick={() => router.push('/researcher-chat')}>
              Go to Chat
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Reports List */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Reports ({reports.length})
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedReport?.id === report.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm line-clamp-2">
                            {report.query.substring(0, 60)}
                            {report.query.length > 60 ? '...' : ''}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(report.created_at), "MMM d, yyyy", { locale: enUS })}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {report.report_data.total_samples} samples
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-600">
                          Cost: {report.cost_in_biochain} BIOCHAIN
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Report Details */}
            <div className="lg:col-span-2">
              {selectedReport ? (
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">Report Details</h2>
                        <p className="text-sm text-gray-600">
                          Generated on {format(new Date(selectedReport.created_at), "MMMM d, yyyy 'at' HH:mm", { locale: enUS })}
                        </p>
                      </div>
                      <Badge className="text-lg px-4 py-2">
                        {selectedReport.report_data.total_samples} samples
                      </Badge>
                    </div>

                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Original Query:</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                        {selectedReport.query}
                      </p>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Demographic Data</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-violet-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Age Range</p>
                        <p className="text-2xl font-bold text-primary">
                          {selectedReport.report_data.demographics.age_range}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Average: {selectedReport.report_data.demographics.average_age} years
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Contraceptive Use</p>
                        <p className="text-lg font-bold text-accent">
                          {selectedReport.report_data.demographics.contraceptive_users} users
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedReport.report_data.demographics.non_contraceptive_users} non-users
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Aggregated Hormonal Data</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Progesterone</p>
                        <p className="text-xl font-bold">
                          {selectedReport.report_data.hormonal_data.progesterone_avg}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Estrogen</p>
                        <p className="text-xl font-bold">
                          {selectedReport.report_data.hormonal_data.estrogen_avg}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Testosterone</p>
                        <p className="text-xl font-bold">
                          {selectedReport.report_data.hormonal_data.testosterone_avg}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Anonymized Medical Context</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Sample profiles from the first 10 participants (completely anonymized data)
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left p-3">ID</th>
                            <th className="text-left p-3">Age</th>
                            <th className="text-left p-3">Contraceptive</th>
                            <th className="text-left p-3">Duration</th>
                            <th className="text-left p-3">Conditions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.report_data.medical_context.map((context, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="p-3">#{index + 1}</td>
                              <td className="p-3">{context.age}</td>
                              <td className="p-3">{context.contraceptive}</td>
                              <td className="p-3">{context.duration}</td>
                              <td className="p-3">
                                {context.conditions.length > 0 ? context.conditions.join(', ') : 'None'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  <Card className="p-6 bg-violet-50">
                    <h3 className="text-lg font-semibold mb-3">Important Information</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span>All data is completely anonymized</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span>File hashes are verified on Stellar blockchain</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span>The {selectedReport.report_data.total_samples} contributors received USDC compensation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span>Report generated with BioChain's anonymization technology</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <h3 className="text-xl font-bold mb-2">Select a Report</h3>
                  <p className="text-gray-600">
                    Choose a report from the list to view its full details
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
