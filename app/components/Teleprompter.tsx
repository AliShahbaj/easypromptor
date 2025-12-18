"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Edit3,
  Eye,
  Type,
  Gauge,
  FlipHorizontal,
  Palette,
  Zap,
} from "lucide-react";

type Mode = "edit" | "play";

const Teleprompter = () => {
  // State for modes and content
  const [mode, setMode] = useState<Mode>("edit");
  const [content, setContent] = useState<string>(
    `Welcome to the Teleprompter App!\n\nThis is your script. You can edit it in Edit Mode and present it in Play Mode.\n\nUse the controls on the right to adjust the scrolling speed, font size, colors, and mirroring.\n\nFor best results, paste your complete script here and practice your delivery.\n\nRemember to maintain eye contact with your audience and speak clearly.\n\nGood luck with your presentation!`
  );
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(50); // 0-100
  const [fontSize, setFontSize] = useState(60); // 20-150
  const [isFlipped, setIsFlipped] = useState(false);
  const [textColor, setTextColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  
  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Calculate actual scroll speed (px per second)
  const getActualSpeed = useCallback(() => {
    // Map 0-100 to 10-200 pixels per second
    return 10 + (scrollSpeed / 100) * 190;
  }, [scrollSpeed]);

  // Animation loop for smooth scrolling
  const animateScroll = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (isPlaying && scrollContainerRef.current) {
        const newPosition = scrollPosition + (getActualSpeed() * deltaTime) / 1000;
        setScrollPosition(newPosition);
        
        // Reset to top if we've scrolled past the end
        if (newPosition > (scrollContainerRef.current.scrollHeight || 0)) {
          setScrollPosition(0);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animateScroll);
    },
    [isPlaying, scrollPosition, getActualSpeed]
  );

  // Handle play/pause
  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      lastTimeRef.current = null;
    }
  }, [isPlaying]);

  // Handle reset
  const handleReset = useCallback(() => {
    setScrollPosition(0);
    setIsPlaying(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "KeyR" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleReset();
      } else if (e.code === "KeyE" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setMode("edit");
      } else if (e.code === "KeyP" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setMode("play");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, handleReset]);

  // Start/stop animation
  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animateScroll);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, animateScroll]);

  // Focus textarea when switching to edit mode
  useEffect(() => {
    if (mode === "edit" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate estimated time
  const estimatedTime = scrollContainerRef.current
    ? (scrollContainerRef.current.scrollHeight - scrollPosition) / getActualSpeed()
    : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* Focus Zone Indicator */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="h-48 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent border-t border-b border-blue-500/30"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-64 h-1 bg-blue-500/50 rounded-full blur-sm"></div>
            <div className="text-blue-400 text-sm text-center mt-2 font-medium">
              Focus Zone
            </div>
          </div>
        </div>

        {/* Content Display/Edit Area */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
          style={{ backgroundColor }}
        >
          {mode === "edit" ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[70vh] p-8 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent transition-all duration-300"
              style={{
                color: textColor,
                fontSize: `${fontSize}px`,
                lineHeight: 1.6,
                transform: isFlipped ? "scaleX(-1)" : "none",
              }}
              placeholder="Paste your script here... You can use multiple lines and paragraphs."
            />
          ) : (
            <div
              ref={scrollContainerRef}
              className="h-[70vh] overflow-hidden relative"
            >
              <div
                className="p-8"
                style={{
                  transform: `translateY(-${scrollPosition}px)`,
                  color: textColor,
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.6,
                  textAlign: "center",
                  transformOrigin: "center",
                  ...(isFlipped ? { transform: `translateY(-${scrollPosition}px) scaleX(-1)` } : {}),
                }}
              >
                {content.split("\n").map((line, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {line || <br />}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Mode Indicator */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {mode === "edit" ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit Mode</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Play Mode</span>
                </>
              )}
            </div>
          </div>

          {/* Playback Progress */}
          {mode === "play" && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Speed: {scrollSpeed}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Estimated time: {formatTime(estimatedTime)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="lg:w-80 space-y-6">
        {/* Mode Toggle */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Mode Selection
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("edit")}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${mode === "edit"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700/50 hover:bg-gray-700"
                }`}
            >
              Edit
            </button>
            <button
              onClick={() => setMode("play")}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${mode === "play"
                  ? "bg-green-600 text-white"
                  : "bg-gray-700/50 hover:bg-gray-700"
                }`}
            >
              Play
            </button>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Playback Controls
          </h3>
          <div className="flex gap-3 mb-6">
            <button
              onClick={togglePlay}
              className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${isPlaying
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-green-600 hover:bg-green-700"
                } transition-colors`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Play
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl font-medium bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>

          {/* Speed Control */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-medium">
                <Gauge className="w-5 h-5" />
                Scroll Speed
              </label>
              <span className="text-sm text-gray-300">{scrollSpeed}/100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
          </div>

          {/* Font Size Control */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-medium">
                <Type className="w-5 h-5" />
                Font Size
              </label>
              <span className="text-sm text-gray-300">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />
          </div>

          {/* Flip Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-medium">
                <FlipHorizontal className="w-5 h-5" />
                Mirror Text
              </label>
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFlipped ? "bg-blue-600" : "bg-gray-700"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isFlipped ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-400">
              For physical teleprompter glass - flips text horizontally
            </p>
          </div>
        </div>

        {/* Color Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Text Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-12 cursor-pointer rounded-lg border-2 border-gray-700"
                />
                <div className="flex-1">
                  <div className="text-sm font-mono">{textColor}</div>
                  <div className="text-xs text-gray-400">
                    Click to pick color
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-12 cursor-pointer rounded-lg border-2 border-gray-700"
                />
                <div className="flex-1">
                  <div className="text-sm font-mono">{backgroundColor}</div>
                  <div className="text-xs text-gray-400">
                    Click to pick color
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Keyboard Shortcuts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Play/Pause</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded">Space</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Reset</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl + R</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Edit Mode</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl + E</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Play Mode</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl + P</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teleprompter;