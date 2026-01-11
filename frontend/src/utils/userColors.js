// Deterministic color assignment for users
const USER_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Sky Blue
  "#F8B88B", // Peach
  "#52B788", // Green
  "#FF8FA3", // Pink
  "#6C63FF", // Indigo
  "#00D4FF", // Cyan
  "#FFD93D", // Gold
  "#A8E6CF", // Light Green
];

// Generate a consistent color for a username
export const getUserColor = (username) => {
  if (!username) return USER_COLORS[0];

  // Simple hash function to generate consistent index
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
};

// Get contrasting text color for a background color
export const getContrastingTextColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white or black based on luminance
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};
