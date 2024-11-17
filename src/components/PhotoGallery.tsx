import React, { useEffect, useState, useRef } from 'react';
import { Trash2, ImageOff, Smile, Share2 } from 'lucide-react';
import { photoDB, StoredPhoto } from '../utils/db';
import { emotionDetector } from '../utils/emotionDetection';
import { blockchainStorage } from '../utils/blockchain';

interface PhotoWithEmotion extends StoredPhoto {
  emotion?: string;
}

const PhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoWithEmotion[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showBlockchainFeatures] = useState(blockchainStorage.isAvailable());

  const detectEmotions = async (photos: StoredPhoto[]) => {
    const photosWithEmotions = await Promise.all(
      photos.map(async (photo) => {
        const img = new Image();
        img.src = photo.imageData;
        await new Promise((resolve) => (img.onload = resolve));
        const emotion = await emotionDetector.detectEmotion(img);
        return { ...photo, emotion };
      })
    );
    return photosWithEmotions;
  };

  const loadPhotos = async () => {
    try {
      const loadedPhotos = await photoDB.getAllPhotos();
      const sortedPhotos = loadedPhotos.sort((a, b) => b.timestamp - a.timestamp);
      const photosWithEmotions = await detectEmotions(sortedPhotos);
      setPhotos(photosWithEmotions);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await photoDB.deletePhoto(id);
      await loadPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const shareToBlockchain = async (photo: PhotoWithEmotion) => {
    try {
      const success = await blockchainStorage.storePhotoData(
        photo.imageData,
        photo.emotion || 'unknown',
        photo.timestamp
      );
      if (success) {
        alert('Successfully shared to blockchain!');
      } else {
        alert('Failed to share to blockchain. Please make sure your wallet is connected.');
      }
    } catch (error) {
      console.error('Error sharing to blockchain:', error);
      alert('Error sharing to blockchain. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-4">
        <ImageOff className="w-16 h-16" />
        <p className="text-lg">No photos saved yet. Take your first photo!</p>
      </div>
    );
  }

  return (
    <div className="relative p-4 bg-gray-100 rounded-lg shadow-lg">
      <button
        onClick={() => handleScroll('left')}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 transition duration-300"
      >
        ←
      </button>
      <button
        onClick={() => handleScroll('right')}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 transition duration-300"
      >
        →
      </button>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar gap-6 pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="flex-none w-[300px] snap-center group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={photo.imageData}
                alt={photo.caption}
                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
              <p className="text-white font-semibold truncate">{photo.caption}</p>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Smile className="w-4 h-4" />
                <span>{photo.emotion}</span>
              </div>
              <p className="text-gray-300 text-sm">
                {new Date(photo.timestamp).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              {showBlockchainFeatures && (
                <button
                  onClick={() => shareToBlockchain(photo)}
                  className="p-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-600 transform hover:scale-110"
                  title="Share to blockchain"
                >
                  <Share2 className="w-4 h-4 text-white" />
                </button>
              )}
              <button
                onClick={() => photo.id && handleDelete(photo.id)}
                className="p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 transform hover:scale-110"
                title="Delete photo"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;