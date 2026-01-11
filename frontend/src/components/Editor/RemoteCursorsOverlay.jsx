import React, { useEffect, useRef } from "react";
import { getUserColor, getContrastingTextColor } from "../../utils/userColors";

/**
 * Component to render remote user cursors/carets in the editor
 * Displays cursor position and username label for each remote user
 */
export const RemoteCursorsOverlay = ({ remoteCursors, editorInstance }) => {
  const labelsContainerRef = useRef(null);
  const previousCursorsRef = useRef(new Map());

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

    return () => {
      // Keep container for other uses
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

    // Clear container
    const container = labelsContainerRef.current;
    container.innerHTML = "";

    // If no remote cursors, return
    if (!remoteCursors || remoteCursors.size === 0) {
      console.debug("RemoteCursorsOverlay: No cursors to render");
      previousCursorsRef.current = new Map();
      return;
    }

    console.debug("RemoteCursorsOverlay: Rendering cursors", {
      count: remoteCursors.size,
      cursors: Array.from(remoteCursors.entries()).map(([id, cursor]) => ({
        id: id.substring(0, 8),
        username: cursor.username,
        position: { line: cursor.line, column: cursor.column },
      })),
    });

    // Render each cursor
    remoteCursors.forEach(({ line, column, username }, socketId) => {
      try {
        const color = getUserColor(username);
        const textColor = getContrastingTextColor(color);

        // Get cursor position in editor coordinates
        const position = editorInstance.getScrolledVisiblePosition({
          lineNumber: Math.max(1, line + 1),
          column: Math.max(1, column + 1),
        });

        if (!position) return;

        const { left, top, height } = position;

        // Create cursor line
        const cursorLine = document.createElement("div");
        cursorLine.style.cssText = `
          position: absolute;
          left: ${left}px;
          top: ${top}px;
          width: 2px;
          height: ${Math.max(height || 20, 18)}px;
          background-color: ${color};
          opacity: 0.9;
          z-index: 1001;
          animation: remoteCursorBlink 1s infinite;
          box-shadow: 0 0 3px ${color};
          pointer-events: none;
        `;

        // Create username label
        const label = document.createElement("div");
        label.style.cssText = `
          position: absolute;
          left: ${left}px;
          top: ${top - 22}px;
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
        // Silently handle positioning errors during scrolling
        console.debug("Cursor positioning error:", error);
      }
    });

    // Store current cursors for comparison
    previousCursorsRef.current = new Map(remoteCursors);
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
