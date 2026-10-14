import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onScanError, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize the scanner
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      /* verbose= */ false
    );

    html5QrcodeScanner.render(
      (decodedText, decodedResult) => {
        // Stop scanning after success to prevent multiple callbacks
        html5QrcodeScanner.clear().catch(console.error);
        onScanSuccess(decodedText, decodedResult);
      },
      (errorMessage) => {
        if (onScanError) {
          onScanError(errorMessage);
        }
      }
    );

    // Cleanup on unmount
    return () => {
      html5QrcodeScanner.clear().catch(console.error);
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="modal-content card" style={{
        backgroundColor: 'var(--bg-primary)', padding: '24px', 
        borderRadius: '12px', width: '100%', maxWidth: '400px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3>Scan QR Code</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)'
          }}>×</button>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div id="reader" ref={scannerRef} style={{ width: '100%' }}></div>
        
        <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)' }}>
          Point your camera at a Wallet QR code to instantly transfer funds.
        </p>
      </div>
    </div>
  );
}
