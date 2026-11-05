/*
 * JJ POKER network adapter for normal websites (GitHub Pages, Netlify, your own server).
 *
 * The game talks to a small "room" API: join a room, send messages on topics,
 * share a little presence data, and get told when people come and go.
 * Inside Claude that API is built in. Everywhere else this file provides the
 * same API using WebRTC peer-to-peer connections (Trystero), with public Nostr
 * relays only used to help players find each other. No server or account needed.
 */
import {joinRoom, selfId} from 'trystero/nostr';

(() => {
  if (window.claude && typeof window.claude.use === 'function') return; // running inside Claude

  const APP_ID = 'jj-poker-joevanka-v1';
  const CONFIG = {
    appId: APP_ID,
    ...(Array.isArray(window.JJ_RELAYS) && window.JJ_RELAYS.length ? {relayConfig: {urls: window.JJ_RELAYS, redundancy: window.JJ_RELAYS.length}} : {}),
    // Optional: add a TURN server here if some friends can never connect
    // (strict mobile or office networks). Example:
    // turnConfig: [{urls: 'turn:YOUR_TURN_HOST:3478', username: 'user', credential: 'pass'}],
  };

  function makeRoom(roomId) {
    const room = joinRoom(CONFIG, roomId);
    const peers = new Map();
    const topicHandlers = {};
    const peerHandlers = [];
    const actions = {};
    let self = {peer: selfId, by: null, isMe: true, sameTab: true, kind: 'viewer', guest: false, presence: {}, updatedAt: Date.now()};
    peers.set(selfId, self);

    const snapshot = () => Object.freeze([...peers.values()]);
    const fire = (joined, left, updated) => {
      const all = snapshot();
      peerHandlers.forEach(h => { try { h({peers: all, joined, left, updated}); } catch (e) { console.error(e); } });
    };
    const remote = (peer, presence) => ({peer, by: null, isMe: false, sameTab: false, kind: 'viewer', guest: false, presence: presence || {}, updatedAt: Date.now()});

    // Trystero action names must be short; topics here are all short words.
    const action = topic => {
      if (!actions[topic]) {
        const a = room.makeAction(('t' + topic).slice(0, 12));
        a.onMessage = (data, meta) => {
          const peerId = meta && meta.peerId;
          if (!peers.has(peerId)) { peers.set(peerId, remote(peerId, {})); fire([peers.get(peerId)], [], []); }
          const from = peers.get(peerId);
          (topicHandlers[topic] || []).forEach(h => { try { h({...from, topic, data}); } catch (e) { console.error(e); } });
        };
        actions[topic] = a;
      }
      return actions[topic];
    };

    const pres = room.makeAction('presence');
    pres.onMessage = (data, meta) => {
      const peerId = meta && meta.peerId; if (!peerId) return;
      const existed = peers.has(peerId);
      const p = remote(peerId, data && typeof data === 'object' ? data : {});
      peers.set(peerId, p);
      fire(existed ? [] : [p], [], existed ? [p] : []);
    };

    room.onPeerJoin = peerId => {
      if (!peers.has(peerId)) { const p = remote(peerId, {}); peers.set(peerId, p); fire([p], [], []); }
      pres.send(self.presence, {target: peerId}).catch(() => {});
    };
    room.onPeerLeave = peerId => {
      const p = peers.get(peerId);
      if (p) { peers.delete(peerId); fire([], [p], []); }
    };

    return {
      name: roomId,
      async emit(topic, data) {
        await action(topic).send(data);
        // Echo locally, like the built-in API does; the game ignores its own messages.
        setTimeout(() => (topicHandlers[topic] || []).forEach(h => { try { h({...self, topic, data}); } catch (e) {} }), 0);
      },
      on(topic, handler) {
        action(topic);
        (topicHandlers[topic] = topicHandlers[topic] || []).push(handler);
        return () => { topicHandlers[topic] = (topicHandlers[topic] || []).filter(h => h !== handler); };
      },
      async presence(patch) {
        const next = {...self.presence};
        for (const k in patch) { if (patch[k] === null) delete next[k]; else next[k] = patch[k]; }
        self = {...self, presence: next, updatedAt: Date.now()};
        peers.set(selfId, self);
        await pres.send(next).catch(() => {});
        fire([], [], [self]);
      },
      peers: () => snapshot(),
      onPeers(handler) {
        peerHandlers.push(handler);
        setTimeout(() => handler({peers: snapshot(), joined: snapshot(), left: [], updated: []}), 0);
        return () => { const i = peerHandlers.indexOf(handler); if (i >= 0) peerHandlers.splice(i, 1); };
      },
      connected: () => true,
      onConnection(handler) { setTimeout(() => handler(true), 0); return () => {}; },
      async leave() { try { room.leave(); } catch (e) {} },
    };
  }

  let lobby = null;
  const getLobby = () => {
    if (!lobby) { lobby = makeRoom('lobby'); lobby.join = async name => makeRoom('table-' + name); }
    return lobby;
  };

  window.claude = {
    async use(name) {
      if (name === 'room') return getLobby();
      if (name === 'user') return {me: async () => ({name: ''})};
      return null; // shared sound board needs Claude's storage; not available here
    },
  };
})();
