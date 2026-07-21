import React, { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, DecodeHintType } from "@zxing/library";
import { Camera, SwitchCamera, VideoOff, CheckCircle2, AlertTriangle } from "lucide-react";

interface BarcodeCameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export function BarcodeCameraScanner({ onScanSuccess }: BarcodeCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
  
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize ZXing reader
  useEffect(() => {
    // Suppress ZXing library's annoying NotFoundException console spam
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('non-ReaderException from reader')) {
        return;
      }
      originalConsoleWarn(...args);
    };

    const hints = new Map();
    const formats = [
      0, // Aztec
      1, // CODABAR
      2, // CODE_39
      3, // CODE_93
      4, // CODE_128
      5, // DATA_MATRIX
      6, // EAN_8
      7, // EAN_13
      8, // ITF
      9, // MAXICODE
      10, // PDF_417
      11, // QR_CODE
      12, // RSS_14
      13, // RSS_EXPANDED
      14, // UPC_A
      15, // UPC_E
      16, // UPC_EAN_EXTENSION
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    codeReaderRef.current = new BrowserMultiFormatReader(hints);

    // List cameras
    codeReaderRef.current.listVideoInputDevices().then((videoInputDevices) => {
      setVideoInputDevices(videoInputDevices);
      if (videoInputDevices.length > 0) {
        // Default to back camera if available, else first
        const backCamera = videoInputDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
        setCurrentDeviceId(backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId);
      }
    }).catch(err => {
      console.error("Error listing devices", err);
    });

    return () => {
      stopCamera();
      console.warn = originalConsoleWarn;
    };
  }, []);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz beep
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1); // 100ms duration
    } catch (e) {
      console.error("Audio Context error", e);
    }
  };

  const startCamera = async () => {
    if (!codeReaderRef.current || !videoRef.current) return;
    
    setHasPermissionError(false);
    setCameraError("");
    setIsScanning(true);

    try {
      await codeReaderRef.current.decodeFromVideoDevice(
        currentDeviceId || undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            // Success decoding
            if (!debounceTimerRef.current) {
              const text = result.getText();
              
              // 1. Trigger beep
              playBeep();
              
              // 2. Show toast
              setShowSuccessToast(true);
              if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
              toastTimerRef.current = setTimeout(() => setShowSuccessToast(false), 2000);
              
              // 3. Callback
              onScanSuccess(text);
              
              // 4. Debounce (prevent spamming for 2 seconds)
              debounceTimerRef.current = setTimeout(() => {
                debounceTimerRef.current = null;
              }, 2000);
            }
          }
          if (err && err.name !== 'NotFoundException') {
            // ZXing constantly throws NotFoundException while scanning, ignore it
            // console.debug(err);
          }
        }
      );
    } catch (error: any) {
      console.error("Camera access error:", error);
      setIsScanning(false);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setHasPermissionError(true);
      } else if (error.name === 'NotFoundError') {
        setCameraError("Không tìm thấy thiết bị camera trên máy của bạn.");
      } else {
        setCameraError("Lỗi không xác định khi mở camera. Vui lòng thử lại.");
      }
    }
  };

  const stopCamera = useCallback(() => {
    setIsScanning(false);
    
    // Stop ZXing decode loop
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    
    // Hard stop all tracks to ensure camera light turns off
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const switchCamera = () => {
    if (videoInputDevices.length > 1) {
      const currentIndex = videoInputDevices.findIndex(d => d.deviceId === currentDeviceId);
      const nextIndex = (currentIndex + 1) % videoInputDevices.length;
      setCurrentDeviceId(videoInputDevices[nextIndex].deviceId);
      
      // If currently scanning, restart with new camera
      if (isScanning) {
        stopCamera();
        setTimeout(() => startCamera(), 100);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden relative border border-[#E2E8F0]">
      {/* Viewport Area */}
      <div className="relative flex-1 min-h-[160px] bg-[#1E293B] overflow-hidden flex items-center justify-center">
        
        {/* Video Feed */}
        <video 
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${!isScanning ? 'opacity-0' : 'opacity-100'}`}
          muted
          playsInline
        />

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#D1FAE5] text-[#15803D] border border-[#34D399] px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 size={16} />
            <span className="text-xs font-black uppercase tracking-wider">Đã quét thành công</span>
          </div>
        )}

        {/* Viewfinder Overlay */}
        {isScanning && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="relative w-[92%] h-[85%] border-2 border-[#15803D] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#34D399] rounded-tl-xl -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#34D399] rounded-tr-xl -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#34D399] rounded-bl-xl -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#34D399] rounded-br-xl -mb-1 -mr-1"></div>
              
              {/* Animated Laser Line */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-[#34D399] shadow-[0_0_8px_2px_rgba(52,211,153,0.6)] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        )}

        {/* CSS for scanning animation */}
        <style>{`
          @keyframes scan {
            0% { top: 5%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 95%; opacity: 0; }
          }
        `}</style>

        {/* Placeholder / Error States */}
        {!isScanning && !hasPermissionError && !cameraError && (
          <div className="text-center p-4">
            <Camera size={40} className="mx-auto text-[#64748B] mb-2 opacity-50" />
            <p className="text-sm font-bold text-[#94A3B8]">Camera đang tắt</p>
          </div>
        )}

        {hasPermissionError && (
          <div className="absolute inset-0 bg-[#FEF2F2] flex flex-col items-center justify-center p-4 text-center z-20">
            <AlertTriangle size={24} className="text-[#EF4444] mb-2" />
            <h4 className="text-xs font-black text-[#991B1B] mb-1">Cần quyền truy cập Camera</h4>
            <p className="text-[10px] font-semibold text-[#DC2626]">
              Vui lòng cho phép trình duyệt truy cập camera trong cài đặt và tải lại trang.
            </p>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 bg-[#FEF2F2] flex flex-col items-center justify-center p-4 text-center z-20">
            <AlertTriangle size={24} className="text-[#EF4444] mb-2" />
            <h4 className="text-xs font-black text-[#991B1B] mb-1">Lỗi Camera</h4>
            <p className="text-[10px] font-semibold text-[#DC2626]">{cameraError}</p>
          </div>
        )}
      </div>

      {/* Control Dashboard */}
      <div className="shrink-0 h-12 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between px-2 gap-2">
        {!isScanning ? (
          <button 
            onClick={startCamera}
            className="flex-1 h-8 flex items-center justify-center gap-2 bg-[#D1FAE5] text-[#15803D] hover:bg-[#A7F3D0] rounded-xl text-xs font-black transition-colors shadow-sm border border-[#34D399]/50"
          >
            <Camera size={14} />
            Mở camera
          </button>
        ) : (
          <button 
            onClick={stopCamera}
            className="flex-1 h-8 flex items-center justify-center gap-2 bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FECACA] rounded-xl text-xs font-black transition-colors shadow-sm border border-[#FCA5A5]/50"
          >
            <VideoOff size={14} />
            Tắt camera
          </button>
        )}
        
        {videoInputDevices.length > 1 && (
          <button 
            onClick={switchCamera}
            className="w-10 h-8 flex items-center justify-center bg-white text-[#64748B] hover:text-[#15803D] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl transition-colors shadow-sm"
            title="Đổi camera"
          >
            <SwitchCamera size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
