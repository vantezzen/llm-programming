// Get color based on success rate
// Gets a number between 0 and 1 and returns a tailwind bg-color
export function getSuccessColor(successRate: number) {
  if (successRate < 0.25) {
    return "bg-red-400";
  } else if (successRate < 0.5) {
    return "bg-yellow-400";
  } else if (successRate < 0.75) {
    return "bg-green-400";
  } else {
    return "bg-blue-400";
  }
}
