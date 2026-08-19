import { Activity } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DAY_RANGE = { min: 540, max: 1800 };
const NIGHT_RANGE = { min: 4, max: 200 };
const UPDATE_INTERVAL_MS = 5000;
const ANIMATION_DURATION_MS = 1200;
const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";

const formatter = new Intl.NumberFormat("pt-BR");
const saoPauloDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: SAO_PAULO_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

type SaoPauloTimeParts = {
  day: number;
  hour: number;
  minute: number;
  month: number;
  second: number;
  year: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getSaoPauloTimeParts = (timestamp: number): SaoPauloTimeParts => {
  const parts = saoPauloDateFormatter.formatToParts(new Date(timestamp));
  const valueByType = parts.reduce<Record<string, number>>((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = Number(part.value);
    }

    return acc;
  }, {});

  return {
    day: valueByType.day,
    hour: valueByType.hour,
    minute: valueByType.minute,
    month: valueByType.month,
    second: valueByType.second,
    year: valueByType.year,
  };
};

const getPresenceRange = (hour: number) => (hour >= 0 && hour < 6 ? NIGHT_RANGE : DAY_RANGE);

const getPresenceEstimate = (timestamp: number) => {
  const bucketTimestamp = Math.floor(timestamp / UPDATE_INTERVAL_MS) * UPDATE_INTERVAL_MS;
  const timeParts = getSaoPauloTimeParts(bucketTimestamp);
  const secondsOfDay =
    timeParts.hour * 3600 + timeParts.minute * 60 + timeParts.second;
  const dateSeed = timeParts.year * 372 + timeParts.month * 31 + timeParts.day;
  const range = getPresenceRange(timeParts.hour);

  // Deterministic waves keep every visitor synchronized without abrupt local randomness.
  const normalized = clamp(
    0.54 +
      0.2 * Math.sin(secondsOfDay / 1700 + dateSeed * 0.007) +
      0.11 * Math.sin(secondsOfDay / 491 + dateSeed * 0.017) +
      0.05 * Math.sin(secondsOfDay / 83 + dateSeed * 0.023),
    0.08,
    0.94,
  );

  return Math.round(range.min + (range.max - range.min) * normalized);
};

export const LivePresenceWidget = () => {
  const [displayedCount, setDisplayedCount] = useState(() => getPresenceEstimate(Date.now()));
  const targetCountRef = useRef(displayedCount);
  const animationFrameRef = useRef<number>();
  const timeoutRef = useRef<number>();

  useEffect(() => {
    const animateTo = (nextCount: number) => {
      window.cancelAnimationFrame(animationFrameRef.current ?? 0);

      const startCount = targetCountRef.current;
      const startedAt = window.performance.now();
      targetCountRef.current = nextCount;

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / ANIMATION_DURATION_MS);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.round(startCount + (nextCount - startCount) * easedProgress);

        setDisplayedCount(currentCount);

        if (progress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(tick);
        }
      };

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    const updateCount = () => {
      animateTo(getPresenceEstimate(Date.now()));
    };

    updateCount();

    const delayUntilNextGlobalTick = UPDATE_INTERVAL_MS - (Date.now() % UPDATE_INTERVAL_MS);
    let intervalId: number | undefined;

    timeoutRef.current = window.setTimeout(() => {
      updateCount();
      intervalId = window.setInterval(updateCount, UPDATE_INTERVAL_MS);
    }, delayUntilNextGlobalTick);

    return () => {
      window.clearTimeout(timeoutRef.current);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      window.cancelAnimationFrame(animationFrameRef.current ?? 0);
    };
  }, []);

  return (
    <aside className="live-presence-widget" aria-label="Pessoas online agora">
      <span className="live-presence-orb" aria-hidden="true" />
      <div className="live-presence-copy">
        <span className="live-presence-label">
          <Activity className="h-3.5 w-3.5" aria-hidden="true" />
          Estimativa ativa
        </span>
        <p aria-live="polite">
          <strong>{formatter.format(displayedCount)}</strong> pessoas online agora
        </p>
        <small>Baseado na audiência ativa do Eu Sou Vibrante</small>
      </div>
    </aside>
  );
};
