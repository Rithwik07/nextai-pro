// src/app/components/ChatWindow.js
"use client"; // THIS MUST BE THE ABSOLUTE FIRST LINE OF THE FILE.
              // No comments, no blank lines, no hidden characters whatsoever before this line.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import { motion, AnimatePresence } from 'framer-motion';

// --- Helper for Silent Actions ---
const executeSilentAction = async (actionType, content) => {
  console.log(`Attempting to execute silent action: ${actionType} with content: "${content}"`);
  let successMessage = `Action "${actionType}" completed.`;
  let errorMessage = `Action "${actionType}" failed.`;
  try {
    switch (actionType) {
      case 'copy_text':
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(content);
          successMessage = `Text copied to clipboard.`;
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = content;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
          successMessage = `Text copied to clipboard (fallback).`;
        }
        break;
      case 'open_url':
        if (content && (content.startsWith('http://') || content.startsWith('https://'))) {
          window.open(content, '_blank');
          successMessage = `Opened URL: ${content}`;
        } else {
          errorMessage = `Invalid URL provided for open_url: "${content}"`;
          throw new Error(errorMessage);
        }
        break;
      default:
        errorMessage = `Unknown action type: "${actionType}"`;
        throw new Error(errorMessage);
    }
    return { status: 'success', message: successMessage };
  } catch (error) {
    console.error(`Error executing action "${actionType}":`, error);
    return { status: 'error', message: errorMessage };
  }
};


