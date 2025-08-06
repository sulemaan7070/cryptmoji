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
  const [decryptKeyChangeCount, setDecryptKeyChangeCount] = useState(0);
  const [keyChangeExceeded, setKeyChangeExceeded] = useState(false);
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

    // Track decryption key changes
    if (activeTab === "decrypt") {
      if (decryptKeyChangeCount >= 3 && !keyChangeExceeded) {
        setKeyChangeExceeded(true);
        showToast(
          "⚠️ Decryption key change limit exceeded! Try fewer attempts.",
          "error"
        );
        return; // Don't update if limit exceeded
      }
      setDecryptKeyChangeCount((prev) => prev + 1);
    }

    // Update output in real-time when key changes
    if (inputText) {
      if (activeTab === "encrypt") {
        const encrypted = encryptText(inputText, index);
        setOutputText(encrypted);
        setDisplayComponents(renderEncryptedText(inputText, index));
      } else {
        if (!keyChangeExceeded) {
          const decrypted = decryptText(inputText, index);
          setOutputText(decrypted);
          setDisplayComponents([]);
        }
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
    // Reset decryption tracking when switching tabs
    setDecryptKeyChangeCount(0);
    setKeyChangeExceeded(false);
  };

  const copyToClipboard = async () => {
    if (!outputText.trim()) return; // Don't copy if no output

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

  const copyJustEncrypted = async () => {
    if (!outputText.trim()) return;

    try {
      await navigator.clipboard.writeText(outputText);
      showToast("Encrypted message copied! 🔤");
    } catch (err) {
      console.error("Failed to copy: ", err);
      showToast("Failed to copy encrypted message", "error");
    }
  };

  const copyKeyAndMessage = async () => {
    if (!outputText.trim()) return;

    try {
      const textToCopy = `${outputText} ${selectedEmoji}`;
      await navigator.clipboard.writeText(textToCopy);
      showToast("Key and encrypted message copied! 🔑");
    } catch (err) {
      console.error("Failed to copy: ", err);
      showToast("Failed to copy key and message", "error");
    }
  };

  const shareMessage = async () => {
    if (!outputText.trim()) return; // Don't share if no output

    try {
      let textToShare = "";

      if (activeTab === "encrypt") {
        textToShare = `Your encrypted message: ${outputText} Your key: ${selectedEmoji} Please visit site https://crypticmoji.vercel.app to decrypt the message`;
      } else {
        textToShare = outputText;
      }

      // For better compatibility, always copy to clipboard first
      await navigator.clipboard.writeText(textToShare);

      // Then try to share if available
      if (navigator.share) {
        try {
          // Some browsers work better with just text, no title
          await navigator.share({
            text: textToShare,
          });
          showToast("Shared successfully! 🚀");
        } catch (shareErr) {
          if (shareErr.name === "AbortError") {
            showToast("Share cancelled, but text is copied to clipboard! 📋");
          } else {
            showToast("Text copied to clipboard! Please paste to share 📋");
          }
        }
      } else {
        showToast("Text copied to clipboard! Please paste to share 📋");
      }
    } catch (err) {
      console.error("Failed to share: ", err);
      showToast("Failed to copy/share message", "error");
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

            {/* Copy and Share Buttons - Always visible */}
            <div className="space-y-2">
              {activeTab === "encrypt" ? (
                // Encryption mode buttons
                <>
                  <button
                    onClick={copyJustEncrypted}
                    disabled={!outputText.trim()}
                    className={`w-full py-2 px-4 rounded-lg transition-colors ${
                      outputText.trim()
                        ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Copy Encrypted Message 🔤
                  </button>
                  <button
                    onClick={copyKeyAndMessage}
                    disabled={!outputText.trim()}
                    className={`w-full py-2 px-4 rounded-lg transition-colors ${
                      outputText.trim()
                        ? "bg-orange-500 text-white hover:bg-orange-600 cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Copy Key + Encrypted Message 🔑
                  </button>
                  <button
                    onClick={copyToClipboard}
                    disabled={!outputText.trim()}
                    className={`w-full py-2 px-4 rounded-lg transition-colors ${
                      outputText.trim()
                        ? "bg-purple-500 text-white hover:bg-purple-600 cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Copy Full Message 📋
                  </button>
                  <button
                    onClick={shareMessage}
                    disabled={!outputText.trim()}
                    className={`w-full py-2 px-4 rounded-lg transition-colors ${
                      outputText.trim()
                        ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Share Message 🚀
                  </button>
                </>
              ) : (
                // Decryption mode buttons (original two buttons)
                <>
                  <button
                    onClick={copyToClipboard}
                    disabled={!outputText.trim()}
                    className={`w-full py-2 px-4 rounded-lg transition-colors ${
                      outputText.trim()
                        ? "bg-purple-500 text-white hover:bg-purple-600 cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Copy Decrypted Text 📋
                  </button>
                  <button
                    onClick={shareMessage}
                    disabled={!outputText.trim()}
                    className={`w-full py-2 px-4 rounded-lg transition-colors ${
                      outputText.trim()
                        ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Share Decrypted Text 🚀
                  </button>
                </>
              )}
            </div>
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
              {activeTab === "decrypt" && (
                <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                  <p className="text-xs text-yellow-700">
                    ⚠️ Key changes: {decryptKeyChangeCount}/3 attempts
                    {keyChangeExceeded && (
                      <span className="text-red-600 font-medium">
                        {" "}
                        - Limit exceeded!
                      </span>
                    )}
                  </p>
                </div>
              )}
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
