"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";

export type DrawerSnap = "collapsed" | "half" | "full";

const DRAG_THRESHOLD = 5; // px before a touch becomes a drag

function getTranslateY(snap: DrawerSnap): number {
  const vh = window.innerHeight;
  switch (snap) {
    case "collapsed": return vh - 62;
    case "half":      return vh * 0.5;
    case "full":      return 0;
  }
}

function getContentMaxH(snap: DrawerSnap): string {
  switch (snap) {
    case "collapsed": return "0px";
    case "half":      return "calc(50dvh - 62px)";
    case "full":      return "calc(100dvh - 62px)";
  }
}

export function useDrawer() {
  const [snap, setSnap] = useState<DrawerSnap>("collapsed");
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync state into refs so pointer callbacks are always stable (no stale closures)
  const snapRef = useRef(snap);
  snapRef.current = snap;
  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;

  const dragState = useRef({
    active: false,
    dragging: false,
    pointerId: 0,
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
    if (!isMobile || isDragging) return;
    const handler = () => {
      if (drawerRef.current) {
        drawerRef.current.style.transform = `translateY(${getTranslateY(snap)}px)`;
      }
      if (contentRef.current) {
        contentRef.current.style.maxHeight = getContentMaxH(snap);
      }
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [isMobile, snap, isDragging]);

  // Pointer handlers — all use refs, stable identity
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isMobileRef.current || e.button !== 0) return;

    const currentY = getTranslateY(snapRef.current);
    dragState.current = {
      active: true,
      dragging: false,
      pointerId: e.pointerId,
      startY: e.clientY,
      startTranslateY: currentY,
      currentTranslateY: currentY,
      lastMoveTime: e.timeStamp,
      lastMoveY: e.clientY,
      velocity: 0,
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds.active) return;

    // Only begin dragging after exceeding threshold (preserves click for taps)
    if (!ds.dragging) {
      if (Math.abs(e.clientY - ds.startY) < DRAG_THRESHOLD) return;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(ds.pointerId);
      } catch { /* pointer may already be released */ }
      ds.dragging = true;
      setIsDragging(true);
    }

    if (!drawerRef.current) return;

    const vh = window.innerHeight;
    const deltaY = e.clientY - ds.startY;
    const newY = Math.max(0, Math.min(vh - 62, ds.startTranslateY + deltaY));

    // Track velocity (positive = downward)
    const dt = e.timeStamp - ds.lastMoveTime;
    if (dt > 0) {
      ds.velocity = (e.clientY - ds.lastMoveY) / dt;
    }
    ds.lastMoveTime = e.timeStamp;
    ds.lastMoveY = e.clientY;
    ds.currentTranslateY = newY;

    // Direct DOM updates for 60fps
    drawerRef.current.style.transform = `translateY(${newY}px)`;
    if (contentRef.current) {
      contentRef.current.style.maxHeight = `${Math.max(0, vh - newY - 62)}px`;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    const ds = dragState.current;
    ds.active = false;

    if (!ds.dragging) return; // Was a tap — let click handler deal with it
    ds.dragging = false;
    setIsDragging(false);

    const currentY = ds.currentTranslateY;
    const velocity = ds.velocity; // positive = downward
    const vh = window.innerHeight;

    const snapPoints: [DrawerSnap, number][] = [
      ["full", 0],
      ["half", vh * 0.5],
      ["collapsed", vh - 62],
    ];

    let targetSnap: DrawerSnap;
    if (Math.abs(velocity) > 0.5) {
      if (velocity > 0) {
        // Flicking down = collapsing
        targetSnap = currentY < vh * 0.25 ? "half" : "collapsed";
      } else {
        // Flicking up = expanding
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

    // Clear DOM-set maxHeight so React style takes over on next render
    if (contentRef.current) {
      contentRef.current.style.maxHeight = "";
    }

    setSnap(targetSnap);
  }, []);

  // Inline style for the drawer
  const drawerStyle = useMemo((): React.CSSProperties => {
    if (!isMobile) return {};
    return {
      transform: `translateY(${getTranslateY(snap)}px)`,
      willChange: isDragging ? "transform" : "auto",
    };
  }, [isMobile, snap, isDragging]);

  // Inline style for the content area (constrains scroll to visible portion)
  const contentStyle = useMemo((): React.CSSProperties => {
    if (!isMobile) return {};
    return { maxHeight: getContentMaxH(snap) };
  }, [isMobile, snap]);

  return {
    snap,
    setSnap,
    isMobile,
    isDragging,
    drawerRef,
    contentRef,
    drawerStyle,
    contentStyle,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
