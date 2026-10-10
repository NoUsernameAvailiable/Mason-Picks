import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import { Moon, Sun } from 'lucide-react';

export default function Header() {
    const [dark, setDark] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('mason-picks-charcoal-theme');
                if (stored !== null) return stored === 'true';
            } catch { /* Use the system theme when storage is unavailable. */ }
            return true;
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
        try { localStorage.setItem('mason-picks-charcoal-theme', dark.toString()); } catch { /* Theme still works for this session. */ }
    }, [dark]);

    return (
        <header className="site-header">
            <a className="skip-link" href="#main-content">Skip to course search</a>
            <div className="page-width header-inner">
                <a className="wordmark" href="/" aria-label="Mason Picks home">
                    <img className="official-mark" src="/mason-official.png" alt="George Mason University" />
                    Mason Picks
                </a>
                <div className="header-right">
                    <button className="icon-button" onClick={() => setDark(d => !d)} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
                        <AnimatePresence mode="wait" initial={false}>
                            <Motion.span
                                key={dark ? 'dark' : 'light'}
                                initial={{ rotate: -50, scale: 0.6, opacity: 0 }}
                                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                exit={{ rotate: 50, scale: 0.6, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                style={{ display: 'inline-flex' }}
                            >
                                {dark ? <Sun size={19} /> : <Moon size={19} />}
                            </Motion.span>
                        </AnimatePresence>
                    </button>
                </div>
            </div>
        </header>
    );
}
