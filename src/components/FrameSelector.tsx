import React from 'react';
import { Frame, Sparkles, Square, Circle, Heart } from 'lucide-react';

export interface FrameStyle {
  id: string;
  name: string;
  icon: React.ReactNode;
  style: {
    border?: string;
    corners?: 'round' | 'square' | 'heart';
    color: string;
    decorative?: boolean;
  };
}

const frames: FrameStyle[] = [
  {
    id: 'classic',
    name: 'Classic',
    icon: <Frame className="w-5 h-5" />,
    style: {
      border: '10px solid',
      corners: 'square',
      color: '#ffffff'
    }
  },
  {
    id: 'elegant',
    name: 'Elegant',
    icon: <Circle className="w-5 h-5" />,
    style: {
      border: '15px double',
      corners: 'round',
      color: '#ffd700',
      decorative: true
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    icon: <Square className="w-5 h-5" />,
    style: {
      border: '5px solid',
      corners: 'square',
      color: '#ffffff'
    }
  },
  {
    id: 'romantic',
    name: 'Romantic',
    icon: <Heart className="w-5 h-5" />,
    style: {
      border: '12px solid',
      corners: 'heart',
      color: '#ff69b4',
      decorative: true
    }
  }
];

interface Props {
  selectedFrame: string;
  onSelectFrame: (frameId: string) => void;
}

const FrameSelector: React.FC<Props> = ({ selectedFrame, onSelectFrame }) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-4">
      {frames.map((frame) => (
        <button
          key={frame.id}
          onClick={() => onSelectFrame(frame.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            selectedFrame === frame.id
              ? 'bg-blue-600 text-white scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {frame.icon}
          <span>{frame.name}</span>
          {frame.style.decorative && (
            <Sparkles className="w-4 h-4 text-yellow-400" />
          )}
        </button>
      ))}
    </div>
  );
};

export { frames };
export default FrameSelector;