import React, { useEffect, useRef } from "react";
import { getUserColor, getContrastingTextColor } from "../../utils/userColors";

/**
 * Component to render remote user cursors/carets in the editor
 * Displays cursor position and username label for each remote user
 */
export const RemoteCursorsOverlay = ({ remoteCursors, editorInstance }) => {
  const labelsContainerRef = useRef(null);
  const previousCursorsRef = useRef(new Map());
  const rerenderTimerRef = useRef(null);
  const disposablesRef = useRef([]);

  // Initialize container on mount
  useEffect(() => {
    if (!editorInstance) return;

    const editorDOM = editorInstance.getDomNode();
    if (!editorDOM || !editorDOM.parentElement) return;

    // Get or create container
    let container = document.getElementById("remote-cursors-labels-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "remote-cursors-labels-container";
      container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 999;
        overflow: hidden;
      `;

      // Set parent position context
      editorDOM.parentElement.style.position = "relative";
      editorDOM.parentElement.insertBefore(container, editorDOM);
    }

    labelsContainerRef.current = container;

    // Cleanup on unmount: remove listeners
    return () => {
      // dispose any editor subscriptions
      try {
        disposablesRef.current.forEach((d) => d && typeof d.dispose === "function" && d.dispose());
      } catch (e) {}
      disposablesRef.current = [];
      // keep container in DOM (do not remove) to avoid flicker when remounting
    };
  }, [editorInstance]);

  // Update cursors when remoteCursors changes
  useEffect(() => {
    if (!editorInstance || !labelsContainerRef.current) {
      console.debug(
        "RemoteCursorsOverlay: Missing editorInstance or container",
        {
          hasEditor: !!editorInstance,
          hasContainer: !!labelsContainerRef.current,
        }
      );
      return;
    }

    
    const container = labelsContainerRef.current;

    const renderAllCursors = () => {
      try {
        container.innerHTML = "";

        if (!remoteCursors || remoteCursors.size === 0) {
          previousCursorsRef.current = new Map();
          return;
        }

        console.debug("RemoteCursorsOverlay: Rendering cursors", {
          count: remoteCursors.size,
        });

        remoteCursors.forEach(({ line, column, username }, socketId) => {
          try {
            const color = getUserColor(username);
            const textColor = getContrastingTextColor(color);

            const position = editorInstance.getScrolledVisiblePosition({
              lineNumber: Math.max(1, line + 1),
              column: Math.max(1, column + 1),
            });

            if (!position) return;

            const { left, top, height } = position;

            // Calculate offsets between editor content and the overlay container
            const editorDOMRect = editorInstance.getDomNode().getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const offsetLeft = editorDOMRect.left - containerRect.left;
            const offsetTop = editorDOMRect.top - containerRect.top;

            const finalLeft = left + offsetLeft;
            const finalTop = top + offsetTop;

            const cursorLine = document.createElement("div");
            cursorLine.style.cssText = `
              position: absolute;
              left: ${finalLeft}px;
              top: ${finalTop}px;
              width: 2px;
              height: ${Math.max(height || 20, 18)}px;
              background-color: ${color};
              opacity: 0.9;
              z-index: 1001;
              animation: remoteCursorBlink 1s infinite;
              box-shadow: 0 0 3px ${color};
              pointer-events: none;
            `;

            const label = document.createElement("div");
            label.style.cssText = `
              position: absolute;
              left: ${finalLeft}px;
              top: ${finalTop - 22}px;
              background-color: ${color};
              color: ${textColor};
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 12px;
              font-weight: 600;
              white-space: nowrap;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
              z-index: 1002;
              font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
              pointer-events: none;
            `;
            label.textContent = username;

            container.appendChild(cursorLine);
            container.appendChild(label);
          } catch (error) {
            console.debug("Cursor positioning error:", error);
          }
        });

        previousCursorsRef.current = new Map(remoteCursors);
      } catch (err) {
        console.debug("RemoteCursorsOverlay render error:", err);
      }
    };

    // initial render
    renderAllCursors();

    // Attach editor listeners to keep cursors in place during scroll/resize
    try {
      const onScroll = () => {
        if (rerenderTimerRef.current) clearTimeout(rerenderTimerRef.current);
        rerenderTimerRef.current = setTimeout(() => renderAllCursors(), 30);
      };

      const onLayout = () => {
        if (rerenderTimerRef.current) clearTimeout(rerenderTimerRef.current);
        rerenderTimerRef.current = setTimeout(() => renderAllCursors(), 30);
      };

      // Monaco subscriptions
      const s1 = editorInstance.onDidScrollChange(onScroll);
      const s2 = editorInstance.onDidLayoutChange(onLayout);
      const s3 = editorInstance.onDidChangeCursorPosition(() => {
        // When remote cursor positions change, re-render to follow movements
        if (rerenderTimerRef.current) clearTimeout(rerenderTimerRef.current);
        rerenderTimerRef.current = setTimeout(() => renderAllCursors(), 10);
      });

      disposablesRef.current.push(s1, s2, s3);

      // Also listen to window resize as editor DOM rects change
      window.addEventListener("resize", onLayout);
      disposablesRef.current.push({ dispose: () => window.removeEventListener("resize", onLayout) });
    } catch (e) {
      console.debug("Failed to attach Monaco listeners:", e);
    }

  }, [remoteCursors, editorInstance]);

  return null;
};

// Ensure animation styles are added to document
const ensureAnimationStyles = () => {
  if (document.getElementById("remote-cursor-animations")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "remote-cursor-animations";
  style.textContent = `
    @keyframes remoteCursorBlink {
      0%, 49% { opacity: 0.9; }
      50%, 100% { opacity: 0.4; }
    }
  `;
  document.head.appendChild(style);
};

// Initialize animation styles when module loads
ensureAnimationStyles();

export default RemoteCursorsOverlay;
