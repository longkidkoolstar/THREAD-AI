import { X } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    autoSendEnabled: boolean;
    setAutoSendEnabled: (enabled: boolean) => void;
}

export function SettingsModal({ isOpen, onClose, autoSendEnabled, setAutoSendEnabled }: SettingsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-zinc-100">Settings</h3>
                    <button 
                        onClick={onClose}
                        className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-zinc-200">Auto-send on Complete</h4>
                            <p className="text-xs text-zinc-500">
                                Automatically send queued messages when generation finishes
                            </p>
                        </div>
                        <button 
                            onClick={() => setAutoSendEnabled(!autoSendEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                                autoSendEnabled ? 'bg-blue-600' : 'bg-zinc-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    autoSendEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
