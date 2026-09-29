import React, { useState, useEffect } from 'react';
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

    return <header className="site-header"><a className="skip-link" href="#main-content">Skip to course search</a><div className="page-width header-inner"><a className="wordmark" href="/" aria-label="Mason Picks home"><img className="official-mark" src="/mason-official.png" alt="George Mason University" />Mason Picks</a><div className="header-right"><button className="icon-button" onClick={() => setDark(d => !d)} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button></div></div></header>;
}
