import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-black text-gray-400 py-6 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <p className="mb-2">Data provided by George Mason University via FOIA.</p>
                <p className="text-sm">Not officially affiliated with GMU. <a href="https://github.com/NoUsernameAvailiable/Mason-Picks" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">View on GitHub</a></p>
            </div>
        </footer>
    );
}
