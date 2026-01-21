'use client';

import { useState, useRef } from 'react';
import { api } from '@/trpc/client';
import { useParams, useRouter } from 'next/navigation';
import { DashboardNav, LoadingScreen } from '@/components';
import { Button, Badge } from '@crafted/ui';
import { PrinterIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react';

type LayoutOption = 1 | 4 | 9 | 16;

export default function ObjectiveQRCodesPage() {
  const params = useParams();
  const router = useRouter();
  const operationId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [layout, setLayout] = useState<LayoutOption>(4);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const { data: user } = api.auth.me.useQuery();

  const logoutMutation = api.auth.logout.useMutation({
    onSuccess: () => {
      router.push('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  const { data: userTeams } = api.team.getUserTeams.useQuery();

  const { data: operation, isLoading: operationLoading } = api.operation.getById.useQuery(
    { id: operationId, teamId: selectedTeamId || userTeams?.[0]?.id || '' },
    { enabled: !!selectedTeamId || !!userTeams?.[0]?.id }
  );

  const { data: objectives, isLoading: objectivesLoading, refetch } = api.objective.getByOperation.useQuery(
    { operationId, teamId: selectedTeamId || userTeams?.[0]?.id || '' },
    { enabled: !!selectedTeamId || !!userTeams?.[0]?.id }
  );

  const regenerateAllMutation = api.objective.regenerateAllQRCodes.useMutation({
    onSuccess: () => {
      refetch();
      alert('All QR codes have been regenerated');
    },
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  if (operationLoading || objectivesLoading || !userTeams) return <LoadingScreen />;

  if (!selectedTeamId && userTeams.length > 0) {
    setSelectedTeamId(userTeams[0].id);
    return <LoadingScreen />;
  }

  if (!operation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Operation not found</h2>
          <Button onClick={() => router.push('/')} className="mt-4">
            Back to Command Center
          </Button>
        </div>
      </div>
    );
  }

  const currentTeamRole = operation.operationTeams?.find(
    (ot: any) => ot.teamId === selectedTeamId
  )?.role;

  const isAdmin = currentTeamRole === 'CREATOR' || currentTeamRole === 'CO_ADMIN';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Unauthorized</h2>
          <p className="mt-2 text-muted-foreground">Only admins can access QR codes</p>
          <Button onClick={() => router.push(`/operations/${operationId}`)} className="mt-4">
            Back to Operation
          </Button>
        </div>
      </div>
    );
  }

  const objectivesToDisplay = selectedObjectives.length > 0
    ? objectives?.filter(o => selectedObjectives.includes(o.id)) || []
    : objectives || [];

  const handlePrint = () => {
    window.print();
  };

  const handleRegenerateAll = () => {
    if (
      window.confirm(
        'Are you sure you want to regenerate ALL QR codes? Previous codes will no longer work.'
      )
    ) {
      regenerateAllMutation.mutate({ operationId, teamId: selectedTeamId });
    }
  };

  const handleSelectAll = () => {
    if (selectedObjectives.length === objectives?.length) {
      setSelectedObjectives([]);
    } else {
      setSelectedObjectives(objectives?.map(o => o.id) || []);
    }
  };

  const toggleObjectiveSelection = (objectiveId: string) => {
    setSelectedObjectives(prev =>
      prev.includes(objectiveId)
        ? prev.filter(id => id !== objectiveId)
        : [...prev, objectiveId]
    );
  };

  const getGridCols = () => {
    switch (layout) {
      case 1: return 'grid-cols-1';
      case 4: return 'grid-cols-2';
      case 9: return 'grid-cols-3';
      case 16: return 'grid-cols-4';
    }
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area,
          #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <DashboardNav
          userName={user?.name || undefined}
          userEmail={user?.email}
          onLogout={handleLogout}
        />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 no-print">
            <Button
              variant="ghost"
              onClick={() => router.push(`/operations/${operationId}/objectives`)}
              className="mb-4"
            >
              ← Back to Objectives
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Objective QR Codes</h1>
                <p className="mt-2 text-muted-foreground">
                  Generate and print QR codes for objective scanning
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow p-6 no-print">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Layout Options</h3>
                <div className="flex gap-2">
                  {([1, 4, 9, 16] as LayoutOption[]).map((l) => (
                    <Button
                      key={l}
                      variant={layout === l ? 'default' : 'outline'}
                      onClick={() => setLayout(l)}
                      size="sm"
                    >
                      {l} per page
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Select Objectives</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedObjectives.length === objectives?.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedObjectives.length > 0
                      ? `${selectedObjectives.length} selected`
                      : 'All objectives selected'}
                  </span>
                </div>

                <div className="space-y-2">
                  {objectives?.map((objective) => (
                    <button
                      key={objective.id}
                      onClick={() => toggleObjectiveSelection(objective.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedObjectives.length === 0 || selectedObjectives.includes(objective.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{objective.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {objective.type} • {objective.points} points
                          </p>
                        </div>
                        {objective.camp && (
                          <Badge
                            className="text-xs"
                            style={{ backgroundColor: objective.camp.color }}
                          >
                            {objective.camp.name}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button onClick={handlePrint}>
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  Print QR Codes
                </Button>
                <Button variant="outline">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRegenerateAll}
                  disabled={regenerateAllMutation.isPending}
                >
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  {regenerateAllMutation.isPending ? 'Regenerating...' : 'Regenerate All'}
                </Button>
              </div>
            </div>
          </div>

          <div
            id="print-area"
            ref={printRef}
            className="bg-white rounded-lg shadow p-8"
          >
            <div className="mb-8 text-center no-print">
              <h2 className="text-2xl font-bold">{operation.name}</h2>
              <p className="text-muted-foreground">Objective QR Codes</p>
            </div>

            <div className={`grid ${getGridCols()} gap-8`}>
              {objectivesToDisplay.map((objective) => (
                <div
                  key={objective.id}
                  className="flex flex-col items-center p-4 border-2 border-slate-200 rounded-lg"
                  style={{
                    borderLeftColor: objective.camp?.color || '#6b7280',
                    borderLeftWidth: '4px'
                  }}
                >
                  <div className="mb-3">
                    <QRCodeDisplay
                      token={objective.qrCodeToken}
                      baseUrl={baseUrl}
                    />
                  </div>

                  <div className="text-center">
                    <p className="font-bold text-lg">{objective.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{objective.type}</p>
                    {objective.camp && (
                      <Badge
                        className="text-xs mb-2"
                        style={{ backgroundColor: objective.camp.color }}
                      >
                        {objective.camp.name}
                      </Badge>
                    )}
                    <p className="text-sm font-semibold text-blue-600">
                      {objective.points} points
                    </p>
                  </div>

                  <div className="mt-3 text-xs text-center text-muted-foreground">
                    <p>Scan to complete objective</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 text-xs text-muted-foreground">
              <p className="font-semibold mb-2">Instructions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Print on quality paper or cardstock</li>
                <li>Laminate or use waterproof sleeves for outdoor use</li>
                <li>Each QR code is unique to the objective</li>
                <li>Place QR codes at objective locations</li>
                <li>Keep QR codes secure and regenerate if compromised</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function QRCodeDisplay({ token, baseUrl }: { token: string; baseUrl: string }) {
  const { data: qrCode } = api.objective.getObjectiveQRCode.useQuery({
    token,
    baseUrl,
  });

  if (!qrCode) {
    return (
      <div className="w-48 h-48 bg-slate-100 animate-pulse rounded" />
    );
  }

  return (
    <img
      src={qrCode}
      alt="Objective QR Code"
      className="w-48 h-48"
    />
  );
}
