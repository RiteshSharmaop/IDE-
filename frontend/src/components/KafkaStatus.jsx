// frontend/src/components/KafkaStatus.jsx
// Component to show Kafka integration status in the IDE

import React, { useEffect, useState } from "react";
import { Activity, AlertCircle, CheckCircle } from "lucide-react";
import { getIDEHealth } from "../lib/kafkaTracking";

const KafkaStatus = ({ theme = "dark" }) => {
  const [status, setStatus] = useState("checking");
  const [lastChecked, setLastChecked] = useState(null);

  const colors = {
    dark: {
      bg: "#252526",
      border: "#3E3E42",
      text: "#E0E0E0",
      textMuted: "#9CA3AF",
      success: "#4EC9B0",
      warning: "#CE9178",
      error: "#F48771",
    },
    light: {
      bg: "#F8F8F8",
      border: "#E0E0E0",
      text: "#2D2D2D",
      textMuted: "#6B7280",
      success: "#00AA00",
      warning: "#AA6600",
      error: "#DD0000",
    },
  };

  const c = colors[theme];

  useEffect(() => {
    const checkHealth = async () => {
      setStatus("checking");
      const result = await getIDEHealth();
      setStatus(result.success ? "connected" : "disconnected");
      setLastChecked(new Date().toLocaleTimeString());
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return c.success;
      case "disconnected":
        return c.error;
      case "checking":
        return c.warning;
      default:
        return c.textMuted;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <CheckCircle size={16} />;
      case "disconnected":
        return <AlertCircle size={16} />;
      case "checking":
        return (
          <Activity
            size={16}
            style={{ animation: "spin 1s linear infinite" }}
          />
        );
      default:
        return <Activity size={16} />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        borderRadius: "6px",
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        fontSize: "12px",
      }}
      title={`Kafka Status: ${status.toUpperCase()}${
        lastChecked ? ` (Last checked: ${lastChecked})` : ""
      }`}
    >
      <div
        style={{
          color: getStatusColor(),
          display: "flex",
          alignItems: "center",
        }}
      >
        {getStatusIcon()}
      </div>
      <span style={{ color: c.textMuted }}>Kafka:</span>
      <span style={{ color: getStatusColor(), fontWeight: "500" }}>
        {status === "connected"
          ? "Connected"
          : status === "disconnected"
          ? "Offline"
          : "Checking..."}
      </span>
    </div>
  );
};

export default KafkaStatus;

// Add this CSS to your global stylesheet
const kafkaStatusStyles = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
