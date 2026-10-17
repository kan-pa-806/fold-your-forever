import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Gamepad2,
  HelpCircle,
  RotateCcw,
  Trophy,
  Dices,
  Heart,
  Flame,
  Send,
  Shuffle,
  ChevronRight,
  Check,
  Clapperboard,
  Film,
  Camera,
  Music,
  Laugh,
  Eye,
  Star,
  PartyPopper,
  Zap,
  Lock,
  Hourglass,
  MessageSquare,
  Users,
  Smile,
  X,
  Bell,
} from "lucide-react";
import { useFold, sendChatMessage } from "@/lib/fold-store";
import {
  broadcastChatMessage,
  broadcastGameTurn,
  broadcastInGameChat,
  broadcastGamePresence,
  broadcastGameState,
} from "@/lib/realtime-chat";
import { cn } from "@/lib/utils";

// Confetti effect helper
function ConfettiOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 1,
            y: 0,
            x: 0,
            scale: Math.random() * 0.8 + 0.5,
            rotate: 0,
          }}
          animate={{
            opacity: 0,
            y: (Math.random() - 0.5) * 400,
            x: (Math.random() - 0.5) * 400,
            rotate: Math.random() * 720,
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn(
            "absolute h-3 w-3 rounded-full",
            i % 4 === 0
              ? "bg-coral"
              : i % 4 === 1
                ? "bg-amber-400"
                : i % 4 === 2
                  ? "bg-emerald-400"
                  : "bg-teal",
          )}
        />
      ))}
    </div>
  );
}

/**
 * Plato-Style Universal Live Room Lobby Header:
 * - Partner & User profile avatars at the top with an active bright green online indicator dot (🟢)
 * - Live connection badge ("Both Connected! 🟢" / "Connecting...")
 * - Quick Nudge button and instant real-time synchronization indicator
 */
export function UniversalLiveRoomHeader({
  gameId,
  gameTitle,
  isPartnerHere,
  onInvitePartner,
  onClose,
}: {
  gameId: string;
  gameTitle: string;
  isPartnerHere: boolean;
  onInvitePartner: () => void;
  onClose?: () => void;
}) {
  const state = useFold();

  return (
    <div className="mb-3.5 overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-3 shadow-device backdrop-blur-md">
      {/* Top row: Opponent/Partner profile & Live online status */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Partner Profile with bright green online dot (Plato layout) */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-coral to-rose-400 text-base font-bold text-white shadow-soft">
              {state.partner?.charAt(0) || "P"}
            </div>
            {/* Active bright green online dot */}
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white",
                isPartnerHere || state.isPartnerOnline ? "bg-emerald-500" : "bg-amber-400",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-white",
                  (isPartnerHere || state.isPartnerOnline) && "animate-ping opacity-75",
                )}
              />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-ink leading-tight">
                {state.partner}
              </h3>
              {/* Online text tag */}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider",
                  isPartnerHere || state.isPartnerOnline
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-700",
                )}
              >
                {isPartnerHere ? "🟢 IN GAME" : state.isPartnerOnline ? "🟢 ONLINE" : "OFFLINE"}
              </span>
            </div>

            <p className="text-[10px] text-ink-soft">
              {isPartnerHere ? (
                <span className="font-semibold text-emerald-600">Both Connected! Playing live</span>
              ) : (
                <span>Waiting for {state.partner} to join…</span>
              )}
            </p>
          </div>
        </div>

        {/* Center/Right: Plato Live Match Info & Actions */}
        <div className="flex items-center gap-2">
          {/* My avatar badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-2xl bg-parchment-soft px-2.5 py-1 border border-ink/5">
            <div className="relative">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-ink text-xs font-bold text-parchment">
                {state.name?.charAt(0) || "U"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500" />
            </div>
            <span className="text-[11px] font-semibold text-ink">You</span>
          </div>

          {!isPartnerHere && (
            <button
              type="button"
              onClick={onInvitePartner}
              className="press flex items-center gap-1.5 rounded-full bg-gradient-to-r from-coral to-rose-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-soft hover:brightness-105 transition-all"
            >
              <span>Nudge {state.partner}</span>
              <Bell size={12} className="animate-bounce" />
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="press rounded-full p-2 text-ink-soft hover:bg-ink/5 transition-colors"
              title="Leave Room"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Live sync banner badge */}
      <div className="mt-2.5 flex items-center justify-between border-t border-ink/5 pt-2 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-ink">
            Plato Live Room · {gameTitle}
          </span>
        </div>
        <span className="rounded-full bg-coral/10 px-2 py-0.5 font-bold text-coral uppercase tracking-wider">
          FAST REALTIME SYNC
        </span>
      </div>
    </div>
  );
}

// In-Game Session Message type (strictly isolated from main ChatRoom)
export interface InGameMessage {
  id: string;
  gameId: string;
  sender: string;
  text: string;
  reaction?: string;
  timestamp: number;
}

/**
 * Plato-Style Bottom Floating In-Game Quick Chat:
 * - Sleek, minimal bottom text input with "Say hello..." placeholder
 * - Quick emoji trigger button + popup reaction bar
 * - Seamless live chat bubble drawer during gameplay without leaving the game
 */
