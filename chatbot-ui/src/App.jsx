import React, { useState, useEffect, useRef } from 'react';

// A simple utility function to calculate contrast ratio
const getContrastRatio = (color1, color2) => {
  const toRgb = (c) => {
    let r, g, b;
    if (c.startsWith('#')) {
      const hex = c.slice(1);
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (c.startsWith('rgb')) {
      const match = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
    return [r, g, b];
  };

  const toLuminance = (rgb) => {
    const srgb = rgb.map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  };

  const l1 = toLuminance(toRgb(color1));
  const l2 = toLuminance(toRgb(color2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

// Component for a styled color input box
const ColorInputBox = ({ value, onChange, label }) => (
  <div className="flex justify-between items-center">
    <span>{label}</span>
    <input
      type="color"
      value={value}
      onChange={onChange}
      className="w-10 h-8 border cursor-pointer p-0 m-0 overflow-hidden"
      style={{
        borderRadius: '4px',
        border: '1px solid #ccc',
      }}
    />
  </div>
);

const App = () => {
  // State for chat messages
  const [messages, setMessages] = useState([
    { text: "Hi! What can I help you with?", type: "bot" },
    { text: "Hello", type: "user" },
  ]);

  // State for styling options, matching the requirements
  const [styles, setStyles] = useState({
    darkMode: false,
    profilePicture: 'https://placehold.co/40x40/000000/FFFFFF?text=P',
    chatIconUrl: 'https://placehold.co/40x40/000000/FFFFFF?text=C',
    userBubbleColor: '#3B82F6',
    botBubbleColor: '#E5E7EB',
    userTextColor: '#FFFFFF',
    botTextColor: '#000000',
    headerBgColor: '#60A5FA',
    areaBgColor: '#FFFFFF',
    chatBubbleButtonColor: '#3B82F6',
    bubbleRadius: 16,
    fontSize: 14,
    fontFamily: 'sans-serif',
    widgetWidth: 360,
    cornerRadius: 12,
    syncUserColor: false,
    showPoweredBy: true,
  });

  // State for message input
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Function to handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { text: inputMessage, type: 'user' }]);
      setInputMessage('');
      // Simulate a bot response
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: "Thank you, I'll process your request shortly.", type: "bot" }]);
      }, 1000);
    }
  };

  // Scroll to the bottom of the message area on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper function to handle color change and sync
  const handleColorChange = (key, value) => {
    setStyles((prev) => {
      const newStyles = { ...prev, [key]: value };
      if (key === 'userBubbleColor' && newStyles.syncUserColor) {
        newStyles.headerBgColor = value;
      }
      return newStyles;
    });
  };

  // Get a list of generic fonts for the select dropdown
  const fontFamilies = [
    'sans-serif',
    'serif',
    'monospace',
    'cursive',
  ];

  // Calculate contrast ratios
  const userContrast = getContrastRatio(styles.userBubbleColor, styles.userTextColor);
  const botContrast = getContrastRatio(styles.botBubbleColor, styles.botTextColor);
  const headerContrast = getContrastRatio(styles.headerBgColor, styles.userTextColor);

  // OPTIMIZED LOGIC: Create a warnings array based on conditions
  const warnings = [];
  if (userContrast < 4.5) {
    warnings.push("⚠️ Low contrast: User bubble & text may be hard to read.");
  }
  if (botContrast < 4.5) {
    warnings.push("⚠️ Low contrast: Bot bubble & text may be hard to read.");
  }
  if (headerContrast < 4.5) {
    warnings.push("⚠️ Low contrast: Header background & text may be hard to read.");
  }

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen p-2 gap-4 ${styles.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Configuration Panel */}
      <div className={`p-6 rounded-2xl shadow-xl flex-1 ${styles.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold mb-6">Chatbot UI</h2>
        <div className="flex space-x-4 mb-6">
          <button className="flex-1 py-2 px-4 rounded-full text-center font-medium bg-gray-200 text-gray-800">Content</button>
          <button className="flex-1 py-2 px-4 rounded-full text-center font-medium bg-blue-500 text-white">Style</button>
        </div>

        {/* Style Panel Content */}
        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-160px)] pr-2">
          {/* Appearance */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Appearance</h3>
            <div className={`flex rounded-full overflow-hidden p-1 border ${styles.darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-300 bg-gray-200'}`}>
              <button
                className={`flex-1 py-1 rounded-full text-sm font-medium transition-colors ${!styles.darkMode ? 'bg-white shadow' : 'text-gray-400'}`}
                onClick={() => setStyles(prev => ({ ...prev, darkMode: false }))}
              >
                Light
              </button>
              <button
                className={`flex-1 py-1 rounded-full text-sm font-medium transition-colors ${styles.darkMode ? 'bg-gray-900 text-white shadow' : 'text-gray-600'}`}
                onClick={() => setStyles(prev => ({ ...prev, darkMode: true }))}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Branding */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Branding</h3>
            <div className="flex items-center justify-between mb-4">
              <span>Profile picture</span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="URL"
                  className="w-40 text-sm p-2 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-100"
                  onChange={(e) => setStyles(prev => ({ ...prev, profilePicture: e.target.value }))}
                />
                <button className="py-2 px-4 rounded-lg border dark:border-gray-600">Upload</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Chat icon URL</span>
              <input
                type="text"
                placeholder="URL"
                className="w-40 text-sm p-2 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-100"
                onChange={(e) => setStyles(prev => ({ ...prev, chatIconUrl: e.target.value }))}
              />
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Colors</h3>
            <div className="space-y-2">
              <ColorInputBox
                label="User bubble"
                value={styles.userBubbleColor}
                onChange={(e) => handleColorChange('userBubbleColor', e.target.value)}
              />
              <ColorInputBox
                label="Bot bubble"
                value={styles.botBubbleColor}
                onChange={(e) => setStyles(prev => ({ ...prev, botBubbleColor: e.target.value }))}
              />
              <ColorInputBox
                label="User text"
                value={styles.userTextColor}
                onChange={(e) => setStyles(prev => ({ ...prev, userTextColor: e.target.value }))}
              />
              <ColorInputBox
                label="Bot text"
                value={styles.botTextColor}
                onChange={(e) => setStyles(prev => ({ ...prev, botTextColor: e.target.value }))}
              />
              <ColorInputBox
                label="Header background"
                value={styles.headerBgColor}
                onChange={(e) => setStyles(prev => ({ ...prev, headerBgColor: e.target.value }))}
              />
              <ColorInputBox
                label="Area background"
                value={styles.areaBgColor}
                onChange={(e) => setStyles(prev => ({ ...prev, areaBgColor: e.target.value }))}
              />
              <ColorInputBox
                label="Chat bubble button color"
                value={styles.chatBubbleButtonColor}
                onChange={(e) => setStyles(prev => ({ ...prev, chatBubbleButtonColor: e.target.value }))}
              />
            </div>
          </div>

          {/* Optimized Warning Block */}
          {warnings.length > 0 && (
            <div className="p-2 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
              {warnings.map((w, i) => (
                <div key={i}>{w}</div>
              ))}
            </div>
          )}

          {/* Typography */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Typography</h3>
            <div className="flex items-center justify-between mb-4">
              <span>Font size ({styles.fontSize} px)</span>
              <input
                type="range"
                min="12"
                max="18"
                step="1"
                value={styles.fontSize}
                onChange={(e) => setStyles(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                className="w-40"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Font family</span>
              <select
                value={styles.fontFamily}
                onChange={(e) => setStyles(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-100"
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Layout */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Layout</h3>
            <div className="flex items-center justify-between mb-4">
              <span>Widget width ({styles.widgetWidth} px)</span>
              <input
                type="range"
                min="280"
                max="420"
                step="5"
                value={styles.widgetWidth}
                onChange={(e) => setStyles(prev => ({ ...prev, widgetWidth: parseInt(e.target.value) }))}
                className="w-40"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Corner radius ({styles.cornerRadius} px)</span>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={styles.cornerRadius}
                onChange={(e) => setStyles(prev => ({ ...prev, cornerRadius: parseInt(e.target.value) }))}
                className="w-40"
              />
            </div>
          </div>

          {/* Behavior */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Behavior</h3>
            <div className="flex items-center justify-between mb-2">
              <span>Sync user color with header</span>
              <input
                type="checkbox"
                checked={styles.syncUserColor}
                onChange={(e) => setStyles(prev => ({ ...prev, syncUserColor: e.target.checked }))}
                className="h-5 w-5 rounded-md text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Show "Powered by" line</span>
              <input
                type="checkbox"
                checked={styles.showPoweredBy}
                onChange={(e) => setStyles(prev => ({ ...prev, showPoweredBy: e.target.checked }))}
                className="h-5 w-5 rounded-md text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget Preview */}
      <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-1rem)] lg:h-auto items-center justify-center">
        <div
          className="rounded-3xl shadow-xl flex flex-col overflow-hidden max-h-full"
          style={{
            width: `${styles.widgetWidth}px`,
            borderRadius: `${styles.cornerRadius}px`,
            fontFamily: styles.fontFamily,
          }}
        >
          {/* Header */}
          <div
            className="p-4 flex items-center space-x-3 flex-shrink-0"
            style={{ backgroundColor: styles.headerBgColor }}
          >
            <img
              src={styles.profilePicture}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
              onError={(e) => e.target.src = 'https://placehold.co/40x40/000000/FFFFFF?text=P'}
            />
            <div className="flex-1">
              <div className="font-semibold text-white">Chatcells.com</div>
              <div className="text-xs text-gray-200">Online</div>
            </div>
          </div>

          {/* Message Area */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-4"
            style={{ backgroundColor: styles.areaBgColor }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                    msg.type === 'user'
                      ? 'text-white'
                      : 'text-gray-800'
                  }`}
                  style={{
                    backgroundColor: msg.type === 'user' ? styles.userBubbleColor : styles.botBubbleColor,
                    color: msg.type === 'user' ? styles.userTextColor : styles.botTextColor,
                    borderRadius: `${styles.bubbleRadius}px`,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <form
            className="p-4 flex items-center space-x-2 border-t flex-shrink-0"
            style={{ borderColor: styles.darkMode ? '#4B5563' : '#E5E7EB' }}
            onSubmit={handleSendMessage}
          >
            {/* Attachment Icon */}
            <button type="button" className={`p-2 rounded-full transition-colors ${styles.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M12 14v6" />
                <path d="M12 14c-4.418 0-8 3.582-8 8v-2a6 6 0 0112 0v2" />
                <path d="M5 13l7 7 7-7" />
              </svg>
            </button>
            {/* Message Input */}
            <input
              type="text"
              className="flex-1 p-2 rounded-full border bg-transparent focus:outline-none"
              placeholder="Message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{
                borderColor: styles.darkMode ? '#4B5563' : '#D1D5DB',
                color: styles.darkMode ? '#FFFFFF' : '#1F2937',
              }}
            />
            {/* Send Button */}
            <button
              type="submit"
              className="p-2 rounded-full text-white transition-colors flex items-center justify-center"
              style={{ backgroundColor: styles.chatBubbleButtonColor }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>

          {/* Powered By Line */}
          {styles.showPoweredBy && (
            <div className="text-center p-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              Powered by <a href="#" className="underline">Chatbot-ui⚡</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;