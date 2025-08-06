import { useState, useEffect } from "react";
import emojis from "./emojis";
import alphabets from "./alphabets";
import "./App.css";
import Data from "./components/Data";
import data from "./data";

function AppNew() {
  const [activeTab, setActiveTab] = useState("encrypt");
  const [selectedEmoji, setSelectedEmoji] = useState(emojis[0]); // Set first emoji as default
  const [selectedKey, setSelectedKey] = useState(0); // Set first key as default
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [displayComponents, setDisplayComponents] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  let arr = [];

  // Encryption function - returns emoji string
  const encryptText = (text, key) => {
    if (!text || key === null) return "";

    return text
      .split("")
      .map((char) => {
        const charCode = char.charCodeAt(0);
        // Use the character's ASCII value plus the key, then map to emoji array
        const encryptedIndex = (charCode + key) % emojis.length;
        return emojis[encryptedIndex];
      })
      .join("");
  };

  // Function to render encrypted text with animation components
  const renderEncryptedText = (text, key) => {
    if (!text || key === null) return "";

    return text.split("").map((char, index) => {
      const charCode = char.charCodeAt(0);
      const encryptedIndex = (charCode + key) % emojis.length;

      return (
        <Data
          key={index}
          img={
            data[
              alphabets.indexOf(char) === -1
                ? alphabets.indexOf("default")
                : alphabets.indexOf(char)
            ].img
          }
          emoji={emojis[encryptedIndex]}
          time={key}
          alpha={char}
        />
      );
    });
  };

  // Decryption function
  const decryptText = (emojiText, key) => {
    if (!emojiText || key === null) return "";

    // Split emoji text properly (handling multi-byte emojis)
    const emojiArray = [...emojiText];

    return emojiArray
      .map((emoji) => {
        const emojiIndex = emojis.indexOf(emoji);
        if (emojiIndex === -1) return "?"; // Unknown emoji

        // Reverse the encryption process
        // We need to find the original ASCII value
        // (charCode + key) % emojis.length = emojiIndex
        // So we need to find charCode where this equation is true

        // Try different ASCII values to find the one that matches
        for (let charCode = 32; charCode <= 126; charCode++) {
          if ((charCode + key) % emojis.length === emojiIndex) {
            return String.fromCharCode(charCode);
          }
        }

        // If no match found in printable ASCII range, return ?
        return "?";
      })
      .join("");
  };

  // Toast function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleEmojiSelect = (emoji, index) => {
    setSelectedEmoji(emoji);
    setSelectedKey(index);

    // Update output in real-time when key changes
    if (inputText) {
      if (activeTab === "encrypt") {
        const encrypted = encryptText(inputText, index);
        setOutputText(encrypted);
        setDisplayComponents(renderEncryptedText(inputText, index));
      } else {
        const decrypted = decryptText(inputText, index);
        setOutputText(decrypted);
        setDisplayComponents([]);
      }
    }
  };

  const handleInputChange = (text) => {
    setInputText(text);

    if (activeTab === "encrypt") {
      const encrypted = encryptText(text, selectedKey);
      setOutputText(encrypted);
      setDisplayComponents(renderEncryptedText(text, selectedKey));
    } else {
      const decrypted = decryptText(text, selectedKey);
      setOutputText(decrypted);
      setDisplayComponents([]);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setInputText("");
    setOutputText("");
    setDisplayComponents([]);
  };

  const copyToClipboard = async () => {
    try {
      let textToCopy = "";

      if (activeTab === "encrypt") {
        // For encryption, add the formatted message with site info
        textToCopy = `Your encrypted message: ${outputText} Your key: ${selectedEmoji} Please visit site https://crypticmoji.vercel.app to decrypt the message`;
      } else {
        // For decryption, just copy the decrypted text
        textToCopy = outputText;
      }

      await navigator.clipboard.writeText(textToCopy);
      showToast("Successfully copied to clipboard! 📋");
    } catch (err) {
      console.error("Failed to copy: ", err);
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const shareMessage = async () => {
    try {
      let textToShare = "";

      if (activeTab === "encrypt") {
        textToShare = `Your encrypted message: ${outputText} Your key: ${selectedEmoji} Please visit site https://crypticmoji.vercel.app to decrypt the message`;
      } else {
        textToShare = outputText;
      }

      if (navigator.share) {
        await navigator.share({
          title: "CryptMoji - Encrypted Message",
          text: textToShare,
          url: "https://crypticmoji.vercel.app",
        });
        showToast("Shared successfully! 🚀");
      } else {
        // Fallback to clipboard if Web Share API is not available
        await navigator.clipboard.writeText(textToShare);
        showToast("Copied to clipboard (sharing not supported) 📋");
      }
    } catch (err) {
      console.error("Failed to share: ", err);
      if (err.name !== "AbortError") {
        showToast("Failed to share message", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-purple-600">🔐 CryptMoji</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => handleTabChange("encrypt")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "encrypt"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Encrypt 🔒
              </button>
              <button
                onClick={() => handleTabChange("decrypt")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "decrypt"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Decrypt 🔓
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Emoji Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Selected Key: {selectedEmoji}
            </h2>

            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 sm:gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg bg-gray-50">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(emoji, index)}
                  className={`text-lg sm:text-2xl p-1 sm:p-2 rounded-lg transition-all hover:bg-purple-100 flex items-center justify-center ${
                    selectedKey === index
                      ? "bg-purple-200 ring-1 sm:ring-2 ring-purple-400"
                      : ""
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input/Output */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {activeTab === "encrypt" ? "Encrypt Message" : "Decrypt Message"}
            </h2>

            {/* Input */}
            <div className="mb-4">
              <label className="flex text-sm font-medium text-gray-700 mb-2">
                {activeTab === "encrypt"
                  ? "Enter text to encrypt:"
                  : "Enter emojis to decrypt:"}
              </label>
              <textarea
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={
                  activeTab === "encrypt"
                    ? "Type your message here..."
                    : "Paste encrypted emojis here..."
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                rows="4"
                maxLength="200"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {inputText.length}/200
              </div>
            </div>

            {/* Output */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {activeTab === "encrypt"
                  ? "Encrypted output:"
                  : "Decrypted output:"}
              </label>
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[100px] break-all">
                {activeTab === "encrypt" && displayComponents.length > 0 ? (
                  <div>{displayComponents}</div>
                ) : (
                  outputText || (
                    <span className="text-gray-400">
                      Start typing to see results...
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Copy and Share Buttons */}
            {outputText && (
              <div className="space-y-2">
                <button
                  onClick={copyToClipboard}
                  className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Copy to Clipboard 📋
                </button>
                <button
                  onClick={shareMessage}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Share Message 🚀
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-3">How it works:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-purple-600 mb-2">Encryption:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Select an emoji as your encryption key</li>
                <li>Type your message in the text area</li>
                <li>Each character gets converted to an emoji</li>
                <li>Share the encrypted emojis and the key emoji</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-purple-600 mb-2">Decryption:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Switch to the Decrypt tab</li>
                <li>Select the same key emoji used for encryption</li>
                <li>Paste the encrypted emoji message</li>
                <li>Your original message will appear</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
              toast.type === "error" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default AppNew;
