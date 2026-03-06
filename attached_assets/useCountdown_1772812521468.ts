import { useEffect, useState } from 'react';

const useCountdown = (targetDateTime: string) => {
  const [countDown, setCountDown] = useState(0);

  useEffect(() => {
    if (!targetDateTime) {
      setCountDown(0);
      return;
    }

    const targetTime = new Date(targetDateTime).getTime();
    
    if (isNaN(targetTime)) {
        setCountDown(0);
        return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        clearInterval(interval);
        setCountDown(0);
      } else {
        setCountDown(distance);
      }
    }, 1000);

    // Set initial value immediately
    const initialDistance = targetTime - new Date().getTime();
    setCountDown(initialDistance > 0 ? initialDistance : 0);

    return () => clearInterval(interval);
  }, [targetDateTime]);

  const isFinished = countDown <= 0;
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isFinished };
};

export { useCountdown };
