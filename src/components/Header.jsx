import React, { useState, useEffect } from 'react';
import { GraduationCap, Moon, Sun } from 'lucide-react';

export default function Header() {
    const [dark, setDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mason-picks-dark');
            if (stored !== null) return stored === 'true';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('mason-picks-dark', dark.toString());
    }, [dark]);

    return (
        <header className="bg-mason-green dark:bg-[#004d26] text-white shadow-md transition-colors">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <GraduationCap size={32} className="text-mason-gold" />
                    <h1 className="text-2xl font-bold">Mason Picks</h1>
                </div>
                <button
                    onClick={() => setDark(d => !d)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                    aria-label="Toggle dark mode"
                >
                    {dark ? <Sun size={20} className="text-mason-gold" /> : <Moon size={20} className="text-white/80" />}
                </button>
            </div>
        </header>
    );
}
