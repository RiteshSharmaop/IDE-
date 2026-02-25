import React from "react";
import { getUserColor, getContrastingTextColor } from "../../utils/userColors";

export const ActiveUsersOverlay = ({ remoteCursors = new Map() }) => {
  const users = Array.from(remoteCursors.values()).map((c) => ({
    username: c.username,
    line: c.line,
    column: c.column,
  }));

  if (!users.length) return null;

  return (
    <div
      style={{
        position: "absolute",
        right: 8,
        top: 8,
        zIndex: 1005,
        display: "flex",
        gap: 8,
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {users.map((u, idx) => {
        const color = getUserColor(u.username);
        const textColor = getContrastingTextColor(color);
        return (
          <div
            key={`${u.username}-${idx}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(0,0,0,0.12)",
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 6,
                backgroundColor: color,
                boxShadow: `0 0 6px ${color}`,
              }}
            />
            <span style={{ color: textColor }}>{u.username}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveUsersOverlay;
