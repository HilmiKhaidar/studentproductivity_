import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';

// IMPORTANT: Get your App ID from https://console.agora.io/
// For production, you should generate tokens on your backend
const AGORA_APP_ID = '37ac1bf2f6b34bb89c03e48e2b19880e';

class VideoCallService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private isJoined = false;

  async joinChannel(channelName: string, userId: string) {
    try {
      // Create Agora client
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      // Join the channel
      // For production, replace null with a token generated from your backend
      await this.client.join(AGORA_APP_ID, channelName, null, userId);
      
      this.isJoined = true;
      console.log('Successfully joined channel:', channelName);
      
      return { success: true };
    } catch (error) {
      console.error('Error joining channel:', error);
      return { success: false, error };
    }
  }

  async createLocalTracks() {
    try {
      // Create audio and video tracks
      [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      
      return {
        success: true,
        audioTrack: this.localAudioTrack,
        videoTrack: this.localVideoTrack,
      };
    } catch (error) {
      console.error('Error creating local tracks:', error);
      return { success: false, error };
    }
  }

  async publishTracks() {
    if (!this.client || !this.localAudioTrack || !this.localVideoTrack) {
      console.error('Client or tracks not initialized');
      return { success: false };
    }

    try {
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
      console.log('Successfully published tracks');
      return { success: true };
    } catch (error) {
      console.error('Error publishing tracks:', error);
      return { success: false, error };
    }
  }

  playLocalVideo(elementId: string) {
    if (this.localVideoTrack) {
      this.localVideoTrack.play(elementId);
    }
  }

  muteAudio() {
    if (this.localAudioTrack) {
      this.localAudioTrack.setEnabled(false);
    }
  }

  unmuteAudio() {
    if (this.localAudioTrack) {
      this.localAudioTrack.setEnabled(true);
    }
  }

  muteVideo() {
    if (this.localVideoTrack) {
      this.localVideoTrack.setEnabled(false);
    }
  }

  unmuteVideo() {
    if (this.localVideoTrack) {
      this.localVideoTrack.setEnabled(true);
    }
  }

  subscribeToRemoteUsers(callback: (user: IAgoraRTCRemoteUser, mediaType: string) => void) {
    if (!this.client) return;

    this.client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio' | 'datachannel') => {
      // Only subscribe to audio and video, ignore datachannel
      if (mediaType === 'video') {
        await this.client!.subscribe(user, mediaType);
        callback(user, mediaType);
        
        // Remote user video track
        const remoteVideoTrack = user.videoTrack;
        remoteVideoTrack?.play(`remote-${user.uid}`);
      } else if (mediaType === 'audio') {
        await this.client!.subscribe(user, mediaType);
        callback(user, mediaType);
        
        // Remote user audio track
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack?.play();
      }
      // Ignore datachannel - no subscription needed
    });

    this.client.on('user-unpublished', (user: IAgoraRTCRemoteUser) => {
      console.log('User unpublished:', user.uid);
    });
  }

  async leaveChannel() {
    try {
      // Close local tracks
      this.localAudioTrack?.close();
      this.localVideoTrack?.close();

      // Leave the channel
      if (this.client && this.isJoined) {
        await this.client.leave();
      }

      this.client = null;
      this.localAudioTrack = null;
      this.localVideoTrack = null;
      this.isJoined = false;

      console.log('Successfully left channel');
      return { success: true };
    } catch (error) {
      console.error('Error leaving channel:', error);
      return { success: false, error };
    }
  }

  getRemoteUsers() {
    return this.client?.remoteUsers || [];
  }
}

export const videoCallService = new VideoCallService();
