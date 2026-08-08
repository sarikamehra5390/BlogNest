import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function BadgeToast({ badge, onClose, duration = 6000 }) {

    const [visible, setVisible] = useState(true);

    useEffect(() => {

        if (!badge) return;

        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onClose && onClose(), 500);
        }, duration);

        return () => clearTimeout(timer);

    }, [badge, duration, onClose]);

    if (!badge) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="fixed bottom-6 right-6 z-[100] max-w-sm"
                >
                    <div
                        className={`
                            relative
                            overflow-hidden
                            rounded-2xl
                            shadow-2xl
                            bg-white
                            dark:bg-slate-900
                            border
                            dark:border-slate-700
                            p-5
                            pr-10
                        `}
                    >
                        <div
                            className={`
                                absolute
                                top-0
                                left-0
                                w-full
                                h-1
                                bg-gradient-to-r ${badge.color || "from-blue-500 to-indigo-500"}
                            `}
                        />

                        <div className="flex items-start gap-4">

                            <motion.div
                                animate={{
                                    rotate: [0, -10, 10, -10, 0],
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                }}
                                className={`
                                    w-16
                                    h-16
                                    rounded-2xl
                                    flex
                                    items-center
                                    justify-center
                                    text-4xl
                                    bg-gradient-to-br ${badge.color || "from-blue-500 to-indigo-500"}
                                    shadow-lg
                                    flex-shrink-0
                                `}
                            >
                                {badge.icon || "🏅"}
                            </motion.div>

                            <div className="flex-1 min-w-0">

                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                        🎉 Achievement Unlocked!
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                    {badge.name || "New Badge"}
                                </h3>

                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                                    {badge.description || "Great work!"}
                                </p>

                            </div>

                        </div>

                        <button
                            onClick={() => {
                                setVisible(false);
                                setTimeout(() => onClose && onClose(), 300);
                            }}
                            className="
                                absolute
                                top-3
                                right-3
                                w-7
                                h-7
                                flex
                                items-center
                                justify-center
                                rounded-full
                                text-slate-400
                                hover:text-slate-600
                                dark:hover:text-slate-200
                                hover:bg-slate-100
                                dark:hover:bg-slate-800
                                transition
                            "
                            aria-label="Close badge notification"
                        >
                            ✕
                        </button>

                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default BadgeToast;
