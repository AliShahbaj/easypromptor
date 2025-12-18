"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Teleprompter from "@/app/components/Teleprompter";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
            Professional Teleprompter
          </h1>
          <p className="text-gray-400 text-center">
            Edit your script and present with confidence
          </p>
        </header>
        
        <Teleprompter />
        
        <footer className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>Use the controls to adjust speed, font size, colors, and mirroring for physical teleprompter glass.</p>
          <p className="mt-2">Press <kbd className="px-2 py-1 bg-gray-800 rounded">Space</kbd> to play/pause • <kbd className="px-2 py-1 bg-gray-800 rounded">R</kbd> to reset</p>
        </footer>
      </div>
    </main>
  );
}