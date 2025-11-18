import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function Header() {
    return (
        <header className="bg-mason-green text-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <GraduationCap size={32} className="text-mason-gold" />
                    <h1 className="text-2xl font-bold">Mason Picks</h1>
                </div>
            </div>
        </header>
    );
}
