// src/components/dashboard/CodeforcesCard.tsx

import { RefreshCw, Trophy, Sparkles } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCodeforcesSync } from "../../hooks/useCodeforcesSync";

const getRankMeta = (rank?: string | null) => {
  switch (rank?.toLowerCase()) {
    case "legendary grandmaster":
      return { title: "Legendary Grandmaster", color: "#AA0000" };
    case "international grandmaster":
      return { title: "International Grandmaster", color: "#FF3333" };
    case "grandmaster":
      return { title: "Grandmaster", color: "#FF3333" };
    case "international master":
      return { title: "International Master", color: "#FF8C00" };
    case "master":
      return { title: "Master", color: "#FFAA00" };
    case "candidate master":
      return { title: "Candidate Master", color: "#AA00AA" };
    case "expert":
      return { title: "Expert", color: "#0000FF" };
    case "specialist":
      return { title: "Specialist", color: "#03A89E" };
    case "pupil":
      return { title: "Pupil", color: "#008000" };
    case "newbie":
      return { title: "Newbie", color: "#808080" };
    default:
      return {
        title: rank ? rank.charAt(0).toUpperCase() + rank.slice(1) : "Unranked",
        color: "#808080",
      };
  }
};

const getRankMetaFromRating = (rating: number) => {
  if (rating >= 3000)
    return { title: "Legendary Grandmaster", color: "#AA0000" };
  if (rating >= 2600)
    return { title: "International Grandmaster", color: "#FF3333" };
  if (rating >= 2400) return { title: "Grandmaster", color: "#FF3333" };
  if (rating >= 2300)
    return { title: "International Master", color: "#FF8C00" };
  if (rating >= 2100) return { title: "Master", color: "#FFAA00" };
  if (rating >= 1900) return { title: "Candidate Master", color: "#AA00AA" };
  if (rating >= 1600) return { title: "Expert", color: "#0000FF" };
  if (rating >= 1400) return { title: "Specialist", color: "#03A89E" };
  if (rating >= 1200) return { title: "Pupil", color: "#008000" };
  return { title: "Newbie", color: "#808080" };
};

const getAbsoluteUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("//")) return `https:${url}`;
  return url;
};

export function CodeforcesCard() {
  const {
    cfProfile,
    cfUsername,
    setCfUsername,
    editingCf,
    setEditingCf,
    syncingCf,
    cfError,
    syncCodeforces,
  } = useCodeforcesSync();

  const handleSave = async () => {
    if (!cfUsername.trim()) return;
    await syncCodeforces();
  };

  return (
    <Card className="bg-[#0F1117] border border-[#2f2f2f] rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <img
            src="/code-forces.svg"
            alt="Codeforces"
            className="w-7 h-7 object-contain"
          />
          <h3
            className="text-white font-semibold text-lg"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Codeforces
          </h3>
        </div>
        {cfProfile && !editingCf && (
          <Button
            onClick={() => syncCodeforces()}
            variant="ghost"
            size="icon"
            disabled={syncingCf}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/50"
          >
            <RefreshCw
              className={`w-4 h-4 ${syncingCf ? "animate-spin" : ""}`}
            />
          </Button>
        )}
      </div>

      {!cfProfile || editingCf ? (
        <div className="space-y-3 mt-auto mb-auto">
          <p className="text-sm text-white/50 mb-2">
            Connect your Codeforces handle to integrate contest ratings.
          </p>
          <Input
            placeholder="Codeforces Handle"
            value={cfUsername}
            onChange={(e) => setCfUsername(e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-[#8B5CF6]"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={syncingCf || !cfUsername}
              className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl"
            >
              {syncingCf ? "Syncing..." : "Connect"}
            </Button>
            {cfProfile && editingCf && (
              <Button
                onClick={() => {
                  setEditingCf(false);
                  setCfUsername(cfProfile.username);
                }}
                variant="ghost"
                className="bg-white/5 text-white/60 hover:text-white rounded-xl"
              >
                Cancel
              </Button>
            )}
          </div>
          {cfError && <p className="text-red-400 text-xs mt-2">{cfError}</p>}
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          {(() => {
            const currentRankMeta = getRankMetaFromRating(cfProfile.rating);
            const maxRatingMeta = getRankMetaFromRating(cfProfile.max_rating);
            const badgeMeta = getRankMeta(cfProfile.rank);

            const fullName = [cfProfile.first_name, cfProfile.last_name]
              .filter(Boolean)
              .join(" ")
              .trim();

            const avatarSrc =
              getAbsoluteUrl(cfProfile.title_photo_url) ||
              getAbsoluteUrl(cfProfile.avatar_url) ||
              "/code-forces.svg";

            return (
              <>
                {/* Profile Row: Avatar + Name + Big Trophy */}
                <div className="flex items-center gap-4 mb-6">
                  {/* Avatar */}
                  <div
                    className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-2"
                    style={{ borderColor: badgeMeta.color }}
                  >
                    <img
                      src={avatarSrc}
                      alt={cfProfile.username}
                      className="w-full h-full rounded-full object-cover bg-[#0B0D12]"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Identity */}
                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-xl sm:text-2xl font-bold truncate tracking-tight"
                      style={{
                        color: badgeMeta.color,
                        fontFamily: "Space Grotesk, sans-serif",
                      }}
                    >
                      {cfProfile.username}
                    </h2>
                    {fullName && (
                      <p className="text-white/60 text-xs sm:text-sm mt-0.5 truncate capitalize font-medium">
                        {fullName}
                      </p>
                    )}
                  </div>

                  {/* BIG Trophy Badge Box */}
                  <div className="shrink-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-3 min-w-[90px] sm:min-w-[110px]">
                    <div className="relative mb-1">
                      <Trophy
                        className="w-7 h-7 sm:w-8 sm:h-8"
                        style={{ color: badgeMeta.color }}
                      />
                      <Sparkles
                        className="w-3 h-3 absolute -top-1 -right-3 animate-pulse"
                        style={{ color: badgeMeta.color }}
                      />
                      <Sparkles
                        className="w-2 h-2 absolute top-4 -left-2 animate-pulse"
                        style={{ color: badgeMeta.color }}
                      />
                    </div>
                    <span
                      className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center"
                      style={{ color: badgeMeta.color }}
                    >
                      {badgeMeta.title}
                    </span>
                  </div>
                </div>

                {/* Compact Stats Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-auto">
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-wider mb-1">
                      Current
                    </p>
                    <p
                      className="font-bold text-lg sm:text-xl"
                      style={{ color: currentRankMeta.color }}
                    >
                      {cfProfile.rating}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-wider mb-1">
                      Max
                    </p>
                    <p
                      className="font-bold text-lg sm:text-xl"
                      style={{ color: maxRatingMeta.color }}
                    >
                      {cfProfile.max_rating}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-wider mb-1">
                      Contests
                    </p>
                    <p className="font-bold text-lg sm:text-xl text-white">
                      {cfProfile.contests}
                    </p>
                  </div>
                </div>

                {/* Action Link */}
                <button
                  onClick={() => setEditingCf(true)}
                  className="mt-4 text-[11px] sm:text-xs text-white/30 hover:text-white/60 underline-offset-2 hover:underline w-full text-center transition-colors"
                >
                  Change Handle
                </button>
              </>
            );
          })()}
        </div>
      )}
    </Card>
  );
}
