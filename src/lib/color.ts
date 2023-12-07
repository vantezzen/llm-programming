// Get color based on success rate
// Gets a number between 0 and 1 and returns a tailwind bg-color
export function getSuccessColor(successRate: number) {
  if (successRate < 0.25) {
    return "border-red-400";
  } else if (successRate < 0.75) {
    return "border-yellow-400";
  } else {
    return "border-green-400";
  }
}

export function getSuccessBackgroundColor(successRate: number) {
  if (successRate < 0.25) {
    return "bg-red-400";
  } else if (successRate < 0.75) {
    return "bg-yellow-400";
  } else {
    return "bg-green-400";
  }
}
