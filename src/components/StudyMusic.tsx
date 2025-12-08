import React, { useState } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, Radio } from 'lucide-react';

interface MusicStation {
  id: string;
  name: string;
  description: string;
  embedUrl: string;
  thumbnail: string;
}

const musicStations: MusicStation[] = [
  {
    id: 'lofi-1',
    name: 'Lofi Hip Hop Radio',
    description: 'Beats to relax/study to',
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1',
    thumbnail: '🎵'
  },
  {
    id: 'lofi-2',
    name: 'Chillhop Music',
    description: 'Jazzy & lofi hip hop beats',
    embedUrl: 'https://www.youtube.com/embed/5yx6BWlEVcY?autoplay=1',
    thumbnail: '🎧'
  },
  {
    id: 'piano',
    name: 'Peaceful Piano',
    description: 'Relaxing piano music',
    embedUrl: 'https://www.youtube.com/embed/lTRiuFIWV54?autoplay=1',
    thumbnail: '🎹'
  },
  {
    id: 'ambient',
    name: 'Ambient Study Music',
    description: 'Atmospheric background music',
    embedUrl: 'https://www.youtube.com/embed/DWcJFNfaw9c?autoplay=1',
    thumbnail: '🌊'
  },
  {
    id: 'jazz',
    name: 'Smooth Jazz',
    description: 'Relaxing jazz for studying',
    embedUrl: 'https://www.youtube.com/embed/Dx5qFachd3A?autoplay=1',
    thumbnail: '🎷'
  },
  {
    id: 'classical',
    name: 'Classical Study Music',
    description: 'Mozart, Bach, Beethoven',
    embedUrl: 'https://www.youtube.com/embed/jgpJVI3tDbY?autoplay=1',
    thumbnail: '🎻'
  }
];

export const StudyMusic: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<MusicStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handlePlay = (station: MusicStation) => {
    setSelectedStation(station);
    setIsPlaying(true);
  };

  const handleStop = () => {
    setSelectedStation(null);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[40px] font-bold notion-heading leading-tight flex items-center gap-2">
          <Music size={32} />
          Study Music
        </h2>
        <p className="notion-text-secondary text-sm mt-2">Background music untuk fokus belajar</p>
      </div>

      {/* Now Playing */}
      {isPlaying && selectedStation && (
        <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{selectedStation.thumbnail}</div>
              <div>
                <h3 className="text-lg font-semibold notion-heading">{selectedStation.name}</h3>
                <p className="notion-text-secondary text-sm">{selectedStation.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="bg-white/10 hover:bg-white/20 notion-text p-3 rounded-lg transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button
                onClick={handleStop}
                className="bg-red-500 hover:bg-red-600 notion-text px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Stop
              </button>
            </div>
          </div>

          {/* YouTube Embed */}
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={`${selectedStation.embedUrl}&mute=${isMuted ? 1 : 0}`}
              title={selectedStation.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Music Stations Grid */}
      <div>
        <h3 className="text-lg font-semibold notion-heading mb-4 flex items-center gap-2">
          <Radio size={24} />
          Pilih Music Station
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {musicStations.map((station) => (
            <button
              key={station.id}
              onClick={() => handlePlay(station)}
              disabled={isPlaying && selectedStation?.id === station.id}
              className={`notion-card p-6 hover:bg-white/20 transition-all text-left ${
                isPlaying && selectedStation?.id === station.id
                  ? 'ring-2 ring-purple-500'
                  : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{station.thumbnail}</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold notion-text mb-1">{station.name}</h4>
                  <p className="notion-text-secondary text-sm mb-3">{station.description}</p>
                  <div className="flex items-center gap-2 notion-text">
                    {isPlaying && selectedStation?.id === station.id ? (
                      <>
                        <Pause size={16} />
                        <span className="text-sm font-medium">Now Playing</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span className="text-sm font-medium">Play</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-bold notion-text mb-3">💡 Tips Menggunakan Music</h3>
        <ul className="space-y-2 notion-text/80 text-sm">
          <li>• Pilih musik instrumental untuk fokus maksimal</li>
          <li>• Volume 30-40% untuk background yang nyaman</li>
          <li>• Lofi & ambient cocok untuk tugas yang butuh konsentrasi</li>
          <li>• Classical music meningkatkan cognitive performance</li>
          <li>• Gunakan headphone untuk pengalaman terbaik</li>
        </ul>
      </div>
    </div>
  );
};