export function InGameQuickChatOverlay({
  gameId,
  gameTitle,
}: {
  gameId: string;
  gameTitle: string;
}) {
  const state = useFold();
  const effectiveRoomId = state.roomId || state.soulCode || "fold-private-room";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<InGameMessage[]>([]);
  const [text, setText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Listen for real-time in-game quick chat messages from partner
  useEffect(() => {
    const handleInGameChat = (e: CustomEvent) => {
      const payload = e.detail;
      if (payload && payload.gameId === gameId) {
        setMessages((prev) => [...prev, payload]);
        if (!isOpen) {
          setUnreadCount((c) => c + 1);
        }
      }
    };

    window.addEventListener("fold:in_game_chat", handleInGameChat as EventListener);
    return () => window.removeEventListener("fold:in_game_chat", handleInGameChat as EventListener);
  }, [gameId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  const handleSend = (customText?: string, reactionEmoji?: string) => {
    const msgText = (customText !== undefined ? customText : text).trim();
    if (!msgText && !reactionEmoji) return;

    const newMsg: InGameMessage = {
      id: `game-msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      gameId,
      sender: state.name,
      text: msgText,
      reaction: reactionEmoji,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setText("");
    setShowEmojiPicker(false);

    // Broadcast in-game chat over Supabase without touching main ChatRoom store
    broadcastInGameChat(effectiveRoomId, newMsg);
  };

  const quickReactions = ["🔥", "❤️", "😂", "🙈", "😘", "👏", "⚡", "✨", "🎯", "😍"];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-auto p-3">
      {/* Expanded Live Chat Stream Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="mb-2 w-full max-w-lg rounded-3xl border border-white/90 bg-white/95 p-3.5 shadow-2xl backdrop-blur-xl"
            style={{ maxHeight: "360px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-coral/15 text-coral text-xs">
                  💬
                </span>
                <div>
                  <h4 className="text-xs font-bold text-ink leading-tight">
                    Plato Live Chat
                  </h4>
                  <p className="text-[10px] text-ink-soft">
                    {gameTitle} · Playing with {state.partner}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="press rounded-full p-1 text-ink-soft hover:bg-ink/5"
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages Area */}
            <div
              className="my-2 flex-1 overflow-y-auto space-y-2 pr-1 text-xs"
              style={{ minHeight: "140px", maxHeight: "200px" }}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-7 text-center text-ink-soft">
                  <Smile size={24} className="mb-1 text-coral/60" />
                  <p className="text-[11px] font-medium">Say hello to {state.partner}!</p>
                  <span className="text-[10px] opacity-65">
                    Live game messages stay right inside this match
                  </span>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender === state.name;
                  return (
                    <div
                      key={m.id}
                      className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                    >
                      <span className="text-[9px] text-ink-soft/70 mb-0.5 px-1 font-medium">
                        {isMe ? "You" : m.sender}
                      </span>
                      <div
                        className={cn(
                          "rounded-2xl px-3 py-1.5 leading-relaxed max-w-[85%] text-xs shadow-xs",
                          isMe
                            ? "bg-gradient-to-r from-coral to-rose-500 text-white rounded-br-sm"
                            : "bg-parchment-soft text-ink border border-ink/5 rounded-bl-sm",
                        )}
                      >
                        {m.reaction && <span className="text-base mr-1">{m.reaction}</span>}
                        {m.text && <span>{m.text}</span>}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Emoji Picker Strip */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2 flex items-center gap-2 overflow-x-auto rounded-full border border-white/80 bg-white/95 px-3 py-1.5 shadow-xl backdrop-blur-md"
          >
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSend("", emoji)}
                className="press rounded-full p-1 text-lg hover:scale-130 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Floating In-Game Quick Chat Bar (Strict Plato layout) */}
      <div className="w-full max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-3 py-2 shadow-2xl backdrop-blur-xl"
        >
          {/* Quick Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="press flex h-8 w-8 items-center justify-center rounded-full bg-parchment-soft text-ink-soft hover:text-coral transition-colors"
          >
            <Smile size={18} />
          </button>

          {/* Plato Input: "Say hello..." */}
          <input
            type="text"
            value={text}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => setText(e.target.value)}
            placeholder="Say hello…"
            className="flex-1 bg-transparent px-2 text-xs text-ink placeholder:text-ink-soft/70 focus:outline-none"
          />

          {/* Toggle Full Chat Stream / Unread Counter Button */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="press relative flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink-soft hover:text-ink"
            title="Chat History"
          >
            <MessageSquare size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[9px] font-bold text-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim()}
            className={cn(
              "press flex h-8 w-8 items-center justify-center rounded-full transition-all",
              text.trim()
                ? "bg-gradient-to-r from-coral to-rose-500 text-white shadow-soft"
                : "bg-ink/10 text-ink/30 cursor-not-allowed",
            )}
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Interactive Game Card Dispatcher:
 * Posts interactive "Join Game" and live action cards directly into the main Chat thread
 * and syncs across devices via Supabase Realtime.
 */
function sendGameChatCard({
  roomId,
  gameId,
  gameTitle,
  gameIcon,
  actionType,
  summary,
  nextTurnPlayer,
  statePayload,
}: {
  roomId: string;
  gameId: string;
  gameTitle: string;
  gameIcon: string;
  actionType: "invite" | "turn" | "result";
  summary: string;
  nextTurnPlayer?: string;
  statePayload?: any;
}) {
  const cardMessage = sendChatMessage({
    type: "game",
    text: `🎮 ${gameTitle} (${actionType.toUpperCase()}):\n${summary}`,
    gameData: {
      gameId,
      gameTitle,
      gameIcon,
      actionType,
      summary,
      nextTurnPlayer,
      statePayload,
    },
  });

  if (roomId) {
    void broadcastChatMessage(roomId, cardMessage);
  }

  return cardMessage;
}

/* =========================================================================
 * MOVIE PREFERENCES & DATA (Marathi, South Indian Hindi-Dubbed, Bollywood, Hollywood)
 * ========================================================================= */
export type MovieLanguage = "all" | "marathi" | "south" | "bollywood" | "hollywood";

interface MovieTriviaItem {
  id: string;
  category: MovieLanguage;
  categoryLabel: string;
  movieTitle: string;
  posterBg: string;
  emojiClues: string;
  actorClues: string;
  leadActors: string[];
  famousDialogue: string;
  options: string[];
  funFact: string;
}

const MOVIE_TRIVIA_DATABASE: MovieTriviaItem[] = [
  // 1. Marathi Cinema Gems
  {
    id: "m-1",
    category: "marathi",
    categoryLabel: "Marathi Classic",
    movieTitle: "Sairat",
    posterBg: "from-rose-500/20 to-amber-500/20",
    emojiClues: "🚜 🌾 💔 🎵 🏍️",
    actorClues: "Archie (Parshya) on the Royal Enfield Bullet!",
    leadActors: ["Rinku Rajguru (Archie)", "Akash Thosar (Parshya)"],
    famousDialogue: "‘मराठीत सांगू की इंग्लिश मध्ये?’",
    options: ["Sairat", "Fandry", "Timepass", "Natsamrat"],
    funFact: "First Marathi film to cross ₹100 crore worldwide!",
  },
  {
    id: "m-2",
    category: "marathi",
    categoryLabel: "Marathi Romantic",
    movieTitle: "Timepass (TP)",
    posterBg: "from-sky-500/20 to-indigo-500/20",
    emojiClues: "🏫 👧 👦 🚲 💌",
    actorClues: "Dagadu & Prajakta's school love story",
    leadActors: ["Prathamesh Parab (Dagadu)", "Ketaki Mategaonkar (Praju)"],
    famousDialogue: "‘आय लव्ह यु, प्राजू!’",
    options: ["Timepass (TP)", "Boyz", "Duniyadari", "Sairat"],
    funFact: "Directed by Ravi Jadhav, captured innocent 90s teenage romance.",
  },
  {
    id: "m-3",
    category: "marathi",
    categoryLabel: "Marathi Masterpiece",
    movieTitle: "Natsamrat",
    posterBg: "from-purple-500/20 to-zinc-500/20",
    emojiClues: "🎭 👑 👴 📜 💔",
    actorClues: "Nana Patekar giving the performance of a lifetime",
    leadActors: ["Nana Patekar (Ganpat Belwalkar)", "Medha Manjrekar"],
    famousDialogue: "‘कुणी घर देता का घर? एका वादळाला घर हवंय...’",
    options: ["Natsamrat", "Katyar Kaljat Ghusali", "Ani... Dr. Kashinath Ghanekar", "Court"],
    funFact: "Adapted from V.V. Shirwadkar's iconic Marathi play.",
  },
  {
    id: "m-4",
    category: "marathi",
    categoryLabel: "Marathi Youth & Friendship",
    movieTitle: "Duniyadari",
    posterBg: "from-teal-500/20 to-emerald-500/20",
    emojiClues: "🎓 🎸 🏍️ 🍻 💖",
    actorClues: "Shreyas, DSP, Shirin & Meenu college gang",
    leadActors: ["Swapnil Joshi", "Ankush Chaudhari", "Sai Tamhankar"],
    famousDialogue: "‘तेरी मेरी यारी, सारी दुनिया पे भारी!’",
    options: ["Duniyadari", "Classmates", "Ti Saddhya Kay Karte", "Mumbai-Pune-Mumbai"],
    funFact: "Set in 1970s Pune, celebrated lifelong friendship and sacrifice.",
  },

  // 2. South Indian (Hindi-Dubbed Mega Hits)
  {
    id: "s-1",
    category: "south",
    categoryLabel: "South Mega Hit (Hindi)",
    movieTitle: "Baahubali 2: The Conclusion",
    posterBg: "from-amber-600/20 to-red-600/20",
    emojiClues: "👑 🗡️ 🐘 🏹 🏰",
    actorClues: "Prabhas as Amarendra Baahubali & Katappa",
    leadActors: ["Prabhas", "Anushka Shetty", "Rana Daggubati"],
    famousDialogue: "‘कट्टप्पा ने बाहुबली को क्यों मारा?’",
    options: ["Baahubali 2", "RRR", "KGF", "Pushpa"],
    funFact: "Became the highest-grossing film in Indian cinema history.",
  },
  {
    id: "s-2",
    category: "south",
    categoryLabel: "South Action Swag (Hindi)",
    movieTitle: "Pushpa: The Rise",
    posterBg: "from-orange-600/20 to-amber-700/20",
    emojiClues: "🪓 🌲 🚚 🧔 🕶️",
    actorClues: "Allu Arjun's iconic beard stroke and Srivalli dance",
    leadActors: ["Allu Arjun (Pushparaj)", "Rashmika Mandanna (Srivalli)"],
    famousDialogue: "‘पुष्पा... पुष्पा राज... मैं झुकेगा नहीं!’",
    options: ["Pushpa: The Rise", "Ala Vaikunthapurramuloo", "Kantara", "KGF: Chapter 2"],
    funFact: "The shoulder shrug became a global sensation across sports and movies.",
  },
  {
    id: "s-3",
    category: "south",
    categoryLabel: "South Epic Action (Hindi)",
    movieTitle: "KGF: Chapter 1 & 2",
    posterBg: "from-yellow-600/20 to-zinc-800/20",
    emojiClues: "⛏️ 🪙 💥 🕶️ 🔫",
    actorClues: "Rocky Bhai ruling the gold mines of Narachi",
    leadActors: ["Yash (Rocky Bhai)", "Srinidhi Shetty", "Sanjay Dutt (Adheera)"],
    famousDialogue: "‘Violence... Violence... Violence! I don’t like it, I avoid... But violence likes me!’",
    options: ["KGF: Chapter 2", "Salaar", "Vikram", "Leo"],
    funFact: "Yash personally oversaw the Hindi dubbing tone for impact.",
  },
  {
    id: "s-4",
    category: "south",
    categoryLabel: "South Global Pride (Hindi)",
    movieTitle: "RRR",
    posterBg: "from-blue-600/20 to-red-600/20",
    emojiClues: "🐅 🌊 🔥 💃 🏆",
    actorClues: "Ram Charan (Fire) & Jr NTR (Water) Naatu Naatu dance",
    leadActors: ["Ram Charan", "Jr. NTR", "Alia Bhatt"],
    famousDialogue: "‘नाचो नाचो! (Naatu Naatu)’",
    options: ["RRR", "Magadheera", "Eega", "Devara"],
    funFact: "Won the Academy Award (Oscar) for Best Original Song!",
  },

  // 3. Bollywood Romance & Drama
  {
    id: "b-1",
    category: "bollywood",
    categoryLabel: "Bollywood Eternal Romance",
    movieTitle: "Dilwale Dulhania Le Jayenge (DDLJ)",
    posterBg: "from-yellow-500/20 to-red-500/20",
    emojiClues: "🚂 🌾 🔔 🎸 🎻",
    actorClues: "Shah Rukh Khan & Kajol in the mustard yellow fields of Punjab",
    leadActors: ["Shah Rukh Khan (Raj)", "Kajol (Simran)"],
    famousDialogue: "‘जा सिमरन जा, जी ले अपनी जिंदगी!’",
    options: ["DDLJ", "Kuch Kuch Hota Hai", "Kabhi Khushi Kabhie Gham", "Mohabbatein"],
    funFact: "Ran continuously for over 28 years at Maratha Mandir theatre in Mumbai!",
  },
  {
    id: "b-2",
    category: "bollywood",
    categoryLabel: "Bollywood Love & Soul",
    movieTitle: "Yeh Jawaani Hai Deewani (YJHD)",
    posterBg: "from-indigo-500/20 to-pink-500/20",
    emojiClues: "🏔️ 🎒 📸 🥂 💃",
    actorClues: "Bunny & Naina on the Manali snow trek and Udaipur wedding",
    leadActors: ["Ranbir Kapoor (Bunny)", "Deepika Padukone (Naina)"],
    famousDialogue: "‘मैं उड़ना चाहता हूँ, दौड़ना चाहता हूँ, गिरना भी चाहता हूँ... बस रुकना नहीं चाहता!’",
    options: ["Yeh Jawaani Hai Deewani", "Tamasha", "Zindagi Na Milegi Dobara", "Jab We Met"],
    funFact: "The ultimate youth anthem for romance, travel, and balance.",
  },
  {
    id: "b-3",
    category: "bollywood",
    categoryLabel: "Bollywood Romantic Classic",
    movieTitle: "Jab We Met",
    posterBg: "from-amber-500/20 to-rose-500/20",
    emojiClues: "🚆 🏨 🌾 👧 💖",
    actorClues: "Geet (the bubbly train talker) & Aditya Kashyap",
    leadActors: ["Shahid Kapoor (Aditya)", "Kareena Kapoor (Geet)"],
    famousDialogue: "‘सिखनी हूँ मैं बठिंडा की! मैं अपनी फेवरेट हूँ!’",
    options: ["Jab We Met", "Love Aaj Kal", "Rockstar", "Highway"],
    funFact: "Changed Indian train travel culture and self-love dialogues forever.",
  },

  // 4. Hollywood Favorites
  {
    id: "h-1",
    category: "hollywood",
    categoryLabel: "Hollywood Romance & Destiny",
    movieTitle: "Titanic",
    posterBg: "from-blue-600/20 to-cyan-600/20",
    emojiClues: "🚢 ❄️ 💎 🎨 🌊",
    actorClues: "Jack & Rose on the bow of the ship spreading their arms",
    leadActors: ["Leonardo DiCaprio (Jack)", "Kate Winslet (Rose)"],
    famousDialogue: "‘You jump, I jump, remember?’",
    options: ["Titanic", "The Notebook", "La La Land", "Avatar"],
    funFact: "Won 11 Academy Awards and remains the ultimate timeless love tragedy.",
  },
  {
    id: "h-2",
    category: "hollywood",
    categoryLabel: "Hollywood Passion & Dance",
    movieTitle: "La La Land",
    posterBg: "from-purple-600/20 to-pink-600/20",
    emojiClues: "🎹 🌌 👠 🎺 🎬",
    actorClues: "Sebastian & Mia tap dancing under the purple sunset streetlamp",
    leadActors: ["Ryan Gosling (Sebastian)", "Emma Stone (Mia)"],
    famousDialogue: "‘Here’s to the ones who dream, foolish as they may seem.’",
    options: ["La La Land", "The Greatest Showman", "About Time", "Before Sunrise"],
    funFact: "Filmed using actual golden hour sunsets in Griffith Park, Los Angeles.",
  },
];

/* =========================================================================
 * 1. GAME: MOVIE POSTER & EMOJI GUESSING WITH STRICT TURNS & CHAT BROADCASTS
 * ========================================================================= */
function MovieGuessingGame() {
  const state = useFold();
  const effectiveRoomId = state.roomId || state.soulCode || "fold-private-room";
  const [selectedLang, setSelectedLang] = useState<MovieLanguage>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [scores, setScores] = useState({ me: 0, partner: 0 });
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<"me" | "partner">("me");
  const [confetti, setConfetti] = useState(false);
  const inviteSentRef = useRef(false);

  // Send interactive Game Invite card to Chat upon opening
  useEffect(() => {
    if (!inviteSentRef.current) {
      inviteSentRef.current = true;
      sendGameChatCard({
        roomId: effectiveRoomId,
        gameId: "movie-guess",
        gameTitle: "Movie Poster & Clues",
        gameIcon: "🎬",
        actionType: "invite",
        summary: `${state.name} invited ${state.partner} to Movie Poster & Trivia! Alternating turns to guess.`,
        nextTurnPlayer: state.name,
      });
    }
  }, [effectiveRoomId, state.name, state.partner]);

  // Listen for real-time game turns
  useEffect(() => {
    const handleGameTurn = (e: CustomEvent) => {
      const { gameId, moveData, nextPlayer } = e.detail;
      if (gameId === "movie-guess" && moveData) {
        if (typeof moveData.index === "number") {
          setCurrentIndex(moveData.index);
        }
        if (moveData.partnerScore !== undefined) {
          setScores((prev) => ({ ...prev, partner: moveData.partnerScore }));
        }
        setSelectedOption(null);
        setShowResult(false);
        setCurrentTurnPlayer("me");
      }
    };

    window.addEventListener("fold:game_turn", handleGameTurn as EventListener);
    return () => window.removeEventListener("fold:game_turn", handleGameTurn as EventListener);
  }, []);

  const filteredMovies = MOVIE_TRIVIA_DATABASE.filter(
    (m) => selectedLang === "all" || m.category === selectedLang,
  );

  const movie = filteredMovies[currentIndex % filteredMovies.length] || MOVIE_TRIVIA_DATABASE[0]!;

  const handleSelectOption = (opt: string) => {
    if (showResult || currentTurnPlayer !== "me") return;
    setSelectedOption(opt);
    setShowResult(true);

    const isCorrect = opt === movie.movieTitle;
    let newMyScore = scores.me;
    if (isCorrect) {
      newMyScore += 10;
      setScores((s) => ({ ...s, me: newMyScore }));
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2000);
    }

    // Fast Real-Time: Broadcast move and state instantly without UI lockouts
    broadcastGameState(effectiveRoomId, {
      gameId: "movie-guess",
      stateData: {
        currentIndex: (currentIndex + 1) % filteredMovies.length,
        partnerScore: newMyScore,
        lastGuess: opt,
        isCorrect,
      },
      sender: state.name,
    });
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowResult(false);
    const nextIdx = (currentIndex + 1) % filteredMovies.length;
    setCurrentIndex(nextIdx);
    broadcastGameState(effectiveRoomId, {
      gameId: "movie-guess",
      stateData: { currentIndex: nextIdx },
      sender: state.name,
    });
  };

  const handleSimulatePartnerTurn = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredMovies.length);
    setSelectedOption(null);
    setShowResult(false);
    setScores((s) => ({ ...s, partner: s.partner + 10 }));
    setCurrentTurnPlayer("me");

    sendGameChatCard({
      roomId: effectiveRoomId,
      gameId: "movie-guess",
      gameTitle: "Movie Poster & Clues",
      gameIcon: "🎬",
      actionType: "turn",
      summary: `${state.partner} took their turn! It is now ${state.name}'s turn to guess!`,
      nextTurnPlayer: state.name,
    });
  };

  return (
    <div className="relative overflow-hidden paper grain rounded-[30px] p-6 shadow-device">
      <ConfettiOverlay show={confetti} />

      {/* Language Preferences Picker Strip */}
      <div className="flex items-center justify-between border-b border-ink/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] text-coral font-bold uppercase">
            🎬 MOVIE TRIVIA &amp; GUESSING
          </span>
          <span className="rounded-full bg-coral/10 px-2 py-0.5 text-[9px] font-semibold text-coral uppercase">
            Turn: {currentTurnPlayer === "me" ? state.name : state.partner}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {state.name}: {scores.me} pts
          </span>
          <span className="text-coral bg-coral/10 px-2 py-0.5 rounded-full">
            {state.partner}: {scores.partner} pts
          </span>
        </div>
      </div>

      {/* Language chips: Marathi, South Indian Hindi-Dubbed, Bollywood, Hollywood */}
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: "all", label: "✨ All Movies" },
          { id: "marathi", label: "🚩 Marathi Cinema" },
          { id: "south", label: "🔥 South (Hindi)" },
          { id: "bollywood", label: "🌟 Bollywood" },
          { id: "hollywood", label: "🎥 Hollywood" },
        ].map((lang) => (
          <button
            key={lang.id}
            type="button"
            onClick={() => {
              setSelectedLang(lang.id as MovieLanguage);
              setCurrentIndex(0);
              setSelectedOption(null);
              setShowResult(false);
            }}
            className={cn(
              "press shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-all border",
              selectedLang === lang.id
                ? "bg-coral text-white border-coral shadow-soft"
                : "bg-white/60 text-ink-soft border-white/60 hover:bg-white hover:text-ink",
            )}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Visual Clue Card with 3D aesthetic */}
      <motion.div
        key={movie.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative mt-5 overflow-hidden rounded-[26px] border border-white/80 p-6 shadow-soft bg-gradient-to-br",
          movie.posterBg,
        )}
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-[10px] font-semibold text-ink-soft uppercase tracking-wider">
            {movie.categoryLabel}
          </span>
          <span className="text-[10px] text-ink-soft">
            Clue {currentIndex + 1} of {filteredMovies.length}
          </span>
        </div>

        {/* Big visual Emoji clues */}
        <div className="my-4 text-center">
          <p className="text-4xl tracking-widest filter drop-shadow-sm">{movie.emojiClues}</p>
          <p className="mt-2 text-xs font-medium text-ink-soft">Guess the film from the emojis &amp; actors</p>
        </div>

        {/* Famous Actor & Dialogue card */}
        <div className="rounded-2xl bg-white/70 p-4 border border-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-ink">
            <Camera size={14} className="text-coral" />
            <span className="font-semibold">{movie.actorClues}</span>
          </div>
          <div className="mt-2 text-xs italic text-ink-soft border-t border-ink/5 pt-2">
            Dialogue: <span className="text-ink font-medium not-italic">&ldquo;{movie.famousDialogue}&rdquo;</span>
          </div>
        </div>
      </motion.div>

      {/* Options grid */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {movie.options.map((opt) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === movie.movieTitle;

          let btnStyle = "bg-white/70 text-ink border-white/80 hover:bg-white";
          if (showResult) {
            if (isCorrect) btnStyle = "bg-emerald-500 text-white border-emerald-500 shadow-soft";
            else if (isSelected && !isCorrect) btnStyle = "bg-rose-500 text-white border-rose-500";
            else btnStyle = "opacity-40 bg-white/40 text-ink/40 border-transparent";
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={showResult || currentTurnPlayer !== "me"}
              onClick={() => handleSelectOption(opt)}
              className={cn(
                "press flex items-center justify-center rounded-2xl py-3 px-3 text-center text-xs font-semibold shadow-soft border transition-all",
                btnStyle,
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation & Next Clue */}
      {showResult ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl bg-white/70 p-4 border border-white/80"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink">
              {selectedOption === movie.movieTitle
                ? "🎉 Spot on! Both of you love great movies."
                : `Nice try! The correct film is ${movie.movieTitle}.`}
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="press inline-flex items-center gap-1 rounded-full bg-ink px-4 py-1.5 text-[11px] font-medium text-parchment"
            >
              <span>Next Movie</span>
              <ChevronRight size={13} />
            </button>
          </div>
          <p className="mt-1 text-[11px] text-ink-soft">{movie.funFact}</p>
        </motion.div>
      ) : null}
    </div>
  );
}

/* =========================================================================
 * 2. GAME: STRICT TURN-BASED TIC-TAC-TOE (HEARTS ❤️ VS ROSES 🌹)
 * ========================================================================= */
function TicTacToeGame() {
  const state = useFold();
  const effectiveRoomId = state.roomId || state.soulCode || "fold-private-room";
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<"me" | "partner">("me");
  const [winner, setWinner] = useState<string | null>(null);
  const [scores, setScores] = useState({ me: 0, partner: 0, draws: 0 });
  const [confetti, setConfetti] = useState(false);
  const inviteSentRef = useRef(false);

  // Send interactive Game Invite card to Chat upon opening
  useEffect(() => {
    if (!inviteSentRef.current) {
      inviteSentRef.current = true;
      sendGameChatCard({
        roomId: effectiveRoomId,
        gameId: "tictactoe",
        gameTitle: "Hearts & Roses",
        gameIcon: "❤️",
        actionType: "invite",
        summary: `${state.name} started a match of Hearts & Roses! Click to play together.`,
        nextTurnPlayer: state.name,
      });
    }
  }, [effectiveRoomId, state.name]);

  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = (squares: Array<string | null>) => {
    for (const [a, b, c] of winningLines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every((sq) => sq !== null)) return "draw";
    return null;
  };

  // Listen for real-time game state sent from partner
  useEffect(() => {
    const handleGameState = (e: CustomEvent) => {
      const { gameId, stateData, moveData } = e.detail;
      const data = stateData || moveData;
      if (gameId === "tictactoe" && data?.board) {
        setBoard(data.board);
        if (data.isXNext !== undefined) setIsXNext(data.isXNext);

        const win = data.winner !== undefined ? data.winner : checkWinner(data.board);
        if (win) {
          setWinner(win);
          if (win !== "draw") {
            setConfetti(true);
            setTimeout(() => setConfetti(false), 2000);
          }
        } else {
          setWinner(null);
        }
      }
    };

    window.addEventListener("fold:game_state", handleGameState as EventListener);
    window.addEventListener("fold:game_turn", handleGameState as EventListener);
    return () => {
      window.removeEventListener("fold:game_state", handleGameState as EventListener);
      window.removeEventListener("fold:game_turn", handleGameState as EventListener);
    };
  }, []);

  const handleClick = (index: number) => {
    if (board[index] || winner || currentTurnPlayer !== "me") return;

    const nextBoard = [...board];
    const symbol = "❤️"; // My symbol is always Hearts
    nextBoard[index] = symbol;
    setBoard(nextBoard);

    const winResult = checkWinner(nextBoard);

    // Fast Real-Time: Broadcast move immediately to partner without UI lock
    broadcastGameState(effectiveRoomId, {
      gameId: "tictactoe",
      stateData: { board: nextBoard, isXNext: !isXNext, winner: winResult },
      sender: state.name,
    });
  };

  const handleSimulatePartnerMove = () => {
    // Find first empty cell and place Rose
    const emptyIndex = board.findIndex((cell) => cell === null);
    if (emptyIndex === -1 || winner) return;

    const nextBoard = [...board];
    nextBoard[emptyIndex] = "🌹";
    setBoard(nextBoard);

    const winResult = checkWinner(nextBoard);
    if (winResult) {
      setWinner(winResult);
      if (winResult === "🌹") setScores((s) => ({ ...s, partner: s.partner + 1 }));
      else if (winResult === "❤️") setScores((s) => ({ ...s, me: s.me + 1 }));
      else setScores((s) => ({ ...s, draws: s.draws + 1 }));
    } else {
      setIsXNext(true);
    }

    broadcastGameState(effectiveRoomId, {
      gameId: "tictactoe",
      stateData: { board: nextBoard, isXNext: true, winner: winResult },
      sender: state.partner,
    });
  };

  const handleReset = () => {
    const freshBoard = Array(9).fill(null);
    setBoard(freshBoard);
    setIsXNext(true);
    setWinner(null);

    broadcastGameState(effectiveRoomId, {
      gameId: "tictactoe",
      stateData: { board: freshBoard, isXNext: true, winner: null },
      sender: state.name,
    });
  };

  return (
    <div className="relative overflow-hidden paper grain rounded-[28px] p-6 shadow-device text-center">
      <ConfettiOverlay show={confetti} />

      <div className="flex items-center justify-between border-b border-ink/5 pb-3">
        <span className="text-[10px] tracking-[0.2em] text-coral font-semibold uppercase">
          HEARTS &amp; ROSES (TURN-BASED)
        </span>
        <span className="text-xs text-ink-soft font-medium">
          {scores.me} ({state.name}) : {scores.partner} ({state.partner})
        </span>
      </div>

      {/* Turn Indicator */}
      <div className="my-4">
        {winner ? (
          <p className="font-display text-2xl text-coral font-medium animate-bounce">
            {winner === "draw" ? "A Sweet Tie! Both win hugs 🤗" : `${winner} takes the round! 🏆`}
          </p>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 shadow-sm border border-white/80">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-ink">
              Turn: {currentTurnPlayer === "me" ? `❤️ Your Move (${state.name})` : `🌹 ${state.partner}'s Move`}
            </span>
          </div>
        )}
      </div>

      {/* Board Grid */}
      <div className="mx-auto grid grid-cols-3 gap-2.5 max-w-[260px]">
        {board.map((cell, idx) => (
          <button
            key={idx}
            type="button"
            disabled={currentTurnPlayer !== "me" || Boolean(cell) || Boolean(winner)}
            onClick={() => handleClick(idx)}
            className="press flex h-20 w-20 items-center justify-center rounded-2xl bg-white/70 text-3xl shadow-soft hover:bg-white transition-all border border-white/80"
          >
            {cell}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleReset}
        className="press mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2 text-xs font-medium text-parchment shadow-sm"
      >
        <RotateCcw size={13} />
        <span>New Round</span>
      </button>
    </div>
  );
}

/* =========================================================================
 * 3. GAME: SPIN THE LOVE WHEEL WITH LIVE CHAT BROADCASTS & ALTERNATING SPINS
 * ========================================================================= */
const WHEEL_ITEMS = [
  "Give partner a 1-minute slow back massage 💆",
  "Whisper your deepest secret crush thought 🤫",
  "Slow dance together to any song for 2 mins 💃",
  "Share your favorite memory of us from this year ✨",
  "Kiss tenderly on the forehead, cheek, and lips 💋",
  "Partner chooses dinner or dessert tonight 🍰",
  "Send a spicy whisper voice memo right now 🎙️",
  "Make a promise you will fulfill before Sunday 🤞",
];

function SpinTheWheelGame() {
  const state = useFold();
  const effectiveRoomId = state.roomId || state.soulCode || "fold-private-room";
  const [spinning, setSpinning] = useState(false);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<"me" | "partner">("me");
  const [confetti, setConfetti] = useState(false);
  const inviteSentRef = useRef(false);

  // Send interactive Game Invite card to Chat upon opening
  useEffect(() => {
    if (!inviteSentRef.current) {
      inviteSentRef.current = true;
      sendGameChatCard({
        roomId: effectiveRoomId,
        gameId: "spin-wheel",
        gameTitle: "Wheel of Romance",
        gameIcon: "🎡",
        actionType: "invite",
        summary: `${state.name} opened the Wheel of Romance! Spin turns alternate between partners.`,
        nextTurnPlayer: state.name,
      });
    }
  }, [effectiveRoomId, state.name]);

  // Listen for partner spins
  useEffect(() => {
    const handleGameTurn = (e: CustomEvent) => {
      const { gameId, moveData } = e.detail;
      if (gameId === "spin-wheel" && moveData?.result) {
        setSelectedResult(moveData.result);
        setCurrentTurnPlayer("me"); // Turn is back to me
      }
    };

    window.addEventListener("fold:game_turn", handleGameTurn as EventListener);
    return () => window.removeEventListener("fold:game_turn", handleGameTurn as EventListener);
  }, []);

  const spinWheel = () => {
    if (spinning || currentTurnPlayer !== "me") return;
    setSpinning(true);
    setSelectedResult(null);

    const randomDegrees = 1440 + Math.floor(Math.random() * 360);
    const newRot = rotation + randomDegrees;
    setRotation(newRot);

    setTimeout(() => {
      setSpinning(false);
      const normalized = ((newRot % 360) + 360) % 360;
      const index = Math.floor(((360 - normalized) % 360) / (360 / WHEEL_ITEMS.length));
      const res = WHEEL_ITEMS[index] || WHEEL_ITEMS[0]!;
      setSelectedResult(res);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2000);

      // 1. Broadcast the romantic dare result directly into Chat Room
      sendGameChatCard({
        roomId: effectiveRoomId,
        gameId: "spin-wheel",
        gameTitle: "Wheel of Romance",
        gameIcon: "🎡",
        actionType: "result",
        summary: `🎡 ${state.name} spun the wheel and got: "${res}"`,
        nextTurnPlayer: state.partner,
      });

      // 2. Lock screen and pass turn to partner
      setCurrentTurnPlayer("partner");

      // 3. Notify partner via Supabase Realtime
      broadcastGameTurn(effectiveRoomId, {
        gameId: "spin-wheel",
        gameTitle: "Wheel of Romance",
        moveData: { result: res },
        nextPlayer: state.partner,
      });
    }, 3000);
  };

  const handleSimulatePartnerSpin = () => {
    const randomItem = WHEEL_ITEMS[Math.floor(Math.random() * WHEEL_ITEMS.length)]!;
    setSelectedResult(randomItem);
    setCurrentTurnPlayer("me"); // Unlock for me

    sendGameChatCard({
      roomId: effectiveRoomId,
      gameId: "spin-wheel",
      gameTitle: "Wheel of Romance",
      gameIcon: "🎡",
      actionType: "result",
      summary: `🎡 ${state.partner} spun the wheel and got: "${randomItem}"! Now it's ${state.name}'s turn to spin!`,
      nextTurnPlayer: state.name,
    });
  };

  return (
    <div className="relative overflow-hidden paper grain rounded-[28px] p-6 shadow-device text-center">
      <ConfettiOverlay show={confetti} />

      <div className="flex items-center justify-between border-b border-ink/5 pb-3">
        <span className="text-[10px] tracking-[0.2em] text-coral font-semibold uppercase">
          WHEEL OF ROMANCE
        </span>
        <span className="text-xs text-ink-soft">
          Turn: <strong>{currentTurnPlayer === "me" ? state.name : state.partner}</strong>
        </span>
      </div>

      <div className="relative my-8 flex items-center justify-center">
        {/* Pointer indicator */}
        <div className="absolute -top-3 z-20 text-coral text-2xl font-bold">▼</div>

        {/* Wheel container */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: [0.15, 0.9, 0.25, 1] }}
          className="relative h-60 w-60 rounded-full border-4 border-white/80 bg-gradient-to-tr from-coral/30 via-parchment to-teal/30 shadow-device flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 rounded-full border border-ink/10" />
          <div className="h-16 w-16 rounded-full bg-white shadow-soft flex items-center justify-center text-xl z-10">
            💖
          </div>
          {WHEEL_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="absolute text-[10px] font-medium text-ink w-full px-2"
              style={{
                transform: `rotate(${(360 / WHEEL_ITEMS.length) * idx}deg) translateY(-85px)`,
              }}
            >
              • {item.split(" ")[0]}
            </div>
          ))}
        </motion.div>
      </div>

      {selectedResult ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-coral/10 p-4 border border-coral/20"
        >
          <p className="text-[11px] font-semibold tracking-wider text-coral uppercase">
            YOUR ROMANTIC DARE (BROADCAST IN CHAT):
          </p>
          <p className="font-display mt-1 text-xl text-ink font-medium">
            {selectedResult}
          </p>
        </motion.div>
      ) : null}

      <button
        type="button"
        onClick={spinWheel}
        disabled={spinning || currentTurnPlayer !== "me"}
        className={cn(
          "press mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-medium shadow-soft",
          spinning || currentTurnPlayer !== "me"
            ? "bg-ink/30 text-white cursor-not-allowed"
            : "bg-ink text-parchment hover:bg-ink/90",
        )}
      >
        <Dices size={15} />
        <span>{spinning ? "Spinning the Wheel…" : "Spin for Us 🎡"}</span>
      </button>
    </div>
  );
}

/* =========================================================================
 * 4. GAME: MEMORY MATCH (TURN-BASED 2-PLAYER FLIP CONTROL)
 * ========================================================================= */
const MATCH_ICONS = ["🎬", "💖", "🍿", "🌹", "👑", "💌"];

function MemoryFlipGame() {
  const state = useFold();
  const effectiveRoomId = state.roomId || state.soulCode || "fold-private-room";
  const [cards, setCards] = useState<Array<{ id: number; icon: string; flipped: boolean; matched: boolean }>>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [scores, setScores] = useState({ me: 0, partner: 0 });
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<"me" | "partner">("me");
  const [confetti, setConfetti] = useState(false);
  const inviteSentRef = useRef(false);

  // Send interactive Game Invite card to Chat upon opening
  useEffect(() => {
    if (!inviteSentRef.current) {
      inviteSentRef.current = true;
      sendGameChatCard({
        roomId: effectiveRoomId,
        gameId: "memory-match",
        gameTitle: "Memory Match",
        gameIcon: "🃏",
        actionType: "invite",
        summary: `${state.name} invited ${state.partner} to 2-Player Memory Match! Match cards to score points.`,
        nextTurnPlayer: state.name,
      });
    }
  }, [effectiveRoomId, state.name, state.partner]);

  const initGame = () => {
    const deck = [...MATCH_ICONS, ...MATCH_ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, id) => ({ id, icon, flipped: false, matched: false }));
    setCards(deck);
    setSelected([]);
    setScores({ me: 0, partner: 0 });
    setCurrentTurnPlayer("me");
  };

  useEffect(() => {
    initGame();
  }, []);

  // Listen for real-time game turns
  useEffect(() => {
    const handleGameTurn = (e: CustomEvent) => {
      const { gameId, moveData } = e.detail;
      if (gameId === "memory-match" && moveData) {
        if (moveData.cards) setCards(moveData.cards);
        if (moveData.partnerScore !== undefined) {
          setScores((prev) => ({ ...prev, partner: moveData.partnerScore }));
        }
        setCurrentTurnPlayer("me"); // Turn passed to me
      }
    };

    window.addEventListener("fold:game_turn", handleGameTurn as EventListener);
    return () => window.removeEventListener("fold:game_turn", handleGameTurn as EventListener);
  }, []);

  const handleCardClick = (id: number) => {
    if (currentTurnPlayer !== "me" || selected.length === 2 || cards[id]?.flipped || cards[id]?.matched) return;

    const nextCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    setCards(nextCards);

    const nextSelected = [...selected, id];
    setSelected(nextSelected);

    if (nextSelected.length === 2) {
      const [first, second] = nextSelected;
      if (first !== undefined && second !== undefined && cards[first]?.icon === cards[second]?.icon) {
        // MATCH FOUND: Keep cards revealed, grant points, and player keeps turn
        setTimeout(() => {
          const updatedCards = nextCards.map((c) =>
            c.id === first || c.id === second ? { ...c, matched: true } : c,
          );
          setCards(updatedCards);
          const newMyScore = scores.me + 1;
          setScores((s) => ({ ...s, me: newMyScore }));
          setSelected([]);

          const totalMatched = updatedCards.filter((c) => c.matched).length;
          if (totalMatched === MATCH_ICONS.length * 2) {
            setConfetti(true);
            setTimeout(() => setConfetti(false), 2500);

            sendGameChatCard({
              roomId: effectiveRoomId,
              gameId: "memory-match",
              gameTitle: "Memory Match",
              gameIcon: "🏆",
              actionType: "result",
              summary: `All cards matched! Final Scores: ${state.name} (${newMyScore}) : ${state.partner} (${scores.partner})!`,
            });
          } else {
            sendGameChatCard({
              roomId: effectiveRoomId,
              gameId: "memory-match",
              gameTitle: "Memory Match",
              gameIcon: "🃏",
              actionType: "turn",
              summary: `${state.name} matched a pair of ${cards[first]?.icon}! +1 point and gets an extra turn!`,
              nextTurnPlayer: state.name,
            });
          }
        }, 500);
      } else {
        // MISMATCH: Flip back, lock screen, and pass turn to partner
        setTimeout(() => {
          const unFlippedCards = nextCards.map((c) =>
            c.id === first || c.id === second ? { ...c, flipped: false } : c,
          );
          setCards(unFlippedCards);
          setSelected([]);
          setCurrentTurnPlayer("partner"); // Lock screen

          // Broadcast card state to partner via Supabase Realtime
          broadcastGameTurn(effectiveRoomId, {
            gameId: "memory-match",
            gameTitle: "Memory Match",
            moveData: { cards: unFlippedCards, partnerScore: scores.me },
            nextPlayer: state.partner,
          });

          sendGameChatCard({
            roomId: effectiveRoomId,
            gameId: "memory-match",
            gameTitle: "Memory Match",
            gameIcon: "🃏",
            actionType: "turn",
            summary: `${state.name} flipped two cards (mismatch). Turn passed to ${state.partner}!`,
            nextTurnPlayer: state.partner,
          });
        }, 900);
      }
    }
  };

  const handleSimulatePartnerMatch = () => {
    // Find two unmatched matching cards or simulate a pair
    const unmatched = cards.filter((c) => !c.matched);
    if (unmatched.length < 2) return;

    const firstIcon = unmatched[0]?.icon;
    const pair = cards.filter((c) => c.icon === firstIcon);

    if (pair.length === 2 && pair[0] && pair[1]) {
      const p1 = pair[0].id;
      const p2 = pair[1].id;
      const updatedCards = cards.map((c) => (c.id === p1 || c.id === p2 ? { ...c, matched: true, flipped: true } : c));
      setCards(updatedCards);
      setScores((s) => ({ ...s, partner: s.partner + 1 }));
    }

    setCurrentTurnPlayer("me"); // Turn returns to me
  };

  const totalPairs = MATCH_ICONS.length;
  const currentPairsMatched = cards.filter((c) => c.matched).length / 2;

  return (
    <div className="relative overflow-hidden paper grain rounded-[28px] p-6 shadow-device text-center">
      <ConfettiOverlay show={confetti} />

      <div className="flex items-center justify-between border-b border-ink/5 pb-3">
        <span className="text-[10px] tracking-[0.2em] text-coral font-semibold uppercase">
          MEMORY CARD MATCH
        </span>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {state.name}: {scores.me}
          </span>
          <span className="text-coral bg-coral/10 px-2 py-0.5 rounded-full">
            {state.partner}: {scores.partner}
          </span>
        </div>
      </div>

      <div className="my-6 grid grid-cols-4 gap-2.5 max-w-[280px] mx-auto">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            disabled={currentTurnPlayer !== "me" || card.matched || card.flipped}
            onClick={() => handleCardClick(card.id)}
            className={cn(
              "press flex h-16 w-16 items-center justify-center rounded-2xl text-2xl transition-all border",
              card.flipped || card.matched
                ? "bg-white shadow-soft border-white/80"
                : "bg-ink/5 hover:bg-ink/10 border-transparent",
            )}
          >
            {card.flipped || card.matched ? card.icon : "✨"}
          </button>
        ))}
      </div>

      {currentPairsMatched === totalPairs ? (
        <p className="font-display text-xl text-coral font-medium animate-pulse mb-3">
          All pairs matched! You two are totally in sync ❤️
        </p>
      ) : null}

      <button
        type="button"
        onClick={initGame}
        className="press inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-parchment shadow-soft"
      >
        <RotateCcw size={13} />
        <span>Restart Game</span>
      </button>
    </div>
  );
}



