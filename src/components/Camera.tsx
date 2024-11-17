import React, { useRef, useState, useCallback } from 'react';
import { Camera, Download, Repeat, Type, Image } from 'lucide-react';
import { photoDB } from '../utils/db';
import FrameSelector, { frames, FrameStyle } from './FrameSelector';

const CameraComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState('classic');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const applyFrame = (context: CanvasRenderingContext2D, frame: FrameStyle['style']) => {
    const width = context.canvas.width;
    const height = context.canvas.height;
    
    context.strokeStyle = frame.color;
    context.lineWidth = parseInt(frame.border?.split('px')[0] || '10');
    
    if (frame.corners === 'round') {
      const radius = 30;
      context.beginPath();
      context.moveTo(0, radius);
      context.arcTo(0, 0, radius, 0, radius);
      context.lineTo(width - radius, 0);
      context.arcTo(width, 0, width, radius, radius);
      context.lineTo(width, height - radius);
      context.arcTo(width, height, width - radius, height, radius);
      context.lineTo(radius, height);
      context.arcTo(0, height, 0, height - radius, radius);
      context.closePath();
      context.stroke();
    } else if (frame.corners === 'heart') {
      context.beginPath();
      const x = width / 2, y = height / 2;
      const size = Math.min(width, height) * 0.4;
      
      context.moveTo(x, y + size * 0.7);
      context.bezierCurveTo(x + size, y + size, x + size, y - size * 0.5, x, y - size * 0.5);
      context.bezierCurveTo(x - size, y - size * 0.5, x - size, y + size, x, y + size * 0.7);
      context.stroke();
    } else {
      context.strokeRect(0, 0, width, height);
    }

    if (frame.decorative) {
      const cornerSize = 20;
      [[cornerSize, cornerSize], [width - cornerSize, cornerSize], 
       [cornerSize, height - cornerSize], [width - cornerSize, height - cornerSize]].forEach(([x, y]) => {
        context.beginPath();
        context.arc(x, y, cornerSize/2, 0, 2 * Math.PI);
        context.fillStyle = frame.color;
        context.fill();
      });
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        
        const selectedFrameStyle = frames.find(f => f.id === selectedFrame)?.style;
        if (selectedFrameStyle) {
          applyFrame(context, selectedFrameStyle);
        }

        if (caption) {
          context.font = 'bold 24px sans-serif';
          context.textAlign = 'center';
          context.fillStyle = selectedFrameStyle?.color || '#ffffff';
          context.fillText(caption, 320, 450);
        }

        setPhoto(canvasRef.current.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const savePhoto = async () => {
    if (photo) {
      setSaving(true);
      try {
        await photoDB.savePhoto({
          imageData: photo,
          caption,
          timestamp: Date.now(),
        });
        setPhoto(null);
        setCaption('');
      } catch (error) {
        console.error('Error saving photo:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const retake = () => {
    setPhoto(null);
    startCamera();
  };

  const downloadPhoto = () => {
    if (photo) {
      const link = document.createElement('a');
      link.download = `framed-photo-${Date.now()}.jpg`;
      link.href = photo;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-2xl mx-auto">
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Choose Your Frame</h3>
        <FrameSelector selectedFrame={selectedFrame} onSelectFrame={setSelectedFrame} />
      </div>

      <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden shadow-xl">
        {!photo ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onLoadedMetadata={() => videoRef.current?.play()}
            />
            {!stream && (
              <button
                onClick={startCamera}
                className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 text-white gap-4 hover:bg-gray-900/60 transition-colors"
              >
                <Camera className="w-16 h-16" />
                <span className="text-xl font-medium">Start Camera</span>
              </button>
            )}
          </>
        ) : (
          <img src={photo} alt="Captured" className="w-full h-full object-cover" />
        )}
      </div>

      <canvas ref={canvasRef} width="640" height="480" className="hidden" />

      <div className="w-full space-y-4">
        <div className="relative">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add your caption..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
          />
          <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <div className="flex justify-center gap-4">
          {!photo ? (
            stream && (
              <button
                onClick={takePhoto}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Camera className="w-5 h-5" />
                <span>Take Photo</span>
              </button>
            )
          ) : (
            <>
              <button
                onClick={retake}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                <Repeat className="w-5 h-5" />
                <span>Retake</span>
              </button>
              <button
                onClick={savePhoto}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Photo'}</span>
              </button>
              <button
                onClick={downloadPhoto}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>Download</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraComponent;