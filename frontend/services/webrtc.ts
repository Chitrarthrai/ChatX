export interface MediaDeviceState {
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  handRaised: boolean;
}

export interface MeetingSessionState {
  meetingId: string;
  meetingCode: string;
  roomName: string;
  isHost: boolean;
  inWaitingRoom: boolean;
  activeSpeakerId?: string;
  participantsCount: number;
}

export interface LiveKitSFUConfig {
  wsUrl: string;
  token: string;
  roomName: string;
  identity: string;
}

export class SFUMediaManager {
  private roomName: string;
  private isHost: boolean;
  private localStream: MediaStream | null = null;
  private sfuConnected: boolean = false;
  private wsUrl: string = "wss://livekit.chatx.io";

  constructor(roomName: string, isHost = false) {
    this.roomName = roomName;
    this.isHost = isHost;
  }

  async initializeLocalMedia(audio = true, video = true): Promise<MediaStream | null> {
    try {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
          video: video ? { width: 1280, height: 720, frameRate: 30 } : false,
        });
        return this.localStream;
      }
    } catch (err) {
      console.warn('Local media device access not available or permission denied:', err);
    }
    return null;
  }

  async connectToSFURoom(token: string): Promise<boolean> {
    try {
      console.log(`Connecting to LiveKit SFU server [${this.wsUrl}] for room [${this.roomName}] with token...`);
      // Simulate LiveKit Room connection initialization
      this.sfuConnected = true;
      return true;
    } catch (err) {
      console.error('SFU connection failed:', err);
      return false;
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => (track.enabled = enabled));
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => (track.enabled = enabled));
    }
  }

  disconnect(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    this.sfuConnected = false;
  }
}
