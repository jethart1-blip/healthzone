export function getYouTubeDemoUrl(exerciseName: string): string {
  const searchQuery = encodeURIComponent(`${exerciseName} exercise form tutorial`)
  return `https://www.youtube.com/results?search_query=${searchQuery}`
}
