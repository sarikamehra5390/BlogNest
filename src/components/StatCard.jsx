import React from "react";

function StatCard({ title, value, icon }) {
    return (

        <div
            className="
            bg-white
            dark:bg-slate-900
            rounded-2xl
            shadow-lg
            p-6
            hover:scale-105
            transition
        "
        >

            <div className="text-5xl">
                {icon}
            </div>

            <h3 className="text-gray-500 mt-4">
                {title}
            </h3>

            <h1 className="text-4xl font-bold mt-2 dark:text-white">
                {value}
            </h1>

        </div>

    );
}

export default StatCard;