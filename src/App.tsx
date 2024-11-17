import React from 'react';
import { Camera as CameraIcon, Image } from 'lucide-react';
import CameraComponent from './components/Camera';
import PhotoGallery from './components/PhotoGallery';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full backdrop-blur-sm mb-6">
            <div className="flex items-center justify-center space-x-3">
              <CameraIcon className="w-8 h-8 text-white" />
              <Image className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Photo Frame Creator
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Capture moments, add beautiful frames, and create lasting memories
          </p>
        </header>

        <main className="space-y-12 max-w-6xl mx-auto">
          <section className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-8 text-gray-800">
              Create Your Photo
            </h2>
            <CameraComponent />
          </section>

          <section className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-8 text-gray-800">
              Your Photo Gallery
            </h2>
            <PhotoGallery />
          </section>
        </main>

        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>Created with ❤️ using React and modern web technologies</p>
        </footer>
      </div>
    </div>
  );
}

export default App;