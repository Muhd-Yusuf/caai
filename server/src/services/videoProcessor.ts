import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const FRAME_INTERVAL_SECONDS = 5;
const MAX_FRAMES = 12;

interface ExtractedFrame {
  base64: string;
  timestamp: number;
}

/**
 * Saves a base64 data URL to a temporary file and returns the path.
 */
function saveBase64ToTempFile(dataUrl: string): string {
  const matches = dataUrl.match(/^data:video\/(\w+);base64,(.+)$/s);
  if (!matches) {
    throw new Error('Invalid video data URL format');
  }

  const ext = matches[1] === 'quicktime' ? 'mov' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const tmpDir = path.join(os.tmpdir(), 'caai-video');

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const filePath = path.join(tmpDir, `${crypto.randomUUID()}.${ext}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

/**
 * Gets video duration in seconds using ffprobe.
 */
function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration || 0);
    });
  });
}

/**
 * Extracts a single frame at a given timestamp.
 */
function extractFrameAt(filePath: string, timestamp: number, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .seekInput(timestamp)
      .frames(1)
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

/**
 * Extracts frames from a video at regular intervals.
 * Returns an array of base64-encoded JPEG frames.
 */
export async function extractFrames(videoDataUrl: string): Promise<ExtractedFrame[]> {
  const videoPath = saveBase64ToTempFile(videoDataUrl);
  const frames: ExtractedFrame[] = [];

  try {
    const duration = await getVideoDuration(videoPath);

    if (duration <= 0) {
      throw new Error('Could not determine video duration');
    }

    // Calculate timestamps to sample
    const timestamps: number[] = [];
    for (let t = 0; t < duration; t += FRAME_INTERVAL_SECONDS) {
      timestamps.push(t);
      if (timestamps.length >= MAX_FRAMES) break;
    }

    // Always include at least one frame
    if (timestamps.length === 0) {
      timestamps.push(0);
    }

    const tmpDir = path.join(os.tmpdir(), 'caai-video', 'frames');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Extract each frame
    for (const ts of timestamps) {
      const framePath = path.join(tmpDir, `${crypto.randomUUID()}.jpg`);
      try {
        await extractFrameAt(videoPath, ts, framePath);

        if (fs.existsSync(framePath)) {
          const frameBuffer = fs.readFileSync(framePath);
          const base64 = `data:image/jpeg;base64,${frameBuffer.toString('base64')}`;
          frames.push({ base64, timestamp: ts });
          fs.unlinkSync(framePath);
        }
      } catch (err) {
        console.error(`Failed to extract frame at ${ts}s:`, err);
      }
    }

    return frames;
  } finally {
    // Clean up temp video file
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
  }
}
