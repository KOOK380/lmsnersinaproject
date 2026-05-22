"use client";

import React from "react";

interface DemoProps {
    badgeText?: string;
    message?: string;
    onClick?: () => void;
}

export default function Example({ badgeText = "Exclusive Offer", message = "Flat 50% off on Premium collection!", onClick }: DemoProps) {
    return (
        <div 
            onClick={onClick}
            className={`flex items-center space-x-2.5 border border-violet-500/30 rounded-full bg-violet-500/20 p-1 text-sm text-violet-600 ${onClick ? 'cursor-pointer hover:bg-violet-500/30 transition-all' : ''}`}
        >
            <div className="flex items-center space-x-1 bg-violet-500 text-white border border-violet-500 rounded-3xl px-3 py-1">
                <p className="font-semibold text-xs whitespace-nowrap">{badgeText}</p>
            </div>
            <p className="pr-3 text-xs md:text-sm">{message}</p>
        </div>
    );
};
