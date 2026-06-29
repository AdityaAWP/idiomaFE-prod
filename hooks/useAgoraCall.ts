'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const APP_ID = 'fdae62e0696e411e9daa1dedc0e71724';

interface RoomSession {
  channelName: string;
  token: string;
}

export function useAgoraCall() {
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteUid, setRemoteUid] = useState<string | null>(null);
  const [isRemoteVideoOn, setIsRemoteVideoOn] = useState(true);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clientRef = useRef<any>(null);
  const localAudioRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const remoteVideoTrackRef = useRef<any>(null);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const localDiv = useRef<HTMLDivElement | null>(null);
  const remoteDiv = useRef<HTMLDivElement | null>(null);

  const [remoteReady, setRemoteReady] = useState(false);

  const emojiListenersRef = useRef(new Set<(emoji: string) => void>());
  const onEmoji = useCallback((cb: (emoji: string) => void) => {
    emojiListenersRef.current.add(cb);
    return () => { emojiListenersRef.current.delete(cb); };
  }, []);

  const sendEmoji = useCallback((emoji: string) => {
    clientRef.current?.sendStreamMessage?.(
      new TextEncoder().encode(JSON.stringify({ type: 'emoji', emoji }))
    );
  }, []);

  const sysListenersRef = useRef(new Set<(text: string) => void>());
  const onSystemMessage = useCallback((cb: (text: string) => void) => {
    sysListenersRef.current.add(cb);
    return () => { sysListenersRef.current.delete(cb); };
  }, []);

  const sendSystemMessage = useCallback((text: string) => {
    clientRef.current?.sendStreamMessage?.(
      new TextEncoder().encode(JSON.stringify({ type: 'system', text }))
    );
  }, []);

  const callEndListenersRef = useRef(new Set<() => void>());
  const onCallEnded = useCallback((cb: () => void) => {
    callEndListenersRef.current.add(cb);
    return () => { callEndListenersRef.current.delete(cb); };
  }, []);

  const chatListenersRef = useRef(new Set<(text: string) => void>());
  const onChatMessage = useCallback((cb: (text: string) => void) => {
    chatListenersRef.current.add(cb);
    return () => { chatListenersRef.current.delete(cb); };
  }, []);

  const sendChatMessage = useCallback((text: string) => {
    clientRef.current?.sendStreamMessage?.(
      new TextEncoder().encode(JSON.stringify({ type: 'chat', text }))
    );
  }, []);

  const setupLocalVideo = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    localDiv.current = el;
    if (localVideoTrackRef.current) {
      try { localVideoTrackRef.current.play(el); } catch {}
    }
  }, []);

  const setupRemoteVideo = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    remoteDiv.current = el;
    // Try playing buffered remote track
    const t = remoteVideoTrackRef.current;
    if (t && isRemoteVideoOn) {
      try { t.play(el); } catch {}
    }
  }, [isRemoteVideoOn]);

  // Keep retrying remote play
  useEffect(() => {
    if (!remoteReady || !remoteVideoTrackRef.current || !remoteDiv.current) return;
    let attempts = 0;
    const iv = setInterval(() => {
      attempts++;
      if (attempts > 20) { clearInterval(iv); return; }
      const el = remoteDiv.current;
      const t = remoteVideoTrackRef.current;
      if (!el || !t) { clearInterval(iv); return; }
      try { t.play(el); } catch {}
    }, 250);
    return () => clearInterval(iv);
  }, [remoteReady]);

  // ── Join ── Register handlers BEFORE joining so we never miss an event
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const raw = localStorage.getItem('current_room');
      if (!raw) { if (!cancelled) { setError('No room session found.'); setLoading(false); } return; }
      const session: RoomSession = JSON.parse(raw);

      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // ── Register event handlers BEFORE joining ──
      client.on('user-published', async (user: any, mediaType: string) => {
        if (cancelled) return;
        await client.subscribe(user, mediaType);
        if (cancelled) return;
        if (mediaType === 'video') {
          remoteVideoTrackRef.current = user.videoTrack;
          setRemoteUid(String(user.uid));
          setIsRemoteVideoOn(true);
          setRemoteReady(true);
        }
        if (mediaType === 'audio') {
          setIsRemoteMuted(false);
          user.audioTrack?.play();
        }
      });

      client.on('user-unpublished', (_user: any, mediaType: string) => {
        if (mediaType === 'video') {
          setIsRemoteVideoOn(false);
          setRemoteReady(false);
          remoteVideoTrackRef.current = null;
          if (remoteDiv.current) remoteDiv.current.innerHTML = '';
        }
        if (mediaType === 'audio') setIsRemoteMuted(true);
      });

      client.on('user-left', () => {
        callEndListenersRef.current.forEach(cb => cb());
        setRemoteUid(null);
        setRemoteReady(false);
        remoteVideoTrackRef.current = null;
        if (remoteDiv.current) remoteDiv.current.innerHTML = '';
      });

      client.on('stream-message', (_uid: number, data: Uint8Array) => {
        try {
          const msg = JSON.parse(new TextDecoder().decode(data));
          if (msg.type === 'emoji') emojiListenersRef.current.forEach(cb => cb(msg.emoji));
          if (msg.type === 'system') sysListenersRef.current.forEach(cb => cb(msg.text));
          if (msg.type === 'chat') chatListenersRef.current.forEach(cb => cb(msg.text));
        } catch {}
      });

      // ── Now join ──
      try {
        await client.join(APP_ID, session.channelName, session.token, null);
        if (cancelled) { await client.leave(); return; }
      } catch (e: any) {
        if (!cancelled) { setError(e.message ?? 'Join failed'); setLoading(false); }
        return;
      }

      const devices = await AgoraRTC.getCameras();
      const realCam = devices.find(
        (d) => !d.label.toLowerCase().includes('droidcam') && !d.label.toLowerCase().includes('virtual')
      );
      const cameraConfig: any = realCam?.deviceId
        ? { cameraId: realCam.deviceId }
        : devices[0]?.deviceId
          ? { cameraId: devices[0].deviceId }
          : { facingMode: 'user' };

      const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
      let camTrack: any = null;
      try {
        camTrack = await AgoraRTC.createCameraVideoTrack(cameraConfig);
      } catch {
        // Camera unavailable (device_not_found, permission denied, etc.) — continue audio-only
      }
      if (cancelled) { await client.leave(); return; }

      localAudioRef.current = micTrack;
      localVideoTrackRef.current = camTrack;
      const tracksToPublish = camTrack ? [micTrack, camTrack] : [micTrack];
      await client.publish(tracksToPublish);
      if (cancelled) { await client.leave(); return; }

      setIsJoined(true);
      setIsMuted(false);
      setIsVideoOff(!camTrack);
      setLoading(false);

      if (camTrack && localDiv.current) {
        try { camTrack.play(localDiv.current); } catch {}
      }

      checkInterval.current = setInterval(() => {
        setIsSpeaking((micTrack.getVolumeLevel?.() ?? 0) > 0.02);
      }, 500);
    })().catch((err: any) => {
      if (!cancelled) { setError(err.message ?? 'Failed to join call'); setLoading(false); }
    });

    return () => {
      cancelled = true;
      if (checkInterval.current) clearInterval(checkInterval.current);
      localAudioRef.current?.close();
      localVideoTrackRef.current?.close();
      remoteVideoTrackRef.current = null;
      if (localDiv.current) localDiv.current.innerHTML = '';
      if (remoteDiv.current) remoteDiv.current.innerHTML = '';
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
    if (checkInterval.current) clearInterval(checkInterval.current);
    localAudioRef.current?.close();
    localVideoTrackRef.current?.close();
    remoteVideoTrackRef.current = null;
    if (localDiv.current) localDiv.current.innerHTML = '';
    if (remoteDiv.current) remoteDiv.current.innerHTML = '';
    await clientRef.current?.leave();
    clientRef.current = null;
    setIsJoined(false);
    setRemoteUid(null);
    setRemoteReady(false);
  }, []);

  return {
    isJoined, isMuted, isVideoOff,
    remoteUid, isRemoteVideoOn, isRemoteMuted,
    isSpeaking, error, loading,
    setupLocalVideo, setupRemoteVideo,
    join: () => { },
    toggleMute, toggleVideo, leave,
    sendEmoji, onEmoji,
    sendSystemMessage, onSystemMessage,
    sendChatMessage, onChatMessage,
    onCallEnded,
  };
}
