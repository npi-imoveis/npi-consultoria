'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { X, Play, Pause } from 'lucide-react';

export function MusicPlayer() {
    const { isOpen, isPlaying, close, play, pause } = usePlayerStore();
    const audioRef = useRef(null);

    useEffect(() => {
        if (isPlaying) {
            if (!audioRef.current) {
                const audio = new Audio('/assets/audio/music.mp3'); // coloque seu mp3 na public/
                audio.loop = true;
                audioRef.current = audio;
            }
            audioRef.current?.play();
        } else {
            audioRef.current?.pause();
        }
    }, [isPlaying]);

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-5 left-5 z-[9999] bg-white/90 shadow-lg p-2 rounded-full flex items-center gap-4">
            {!isPlaying && (
                <button onClick={() => play()} className="text-gray-800">
                    <Play size={24} />
                </button>
            )}
            {isPlaying && (
                <button onClick={() => pause()} className="text-gray-800">
                    <Pause size={24} />
                </button>
            )}
            <button onClick={close} className="text-red-500">
                <X size={24} />
            </button>
        </div>
    );
};

