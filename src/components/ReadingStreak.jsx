import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { getStreakSummary, toDateKey } from "../appwrite/historyService";

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StatBlock({ icon, label, value, accent }) {
    return (
        <div
            className="
                flex
                flex-col
                items-center
                justify-center
                bg-slate-50
                dark:bg-slate-800/50
                rounded-xl
                p-4
                border
                border-slate-100
                dark:border-slate-700
                min-w-[110px]
                flex-1
            "
        >
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`text-2xl font-bold ${accent || "text-slate-800 dark:text-white"}`}>
                {value}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                {label}
            </div>
        </div>
    );
}

function StreakFireBadge({ streak, readToday }) {
    const fireFrames = useMemo(
        () => ["🔥", "🔥", "🔥", "🔆", "🔥"],
        []
    );

    if (streak === 0) {
        return (
            <div
                className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    w-24
                    h-24
                    rounded-full
                    bg-slate-100
                    dark:bg-slate-800
                    border-4
                    border-dashed
                    border-slate-300
                    dark:border-slate-600
                "
            >
                <span className="text-3xl">📚</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Start!
                </span>
            </div>
        );
    }

    const isHot = streak >= 7;
    const ringColor = readToday
        ? isHot
            ? "ring-4 ring-orange-400/70"
            : "ring-4 ring-amber-400/50"
        : "";

    return (
        <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
            <div
                className={`
                    flex
                    flex-col
                    items-center
                    justify-center
                    w-28
                    h-28
                    rounded-full
                    bg-gradient-to-br
                    ${isHot
                        ? "from-orange-400 via-amber-400 to-yellow-300"
                        : "from-amber-400 via-yellow-400 to-lime-300"
                    }
                    shadow-lg
                    ${ringColor}
                `}
            >
                <motion.span
                    className="text-4xl leading-none"
                    animate={{
                        scale: [1, 1.12, 1],
                    }}
                    transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    🔥
                </motion.span>
                <span className="text-3xl font-extrabold text-white drop-shadow mt-1">
                    {streak}
                </span>
            </div>
            {readToday && (
                <motion.div
                    className="
                        absolute
                        -top-1
                        -right-1
                        bg-emerald-500
                        text-white
                        text-[10px]
                        font-bold
                        px-2
                        py-1
                        rounded-full
                        shadow
                    "
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.3 }}
                >
                    ✓ Today
                </motion.div>
            )}
            {isHot && (
                <motion.div
                    className="
                        absolute
                        -bottom-1
                        left-1/2
                        -translate-x-1/2
                        bg-rose-500
                        text-white
                        text-[10px]
                        font-bold
                        px-2
                        py-0.5
                        rounded-full
                        shadow
                        whitespace-nowrap
                    "
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    🔥 HOT STREAK!
                </motion.div>
            )}
        </motion.div>
    );
}

