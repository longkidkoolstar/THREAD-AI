import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Box, Check } from 'lucide-react';
import { models } from '../../models/index.js';

interface Props {
    currentModel: string;
    onSelect: (model: string) => void;
}

export const ModelSelector: React.FC<Props> = ({ currentModel, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedModel = models.find(m => m.id === currentModel);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative group" ref={dropdownRef}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-200"></div>
            
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors pl-3 pr-10 py-2 w-48 text-left focus:outline-none"
            >
                <Box className="w-4 h-4 text-zinc-500 mr-2 flex-shrink-0" />
                <span className="text-zinc-300 text-sm font-medium truncate block">
                    {selectedModel ? selectedModel.name : 'Select Model'}
                </span>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onSelect(model.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                    currentModel === model.id
                                        ? 'bg-zinc-800 text-zinc-100'
                                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                                }`}
                            >
                                <span className="font-medium">{model.name}</span>
                                {currentModel === model.id && (
                                    <Check className="w-3.5 h-3.5 text-blue-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
