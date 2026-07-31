import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, FiSmile, FiPaperclip, FiMic, FiImage, FiX, 
  FiZap, FiCheckCircle, FiFileText
} from 'react-icons/fi';
import { AI_QUICK_REPLIES } from '../../constants/chatData';

const EMOJI_LIST = ['😊', '👍', '🔥', '❤️', '🤝', '🙌', '💯', '💰', '📍', '🚀', '✅', '📦', '📱', '💬', '⭐'];

const MessageComposer = ({ onSendMessage, isBlocked }) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle Quick AI Chip Click
  const handleChipClick = (chipText) => {
    onSendMessage({
      type: 'text',
      text: chipText
    });
  };

  // Image File Upload handling
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setSelectedImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice recording toggle
  const toggleVoiceRecording = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingTimerRef.current);
      setIsRecordingVoice(false);
      // Send simulated voice note
      onSendMessage({
        type: 'text',
        text: `🎤 Voice Note (${recordingSeconds || 3}s)`
      });
      setRecordingSeconds(0);
    }
  };

  // Submit Message
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isBlocked) return;

    if (imagePreview) {
      onSendMessage({
        type: 'image',
        imageUrl: imagePreview,
        text: inputText.trim()
      });
      setImagePreview(null);
      setSelectedImage(null);
      setInputText('');
      return;
    }

    if (inputText.trim()) {
      onSendMessage({
        type: 'text',
        text: inputText.trim()
      });
      setInputText('');
      setShowEmojiPicker(false);
    }
  };

  if (isBlocked) {
    return (
      <div className="p-4 bg-red-500/10 border-t border-red-500/20 text-center">
        <p className="text-xs font-semibold text-red-500">
          You have blocked this user. Unblock from the menu to send messages.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-[#121212]/90 backdrop-blur-xl border-t border-gray-200/80 dark:border-white/10 p-3 sm:p-4 space-y-3">
      
      {/* 1. AI Quick Reply Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/15 px-2.5 py-1 rounded-full border border-primary/20 flex-shrink-0">
          <FiZap className="text-xs" /> AI Replies:
        </div>
        {AI_QUICK_REPLIES.map((chip, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleChipClick(chip)}
            className="text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full hover:border-primary hover:text-primary transition-all flex-shrink-0 whitespace-nowrap shadow-xs"
          >
            {chip}
          </motion.button>
        ))}
      </div>

      {/* 2. Image Attachment Preview Bar */}
      {imagePreview && (
        <div className="relative inline-block bg-black/10 dark:bg-white/5 p-2 rounded-2xl border border-gray-200 dark:border-white/10">
          <img src={imagePreview} alt="upload preview" className="w-20 h-20 object-cover rounded-xl" />
          <button
            onClick={() => { setImagePreview(null); setSelectedImage(null); }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-all text-xs"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* 3. Emoji Picker Popover */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-white dark:bg-[#1A1A1A] p-3 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl flex items-center gap-2 flex-wrap max-w-sm"
          >
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setInputText(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-xl p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Voice Recording Bar / Input Composer Form */}
      {isRecordingVoice ? (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 p-3 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold text-red-500">
              Recording Voice Message... 00:0{recordingSeconds}s
            </span>
          </div>
          <button
            onClick={toggleVoiceRecording}
            className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-600 transition-all"
          >
            Send Voice Note
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          
          {/* File Upload Hidden Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10 transition-all flex-shrink-0"
            title="Emoji Picker"
          >
            <FiSmile className="text-lg" />
          </button>

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-accentBlue hover:bg-accentBlue/10 transition-all flex-shrink-0"
            title="Attach Photo"
          >
            <FiImage className="text-lg" />
          </button>

          {/* Text Input with rounded corners */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write a message or negotiate price..."
              className="w-full pl-4 pr-10 py-3 text-xs sm:text-sm rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all shadow-inner"
            />
          </div>

          {/* Voice Note Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className="p-2.5 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all flex-shrink-0"
            title="Record Voice Note"
          >
            <FiMic className="text-lg" />
          </button>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!inputText.trim() && !imagePreview}
            className={`p-3 rounded-2xl text-black font-bold flex items-center justify-center transition-all flex-shrink-0 shadow-md ${
              inputText.trim() || imagePreview
                ? 'bg-primary hover:bg-primary-dark shadow-amber-500/20'
                : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FiSend className="text-base" />
          </motion.button>
        </form>
      )}
    </div>
  );
};

export default MessageComposer;
