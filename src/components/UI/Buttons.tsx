import { useState, useRef } from 'react';

interface DebugButtonProps {
  debugMode: boolean;
  onClick: () => void;
}

export const DebugButton = ({ debugMode, onClick }: DebugButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        lineHeight: '1',
        padding: '10px 18px',
        backgroundColor: debugMode ? '#FFD700' : isHovered ? 'rgba(255,215,0,0.1)' : 'transparent',
        border: `2px solid ${debugMode ? '#FFD700' : 'rgba(255,215,0,0.3)'}`,
        borderRadius: '8px',
        color: debugMode ? '#000' : '#FFD700',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        outline: 'none',
      }}>
      {debugMode ? 'Debug On' : 'Debug'}
    </button>
  );
};

interface AddPhotoButtonProps {
  onPhotosAdded: (files: FileList) => void;
  photoCount: number;
}

export const AddPhotoButton = ({ onPhotosAdded, photoCount }: AddPhotoButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onPhotosAdded(files);
    }
    // Reset input để có thể chọn lại cùng file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          lineHeight: '1',
          padding: '10px 18px',
          backgroundColor: isHovered ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
          border: '2px solid rgba(76, 175, 80, 0.5)',
          borderRadius: '8px',
          color: '#4CAF50',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
        <span>Photos</span>
        {photoCount > 0 && (
          <span style={{
            backgroundColor: 'rgba(76, 175, 80, 0.3)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
          }}>
            {photoCount}
          </span>
        )}
      </button>
    </>
  );
};

interface StatusTextProps {
  aiStatus: string;
}

export const StatusText = ({ aiStatus }: StatusTextProps) => {
  const hasError = aiStatus.includes('ERROR');
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: hasError ? '#ff4757' : 'rgba(255,215,0,0.8)',
        fontSize: '11px',
        fontWeight: '500',
        zIndex: 10,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        padding: '8px 16px',
        borderRadius: '20px',
        border: `1px solid ${hasError ? 'rgba(255,71,87,0.3)' : 'rgba(255,215,0,0.2)'}`,
      }}>
      {aiStatus}
    </div>
  );
};

