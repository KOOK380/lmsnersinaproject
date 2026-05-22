"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

interface DemoProps {
    badgeText?: string;
    message?: string;
    onClick?: () => void;
    bgColor?: string;
    borderColor?: string;
    textColor?: string;
    tagBgColor?: string;
    tagTextColor?: string;
}

export default function Example({ 
    badgeText = "Exclusive Offer", 
    message = "Flat 50% off on Premium collection!", 
    onClick,
    bgColor,
    borderColor,
    textColor,
    tagBgColor,
    tagTextColor
}: DemoProps) {
    const outerStyle: React.CSSProperties = {};
    if (bgColor) outerStyle.backgroundColor = bgColor;
    if (borderColor) outerStyle.borderColor = borderColor;
    if (textColor) outerStyle.color = textColor;

    const innerStyle: React.CSSProperties = {};
    if (tagBgColor) innerStyle.backgroundColor = tagBgColor;
    if (tagTextColor) innerStyle.color = tagTextColor;
    if (borderColor) innerStyle.borderColor = borderColor;

    // Premium default styles that auto-match the Nesrina theme
    const defaultOuterClass = "bg-primary/5 border-primary/15 text-primary hover:bg-primary/10 shadow-[0_4px_16px_rgba(55,28,59,0.06)] hover:shadow-[0_6px_22px_rgba(55,28,59,0.12)]";
    const defaultInnerClass = "bg-secondary text-white border-secondary shadow-[0_2px_8px_rgba(212,148,45,0.25)]";

    return (
        <div 
            onClick={onClick}
            style={outerStyle}
            className={`group/badge flex items-center space-x-2.5 sm:space-x-3 border-2 rounded-2xl sm:rounded-full p-1.5 md:p-2 pl-2 sm:pl-2.5 pr-3 sm:pr-4 md:pr-5 text-sm transition-all duration-300 w-full max-w-[92vw] sm:max-w-md md:max-w-xl lg:max-w-none ${bgColor ? 'border-gray-500/30' : defaultOuterClass} ${onClick ? "cursor-pointer hover:scale-[1.02] active:scale-[0.99]" : ""}`}
        >
            <div 
                style={innerStyle}
                className={`flex items-center space-x-1.5 shrink-0 border px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full transition-transform duration-300 ${tagBgColor ? '' : defaultInnerClass}`}
            >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-100" />
                <p 
                    className="font-extrabold text-[10px] sm:text-[11px] md:text-xs tracking-wider uppercase whitespace-nowrap"
                    style={tagTextColor ? { color: tagTextColor } : undefined}
                >
                    {badgeText}
                </p>
            </div>
            <div className="flex-1 min-w-0 overflow-hidden relative py-0.5 whitespace-nowrap">
                <span 
                    className="tablet-mobile-marquee text-xs sm:text-sm font-semibold tracking-wide text-inherit md:text-base pr-1 inline-block whitespace-nowrap"
                    style={textColor ? { color: textColor } : undefined}
                >
                    {message}
                </span>
            </div>
            {onClick && (
                <ArrowRight className="w-4 h-4 opacity-70 group-hover/badge:translate-x-1 transition-transform duration-300 shrink-0" />
            )}
        </div>
    );
}

