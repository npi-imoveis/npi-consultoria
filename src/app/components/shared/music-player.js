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
        <div className="fixed bottom-20 right-5 z-[9999] bg-black/50 shadow-lg py-2 px-4 rounded-full flex items-center gap-2">
            {!isPlaying && (
                <button onClick={() => play()} className="text-white">
                    <Play size={18} />
                </button>
            )}
            {isPlaying && (
                <button onClick={() => pause()} className="text-white">
                    <Pause size={18} />
                </button>
            )}
            {/* <button onClick={close} className="text-white">
                <X size={18} />
            </button> */}
        </div>
    );
};

