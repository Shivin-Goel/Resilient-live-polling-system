import { useState, useEffect } from 'react';

export const usePollTimer = (startTime: string | Date | null, duration: number) => {
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [isExpired, setIsExpired] = useState<boolean>(false);

    useEffect(() => {
        if (!startTime || !duration) {
            setRemainingTime(null);
            setIsExpired(false);
            return;
        }

        const calculateRemaining = () => {
            const start = new Date(startTime).getTime();
            const now = new Date().getTime();
            const elapsed = Math.floor((now - start) / 1000);
            const remaining = Math.max(0, duration - elapsed);

            setRemainingTime(remaining);

            if (remaining <= 0) {
                setIsExpired(true);
            } else {
                setIsExpired(false);
            }
        };

        // Calculate immediately
        calculateRemaining();

        const intervalId = setInterval(() => {
            calculateRemaining();
        }, 1000);

        return () => clearInterval(intervalId);
    }, [startTime, duration]);

    return { remainingTime, isExpired };
};
