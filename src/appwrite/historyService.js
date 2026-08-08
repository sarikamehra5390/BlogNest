import conf from "../conf/conf";
import { Client, TablesDB, ID, Query } from "appwrite";

export class HistoryService {

    client = new Client();

    databases;

    constructor() {

        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new TablesDB(this.client);

    }

    // ==========================
    // Add / Update History
    // ==========================

    async addHistory(userId, postId) {

        try {

            const existing = await this.databases.listRows({

                databaseId: conf.appwriteDatabaseId,

                tableId: conf.appwriteHistoryTableId,

                queries: [

                    Query.equal("userId", userId),

                    Query.equal("postId", postId),

                ],

            });

            // Already exists → update timestamp

            if (existing.rows.length > 0) {

                return await this.databases.updateRow({

                    databaseId: conf.appwriteDatabaseId,

                    tableId: conf.appwriteHistoryTableId,

                    rowId: existing.rows[0].$id,

                    data: {

                        viewedAt: new Date().toISOString(),

                    },

                });

            }

            // First time viewing

            return await this.databases.createRow({

                databaseId: conf.appwriteDatabaseId,

                tableId: conf.appwriteHistoryTableId,

                rowId: ID.unique(),

                data: {

                    userId,

                    postId,

                    viewedAt: new Date().toISOString(),

                },

            });

        }

        catch (error) {

            console.log(

                "History Service :: addHistory ::",

                error

            );

            return false;

        }

    }

    // ==========================
    // Get Reading History
    // ==========================

    async getHistory(userId) {

        try {

            return await this.databases.listRows({

                databaseId: conf.appwriteDatabaseId,

                tableId: conf.appwriteHistoryTableId,

                queries: [

                    Query.equal("userId", userId),

                    Query.orderDesc("viewedAt"),

                ],

            });

        }

        catch (error) {

            console.log(

                "History Service :: getHistory ::",

                error

            );

            return {

                rows: [],

            };

        }

    }

    // ==========================
    // Delete One Item
    // ==========================

    async removeHistory(historyId) {

        try {

            await this.databases.deleteRow({

                databaseId: conf.appwriteDatabaseId,

                tableId: conf.appwriteHistoryTableId,

                rowId: historyId,

            });

            return true;

        }

        catch (error) {

            console.log(error);

            return false;

        }

    }

    // ==========================
    // Clear All History
    // ==========================

    async clearHistory(userId) {

        try {

            const response = await this.getHistory(userId);

            await Promise.all(

                response.rows.map((item) =>

                    this.removeHistory(item.$id)

                )

            );

            return true;

        }

        catch (error) {

            console.log(error);

            return false;

        }

    }

}

const historyService = new HistoryService();

// ========================================
// Pure Streak Utilities (zero deps, testable)
// ========================================

function toDateKey(isoDateLike) {
    const d = new Date(isoDateLike);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function extractReadDateKeys(historyRows, viewedAtKey = "viewedAt") {
    const set = new Set();
    for (const row of historyRows || []) {
        const key = toDateKey(row?.[viewedAtKey]);
        if (key) set.add(key);
    }
    return set;
}

function computeCurrentStreak(readDateSet, today = new Date()) {
    if (!readDateSet || readDateSet.size === 0) return 0;

    let streak = 0;
    const cursor = new Date(today);
    cursor.setHours(0, 0, 0, 0);

    let todayChecked = false;

    while (true) {
        const key = toDateKey(cursor);
        if (readDateSet.has(key)) {
            streak += 1;
            todayChecked = true;
            cursor.setDate(cursor.getDate() - 1);
            continue;
        }

        if (!todayChecked) {
            todayChecked = true;
            cursor.setDate(cursor.getDate() - 1);
            continue;
        }

        break;
    }

    return streak;
}

function computeLongestStreak(readDateSet) {
    if (!readDateSet || readDateSet.size === 0) return 0;

    const sorted = [...readDateSet].sort();
    let best = 1;
    let current = 1;

    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diffDays = Math.round(
            (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
            current += 1;
            if (current > best) best = current;
        } else if (diffDays > 1) {
            current = 1;
        }
    }

    return best;
}

function buildCalendarMatrix(year, month, readDateSet) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const rows = [];
    let currentWeek = new Array(7).fill(null);

    for (let offset = 0; offset < startWeekday; offset++) {
        currentWeek[offset] = { day: null, date: null, read: false, inMonth: false };
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const weekday = date.getDay();
        const dateKey = toDateKey(date);
        const read = readDateSet.has(dateKey);

        currentWeek[weekday] = {
            day,
            date,
            dateKey,
            read,
            inMonth: true,
        };

        if (weekday === 6) {
            rows.push(currentWeek);
            currentWeek = new Array(7).fill(null);
        }
    }

    let lastWeekFilled = false;
    for (const slot of currentWeek) {
        if (slot !== null) {
            lastWeekFilled = true;
            break;
        }
    }
    if (lastWeekFilled) {
        for (let w = 0; w < currentWeek.length; w++) {
            if (currentWeek[w] === null) {
                currentWeek[w] = { day: null, date: null, read: false, inMonth: false };
            }
        }
        rows.push(currentWeek);
    }

    return rows;
}

function computeTotalReadingDays(readDateSet) {
    return readDateSet.size || 0;
}

function computeLastReadDate(readDateSet) {
    if (!readDateSet || readDateSet.size === 0) return null;
    const sorted = [...readDateSet].sort();
    return sorted[sorted.length - 1];
}

// ========================================
// Async helper — loads history + computes everything
// ========================================

async function getStreakSummary(userId, options = {}) {
    const { calendarMonths = 2 } = options;

    const response = await historyService.getHistory(userId);
    const rows = response?.rows || [];
    const dateSet = extractReadDateKeys(rows);

    const today = new Date();
    const currentStreak = computeCurrentStreak(dateSet, today);
    const longestStreak = computeLongestStreak(dateSet);
    const totalDays = computeTotalReadingDays(dateSet);
    const lastRead = computeLastReadDate(dateSet);

    const todayKey = toDateKey(today);
    const readToday = dateSet.has(todayKey);

    const calendars = [];
    let cursor = new Date(today.getFullYear(), today.getMonth(), 1);

    for (let i = 0; i < calendarMonths; i++) {
        const y = cursor.getFullYear();
        const m = cursor.getMonth();
        calendars.push({
            year: y,
            month: m,
            label: new Date(y, m, 1).toLocaleString("default", {
                month: "long",
                year: "numeric",
            }),
            matrix: buildCalendarMatrix(y, m, dateSet),
        });
        cursor.setMonth(cursor.getMonth() - 1);
    }

    return {
        rows,
        dateSet: [...dateSet],
        currentStreak,
        longestStreak,
        totalDays,
        lastRead,
        readToday,
        calendars,
    };
}

export {
    toDateKey,
    extractReadDateKeys,
    computeCurrentStreak,
    computeLongestStreak,
    buildCalendarMatrix,
    computeTotalReadingDays,
    computeLastReadDate,
    getStreakSummary,
};

export default historyService;