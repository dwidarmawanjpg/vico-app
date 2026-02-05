import React from 'react';
import Header from './components/Header';
import Greeting from './components/Greeting';
import ProductionButton from './components/ProductionButton';
import SummaryCard from './components/SummaryCard';
import Onboarding from './components/Onboarding';
import History from './components/History';
import HistoryDetail from './components/HistoryDetail';
import SOPInput from './components/SOPInput';
import SOPStep from './components/SOPStep';
import QCStep from './components/QCStep';
import Education from './components/Education';
import EducationDetail, { ModuleData } from './components/EducationDetail';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import ActiveBatchCard from './components/ActiveBatchCard';
import { useUserStore } from './stores/useUserStore';
import { useBatchStore } from './stores/useBatchStore';
import { ClipboardList } from 'lucide-react';

function App() {
  const { isLoaded, loadProfile } = useUserStore();
  const { activeBatches, loadActiveBatches, setCurrentBatch } = useBatchStore();
  const [activeTab, setActiveTab] = React.useState('home');
  const [selectedModule, setSelectedModule] = React.useState<ModuleData | null>(null);
  const [selectedBatchId, setSelectedBatchId] = React.useState<string | null>(null);

  // Load user profile from localStorage on mount
  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Load active batches when on home screen
  React.useEffect(() => {
    if (activeTab === 'home') {
      loadActiveBatches();
    }
  }, [activeTab, loadActiveBatches]);

  // Check if this is a first-time user (no name saved yet)
  const isFirstTimeUser = isLoaded && !localStorage.getItem('vico_user_profile');

  // Show loading state while checking localStorage
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-pulse text-primary font-bold text-xl">VICO</div>
      </div>
    );
  }

  // Show onboarding only for first-time users
  if (isFirstTimeUser) {
    return <Onboarding onStart={() => {
      // Force re-render after profile is saved
      loadProfile();
    }} />;
  }

  if (activeTab === 'sop-input') {
      return <SOPInput onBack={() => setActiveTab('home')} onStart={() => setActiveTab('sop-step')} onSkipToQC={() => setActiveTab('qc-step')} />;
  }

  if (activeTab === 'sop-step') {
      return <SOPStep onBack={() => setActiveTab('sop-input')} onNext={() => setActiveTab('qc-step')} onHome={() => setActiveTab('home')} />;
  }

  if (activeTab === 'qc-step') {
      return <QCStep onBack={() => setActiveTab('sop-step')} onFinish={() => setActiveTab('history')} />;
  }

  if (activeTab === 'education') {
      return <Education onNavigate={setActiveTab} onModuleClick={(module) => {
          setSelectedModule(module as ModuleData);
          setActiveTab('education-detail');
      }} />;
  }

  if (activeTab === 'education-detail' && selectedModule) {
      return <EducationDetail module={selectedModule} onBack={() => setActiveTab('education')} />;
  }

  if (activeTab === 'settings') {
      return <Settings onNavigate={setActiveTab} />;
  }




  if (activeTab === 'history') {
      return (
          <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 min-h-screen flex flex-col font-display selection:bg-primary/30">
              <History onBatchClick={(batch) => {
                  setSelectedBatchId(batch.batchId);
                  setActiveTab('history-detail');
              }} onNavigate={setActiveTab} />
          </div>
      )
  }

  if (activeTab === 'history-detail' && selectedBatchId) {
      return <HistoryDetail batchId={selectedBatchId} onBack={() => setActiveTab('history')} />;
  }

  // Fallback for unknown routes - redirect to home
  const validTabs = ['home', 'sop-input', 'sop-step', 'qc-step', 'education', 'education-detail', 'settings', 'history', 'history-detail'];
  if (!validTabs.includes(activeTab)) {
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col items-center justify-center max-w-md mx-auto bg-background-light dark:bg-background-dark font-display">
        <div className="text-center p-6">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <p className="text-text-main dark:text-white text-lg font-medium mb-2">Halaman tidak ditemukan</p>
          <p className="text-text-secondary dark:text-gray-400 text-sm mb-6">Route "{activeTab}" tidak tersedia</p>
          <button 
            onClick={() => setActiveTab('home')}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Home screen (default)
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl font-display text-text-main dark:text-gray-100 selection:bg-primary/30">
      {/* Top App Bar */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto pt-20 pb-24 px-4 overflow-y-auto overflow-x-hidden">
        
        {/* Greeting Section */}
        <Greeting />

        {/* Active Batches Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-main dark:text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="text-primary" size={22} />
              Batch Aktif 
              {activeBatches.length > 0 && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {activeBatches.length}
                </span>
              )}
            </h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {activeBatches.length > 0 ? (
              activeBatches.map((batch) => (
                <ActiveBatchCard
                  key={batch.id}
                  batch={batch}
                  onClick={() => {
                    setCurrentBatch(batch);
                    // Navigate based on current step
                    if (batch.currentStep === 7) {
                      setActiveTab('qc-step');
                    } else {
                      setActiveTab('sop-step');
                    }
                  }}
                />
              ))
            ) : (
              <div className="bg-white dark:bg-surface-dark rounded-xl p-6 text-center border border-gray-100 dark:border-gray-800">
                <p className="text-text-secondary dark:text-gray-400 text-sm">Belum ada batch aktif</p>
                <p className="text-text-secondary dark:text-gray-500 text-xs mt-1">Klik tombol di bawah untuk mulai produksi baru</p>
              </div>
            )}
          </div>
        </section>

        {/* New Production Button */}
        <ProductionButton onClick={() => setActiveTab('sop-input')} />

        {/* Summary Section */}
        <SummaryCard />

      </main>

      <BottomNav activeTab={activeTab} onNavigate={setActiveTab} />
    </div>
  );
}

export default App;