function CalendarGrid({ label, matrix }) {
    if (!matrix || matrix.length === 0) return null;

    const todayKey = toDateKey(new Date());

    return (
        <div
            className="
                flex-1
                min-w-[320px]
                bg-white
                dark:bg-slate-900
                rounded-2xl
                border
                border-slate-100
                dark:border-slate-800
                p-5
            "
        >
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
                {label}
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-2">
                {WEEKDAY_HEADERS.map((w) => (
                    <div
                        key={w}
                        className="
                            text-[10px]
                            font-semibold
                            text-slate-400
                            dark:text-slate-500
                            text-center
                            pb-1
                        "
                    >
                        {w}
                    </div>
                ))}
            </div>

            {matrix.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1.5 mb-1.5">
                    {week.map((slot, di) => {
                        if (!slot || !slot.inMonth) {
                            return (
                                <div
                                    key={di}
                                    className="
                                        aspect-square
                                        rounded-md
                                    "
                                />
                            );
                        }

                        const isToday = slot.dateKey === todayKey;
                        const read = slot.read;

                        const base =
                            "aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all duration-200";

                        let style = "";
                        if (read) {
                            style =
                                "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm";
                        } else {
                            style =
                                "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500";
                        }

                        const todayRing = isToday
                            ? read
                                ? "ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ring-orange-600"
                                : "ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ring-blue-500"
                            : "";

                        return (
                            <motion.div
                                key={di}
                                className={`${base} ${style} ${todayRing}`}
                                title={
                                    `${slot.dateKey}${read ? " — Read ✓" : ""}${isToday ? " (Today)" : ""}`
                                }
                                whileHover={read ? { scale: 1.15, y: -2 } : { scale: 1.05 }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: (wi * 7 + di) * 0.004 }}
                            >
                                {slot.day}
                            </motion.div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function Legend() {
    return (
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                <span>No read</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-gradient-to-br from-amber-400 to-orange-500" />
                <span>Read</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded ring-2 ring-blue-500 ring-offset-1" />
                <span>Today</span>
            </div>
        </div>
    );
}

function ReadingStreak() {
    const userData = useSelector((state) => state.auth.userData);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!userData) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getStreakSummary(userData.$id, {
                    calendarMonths: 2,
                });
                if (!cancelled) setSummary(data);
            } catch (err) {
                console.log("ReadingStreak :: load ::", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [userData]);

    if (loading) {
        return (
            <div
                className="
                    mt-12
                    bg-white
                    dark:bg-slate-900
                    rounded-2xl
                    shadow-lg
                    p-8
                    text-center
                    border
                    border-slate-100
                    dark:border-slate-800
                "
            >
                <div className="text-5xl mb-4 animate-pulse">🔥</div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                    Loading reading streak...
                </h3>
            </div>
        );
    }

    if (!summary) return null;

  const {
    currentStreak,
    longestStreak,
    totalDays,
    lastRead,
    readToday,
    calendars,
} = summary;

const lastReadLabel = !lastRead
    ? "Never"
    : new Date(lastRead).toLocaleDateString("default", {
          month: "short",
          day: "numeric",
          year: "numeric",
      });

let statusLine = "";

if (currentStreak === 0) {
    statusLine = "Start a reading streak today — open any post!";
} else if (readToday) {
    if (currentStreak === 1) {
        statusLine =
            "Great! You read today — come back tomorrow to build your streak.";
    } else {
        statusLine = `Amazing! ${currentStreak} days in a row — keep it going!`;
    }
} else {
    statusLine = `Read today to keep your ${currentStreak}-day streak alive! ⏳`;
}

    const statusColor = readToday
        ? "text-emerald-600 dark:text-emerald-400"
        : currentStreak > 0
        ? "text-amber-600 dark:text-amber-400"
        : "text-slate-500 dark:text-slate-400";

    return (
        <div
            className="
                mt-12
                bg-gradient-to-br
                from-white
                to-slate-50
                dark:from-slate-900
                dark:to-slate-950
                rounded-3xl
                shadow-xl
                p-8
                border
                border-slate-100
                dark:border-slate-800
            "
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        🔥 Reading Streak
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Track consecutive reading days and build a habit
                    </p>
                </div>
            </div>

            <div
                className="
                    flex
                    flex-col
                    md:flex-row
                    items-center
                    gap-8
                    mb-8
                "
            >
                <StreakFireBadge streak={currentStreak} readToday={readToday} />

                <div className="flex-1 w-full">
                    <motion.p
                        className={`text-lg font-semibold mb-4 ${statusColor}`}
                        key={statusLine}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {statusLine}
                    </motion.p>

                    <div className="flex flex-wrap gap-3 w-full">
                        <StatBlock
                            icon="🔥"
                            label="Current Streak"
                            value={`${currentStreak} days`}
                            accent="text-orange-600 dark:text-orange-400"
                        />
                        <StatBlock
                            icon="🏆"
                            label="Longest Streak"
                            value={`${longestStreak} days`}
                            accent="text-amber-600 dark:text-amber-400"
                        />
                        <StatBlock
                            icon="📅"
                            label="Total Days"
                            value={`${totalDays}`}
                            accent="text-sky-600 dark:text-sky-400"
                        />
                        <StatBlock
                            icon="🕘"
                            label="Last Read"
                            value={lastReadLabel}
                            accent="text-slate-700 dark:text-slate-300"
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    📆 Streak Calendar
                </h3>
                <div
                    className="
                        flex
                        flex-col
                        lg:flex-row
                        flex-wrap
                        gap-4
                        w-full
                    "
                >
                    {calendars.map((cal) => (
                        <CalendarGrid
                            key={`${cal.year}-${cal.month}`}
                            label={cal.label}
                            matrix={cal.matrix}
                        />
                    ))}
                </div>
                <div className="mt-4 pl-1">
                    <Legend />
                </div>
            </div>
        </div>
    );
}

export default ReadingStreak;
