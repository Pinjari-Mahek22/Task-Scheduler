import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  CheckCircle,
  Clock,
  Headphones,
  Moon,
  Coffee,
  BookOpen,
} from "lucide-react";
import { Assignment, PomodoroSession } from "../types";
import { ambientSoundEngine } from "../utils/audioSynth";

interface PomodoroRoomProps {
  assignments: Assignment[];
}

export const PomodoroRoom: React.FC<PomodoroRoomProps> = ({ assignments }) => {
  const [mode, setMode] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(3);
  const [totalMinutesStudied, setTotalMinutesStudied] = useState(145);

  // Selected assignment to focus on
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    assignments[0]?.id || ""
  );

  // Audio Ambient Synthesizer state
  const [soundType, setSoundType] = useState<"none" | "binaural" | "rain" | "brown">("none");
  const [volume, setVolume] = useState(0.4);

  // Modes timing config
  const durations = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === "work") {
          setTotalMinutesStudied((prev) => prev + 1 / 60);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      ambientSoundEngine.playBeepNotification();

      if (mode === "work") {
        setCompletedCycles((c) => c + 1);
        setMode("shortBreak");
        setTimeLeft(durations.shortBreak);
      } else {
        setMode("work");
        setTimeLeft(durations.work);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const switchMode = (newMode: "work" | "shortBreak" | "longBreak") => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const handleSoundChange = (type: "none" | "binaural" | "rain" | "brown") => {
    setSoundType(type);
    ambientSoundEngine.stop();
    if (type !== "none") {
      ambientSoundEngine.start(type, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientSoundEngine.setVolume(newVol);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent =
    ((durations[mode] - timeLeft) / durations[mode]) * 100;

  const currentTask = assignments.find((a) => a.id === selectedAssignmentId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border p-5 sm:p-6 transition-all border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center space-x-1">
                <Moon className="w-3.5 h-3.5" />
                <span>Deep Work & Study Chamber</span>
              </span>
              <span className="text-xs font-semibold text-amber-500 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Streak: 4 Days</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Pomodoro Focus Room with Ambient Soundscapes
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Engineered for intense coding, math derivations, and late-night semester cramming sessions.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-400">Total Focus Today</div>
              <div className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                {Math.round(totalMinutesStudied)} Mins ({completedCycles} Cycles)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Focus Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timer & Controls */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-10 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
          {/* Mode Selector Tabs */}
          <div className="flex space-x-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 w-fit">
            <button
              onClick={() => switchMode("work")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "work"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              Focus Sprint (25m)
            </button>
            <button
              onClick={() => switchMode("shortBreak")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "shortBreak"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              Short Recharge (5m)
            </button>
            <button
              onClick={() => switchMode("longBreak")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "longBreak"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              Long Rest (15m)
            </button>
          </div>

          {/* Big Circular Styled Display */}
          <div className="relative flex items-center justify-center">
            {/* SVG Ring */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center border-4 border-zinc-100 dark:border-zinc-800 relative shadow-inner">
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-zinc-900 dark:text-zinc-100">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 mt-2">
                {mode === "work" ? "Deep Study" : "Break Time"}
              </span>

              {/* Small Progress Ring Bar */}
              <div
                className="absolute inset-0 rounded-full border-4 border-indigo-600 dark:border-indigo-400 transition-all pointer-events-none"
                style={{
                  clipPath: `inset(${100 - progressPercent}% 0 0 0)`,
                }}
              />
            </div>
          </div>

          {/* Play / Pause / Reset Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTimer}
              className={`flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all transform active:scale-95 ${
                isRunning
                  ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isRunning ? "Pause Session" : "Start Focus"}</span>
            </button>

            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Current Task Linking */}
          {assignments.length > 0 && (
            <div className="w-full max-w-md p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/40 text-left text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Attached Academic Task:</span>
              <select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                {assignments.map((ass) => (
                  <option key={ass.id} value={ass.id}>
                    {ass.subject}: {ass.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right 1 Col: Ambient Audio Synthesizer & Quotes */}
        <div className="space-y-6">
          {/* Ambient Soundscapes Widget */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Headphones className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Procedural Soundscapes
              </h3>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Synthesized directly in your browser using the Web Audio API for zero latency and continuous focus.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "none", label: "Mute" },
                { id: "binaural", label: "40Hz Gamma Focus" },
                { id: "rain", label: "Gentle Rain" },
                { id: "brown", label: "Deep Brown Noise" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSoundChange(s.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors text-left ${
                    soundType === s.id
                      ? "border-indigo-500 bg-indigo-50/60 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {soundType !== "none" && (
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center space-x-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Volume</span>
                  </span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            )}
          </div>

          {/* Motivational Engineering Insights */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-900/30 dark:bg-indigo-950/20 shadow-sm space-y-3">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                Engineering Focus Wisdom
              </h4>
            </div>
            <blockquote className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
              &quot;First, solve the problem. Then, write the code.&quot;
            </blockquote>
            <span className="text-[10px] text-zinc-500 block">— John Johnson</span>
          </div>
        </div>
      </div>
    </div>
  );
};