/* =========================================================================
 * EXPANDED 20+ VISUAL PICTURE-BASED GAMES CATALOGUE & RUNNERS
 * ========================================================================= */
export interface MiniGameMeta {
  id: string;
  title: string;
  category: "trivia" | "classic" | "action" | "spicy" | "creative" | "speed";
  tag: string;
  badgeColor: string;
  imageBg: string;
  icon: string;
  emoji: string;
  summary: string;
  turnsPerRound: number;
}

export const TWENTY_COUPLE_GAMES: MiniGameMeta[] = [
  {
    id: "movie",
    title: "Movie Poster Guess",
    category: "trivia",
    tag: "Visual Cinema",
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-200",
    imageBg: "from-rose-500/25 via-pink-500/15 to-amber-500/20",
    icon: "🎬",
    emoji: "🍿",
    summary: "Decode famous movies from emoji clues, actor stills & dialogues.",
    turnsPerRound: 2,
  },
  {
    id: "tictactoe",
    title: "Hearts & Roses",
    category: "classic",
    tag: "Romantic Classic",
    badgeColor: "bg-red-500/10 text-red-600 border-red-200",
    imageBg: "from-red-500/25 via-rose-500/15 to-orange-500/20",
    icon: "❤️",
    emoji: "🌹",
    summary: "Turn-based 3x3 showdown. Hearts vs Roses.",
    turnsPerRound: 9,
  },
  {
    id: "wheel",
    title: "Wheel of Romance",
    category: "action",
    tag: "Dares & Surprises",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200",
    imageBg: "from-purple-500/25 via-fuchsia-500/15 to-pink-500/20",
    icon: "🎡",
    emoji: "💋",
    summary: "Spin for spicy intimate dares, whispers, and sweet favors.",
    turnsPerRound: 2,
  },
  {
    id: "memory",
    title: "Memory Match",
    category: "classic",
    tag: "Sync & Memory",
    badgeColor: "bg-teal-500/10 text-teal-600 border-teal-200",
    imageBg: "from-teal-500/25 via-emerald-500/15 to-cyan-500/20",
    icon: "🃏",
    emoji: "✨",
    summary: "2-player card flips. Match pairs to score intimate points.",
    turnsPerRound: 6,
  },
  {
    id: "who-knows",
    title: "Who Knows Me Best?",
    category: "trivia",
    tag: "Deep Intimacy",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200",
    imageBg: "from-amber-500/25 via-yellow-500/15 to-orange-500/20",
    icon: "🧠",
    emoji: "👑",
    summary: "Guess each other's secret favorites, habits, and pet peeves.",
    turnsPerRound: 4,
  },
  {
    id: "would-you-rather",
    title: "Would You Rather (Couples)",
    category: "spicy",
    tag: "Dilemmas",
    badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
    imageBg: "from-indigo-500/25 via-blue-500/15 to-purple-500/20",
    icon: "🤔",
    emoji: "⚡",
    summary: "Spicy & wild couples scenarios. See if your choices align.",
    turnsPerRound: 2,
  },
  {
    id: "truth-or-dare",
    title: "Truth or Dare Tonight",
    category: "spicy",
    tag: "Midnight Heat",
    badgeColor: "bg-rose-600/10 text-rose-700 border-rose-300",
    imageBg: "from-rose-600/30 via-red-500/20 to-pink-600/25",
    icon: "🔥",
    emoji: "🌶️",
    summary: "Vulnerable confessions and fun, playful bedroom dares.",
    turnsPerRound: 2,
  },
  {
    id: "love-language",
    title: "Love Language Quiz",
    category: "trivia",
    tag: "Emotional Heart",
    badgeColor: "bg-pink-500/10 text-pink-600 border-pink-200",
    imageBg: "from-pink-500/25 via-rose-400/15 to-warm-pink/20",
    icon: "💖",
    emoji: "🕊️",
    summary: "Discover which gestures make your partner feel most cherished.",
    turnsPerRound: 3,
  },
  {
    id: "actor-guess",
    title: "Bollywood & South Stars",
    category: "trivia",
    tag: "Star Avatars",
    badgeColor: "bg-amber-600/10 text-amber-700 border-amber-200",
    imageBg: "from-amber-600/25 via-orange-500/15 to-yellow-600/20",
    icon: "🌟",
    emoji: "📸",
    summary: "Identify legendary actors from their signature look & dialogues.",
    turnsPerRound: 2,
  },
  {
    id: "fortune-cookie",
    title: "Romantic Fortune Cookie",
    category: "action",
    tag: "Destiny Tap",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    imageBg: "from-emerald-500/25 via-teal-500/15 to-lime-500/20",
    icon: "🥠",
    emoji: "📜",
    summary: "Crack open our lucky daily love prediction and post to Chat.",
    turnsPerRound: 2,
  },
  {
    id: "lyrics-mash",
    title: "Romantic Song Lyrics Match",
    category: "creative",
    tag: "Musical Hearts",
    badgeColor: "bg-sky-500/10 text-sky-600 border-sky-200",
    imageBg: "from-sky-500/25 via-blue-500/15 to-indigo-500/20",
    icon: "🎵",
    emoji: "🎧",
    summary: "Complete the iconic love songs from Arijit to Shreya Ghoshal.",
    turnsPerRound: 3,
  },
  {
    id: "telepathy",
    title: "Couple Telepathy Test",
    category: "speed",
    tag: "Mind Connection",
    badgeColor: "bg-violet-500/10 text-violet-600 border-violet-200",
    imageBg: "from-violet-500/25 via-purple-500/15 to-fuchsia-500/20",
    icon: "🔮",
    emoji: "🧿",
    summary: "Pick 1 of 3 options simultaneously without speaking. Match = win!",
    turnsPerRound: 2,
  },
  {
    id: "never-have-i",
    title: "Never Have I Ever",
    category: "spicy",
    tag: "Secret Spills",
    badgeColor: "bg-red-500/10 text-red-600 border-red-200",
    imageBg: "from-red-500/25 via-rose-500/15 to-amber-500/20",
    icon: "🙈",
    emoji: "🥂",
    summary: "Reveal funny & intimate things you have or haven't done.",
    turnsPerRound: 2,
  },
  {
    id: "date-night-roulette",
    title: "Date Night Roulette",
    category: "action",
    tag: "Spontaneous Love",
    badgeColor: "bg-orange-500/10 text-orange-600 border-orange-200",
    imageBg: "from-orange-500/25 via-amber-500/15 to-yellow-500/20",
    icon: "🍷",
    emoji: "🕯️",
    summary: "Roll the dice to decide tonight's date food, mood & activities.",
    turnsPerRound: 2,
  },
  {
    id: "kiss-map",
    title: "Intimate Kiss & Hug Map",
    category: "spicy",
    tag: "Sensory Warmth",
    badgeColor: "bg-pink-600/10 text-pink-700 border-pink-300",
    imageBg: "from-pink-600/25 via-rose-500/20 to-red-500/20",
    icon: "💋",
    emoji: "🫂",
    summary: "Tap a spot on the romantic silhouette to request a tender kiss.",
    turnsPerRound: 2,
  },
  {
    id: "emoji-pictionary",
    title: "Emoji Pictionary Stories",
    category: "creative",
    tag: "Story Decoders",
    badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
    imageBg: "from-cyan-500/25 via-teal-500/15 to-blue-500/20",
    icon: "🎨",
    emoji: "🧩",
    summary: "Send 3 emojis to describe our first date, first trip or big dream.",
    turnsPerRound: 2,
  },
  {
    id: "fast-fingers",
    title: "Heart Tap Race",
    category: "speed",
    tag: "Rapid Hearts",
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-200",
    imageBg: "from-rose-500/25 via-red-500/15 to-orange-500/20",
    icon: "⚡",
    emoji: "💓",
    summary: "Who can tap the glowing origami heart 20 times the fastest?",
    turnsPerRound: 2,
  },
  {
    id: "future-builder",
    title: "Our Dream Home Builder",
    category: "creative",
    tag: "Future Nest",
    badgeColor: "bg-emerald-600/10 text-emerald-700 border-emerald-200",
    imageBg: "from-emerald-600/25 via-teal-500/15 to-cyan-500/20",
    icon: "🏡",
    emoji: "🪴",
    summary: "Take turns picking our dream kitchen, balcony view, and pets.",
    turnsPerRound: 4,
  },
  {
    id: "secret-admirer",
    title: "Whisper Compliment Box",
    category: "trivia",
    tag: "Sweet Affirmations",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200",
    imageBg: "from-amber-500/25 via-yellow-500/15 to-rose-500/20",
    icon: "💌",
    emoji: "🌹",
    summary: "Unlock 3 hidden compliments your partner locked for you today.",
    turnsPerRound: 2,
  },
  {
    id: "bucket-list",
    title: "Couple Bucket List Spin",
    category: "action",
    tag: "Adventures Ahead",
    badgeColor: "bg-blue-600/10 text-blue-700 border-blue-200",
    imageBg: "from-blue-600/25 via-indigo-500/15 to-teal-500/20",
    icon: "✈️",
    emoji: "🏔️",
    summary: "Pick destinations and thrilling dates to lock into our Forever Vault.",
    turnsPerRound: 2,
  },
];

