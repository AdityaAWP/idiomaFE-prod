'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const APP_ID = 'fdae62e0696e411e9daa1dedc0e71724';

export interface LobbyParticipant {
  uid: string;
  videoOn: boolean;
  muted: boolean;
  speaking: boolean;
  username?: string;
  avatarUrl?: string | null;
}

export function useLobbyCall(lobbyId: string) {
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Map<string, LobbyParticipant>>(new Map());

  const clientRef = useRef<any>(null);
  const localAudioRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const userMapRef = useRef(new Map<string, any>()); // uid -> Agora remote user
  const trackMapRef = useRef(new Map<string, any>()); // uid -> videoTrack
  const containerMapRef = useRef(new Map<string, HTMLDivElement>()); // uid -> DOM container
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const stoppedRef = useRef(false);

  const setupLocalVideo = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    if (localVideoTrackRef.current) {
      try { localVideoTrackRef.current.play(el); } catch {}
    }
  }, []);

  const setupRemoteVideo = useCallback((uid: string, el: HTMLDivElement | null) => {
    if (!el) { containerMapRef.current.delete(uid); return; }
    containerMapRef.current.set(uid, el);
    const t = trackMapRef.current.get(uid);
    if (t) {
      try { t.play(el); } catch {}
    }
  }, []);

  // Join Agora channel on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { getAccessToken } = await import('@/lib/api');
        const token = getAccessToken();
        if (!token) throw new Error('Not authenticated');
        const MONOLITH_URL = process.env.NEXT_PUBLIC_MONOLITH_URL ?? 'http://localhost:3003/api';
        const tokenRes = await fetch(
          `${MONOLITH_URL}/lobbies/${lobbyId}/agora-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!tokenRes.ok) throw new Error(`Token fetch failed: ${tokenRes.status}`);
        const { channelName, token: agoraToken } = await tokenRes.json();

        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        // Register handlers BEFORE joining
        client.on('user-published', async (user: any, mediaType: 'audio' | 'video' | 'datachannel') => {
          if (cancelled || stoppedRef.current) return;
          await client.subscribe(user, mediaType);
          if (cancelled || stoppedRef.current) return;

          userMapRef.current.set(String(user.uid), user);

          if (mediaType === 'video') {
            trackMapRef.current.set(String(user.uid), user.videoTrack);
            const container = containerMapRef.current.get(String(user.uid));
            if (container) {
              try { user.videoTrack.play(container); } catch {}
            }
            setParticipants(prev => {
              const next = new Map(prev);
              const existing = next.get(String(user.uid)) || { uid: String(user.uid), videoOn: true, muted: false, speaking: false };
              next.set(String(user.uid), { ...existing, videoOn: true });
              return next;
            });
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play();
            setParticipants(prev => {
              const next = new Map(prev);
              const existing = next.get(String(user.uid)) || { uid: String(user.uid), videoOn: false, muted: false, speaking: false };
              next.set(String(user.uid), { ...existing, muted: false });
              return next;
            });
          }
        });

        client.on('user-unpublished', (user: any, mediaType: string) => {
          if (mediaType === 'video') {
            trackMapRef.current.delete(String(user.uid));
            setParticipants(prev => {
              const next = new Map(prev);
              const existing = next.get(String(user.uid));
              if (existing) next.set(String(user.uid), { ...existing, videoOn: false });
              return next;
            });
          }
          if (mediaType === 'audio') {
            setParticipants(prev => {
              const next = new Map(prev);
              const existing = next.get(String(user.uid));
              if (existing) next.set(String(user.uid), { ...existing, muted: true });
              return next;
            });
          }
        });

        client.on('user-left', (user: any) => {
          userMapRef.current.delete(String(user.uid));
          trackMapRef.current.delete(String(user.uid));
          containerMapRef.current.delete(String(user.uid));
          setParticipants(prev => {
            const next = new Map(prev);
            next.delete(String(user.uid));
            return next;
          });
        });

        // Join channel
        const uid = await client.join(APP_ID, channelName, agoraToken, null);
        if (cancelled || stoppedRef.current) { await client.leave(); return; }
        const myUid = String(uid);

        // Fetch lobby members to populate participant names
        const membersRes = await fetch(
          `${process.env.NEXT_PUBLIC_MONOLITH_URL ?? 'http://localhost:3003/api'}/lobbies/${lobbyId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          }
        );
        let memberMap = new Map<string, { username: string; avatarUrl: string | null }>();
        if (membersRes.ok) {
          const lobby = await membersRes.json();
          if (lobby.members) {
            for (const m of lobby.members) {
              memberMap.set(m.user.id, { username: m.user.username, avatarUrl: m.user.avatarUrl });
            }
          }
        }

        // Add myself
        const me = memberMap.get(myUid);
        setParticipants(prev => {
          const next = new Map(prev);
          next.set(myUid, { uid: myUid, videoOn: true, muted: false, speaking: false, username: me?.username, avatarUrl: me?.avatarUrl });
          return next;
        });

        // Create local tracks
        const devices = await AgoraRTC.getCameras();
        const realCam = devices.find(
          (d: any) => !d.label.toLowerCase().includes('droidcam') && !d.label.toLowerCase().includes('virtual')
        );
        const cameraConfig = realCam?.deviceId
          ? { cameraId: realCam.deviceId }
          : devices[0]?.deviceId
            ? { cameraId: devices[0].deviceId }
            : { facingMode: 'user' };

        const [micTrack, camTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack(cameraConfig),
        ]);
        if (cancelled || stoppedRef.current) { await client.leave(); return; }

        localAudioRef.current = micTrack;
        localVideoTrackRef.current = camTrack;
        await client.publish([micTrack, camTrack]);

        setIsJoined(true);
        setIsMuted(false);
        setIsVideoOff(false);
        setLoading(false);

        // Play local video
        const containers = document.querySelectorAll('[data-lobby-video="local"]');
        containers.forEach(el => {
          try { camTrack.play(el); } catch {}
        });

        // Volume check
        checkInterval.current = setInterval(() => {
          setIsSpeaking((micTrack.getVolumeLevel?.() ?? 0) > 0.02);
        }, 500);
      } catch (err: any) {
        if (!cancelled) { 
          console.error('Lobby join error:', err);
          setError(err.message ?? 'Failed to join lobby call'); 
          setLoading(false); 
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lobbyId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      if (checkInterval.current) clearInterval(checkInterval.current);
      localAudioRef.current?.close();
      localVideoTrackRef.current?.close();
      clientRef.current?.leave().catch(() => {});
      clientRef.current = null;
    };
  }, []);

  const toggleMute = useCallback(async () => {
    const t = localAudioRef.current; if (!t) return;
    if (isMuted) { await t.setEnabled(true); setIsMuted(false); }
    else { await t.setEnabled(false); setIsMuted(true); }
  }, [isMuted]);

  const toggleVideo = useCallback(async () => {
    const t = localVideoTrackRef.current; if (!t) return;
    if (isVideoOff) { await t.setEnabled(true); setIsVideoOff(false); }
    else { await t.setEnabled(false); setIsVideoOff(true); }
  }, [isVideoOff]);

  const leave = useCallback(async () => {
    stoppedRef.current = true;
    if (checkInterval.current) clearInterval(checkInterval.current);
    localAudioRef.current?.close();
    localVideoTrackRef.current?.close();
    await clientRef.current?.leave();
    clientRef.current = null;
    setIsJoined(false);
    setParticipants(new Map());
  }, []);

  return {
    isJoined, isMuted, isVideoOff,
    error, loading, participants,
    setupLocalVideo, setupRemoteVideo,
    toggleMute, toggleVideo, leave,
  };
}
