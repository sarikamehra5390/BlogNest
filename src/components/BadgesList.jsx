import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";

import badgeService, { BADGE_DEFINITIONS } from "../appwrite/badgeService";
import realtimeService from "../appwrite/realtimeService";

function BadgesList({ userId, title = "🏅 Achievements", limit, onBadgeEarned }) {

    const currentUser = useSelector((state) => state.auth.userData);

    const targetUserId = userId || currentUser?.$id;
    const isCurrentUser = targetUserId === currentUser?.$id;

    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadBadges = useCallback(async () => {

        if (!targetUserId) {
            setLoading(false);
            return;
        }

        try {

            setLoading(true);

            const earned = await badgeService.getBadges(targetUserId);

            setBadges(earned || []);

        } catch (error) {

            console.log("BadgesList Error:", error);

        } finally {

            setLoading(false);

        }

    }, [targetUserId]);

    useEffect(() => {

        let cancelled = false;
        let realtimeUnsub = null;

        loadBadges().catch(() => {});

        if (targetUserId) {

            realtimeUnsub = realtimeService.subscribeToBadges(
                targetUserId,
                (event) => {

                    const action = event?.events?.[0] || "";
                    const payload = event?.payload;

                    if (!payload) return;

                    if (action.includes(".create")) {

                        setBadges((prev) => {

                            if (prev.some(b => b.$id === payload.$id)) return prev;

                            const next = [payload, ...prev];

                            if (isCurrentUser && onBadgeEarned) {
                                const def = Object.values(BADGE_DEFINITIONS).find(
                                    d => d.id === payload.badgeId
                                );
                                onBadgeEarned({
                                    badgeId: payload.badgeId,
                                    name: payload.name,
                                    icon: payload.icon,
                                    color: payload.color,
                                    description: payload.description,
                                });
                            }

                            return next;

                        });

                    } else if (action.includes(".delete")) {

                        setBadges((prev) =>
                            prev.filter(b => b.$id !== payload.$id)
                        );

                    }

                }
            );

        }

        return () => {

            cancelled = true;

            if (realtimeUnsub && typeof realtimeUnsub.unsubscribe === "function") {
                realtimeUnsub.unsubscribe();
            }

        };

    }, [targetUserId, isCurrentUser, onBadgeEarned, loadBadges]);

    const allDefs = Object.values(BADGE_DEFINITIONS);

    const earnedIds = new Set(badges.map(b => b.badgeId));

    if (loading) {

        return (

            <div className="mt-12">

                <h2 className="text-2xl font-bold mb-6 dark:text-white">
                    {title}
                </h2>

                <div
                    className="
                        bg-white
                        dark:bg-slate-900
                        rounded-2xl
                        shadow-lg
                        p-8
                        text-center
                        text-gray-500
                    "
                >

                    Loading Achievements...

                </div>

            </div>

        );

    }

    const earnedCount = earnedIds.size;
    const totalCount = allDefs.length;
    const progress = totalCount > 0
        ? Math.round((earnedCount / totalCount) * 100)
        : 0;

    const displayDefs = limit ? allDefs.slice(0, limit) : allDefs;

    return (

        <div className="mt-12">

            <div className="flex flex-wrap justify-between items-end gap-4 mb-6">

                <h2 className="text-2xl font-bold dark:text-white">
                    {title}
                </h2>

                <div className="flex items-center gap-3">

                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">

                    Progress

                    <span className="ml-2 text-blue-600 dark:text-blue-400 font-bold">
                        {earnedCount} / {totalCount}
                    </span>

                </div>

                    <div className="w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">

                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                            style={{ width: `${progress}%` }}
                        />

                    </div>

                </div>

            </div>

            {allDefs.length === 0 ? (

                <div
                    className="
                        bg-white
                        dark:bg-slate-900
                        rounded-2xl
                        shadow-lg
                        p-8
                        text-center
                    "
                >

                    <div className="text-5xl mb-4">🏅</div>

                    <p className="text-gray-500 dark:text-gray-400">
                        No achievements defined yet.
                    </p>

                </div>

            ) : (

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                    {displayDefs.map((def) => {

                    const earned = earnedIds.has(def.id);

                    const badge = badges.find(b => b.badgeId === def.id);

                    return (

                        <div
                            key={def.id}
                            className={`
                                relative
                                overflow-hidden
                                rounded-2xl
                                shadow-lg
                                p-6
                                border
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-2xl
                                ${earned
                                    ? `bg-white dark:bg-slate-900 dark:border-slate-700 border-slate-200`
                                    : "bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 border-slate-200 opacity-70"
                                }
                            `}
                        >

                            {earned && (

                                <div
                                    className={`
                                        absolute
                                        top-0
                                        right-0
                                        w-20
                                        h-20
                                        -mr-8
                                        -mt-8
                                        rounded-full
                                        bg-gradient-to-br ${def.color}
                                        opacity-10
                                    `}
                                />

                            )}

                            <div className="relative">

                                <div
                                    className={`
                                        w-16
                                        h-16
                                        rounded-2xl
                                        flex
                                        items-center
                                        justify-center
                                        text-3xl
                                        mb-4
                                        ${earned
                                            ? `bg-gradient-to-br ${def.color} shadow-lg text-white`
                                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 grayscale"
                                        }
                                    `}
                                >

                                    {def.icon}

                                </div>

                                <h3
                                    className={`
                                        font-bold
                                        text-lg
                                        ${earned
                                            ? "text-slate-800 dark:text-white"
                                            : "text-slate-500 dark:text-slate-400"
                                        }
                                    `}
                                >

                                    {def.name}

                                </h3>

                                <p
                                    className={`
                                        mt-1
                                        text-sm
                                        leading-snug
                                        ${earned
                                            ? "text-slate-500 dark:text-slate-400"
                                            : "text-slate-400 dark:text-slate-500"
                                        }
                                    `}
                                >

                                    {def.description}

                                </p>

                                {earned ? (

                                    <div
                                        className="
                                            mt-4
                                            flex
                                            justify-between
                                            items-center
                                            text-xs
                                        "
                                    >

                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                            ✓ Unlocked
                                        </span>

                                        {badge?.awardedAt && (

                                            <span className="text-slate-400 dark:text-slate-500">
                                                {new Date(badge.awardedAt).toLocaleDateString()}
                                            </span>

                                        )}

                                    </div>

                                ) : (

                                    <div
                                        className="
                                            mt-4
                                            text-xs
                                            font-semibold
                                            text-slate-400
                                            dark:text-slate-500
                                        "
                                    >

                                        🔒 Locked

                                    </div>

                                )}

                            </div>

                        </div>

                    );

                })}

                </div>

            )}

        </div>

    );

}

export default BadgesList;
