"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";

export type DrawerSnap = "collapsed" | "half" | "full";

function getTranslateY(snap: DrawerSnap): number {
  const vh = window.innerHeight;
  switch (snap) {
    case "collapsed": return vh - 62;
    case "half":      return vh * 0.5;
    case "full":      return 0;
  }
}

export function useDrawer() {
  const [snap, setSnap] = useState<DrawerSnap>("collapsed");
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    startY: 0,
    startTranslateY: 0,
    currentTranslateY: 0,
    lastMoveTime: 0,
    lastMoveY: 0,
    velocity: 0,
  });

  // Track mobile breakpoint
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 900px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (!e.matches) setSnap("collapsed");
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Recalculate on resize (orientation change, etc.)
  useEffect(() => {
    if (!isMobile || !drawerRef.current || isDragging) return;
    const handler = () => {
      if (drawerRef.current) {
        drawerRef.current.style.transform = `translateY(${getTranslateY(snap)}px)`;
      }
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [isMobile, snap, isDragging]);

  // Pointer handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isMobile || e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const currentY = getTranslateY(snap);
    dragState.current = {
      startY: e.clientY,
      startTranslateY: currentY,
      currentTranslateY: currentY,
      lastMoveTime: e.timeStamp,
      lastMoveY: e.clientY,
      velocity: 0,
    };
    setIsDragging(true);
  }, [isMobile, snap]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !drawerRef.current) return;

    const vh = window.innerHeight;
    const deltaY = e.clientY - dragState.current.startY;
    const newY = Math.max(0, Math.min(vh - 62, dragState.current.startTranslateY + deltaY));

    // Track velocity (px/ms)
    const dt = e.timeStamp - dragState.current.lastMoveTime;
    if (dt > 0) {
      dragState.current.velocity = (e.clientY - dragState.current.lastMoveY) / dt;
    }
    dragState.current.lastMoveTime = e.timeStamp;
    dragState.current.lastMoveY = e.clientY;
    dragState.current.currentTranslateY = newY;

    // Direct DOM update for 60fps (no React re-render)
    drawerRef.current.style.transform = `translateY(${newY}px)`;
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const currentY = dragState.current.currentTranslateY;
    const velocity = dragState.current.velocity; // positive = downward
    const vh = window.innerHeight;

    const snapPoints: [DrawerSnap, number][] = [
      ["full", 0],
      ["half", vh * 0.5],
      ["collapsed", vh - 62],
    ];

    let targetSnap: DrawerSnap;
    if (Math.abs(velocity) > 0.5) {
      // Flick: snap in direction of velocity
      if (velocity > 0) {
        targetSnap = currentY < vh * 0.25 ? "half" : "collapsed";
      } else {
        targetSnap = currentY > vh * 0.75 ? "half" : "full";
      }
    } else {
      // Snap to nearest
      let closest: DrawerSnap = "collapsed";
      let minDist = Infinity;
      for (const [name, y] of snapPoints) {
        const dist = Math.abs(currentY - y);
        if (dist < minDist) {
          minDist = dist;
          closest = name;
        }
      }
      targetSnap = closest;
    }

    setSnap(targetSnap);
  }, [isDragging]);

  // Inline style for the drawer
  const drawerStyle = useMemo((): React.CSSProperties => {
    if (!isMobile) return {};
    return {
      transform: `translateY(${getTranslateY(snap)}px)`,
      willChange: isDragging ? "transform" : "auto",
    };
  }, [isMobile, snap, isDragging]);

  return {
    snap,
    setSnap,
    isMobile,
    isDragging,
    drawerRef,
    drawerStyle,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