/**
 * Generic Interactive Turn-Based Mini-Game Runner for Extended Games
 */
function GenericMiniGameRunner({
  game,
  onBack,
}: {
  game: MiniGameMeta;
  onBack: () => void;
}) {
  const state = useFold();
  const effectiveRoomId = state.roomId || state.soulCode || "fold-private-room";
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<"me" | "partner">("me");
  const [score, setScore] = useState({ me: 0, partner: 0 });
  const [actionDone, setActionDone] = useState(false);
  const [customText, setCustomText] = useState("");
  const [confetti, setConfetti] = useState(false);
  const inviteSent = useRef(false);

  // Auto-send chat invite on launch
  useEffect(() => {
    if (!inviteSent.current) {
      inviteSent.current = true;
      sendGameChatCard({
        roomId: effectiveRoomId,
        gameId: game.id,
        gameTitle: game.title,
        gameIcon: game.icon,
        actionType: "invite",
        summary: `${state.name} launched ${game.title}! Tap to play turn-based together.`,
        nextTurnPlayer: state.name,
      });
    }
  }, [effectiveRoomId, game, state.name]);

  // Listen for real-time turns
  useEffect(() => {
    const handleGameTurn = (e: CustomEvent) => {
      const { gameId, moveData } = e.detail;
      if (gameId === game.id) {
        if (moveData?.partnerScore !== undefined) {
          setScore((s) => ({ ...s, partner: moveData.partnerScore }));
        }
        setCurrentTurnPlayer("me");
        setActionDone(false);
      }
    };

    window.addEventListener("fold:game_turn", handleGameTurn as EventListener);
    return () => window.removeEventListener("fold:game_turn", handleGameTurn as EventListener);
  }, [game.id]);

  const handleTakeAction = (choiceText: string) => {
    if (currentTurnPlayer !== "me") return;
    setActionDone(true);
    const newMyScore = score.me + 10;
    setScore((s) => ({ ...s, me: newMyScore }));
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2000);

    // 1. Post to Chat
    sendGameChatCard({
      roomId: effectiveRoomId,
      gameId: game.id,
      gameTitle: game.title,
      gameIcon: game.icon,
      actionType: "result",
      summary: `${state.name} chose: "${choiceText}" in ${game.title}! (+10 pts)`,
      nextTurnPlayer: state.partner,
    });

    // 2. Lock screen and pass turn
    setCurrentTurnPlayer("partner");

    // 3. Broadcast to Supabase
    broadcastGameTurn(effectiveRoomId, {
      gameId: game.id,
      gameTitle: game.title,
      moveData: { choice: choiceText, partnerScore: newMyScore },
      nextPlayer: state.partner,
    });
  };

  const handleSimulatePartner = () => {
    setCurrentTurnPlayer("me");
    setScore((s) => ({ ...s, partner: s.partner + 10 }));
    sendGameChatCard({
      roomId: effectiveRoomId,
      gameId: game.id,
      gameTitle: game.title,
      gameIcon: game.icon,
      actionType: "turn",
      summary: `${state.partner} took their turn! It is now ${state.name}'s turn.`,
      nextTurnPlayer: state.name,
    });
  };

  const sampleChoices = [
    `Option A: Sweet & Cozy Morning`,
    `Option B: Wild & Passionate Midnight`,
    `Option C: Long Candlelight Talk`,
    `Option D: Spontaneous Road Trip`,
  ];

  return (
    <div className="relative overflow-hidden paper grain rounded-[30px] p-6 shadow-device">
      <ConfettiOverlay show={confetti} />

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-ink/5 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="press inline-flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink"
        >
          <span>← Back to Games</span>
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {state.name}: {score.me}
          </span>
          <span className="text-coral bg-coral/10 px-2 py-0.5 rounded-full">
            {state.partner}: {score.partner}
          </span>
        </div>
      </div>

      {/* Hero Visual Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative mt-4 overflow-hidden rounded-[26px] border border-white/80 p-6 shadow-soft bg-gradient-to-br text-center",
          game.imageBg,
        )}
      >
        <span className="text-4xl filter drop-shadow-sm">{game.icon}</span>
        <h3
          className="font-bold text-2xl text-ink mt-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {game.title}
        </h3>
        <p className="mt-1 text-xs text-ink-soft max-w-[280px] mx-auto font-medium">
          {game.summary}
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1 text-[11px] font-semibold text-ink border border-white/80">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Turn: {currentTurnPlayer === "me" ? `Your Move (${state.name})` : `${state.partner}'s Move`}
          </span>
        </div>
      </motion.div>

      {/* Action Options */}
      <div className="mt-5 space-y-2.5">
        <p className="text-[11px] font-bold tracking-wider text-ink-soft uppercase text-center">
          Choose your answer or move for {state.partner}:
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sampleChoices.map((choice, idx) => (
            <button
              key={idx}
              type="button"
              disabled={currentTurnPlayer !== "me" || actionDone}
              onClick={() => handleTakeAction(choice)}
              className="press rounded-2xl bg-white/70 p-3.5 text-left text-xs font-semibold text-ink shadow-soft border border-white/80 hover:bg-white transition-all"
            >
              <div className="flex items-center justify-between">
                <span>{choice}</span>
                <span className="text-coral text-sm">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Custom text whisper input */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={`Whisper custom move for ${state.partner}…`}
            disabled={currentTurnPlayer !== "me" || actionDone}
            className="flex-1 rounded-2xl border border-white/80 bg-white/70 px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-soft/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-coral"
          />
          <button
            type="button"
            disabled={!customText.trim() || currentTurnPlayer !== "me" || actionDone}
            onClick={() => {
              handleTakeAction(customText.trim());
              setCustomText("");
            }}
            className={cn(
              "press rounded-2xl px-4 py-2.5 text-xs font-semibold shadow-soft transition-all",
              customText.trim() && currentTurnPlayer === "me"
                ? "bg-ink text-parchment hover:bg-ink/90"
                : "bg-ink/10 text-ink/30 cursor-not-allowed",
            )}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * 5. UNLIMITED DAILY QUESTIONS & VISUAL PROMPTS
 * ========================================================================= */
const ROTATING_DAILY_PROMPTS = [
  {
    id: "q-1",
    tag: "Romantic",
    icon: "💖",
    prompt: "What is a small, quiet moment with me that you replay in your mind when you miss me?",
    imageBg: "from-rose-500/15 to-amber-500/15",
  },
  {
    id: "q-2",
    tag: "Cinema & Soul",
    icon: "🎬",
    prompt: "If our story was made into a movie, which actor would play each of us?",
    imageBg: "from-sky-500/15 to-purple-500/15",
  },
  {
    id: "q-3",
    tag: "Deep Vulnerability",
    icon: "🌊",
    prompt: "In what ways do you feel most safely loved and understood by me?",
    imageBg: "from-teal-500/15 to-emerald-500/15",
  },
  {
    id: "q-4",
    tag: "Dreams & Future",
    icon: "🏡",
    prompt: "When you imagine our home in ten years, what is one little detail that stands out most?",
    imageBg: "from-amber-500/15 to-orange-500/15",
  },
  {
    id: "q-5",
    tag: "Playful Sparks",
    icon: "🥂",
    prompt: "What is the funniest or most endearing quirk you've secretly noticed about me?",
    imageBg: "from-pink-500/15 to-rose-500/15",
  },
];

function DailyQuestionsSection() {
  const state = useFold();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [sent, setSent] = useState(false);
  const effectiveRoomId = state.roomId || state.soulCode || "fold-private-room";

  const q = ROTATING_DAILY_PROMPTS[index % ROTATING_DAILY_PROMPTS.length]!;

  const handleSendToChat = () => {
    if (!answer.trim()) return;

    // Send formatted card directly to ChatRoom
    const newMsg = sendChatMessage({
      type: "game",
      text: `💌 Couples Question:\n"${q.prompt}"\n\nMy Answer to ${state.partner}:\n${answer.trim()}`,
      gameData: {
        gameId: "daily-prompt",
        gameTitle: "Daily Intimate Prompt",
        gameIcon: "💌",
        actionType: "result",
        summary: `"${q.prompt}"\n— Answered by ${state.name}: "${answer.trim()}"`,
        nextTurnPlayer: state.partner,
      },
    });

    void broadcastChatMessage(effectiveRoomId, newMsg);

    setSent(true);
    setTimeout(() => {
      setSent(false);
      setAnswer("");
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Visual Question Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-[30px] border border-white/80 p-6 shadow-device backdrop-blur-md bg-gradient-to-br",
          q.imageBg,
        )}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] text-coral uppercase">
            <span>{q.icon}</span>
            <span>{q.tag}</span>
          </span>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev + 1) % ROTATING_DAILY_PROMPTS.length)}
            className="press flex items-center gap-1 text-xs text-ink-soft hover:text-coral"
          >
            <Shuffle size={12} />
            <span>Shuffle</span>
          </button>
        </div>

        <h3 className="font-display mt-4 text-2xl text-ink leading-snug">
          &ldquo;{q.prompt}&rdquo;
        </h3>

        {/* Quick in-app response */}
        <div className="mt-5 border-t border-ink/5 pt-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={`Whisper your answer to ${state.partner}…`}
            rows={3}
            className="w-full resize-none rounded-2xl border border-white/80 bg-white/70 p-3 text-xs text-ink placeholder:text-ink-soft/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-coral"
          />

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev + 1) % ROTATING_DAILY_PROMPTS.length)}
              className="press text-xs font-medium text-coral hover:underline"
            >
              Next Prompt →
            </button>

            <button
              type="button"
              onClick={handleSendToChat}
              disabled={!answer.trim()}
              className={cn(
                "press flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-xs font-medium transition-all shadow-soft",
                answer.trim()
                  ? "bg-ink text-parchment hover:bg-ink/90"
                  : "bg-ink/10 text-ink/30 cursor-not-allowed",
              )}
            >
              {sent ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span>Sent to Chat!</span>
                </>
              ) : (
                <>
                  <Heart size={13} className="fill-coral text-coral" />
                  <span>Send to {state.partner}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * MAIN EXPORT: 20+ PICTURE-BASED GAMES GRID & PROMPTS ENGINE
 * ========================================================================= */
export function CoupleGames({ initialGameId }: { initialGameId?: string } = {}) {
  const state = useFold();
  const effectiveRoomId = state.roomId || state.soulCode || "fold-private-room";
  const [activeTab, setActiveTab] = useState<"games" | "questions">("games");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(initialGameId || null);
  const [isPartnerInRoom, setIsPartnerInRoom] = useState<boolean>(false);

  // Real-time map of game turn states (e.g. { [gameId]: "me" | "partner" })
  const [gameTurns, setGameTurns] = useState<Record<string, "me" | "partner">>({
    movie: "me",
    tictactoe: "me",
    wheel: "me",
    memory: "me",
  });

  useEffect(() => {
    if (initialGameId) {
      setSelectedGameId(initialGameId);
      setActiveTab("games");
    }
  }, [initialGameId]);

  // When a game is selected, announce presence to partner and ping
  useEffect(() => {
    if (selectedGameId) {
      const meta = TWENTY_COUPLE_GAMES.find((g) => g.id === selectedGameId);
      broadcastGamePresence(effectiveRoomId, {
        gameId: selectedGameId,
        gameTitle: meta?.title || "Mini-Game",
        sender: state.name,
        action: "joined",
      });

      // Listen for partner joining/pinging
      const handlePresence = (e: CustomEvent) => {
        const payload = e.detail;
        if (payload && payload.gameId === selectedGameId) {
          if (payload.action === "joined" || payload.action === "ping") {
            setIsPartnerInRoom(true);
            // Respond back so both sides know they're connected
            if (payload.action === "joined") {
              broadcastGamePresence(effectiveRoomId, {
                gameId: selectedGameId,
                gameTitle: meta?.title || "Mini-Game",
                sender: state.name,
                action: "ping",
              });
            }
          } else if (payload.action === "left") {
            setIsPartnerInRoom(false);
          }
        }
      };

      window.addEventListener("fold:game_presence", handlePresence as EventListener);
      return () => {
        window.removeEventListener("fold:game_presence", handlePresence as EventListener);
        broadcastGamePresence(effectiveRoomId, {
          gameId: selectedGameId,
          gameTitle: meta?.title || "Mini-Game",
          sender: state.name,
          action: "left",
        });
      };
    } else {
      setIsPartnerInRoom(false);
    }
  }, [selectedGameId, effectiveRoomId, state.name]);

  const handleNudgePartner = () => {
    const meta = TWENTY_COUPLE_GAMES.find((g) => g.id === selectedGameId);
    broadcastGamePresence(effectiveRoomId, {
      gameId: selectedGameId || "games",
      gameTitle: meta?.title || "2-Player Game",
      sender: state.name,
      action: "joined",
    });
  };

  // Real-time listener to update card badges when partner or user makes a move
  useEffect(() => {
    const handleGameTurn = (e: CustomEvent) => {
      const { gameId, nextPlayer } = e.detail;
      if (gameId) {
        setGameTurns((prev) => ({
          ...prev,
          [gameId]: nextPlayer === state.name ? "me" : "partner",
        }));
      }
    };

    window.addEventListener("fold:game_turn", handleGameTurn as EventListener);
    return () => window.removeEventListener("fold:game_turn", handleGameTurn as EventListener);
  }, [state.name]);

  const filteredGames = TWENTY_COUPLE_GAMES.filter(
    (g) => activeCategory === "all" || g.category === activeCategory,
  );

  const selectedGameMeta = TWENTY_COUPLE_GAMES.find((g) => g.id === selectedGameId);

  return (
    <div className="space-y-6">
      {/* Navigation Switcher */}
      <div className="flex rounded-2xl bg-white/60 p-1.5 shadow-soft border border-white/80">
        <button
          type="button"
          onClick={() => {
            setActiveTab("games");
            setSelectedGameId(null);
          }}
          className={cn(
            "press flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all",
            activeTab === "games"
              ? "bg-ink text-parchment shadow-soft"
              : "text-ink-soft hover:text-ink",
          )}
        >
          <Gamepad2 size={15} />
          <span>20+ Mini-Games Grid</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("questions");
            setSelectedGameId(null);
          }}
          className={cn(
            "press flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all",
            activeTab === "questions"
              ? "bg-ink text-parchment shadow-soft"
              : "text-ink-soft hover:text-ink",
          )}
        >
          <HelpCircle size={15} />
          <span>Daily Prompts</span>
        </button>
      </div>

      {activeTab === "games" ? (
        <div className="space-y-5">
          {/* If a game is active, render its runner */}
          {selectedGameId ? (
            <div className="relative">
              {/* Back strip */}
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedGameId(null)}
                  className="press inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold text-ink shadow-sm border border-white/80 hover:bg-white"
                >
                  <span>← Back to 20 Games Grid</span>
                </button>
                <span className="text-xs font-bold text-coral uppercase tracking-wider">
                  {selectedGameMeta?.title}
                </span>
              </div>

              {/* Universal Live Room Lobby Badge & Real-Time Status for ALL 20+ Games (Plato Layout) */}
              <UniversalLiveRoomHeader
                gameId={selectedGameId}
                gameTitle={selectedGameMeta?.title || "Mini-Game"}
                isPartnerHere={isPartnerInRoom}
                onInvitePartner={handleNudgePartner}
                onClose={() => setSelectedGameId(null)}
              />

              <div className="pb-24">
                {selectedGameId === "movie" && <MovieGuessingGame />}
                {selectedGameId === "tictactoe" && <TicTacToeGame />}
                {selectedGameId === "wheel" && <SpinTheWheelGame />}
                {selectedGameId === "memory" && <MemoryFlipGame />}
                {selectedGameMeta &&
                  selectedGameId !== "movie" &&
                  selectedGameId !== "tictactoe" &&
                  selectedGameId !== "wheel" &&
                  selectedGameId !== "memory" && (
                    <GenericMiniGameRunner
                      game={selectedGameMeta}
                      onBack={() => setSelectedGameId(null)}
                    />
                  )}
              </div>

              {/* Plato-Style Bottom Floating Quick-Chat Bar */}
              <InGameQuickChatOverlay
                gameId={selectedGameId}
                gameTitle={selectedGameMeta?.title || "Couple Mini-Game"}
              />
            </div>
          ) : (
            /* DENSE 20+ PICTURE-BASED GAMES GRID */
            <div className="space-y-4">
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "all", label: "✨ All (20 Games)" },
                  { id: "trivia", label: "🎬 Cinema & Trivia" },
                  { id: "classic", label: "❤️ Romantic Classics" },
                  { id: "action", label: "🎡 Dares & Action" },
                  { id: "spicy", label: "🔥 Spicy & Midnight" },
                  { id: "creative", label: "🎨 Creative & Future" },
                  { id: "speed", label: "⚡ Speed & Telepathy" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "press shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all border",
                      activeCategory === cat.id
                        ? "bg-coral text-white border-coral shadow-soft"
                        : "bg-white/60 text-ink-soft border-white/60 hover:bg-white hover:text-ink",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of 20 Picture-Based Cards with Real-Time Turn Indicators */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filteredGames.map((game) => {
                  const turn = gameTurns[game.id] || "me";
                  return (
                    <motion.button
                      key={game.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedGameId(game.id);
                        sendGameChatCard({
                          roomId: effectiveRoomId,
                          gameId: game.id,
                          gameTitle: game.title,
                          gameIcon: game.icon,
                          actionType: "invite",
                          summary: `${state.name} started ${game.title}! Click to accept & join live match.`,
                          nextTurnPlayer: state.name,
                        });
                      }}
                      className={cn(
                        "press relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-white/80 p-4 text-left shadow-soft bg-gradient-to-br transition-all hover:shadow-device group",
                        game.imageBg,
                      )}
                      style={{ minHeight: "165px" }}
                    >
                      {/* Top row: badge & turn status indicator */}
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border",
                            game.badgeColor,
                          )}
                        >
                          {game.tag}
                        </span>
                        
                        {/* Live Turn indicator */}
                        <span
                          className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-tight shadow-xs",
                            turn === "me"
                              ? "bg-emerald-500/90 text-white"
                              : "bg-ink/60 text-parchment",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              turn === "me" ? "bg-white animate-pulse" : "bg-white/50",
                            )}
                          />
                          <span>{turn === "me" ? "Your Turn" : `${state.partner}'s Turn`}</span>
                        </span>
                      </div>

                      {/* Center big visual icon / image clue */}
                      <div className="my-2 flex items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 shadow-soft text-2xl border border-white/80 group-hover:scale-110 transition-transform">
                          {game.icon}
                        </div>
                      </div>

                      {/* Bottom title & minimal subtitle */}
                      <div>
                        <h4
                          className="font-bold text-sm text-ink leading-tight line-clamp-1"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {game.title}
                        </h4>
                        <p className="mt-0.5 text-[10px] text-ink-soft line-clamp-1 leading-snug font-medium">
                          {game.summary}
                        </p>
                      </div>

                      {/* Hover subtle shine */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <DailyQuestionsSection />
      )}
    </div>
  );
}

