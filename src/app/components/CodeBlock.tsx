import React, { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
    language: string;
    value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${language || 'txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="relative group rounded-lg overflow-hidden my-4 border border-zinc-700 bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
                <span className="text-xs text-zinc-400 font-mono lowercase">{language || 'text'}</span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleDownload}
                        className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-700/50 transition-colors"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-green-400">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                wrapLines={true}
                wrapLongLines={true}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};
