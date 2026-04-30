"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";

export default function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [hasPassed, setHasPassed] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = differenceInSeconds(targetDate, now);

      if (difference <= 0) {
        setHasPassed(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (3600 * 24)),
        hours: Math.floor((difference % (3600 * 24)) / 3600),
        minutes: Math.floor((difference % 3600) / 60),
        seconds: Math.floor(difference % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (hasPassed) {
    return (
      <div className="text-center mt-6 p-4 rounded bg-yellow/10 border border-yellow/20">
        <p className="text-yellow text-lg font-bold uppercase tracking-widest font-display">
          Time to create something great! 🎬
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-6 w-full max-w-sm">
      <p className="text-white/60 uppercase tracking-widest mb-3 text-sm">
        Your session starts in
      </p>
      <div className="grid grid-cols-4 gap-4 w-full text-center">
        <div className="flex flex-col p-3 bg-navy-light/50 border border-white/10 rounded backdrop-blur">
          <span className="text-2xl md:text-3xl font-bold text-yellow font-mono">
            {String(timeLeft.days).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase text-white/50 tracking-wider">Days</span>
        </div>
        <div className="flex flex-col p-3 bg-navy-light/50 border border-white/10 rounded backdrop-blur">
          <span className="text-2xl md:text-3xl font-bold text-yellow font-mono">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase text-white/50 tracking-wider">Hrs</span>
        </div>
        <div className="flex flex-col p-3 bg-navy-light/50 border border-white/10 rounded backdrop-blur">
          <span className="text-2xl md:text-3xl font-bold text-yellow font-mono">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase text-white/50 tracking-wider">Min</span>
        </div>
        <div className="flex flex-col p-3 bg-navy-light/50 border border-white/10 rounded backdrop-blur">
          <span className="text-2xl md:text-3xl font-bold text-yellow font-mono">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase text-white/50 tracking-wider">Sec</span>
        </div>
      </div>
    </div>
  );
}
