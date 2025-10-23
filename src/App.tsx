import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useChainId } from "wagmi";
import { parseAbi } from "viem";
import { base } from "wagmi/chains";
import { CheckCircle, XCircle, Wallet as WalletIcon, LogOut, AlertTriangle, X, RotateCcw } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
const REQUIRED_CHAIN_ID = base.id; // 8453

const CONTRACT_ABI = parseAbi([
  'function submitQuiz(uint8 _score) public',
  'event QuizSubmitted(address indexed player, uint8 score, uint256 timestamp)'
]);

const quizQuestions = [
  {
    question: "What blockchain is Farcaster built on?",
    options: [
      "Optimism (Ethereum Layer 2)",
      "Polygon",
      "Solana",
      "Base"
    ],
    correctAnswer: 0
  },
  {
    question: "What are Frames in Farcaster?",
    options: [
      "Profile picture borders",
      "Interactive apps that run inside casts",
      "NFT collections",
      "Private messaging groups"
    ],
    correctAnswer: 1
  },
  {
    question: "Who created Farcaster?",
    options: [
      "Vitalik Buterin",
      "Jesse Pollak",
      "Dan Romero and Varun Srinivasan",
      "Brian Armstrong"
    ],
    correctAnswer: 2
  },
  {
    question: "What is Warpcast?",
    options: [
      "A cryptocurrency wallet",
      "The flagship client app for Farcaster protocol",
      "An NFT marketplace",
      "A DeFi protocol"
    ],
    correctAnswer: 1
  },
  {
    question: "Why does Farcaster charge a signup fee?",
    options: [
      "To make profit",
      "To prevent spam and bot accounts",
      "For server maintenance",
      "It's a one-time NFT mint"
    ],
    correctAnswer: 1
  }
];


// LocalStorage helpers
const STORAGE_KEY = 'quiz_state';

const saveToStorage = (data: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};

