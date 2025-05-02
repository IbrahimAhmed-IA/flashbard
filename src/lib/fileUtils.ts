/**
 * Downloads a JSON object as a file
 */
export function downloadJson<T>(data: T, filename: string): void {
  // Convert JSON object to a string
  const jsonStr = JSON.stringify(data, null, 2);

  // Create a blob from the JSON string
  const blob = new Blob([jsonStr], { type: 'application/json' });

  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;

  // Trigger the download
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Reads a JSON file and returns the parsed content
 */
export function readJsonFile<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string) as T;
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Failed to parse JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Utility to calculate the next interval using spaced repetition algorithm
 * Based on a simplified SM-2 algorithm
 */
export function calculateNextInterval(
  currentInterval: number,
  ease: number,
  quality: number
): { interval: number; ease: number } {
  // Adjust ease factor based on performance
  let newEase = ease;

  if (quality < 3) {  // If not "Easy"
    newEase = Math.max(1.3, ease - 0.15);
  } else {
    newEase = ease + 0.15;
  }

  // Calculate new interval
  let newInterval: number;

  if (quality === 0) {  // Again
    newInterval = 1;  // 1 day
  } else if (quality === 1) {  // Hard
    newInterval = Math.max(1, Math.round(currentInterval * 1.2));
  } else if (quality === 2) {  // Good
    if (currentInterval === 0) {
      newInterval = 1;
    } else {
      newInterval = Math.round(currentInterval * newEase);
    }
  } else {  // Easy
    if (currentInterval === 0) {
      newInterval = 3;
    } else {
      newInterval = Math.round(currentInterval * newEase * 1.3);
    }
  }

  return { interval: newInterval, ease: newEase };
}
