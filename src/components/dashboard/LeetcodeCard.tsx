import { Code, RefreshCw } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useLeetcodeSync } from "../../hooks/useLeetcodeSync";

const EASY_TOTAL = 949;
const MEDIUM_TOTAL = 2066;
const HARD_TOTAL = 942;
const TOTAL_PROBLEMS = EASY_TOTAL + MEDIUM_TOTAL + HARD_TOTAL;

export function LeetcodeCard() {
  const {
    leetcodeProfile,
    leetcodeUsername,
    setLeetcodeUsername,
    editingLc,
    setEditingLc,
    syncingLeetcode,
    lcError,
    syncLeetcode,
  } = useLeetcodeSync();

  const handleSave = async () => {
    if (!leetcodeUsername.trim()) return;
    await syncLeetcode();
  };

  return (
    <Card className="bg-[#0F1117] border border-[#2f2f2f] rounded-3xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src="/leetcode.svg"
            alt="LeetCode"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
          />
          <h3
            className="text-white font-semibold text-lg sm:text-xl"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            LeetCode
          </h3>
        </div>

        {leetcodeProfile && !editingLc && (
          <Button
            onClick={() => syncLeetcode()}
            variant="ghost"
            size="icon"
            disabled={syncingLeetcode}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/50"
          >
            <RefreshCw
              className={`w-4 h-4 ${syncingLeetcode ? "animate-spin" : ""}`}
            />
          </Button>
        )}
      </div>

      {!leetcodeProfile || editingLc ? (
        <div className="space-y-3">
          <p className="text-sm text-white/50">
            Connect your LeetCode profile to track competitive programming
            metrics.
          </p>

          <Input
            placeholder="LeetCode Username"
            value={leetcodeUsername}
            onChange={(e) => setLeetcodeUsername(e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-[#FFA116]"
          />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleSave}
              disabled={syncingLeetcode || !leetcodeUsername}
              className="w-full sm:flex-1 bg-[#FFA116]/20 text-[#FFA116] hover:bg-[#FFA116]/30 rounded-xl"
            >
              {syncingLeetcode ? "Syncing..." : "Connect"}
            </Button>

            {leetcodeProfile && editingLc && (
              <Button
                onClick={() => {
                  setEditingLc(false);
                  setLeetcodeUsername(leetcodeProfile.username);
                }}
                variant="ghost"
                className="w-full sm:flex-none bg-white/5 text-white/60 hover:text-white rounded-xl"
              >
                Cancel
              </Button>
            )}
          </div>

          {lcError && <p className="text-red-400 text-xs mt-2">{lcError}</p>}
        </div>
      ) : (
        <>
          {(() => {
            const solvedPercent =
              (leetcodeProfile.solved / TOTAL_PROBLEMS) * 100;

            const radius = 52;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset =
              circumference - (solvedPercent / 100) * circumference;

            return (
              <div className="space-y-5 sm:space-y-6">
                {/* User Header */}
                <div
                  className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 sm:gap-0"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight truncate max-w-full">
                    {leetcodeProfile.username}
                  </h1>

                  <span className="text-xl sm:text-2xl font-bold text-white/85">
                    #{leetcodeProfile.ranking}
                  </span>
                </div>

                {/* Main Layout - Stacks on Mobile */}
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  {/* Ring */}
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32 flex items-center justify-center mx-auto">
                      <svg
                        className="absolute inset-0 -rotate-90"
                        width="128"
                        height="128"
                      >
                        <circle
                          cx="64"
                          cy="64"
                          r={radius}
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r={radius}
                          stroke="#FFA116"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                        />
                      </svg>

                      <span
                        className="text-3xl sm:text-4xl font-bold text-white"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {leetcodeProfile.solved}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="w-full sm:flex-1 space-y-4">
                    {/* Easy */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span
                          className="font-bold text-[#5cb85c] text-lg sm:text-xl"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          Easy
                        </span>
                        <span
                          className="text-white/80 font-bold text-sm sm:text-base"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {leetcodeProfile.easy} / {EASY_TOTAL}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#5cb85c]"
                          style={{
                            width: `${((leetcodeProfile.easy / EASY_TOTAL) * 100).toFixed(1)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Medium */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span
                          className="font-bold text-[#f0ad4e] text-lg sm:text-xl"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          Medium
                        </span>
                        <span
                          className="text-white/80 font-bold text-sm sm:text-base"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {leetcodeProfile.medium} / {MEDIUM_TOTAL}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#f0ad4e]"
                          style={{
                            width: `${((leetcodeProfile.medium / MEDIUM_TOTAL) * 100).toFixed(1)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Hard */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span
                          className="font-bold text-[#d9534f] text-lg sm:text-xl"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          Hard
                        </span>
                        <span
                          className="text-white/80 font-bold text-sm sm:text-base"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {leetcodeProfile.hard} / {HARD_TOTAL}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#d9534f]"
                          style={{
                            width: `${((leetcodeProfile.hard / HARD_TOTAL) * 100).toFixed(1)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditingLc(true)}
                  className="w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors pt-2"
                >
                  Change Profile
                </button>
              </div>
            );
          })()}
        </>
      )}
    </Card>
  );
}