// Network Switch Modal Component
const NetworkModal = ({ 
  chainId, 
  onSwitch, 
  onClose 
}: { 
  chainId: number; 
  onSwitch: () => void; 
  onClose: () => void;
}) => {
  const getNetworkName = (id: number) => {
    switch(id) {
      case 59144: return 'Linea';
      case 10: return 'Optimism';
      case 1: return 'Ethereum Mainnet';
      case 137: return 'Polygon';
      case 42161: return 'Arbitrum';
      case 8453: return 'Base Mainnet';
      default: return `Chain ID ${id}`;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '24px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        position: 'relative',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <AlertTriangle size={64} style={{ margin: '0 auto 24px', color: '#f59e0b' }} />
          
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
            Wrong Network Detected
          </h2>
          
          <p style={{ color: '#6b7280', marginBottom: '12px', fontSize: '16px' }}>
            You're currently connected to:
          </p>
          
          <div style={{
            background: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <strong style={{ color: '#ef4444', fontSize: '18px' }}>
              {getNetworkName(chainId)}
            </strong>
          </div>
          
          <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '16px' }}>
            Please switch to <strong style={{ color: '#10b981' }}>Base Sepolia</strong> to continue
          </p>

          <div style={{
            background: '#f3f4f6',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '14px', color: '#4b5563', fontFamily: 'monospace' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Network:</strong> Base Sepolia Testnet
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Chain ID:</strong> {REQUIRED_CHAIN_ID}
              </div>
              <div>
                <strong>RPC:</strong> https://sepolia.base.org
              </div>
            </div>
          </div>

          <button
            onClick={onSwitch}
            style={{
              width: '100%',
              background: '#9333ea',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              marginBottom: '12px',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#7c3aed'}
            onMouseOut={(e) => e.currentTarget.style.background = '#9333ea'}
          >
            🔄 Switch to Base Sepolia
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: 'transparent',
              color: '#6b7280',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: '600',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  
  const getInitialState = () => {
    const saved = loadFromStorage();
    return {
      currentQuestion: saved?.currentQuestion ?? 0,
      selectedAnswers: saved?.selectedAnswers ?? [],
      showPaymentPrompt: saved?.showPaymentPrompt ?? false,
      showResults: saved?.showResults ?? false,
      quizCompleted: saved?.quizCompleted ?? false,
      transactionHash: saved?.transactionHash ?? null,
    };
  };

  const [currentQuestion, setCurrentQuestion] = useState(getInitialState().currentQuestion);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(getInitialState().selectedAnswers);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(getInitialState().showPaymentPrompt);
  const [showResults, setShowResults] = useState(getInitialState().showResults);
  const [quizCompleted, setQuizCompleted] = useState(getInitialState().quizCompleted);
  const [transactionHash, setTransactionHash] = useState<string | null>(getInitialState().transactionHash);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: hash, isPending, isError: txError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash: hash || (transactionHash as `0x${string}` | undefined)
  });

  const isOnCorrectNetwork = chainId === REQUIRED_CHAIN_ID;

  // Save state to localStorage
  useEffect(() => {
    saveToStorage({
      currentQuestion,
      selectedAnswers,
      showPaymentPrompt,
      showResults,
      quizCompleted,
      transactionHash,
    });
  }, [currentQuestion, selectedAnswers, showPaymentPrompt, showResults, quizCompleted, transactionHash]);

  useEffect(() => {
    const initSDK = async () => {
      await sdk.actions.ready();
      setIsSDKLoaded(true);
    };
    initSDK();
  }, []);

  // Save transaction hash and show results
  useEffect(() => {
    if (isSuccess && hash) {
      setTransactionHash(hash);
      setShowPaymentPrompt(false);
      setShowResults(true);
      toast.success('Score saved to blockchain! 🎉', {
        duration: 5000,
        icon: '✅',
      });
    }
  }, [isSuccess, hash]);

  // Show toast for transaction rejection
  useEffect(() => {
    if (txError) {
      toast.error('Transaction rejected. Your answers are saved. You can try again!', {
        duration: 4000,
        icon: '❌',
      });
      reset();
    }
  }, [txError, reset]);

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
      setShowPaymentPrompt(true);
    }
  };

  const handlePayForResults = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first!');
      return;
    }

    // Show modal if wrong network
    if (!isOnCorrectNetwork) {
      setShowNetworkModal(true);
      return;
    }

    const score = calculateScore();

    try {
      toast.loading('Preparing transaction...', { id: 'tx-prepare' });
      
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'submitQuiz',
        args: [score],
        chainId: REQUIRED_CHAIN_ID,
      });

      toast.dismiss('tx-prepare');
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.dismiss('tx-prepare');
      toast.error('Transaction failed. Please try again.');
    }
  };

  const handleSwitchNetworkFromModal = async () => {
    try {
      toast.loading('Switching network...', { id: 'network-switch' });
      await switchChain({ chainId: REQUIRED_CHAIN_ID });
      toast.dismiss('network-switch');
      toast.success('Switched to Base Sepolia! 🔄');
      setShowNetworkModal(false);
      
      // Small delay then try transaction again
      setTimeout(() => {
        handlePayForResults();
      }, 1000);
    } catch (error) {
      console.error("Network switch failed:", error);
      toast.dismiss('network-switch');
      toast.error('Network switch rejected. Please switch manually in your wallet.');
    }
  };

  const handleRestartQuiz = () => {
    // Clear all state
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowPaymentPrompt(false);
    setShowResults(false);
    setQuizCompleted(false);
    setTransactionHash(null);
    clearStorage();
    toast.success('Quiz restarted! 🔄');
  };

  const handleDisconnect = () => {
    disconnect();
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowPaymentPrompt(false);
    setShowResults(false);
    setQuizCompleted(false);
    setTransactionHash(null);
    clearStorage();
    toast.success('Wallet disconnected');
  };

  if (!isSDKLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #9333ea, #3b82f6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '20px' }}>Loading...</div>
      </div>
    );
  }

  // Wallet connection screen
  if (!isConnected) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #9333ea, #3b82f6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <Toaster position="top-center" />
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <WalletIcon size={64} style={{ margin: '0 auto 24px', color: '#9333ea' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Connect Wallet
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Connect your wallet to take the quiz and save your score onchain
          </p>
          <button
            onClick={() => connect({ connector: connectors[0] })}
            style={{
              width: '100%',
              background: '#9333ea',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // Payment prompt screen
  if (showPaymentPrompt && quizCompleted && !showResults) {
    const score = calculateScore();
    const percentage = (score / quizQuestions.length) * 100;

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #9333ea, #3b82f6)',
        padding: '24px',
        position: 'relative'
      }}>
        <Toaster position="top-center" />
        
        {/* Render modal when showNetworkModal is true */}
        {showNetworkModal && (
          <NetworkModal 
            chainId={chainId}
            onSwitch={handleSwitchNetworkFromModal}
            onClose={() => setShowNetworkModal(false)}
          />
        )}

        {/* Top bar */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10
        }}>
          <div style={{
            background: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <button
            onClick={handleDisconnect}
            style={{
              background: '#ef4444',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>

        <div style={{
          maxWidth: '600px',
          margin: '60px auto 0',
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(to bottom right, #9333ea, #3b82f6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '40px'
          }}>
            🎉
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
            Quiz Completed!
          </h2>
          
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
            You answered all {quizQuestions.length} questions!
          </p>

          <div style={{
            background: '#f3f4f6',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              Your estimated score
            </p>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#9333ea' }}>
              ~{percentage.toFixed(0)}%
            </div>
          </div>

          {/* Warning if wrong network */}
          {!isOnCorrectNetwork && (
            <div style={{
              background: '#fee2e2',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} />
                Wrong Network Detected
              </h3>
              <p style={{ fontSize: '12px', color: '#991b1b' }}>
                You're on {chainId === 59144 ? 'Linea' : chainId === 10 ? 'Optimism' : chainId === 1 ? 'Ethereum' : 'wrong network'}. 
                Click the button below to switch to Base Sepolia.
              </p>
            </div>
          )}

          <div style={{
            background: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>
              💰 To View Your Results:
            </h3>
            <ul style={{ fontSize: '14px', color: '#92400e', marginLeft: '20px', lineHeight: '1.8' }}>
              <li>Pay a small gas fee (~$0.01-0.05 on Base Sepolia)</li>
              <li>Your score will be saved to blockchain</li>
              <li>View detailed results with correct answers</li>
              <li>Proof of your achievement forever!</li>
            </ul>
          </div>

          <button
            onClick={handlePayForResults}
            disabled={isPending || isConfirming}
            style={{
              width: '100%',
              background: isPending || isConfirming ? '#d1d5db' : '#10b981',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              fontWeight: '600',
              border: 'none',
              cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              marginBottom: '12px'
            }}
          >
            {isPending && "⏳ Confirm in Wallet..."}
            {isConfirming && "⛓️ Saving to Blockchain..."}
            {!isPending && !isConfirming && "💳 Pay Gas Fee & View Results"}
          </button>

          <p style={{ fontSize: '12px', color: '#6b7280' }}>
            Your answers are saved. You can come back later!
          </p>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults && (isSuccess || transactionHash)) {
    const score = calculateScore();
    const percentage = (score / quizQuestions.length) * 100;
    const displayHash = hash || transactionHash;

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #9333ea, #3b82f6)',
        padding: '24px',
        position: 'relative'
      }}>
        <Toaster position="top-center" />

        {/* Top bar */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10
        }}>
          <div style={{
            background: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <button
            onClick={handleDisconnect}
            style={{
              background: '#ef4444',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>

        <div style={{
          maxWidth: '800px',
          margin: '60px auto 0',
          background: 'white',
          borderRadius: '16px',
          padding: '32px'
        }}>
          <h1 style={{
            fontSize: '30px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '24px',
            color: '#9333ea'
          }}>
            Quiz Results! 🎉
          </h1>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              fontSize: '60px',
              fontWeight: 'bold',
              color: '#9333ea',
              marginBottom: '8px'
            }}>
              {score}/{quizQuestions.length}
            </div>
            <div style={{ fontSize: '20px', color: '#6b7280', marginBottom: '16px' }}>
              Score: {percentage.toFixed(0)}%
            </div>
          </div>

          <div style={{
            background: '#d1fae5',
            border: '2px solid #10b981',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>
              ✅ Score saved to Base Sepolia blockchain!
            </p>
            <p style={{ fontSize: '12px', color: '#047857' }}>
              Tx: {displayHash?.slice(0, 10)}...{displayHash?.slice(-8)}
            </p>
            <a 
              href={`https://basescan.org/tx/${displayHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '12px',
                color: '#047857',
                textDecoration: 'underline',
                marginTop: '4px',
                display: 'inline-block'
              }}
            >
              View on BaseScan →
            </a>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Review Answers:
            </h2>
            {quizQuestions.map((q, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === q.correctAnswer;
              
              return (
                <div key={index} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  background: '#f9fafb',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isCorrect ? (
                      <CheckCircle color="#10b981" size={20} />
                    ) : (
                      <XCircle color="#ef4444" size={20} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', marginBottom: '8px' }}>
                        {index + 1}. {q.question}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Your answer: <span style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>
                          {q.options[userAnswer]}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p style={{ fontSize: '14px', color: '#10b981' }}>
                          Correct: {q.options[q.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Restart Quiz Button */}
          <button
            onClick={handleRestartQuiz}
            style={{
              width: '100%',
              background: '#9333ea',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#7c3aed'}
            onMouseOut={(e) => e.currentTarget.style.background = '#9333ea'}
          >
            <RotateCcw size={20} />
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz question screen
  const currentQ = quizQuestions[currentQuestion];
  const hasSelectedAnswer = selectedAnswers[currentQuestion] !== undefined;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #9333ea, #3b82f6)',
      padding: '24px',
      position: 'relative'
    }}>
      <Toaster position="top-center" />

      {/* Top bar */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10
      }}>
        <div style={{
          background: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#10b981',
            borderRadius: '50%'
          }} />
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <button
          onClick={handleDisconnect}
          style={{
            background: '#ef4444',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <LogOut size={16} />
          Disconnect
        </button>
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '60px auto 0',
        background: 'white',
        borderRadius: '16px',
        padding: '32px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px'
          }}>
            <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
            <span>{Math.round((currentQuestion / quizQuestions.length) * 100)}% Complete</span>
          </div>
          <div style={{
            width: '100%',
            background: '#e5e7eb',
            borderRadius: '9999px',
            height: '8px'
          }}>
            <div style={{
              background: '#9333ea',
              height: '8px',
              borderRadius: '9999px',
              width: `${(currentQuestion / quizQuestions.length) * 100}%`,
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '32px',
          color: '#1f2937'
        }}>
          {currentQ.question}
        </h2>

        <div style={{ marginBottom: '32px' }}>
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              style={{
                width: '100%',
                padding: '16px',
                textAlign: 'left',
                borderRadius: '8px',
                border: selectedAnswers[currentQuestion] === index 
                  ? '2px solid #9333ea' 
                  : '2px solid #e5e7eb',
                background: selectedAnswers[currentQuestion] === index 
                  ? '#f3e8ff' 
                  : 'white',
                marginBottom: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: selectedAnswers[currentQuestion] === index 
                    ? '2px solid #9333ea' 
                    : '2px solid #d1d5db',
                  background: selectedAnswers[currentQuestion] === index 
                    ? '#9333ea' 
                    : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedAnswers[currentQuestion] === index && (
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: 'white',
                      borderRadius: '50%'
                    }} />
                  )}
                </div>
                <span style={{ color: '#1f2937' }}>{option}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!hasSelectedAnswer}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '8px',
            fontWeight: '600',
            border: 'none',
            cursor: hasSelectedAnswer ? 'pointer' : 'not-allowed',
            background: hasSelectedAnswer ? '#9333ea' : '#d1d5db',
            color: hasSelectedAnswer ? 'white' : '#6b7280',
            fontSize: '16px',
            transition: 'background 0.2s'
          }}
        >
          {currentQuestion === quizQuestions.length - 1 ? "Complete Quiz" : "Next Question"}
        </button>
      </div>
    </div>
  );
}

export default App;