// --- ChatWindow Component ---
export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // New state for selected image

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const nextMessageId = useRef(0);
  const pressedKeys = useRef(new Set());
  const utteranceRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for file input element


  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // Initialize and manage Web Speech Recognition API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        console.log('Voice recognition started...');
        setMessages((prevMessages) => [...prevMessages, { id: nextMessageId.current++, text: "Listening...", sender: "system" }]);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setInputMessage(transcript);
        console.log('Recognized:', transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setMessages((prevMessages) => prevMessages.filter(msg => !(msg.sender === 'system' && msg.text === 'Listening...')));
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
            console.log('No speech detected.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        console.log('Voice recognition ended.');
        setMessages((prevMessages) => prevMessages.filter(msg => !(msg.sender === 'system' && msg.text === 'Listening...')));
      };
    } else {
      console.warn('Web Speech API (webkitSpeechRecognition) not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);


  // Function to speak AI response text
  const speakResponse = useCallback((text) => {
    if (isSpeakerMuted) {
      console.log('DEBUG: Speech synthesis is muted, not speaking.');
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis || !text) {
      console.warn('SpeechSynthesis not supported or no text to speak.');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.pitch = 1;
    utteranceRef.current.rate = 1.1;

    utteranceRef.current.onend = () => {
      console.log('Speech synthesis ended.');
      utteranceRef.current = null;
    };

    utteranceRef.current.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      utteranceRef.current = null;
    };

    window.speechSynthesis.speak(utteranceRef.current);
    console.log('DEBUG: Speaking response:', text);
  }, [isSpeakerMuted]);


  // Handle sending messages to the AI
  const handleSendMessage = async (messageToSend = inputMessage) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // Require either text or an image
    if (messageToSend.trim() === '' && !selectedImage) {
      return;
    }

    const userMessage = {
      id: nextMessageId.current++,
      text: messageToSend,
      sender: 'user',
      image: selectedImage // Include selected image data
    };

    setMessages((prevMessages) => {
        const filteredMessages = prevMessages.filter(msg => !(msg.sender === 'system' && msg.text === 'Listening...'));
        return [...filteredMessages, userMessage];
    });
    setInputMessage('');
    setSelectedImage(null); // Clear selected image after sending
    setIsLoading(true);

    let currentAIResponseText = '';
    let currentAIResponseId = nextMessageId.current++;

    setMessages((prevMessages) => [...prevMessages, { id: currentAIResponseId, text: '', sender: 'ai' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send messages array, and selectedImage if available
        body: JSON.stringify({
          messages: [...messages, userMessage],
          image: selectedImage // Pass the base64 image here
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(`HTTP error! status: ${response.status} - ${errorBody ? JSON.stringify(errorBody) : response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let toolCallDetected = false;

      while (true) {
        const { value, done } = await reader.read();
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        let lastNewlineIndex;
        while ((lastNewlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.substring(0, lastNewlineIndex).trim();
          buffer = buffer.substring(lastNewlineIndex + 1);

          if (line === '') continue;

          try {
            const parsedData = JSON.parse(line);

            if (parsedData.type === 'tool_call') {
              console.log('Gemini requested tool call:', parsedData.data);
              const { action_type, content } = parsedData.data.args;

              const actionResult = await executeSilentAction(action_type, content);
              toolCallDetected = true;

              setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== currentAIResponseId));
              setMessages((prevMessages) => [...prevMessages, {
                id: nextMessageId.current++,
                text: actionResult.message,
                sender: 'system'
              }]);
              reader.cancel();
              break;
            } else if (parsedData.type === 'text' && !toolCallDetected) {
              setMessages((prevMessages) => {
                const updatedMessages = prevMessages.map((msg) =>
                  msg.id === currentAIResponseId ? { ...msg, text: msg.text + parsedData.data } : msg
                );
                currentAIResponseText = updatedMessages.find(msg => msg.id === currentAIResponseId)?.text || '';
                return updatedMessages;
              });
            }
          } catch (parseError) {
            console.error('Error parsing streaming JSON chunk:', parseError, 'Line:', line);
          }
        }

        if (done) {
          if (currentAIResponseText && !toolCallDetected) {
              speakResponse(currentAIResponseText);
          }
          break;
        }

        if (toolCallDetected) {
            reader.cancel();
            break;
        }
      }

    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage = { id: nextMessageId.current++, text: 'Oops! Something went wrong. Please try again.', sender: 'ai' };
      setMessages((prevMessages) => {
          const filteredMessages = prevMessages.filter(msg => msg.id !== currentAIResponseId);
          return [...filteredMessages, errorMessage];
      });
      speakResponse(errorMessage.text);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard input (e.g., Enter key for sending)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isListening) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  // Toggle speech recognition on/off
  const toggleListening = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputMessage('');
      setSelectedImage(null); // Clear image if starting voice input
      recognitionRef.current.start();
    }
  };

  // Hotkey Logic (Ctrl + Space)
  useEffect(() => {
    const handleKeyDown = (event) => {
      pressedKeys.current.add(event.key.toLowerCase());

      const isCtrlPressed = pressedKeys.current.has('control');
      const isSpacePressed = pressedKeys.current.has(' ');

      if (isCtrlPressed && isSpacePressed && !isListening && !isLoading) {
        event.preventDefault();
        toggleListening();
        console.log('DEBUG: Hotkey (Ctrl + Space) pressed. Toggling listening.');
      }
    };

    const handleKeyUp = (event) => {
      pressedKeys.current.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, isLoading, toggleListening]);


  // Speaker mute toggle function
  const toggleSpeakerMute = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakerMuted(prev => !prev);
    console.log('DEBUG: Speaker muted toggled to:', !isSpeakerMuted);
  };

  // Clear chat history
  const clearChat = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setMessages([]);
    setInputMessage('');
    setSelectedImage(null); // Clear any selected image
    setIsLoading(false);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isListening]);


  // Handle image file selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result); // Store as Base64 string
        setInputMessage(prev => prev === '' ? 'Describe this image.' : prev); // Optional: Pre-fill input
      };
      reader.readAsDataURL(file); // Convert file to Base64
    } else {
      setSelectedImage(null);
    }
  };


  return (
    <motion.div
      className="card shadow-lg"
      style={{ width: '100%', maxWidth: '768px', height: '80vh', display: 'flex', flexDirection: 'column' }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header with Clear Chat Button and Speaker Mute */}
      <div className="card-header d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0">NextAI Pro Chat</h5>
        <div className="d-flex align-items-center">
          {/* Speaker Mute Button */}
          <motion.button
            onClick={toggleSpeakerMute}
            className={`btn btn-sm me-2 ${isSpeakerMuted ? 'btn-secondary' : 'btn-outline-secondary'}`}
            title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {isSpeakerMuted ? (
              <i className="bi bi-volume-mute-fill"></i>
            ) : (
              <i className="bi bi-volume-up-fill"></i>
            )}
          </motion.button>

          {/* Clear Chat Button */}
          <motion.button
            onClick={clearChat}
            className="btn btn-danger btn-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Clear Chat
          </motion.button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="card-body overflow-auto flex-grow-1 p-3 bg-light-subtle">
        <AnimatePresence>
          {messages.length === 0 && !isLoading && !selectedImage ? (
            <motion.div
              className="text-center text-muted py-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Start a conversation with NextAI Pro!
            </motion.div>
          ) : (
            messages.map((msg, index) => (
              <MessageBubble key={String(msg.id !== undefined && msg.id !== null ? msg.id : index)} message={msg.text} sender={msg.sender} image={msg.image} />
            ))
          )}

          {/* Conditional Loading Spinner */}
          {isLoading && (
            <motion.div
              key="loading-spinner"
              className="d-flex justify-content-start mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-light text-dark rounded py-2 px-3 d-inline-flex align-items-center" style={{ maxWidth: '75%' }}>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                AI is thinking...
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {/* Image preview (optional) */}
      {selectedImage && (
          <div className="card-footer p-2 border-top bg-light-subtle d-flex align-items-center">
              <img src={selectedImage} alt="Selected Preview" className="img-thumbnail me-2" style={{ maxHeight: '80px', maxWidth: '80px', objectFit: 'cover' }} />
              <span className="text-muted small">Image ready. Ask a question!</span>
              <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => setSelectedImage(null)} title="Remove Image">
                  <i className="bi bi-x-lg"></i>
              </button>
          </div>
      )}


      {/* Message Input and Send Button */}
      <div className="card-footer d-flex align-items-center p-3">
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageChange}
          disabled={isLoading || isListening}
        />
        {/* Upload Image Button */}
        <motion.button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-outline-secondary me-2"
          disabled={isLoading || isListening || selectedImage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          title="Upload Image"
        >
          <i className="bi bi-image-fill"></i>
        </motion.button>

        <textarea
          className="form-control me-2"
          rows="1"
          placeholder={isListening ? 'Speak now...' : 'Type your message or ask about the image...'}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          style={{ resize: 'none', overflowY: 'hidden' }}
        ></textarea>
        <motion.button
          onClick={toggleListening}
          className={`btn btn-outline-primary me-2 ${isListening ? 'btn-danger' : ''}`}
          disabled={isLoading || selectedImage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          title={isListening ? 'Stop Listening (Ctrl+Space)' : 'Start Voice Input (Ctrl+Space)'}
        >
          {isListening ? (
            <i className="bi bi-mic-mute-fill"></i>
          ) : (
            <i className="bi bi-mic-fill"></i>
          )}
        </motion.button>
        <motion.button
          onClick={() => handleSendMessage()}
          className="btn btn-primary"
          disabled={isLoading || (inputMessage.trim() === '' && !selectedImage)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          title="Send Message"
        >
          <i className="bi bi-send-fill"></i>
        </motion.button>
      </div>
    </motion.div>
  );
}