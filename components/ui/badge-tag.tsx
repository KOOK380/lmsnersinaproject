"use client";

import React from "react";

interface BadgeTagProps {
    badgeText?: string;
    message?: string;
    onClick?: () => void;
}

export default function Example({ badgeText = "Version 7.8", message = "New feature is ready to use, let's try", onClick }: BadgeTagProps) {
    return (
        <div 
            onClick={onClick}
            className={`flex items-center space-x-2.5 border border-gray-500/30 rounded-full bg-gray-500/10 p-1 text-sm text-gray-800 ${onClick ? 'cursor-pointer hover:bg-gray-500/15 transition-all' : ''}`}
        >
            <div className="bg-white border border-gray-500/30 rounded-2xl px-3 py-1">
                <p className="font-semibold text-xs whitespace-nowrap">{badgeText}</p>
            </div>
            <p className="pr-3 text-xs md:text-sm">{message}</p>
        </div>
    );
};
