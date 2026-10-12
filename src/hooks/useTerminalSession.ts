'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal } from '@xterm/xterm';
import { RECONNECT_DELAYS_MS, TERMINAL_FONT, TERMINAL_SCROLLBACK } from '@/constants/claude';
import { api } from '@/lib/api-client';
import { readTerminalTheme } from '@/lib/terminal-theme';
import type { TerminalConnectionState } from '@/types';

const decoder = new TextDecoder();

export function useTerminalSession(runId: string, containerRef: RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<TerminalConnectionState>('connecting');
  const [attempt, setAttempt] = useState(0);
  const terminalRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const sendResize = useCallback(() => {
    const terminal = terminalRef.current;
    const socket = socketRef.current;
    if (!terminal || !socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'resize', cols: terminal.cols, rows: terminal.rows }));
  }, []);

  const fit = useCallback(() => {
    try {
      fitRef.current?.fit();
    } catch {
      return;
    }
    sendResize();
  }, [sendResize]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const terminal = new Terminal({
      fontFamily: TERMINAL_FONT.family,
      fontSize: TERMINAL_FONT.size,
      cursorBlink: true,
      scrollback: TERMINAL_SCROLLBACK,
      allowProposedApi: false,
      theme: readTerminalTheme(),
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon((_event, uri) => window.open(uri, '_blank', 'noopener,noreferrer')));
    terminal.open(container);
    terminalRef.current = terminal;
    fitRef.current = fitAddon;
    const input = terminal.onData((data) => {
      const socket = socketRef.current;
      if (socket?.readyState === WebSocket.OPEN) socket.send(data);
    });
    const observer = new ResizeObserver(() => fit());
    observer.observe(container);
    requestAnimationFrame(() => fit());
    return () => {
      observer.disconnect();
      input.dispose();
      terminal.dispose();
      terminalRef.current = null;
      fitRef.current = null;
    };
  }, [containerRef, fit]);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let tries = 0;

    const scheduleReconnect = () => {
      if (cancelled) return;
      if (tries >= RECONNECT_DELAYS_MS.length) {
        setState('offline');
        return;
      }
      setState('reconnecting');
      retryTimer = setTimeout(() => void connect(), RECONNECT_DELAYS_MS[tries]);
      tries += 1;
    };

    const connect = async () => {
      try {
        const ticket = await api.terminalTicket(runId);
        if (cancelled) return;
        const socket = new WebSocket(ticket.url);
        socket.binaryType = 'arraybuffer';
        socketRef.current = socket;
        socket.onopen = () => {
          tries = 0;
          setState('connected');
          terminalRef.current?.reset();
          fit();
        };
        socket.onmessage = (event) => {
          const data = typeof event.data === 'string' ? event.data : decoder.decode(event.data as ArrayBuffer);
          terminalRef.current?.write(data);
        };
        socket.onclose = () => {
          if (socketRef.current === socket) socketRef.current = null;
          scheduleReconnect();
        };
      } catch {
        scheduleReconnect();
      }
    };

    setState('connecting');
    void connect();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      const socket = socketRef.current;
      socketRef.current = null;
      socket?.close();
    };
  }, [runId, attempt, fit]);

  const reconnect = useCallback(() => setAttempt((value) => value + 1), []);

  return { state, reconnect, fit, focus: () => terminalRef.current?.focus() };
}
