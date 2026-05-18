import React, { useState } from 'react';
import { agentChat } from '../services/api';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await agentChat(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: res.data.message }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="chat-fab" aria-label="Open hotel assistant">
        AI
      </button>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <strong>Hotel Assistant</strong>
        <button onClick={() => setOpen(false)} className="btn btn-ghost" aria-label="Close chat">
          X
        </button>
      </div>

      <div className="chat-body">
        {messages.length === 0 && (
          <p className="muted" style={{ textAlign: 'center', marginTop: 48 }}>
            Ask me to find or book a hotel.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role}`}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant muted">
            Thinking...
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="input"
        />
        <button onClick={sendMessage} disabled={loading} className="btn btn-primary">Send</button>
      </div>
    </div>
  );
}
