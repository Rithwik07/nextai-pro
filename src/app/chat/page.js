// src/app/chat/page.js
// This file does NOT need "use client"; because it only renders a client component.
import ChatWindow from '../components/ChatWindow'; // Corrected path based on your structure

export default function ChatPage() {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
      <ChatWindow />
    </div>
  );
}
