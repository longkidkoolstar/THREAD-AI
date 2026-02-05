import { useChat } from './hooks/useChat.js';
import { MessageList } from './components/MessageList.js';
import { MessageInput } from './components/MessageInput.js';
import { ModelSelector } from './components/ModelSelector.js';
import { ChatSidebar } from './components/ChatSidebar.js';
import { Bot, Sparkles } from 'lucide-react';

function App() {
  const { 
      messages, 
      isLoading, 
      sendMessage, 
      currentModel, 
      setCurrentModel,
      chats,
      currentChatId,
      createNewChat,
      deleteChat,
      selectChat
  } = useChat();

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <ChatSidebar 
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={selectChat}
          onDeleteChat={deleteChat}
          onNewChat={createNewChat}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900/50 bg-zinc-950/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-25"></div>
                    <div className="relative bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                        <Bot className="w-6 h-6 text-blue-400" />
                    </div>
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-zinc-100">THREAD AI</h1>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">Professional Assistant</p>
                </div>
            </div>
            <ModelSelector currentModel={currentModel} onSelect={setCurrentModel} />
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-hidden relative flex flex-col w-full max-w-5xl mx-auto">
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-8 w-full">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-6">
                        <div className="p-4 rounded-full bg-zinc-900/50 border border-zinc-800/50">
                            <Sparkles className="w-12 h-12 text-zinc-700" />
                        </div>
                        <div className="text-center space-y-2 max-w-md">
                            <h2 className="text-xl font-medium text-zinc-300">How can I help you today?</h2>
                            <p className="text-sm text-zinc-500">I can analyze documents, write code, and reason through complex problems.</p>
                        </div>
                    </div>
                ) : (
                    <MessageList messages={messages} isLoading={isLoading} />
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-transparent">
                <div className="max-w-4xl mx-auto">
                    <MessageInput onSend={sendMessage} disabled={isLoading} />
                    <p className="text-center text-xs text-zinc-600 mt-3">
                        AI can make mistakes. Please verify important information.
                    </p>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}

export default App;
