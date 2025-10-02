import { supabase } from '../lib/supabase';

import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

// Types for signaling messages
export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-start' | 'call-end';
  sessionId: string;
  from: string;
  to: string;
  data?: RTCSessionDescriptionInit | RTCIceCandidateInit | Record<string, unknown>;
  timestamp: number;
}

export interface WebRTCSignalingService {
  joinSession: (sessionId: string, userId: string) => Promise<void>;
  leaveSession: () => void;
  sendOffer: (offer: RTCSessionDescriptionInit, to: string) => Promise<void>;
  sendAnswer: (answer: RTCSessionDescriptionInit, to: string) => Promise<void>;
  sendIceCandidate: (candidate: RTCIceCandidate, to: string) => Promise<void>;
  sendCallStart: (to: string) => Promise<void>;
  sendCallEnd: (to: string) => Promise<void>;
  onMessage: (callback: (message: SignalingMessage) => void) => void;
  onUserJoined: (callback: (userId: string) => void) => void;
  onUserLeft: (callback: (userId: string) => void) => void;
}

class SupabaseWebRTCSignaling implements WebRTCSignalingService {
  private supabaseClient: SupabaseClient;
  private channel: RealtimeChannel | null = null;
  private currentSessionId: string | null = null;
  private currentUserId: string | null = null;
  private messageCallback: ((message: SignalingMessage) => void) | null = null;
  private userJoinedCallback: ((userId: string) => void) | null = null;
  private userLeftCallback: ((userId: string) => void) | null = null;

  constructor(supabaseClient: SupabaseClient = supabase) {
    this.supabaseClient = supabaseClient;
  }

  async joinSession(sessionId: string, userId: string): Promise<void> {
    try {
      // Leave any existing session first
      if (this.channel) {
        this.leaveSession();
      }

      this.currentSessionId = sessionId;
      this.currentUserId = userId;

      // Create a channel for this video session
      this.channel = this.supabaseClient.channel(`video-session-${sessionId}`, {
        config: {
          presence: { key: userId },
        },
      });

      // Listen for signaling messages
      this.channel.on('broadcast', { event: 'signaling' }, payload => {
        const message = payload.payload as SignalingMessage;

        // Only process messages intended for this user
        if (message.to === userId || message.to === '*') {
          if (this.messageCallback) {
            this.messageCallback(message);
          }
        }
      });

      // Listen for presence changes (users joining/leaving)
      this.channel.on('presence', { event: 'sync' }, () => {
        const newState = this.channel?.presenceState();
        console.log('[Signaling] Presence sync:', newState);
      });

      this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[Signaling] User joined:', key, newPresences);
        if (key !== userId && this.userJoinedCallback) {
          this.userJoinedCallback(key);
        }
      });

      this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[Signaling] User left:', key, leftPresences);
        if (key !== userId && this.userLeftCallback) {
          this.userLeftCallback(key);
        }
      });

      // Subscribe to the channel
      await this.channel.subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          // Track presence
          await this.channel?.track({
            userId,
            joinedAt: new Date().toISOString(),
          });
          console.log(`[Signaling] Joined session ${sessionId} as user ${userId}`);
        }
      });
    } catch (error) {
      console.error('[Signaling] Error joining session:', error);
      throw error;
    }
  }

  leaveSession(): void {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.currentSessionId = null;
    this.currentUserId = null;
    console.log('[Signaling] Left session');
  }

  private async sendMessage(message: Omit<SignalingMessage, 'timestamp'>): Promise<void> {
    if (!this.channel || !this.currentSessionId || !this.currentUserId) {
      throw new Error('Not connected to a session');
    }

    const fullMessage: SignalingMessage = {
      ...message,
      timestamp: Date.now(),
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'signaling',
      payload: fullMessage,
    });

    console.log('[Signaling] Sent message:', fullMessage.type, 'to:', fullMessage.to);
  }

  async sendOffer(offer: RTCSessionDescriptionInit, to: string): Promise<void> {
    await this.sendMessage({
      type: 'offer',
      sessionId: this.currentSessionId!,
      from: this.currentUserId!,
      to,
      data: offer,
    });
  }

  async sendAnswer(answer: RTCSessionDescriptionInit, to: string): Promise<void> {
    await this.sendMessage({
      type: 'answer',
      sessionId: this.currentSessionId!,
      from: this.currentUserId!,
      to,
      data: answer,
    });
  }

  async sendIceCandidate(candidate: RTCIceCandidate, to: string): Promise<void> {
    await this.sendMessage({
      type: 'ice-candidate',
      sessionId: this.currentSessionId!,
      from: this.currentUserId!,
      to,
      data: {
        candidate: candidate.candidate,
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid,
      },
    });
  }

  async sendCallStart(to: string): Promise<void> {
    await this.sendMessage({
      type: 'call-start',
      sessionId: this.currentSessionId!,
      from: this.currentUserId!,
      to,
    });
  }

  async sendCallEnd(to: string): Promise<void> {
    await this.sendMessage({
      type: 'call-end',
      sessionId: this.currentSessionId!,
      from: this.currentUserId!,
      to,
    });
  }

  onMessage(callback: (message: SignalingMessage) => void): void {
    this.messageCallback = callback;
  }

  onUserJoined(callback: (userId: string) => void): void {
    this.userJoinedCallback = callback;
  }

  onUserLeft(callback: (userId: string) => void): void {
    this.userLeftCallback = callback;
  }
}

// Export singleton instance
export const webRTCSignaling = new SupabaseWebRTCSignaling();

// Export class for testing
export { SupabaseWebRTCSignaling };

export default webRTCSignaling;
