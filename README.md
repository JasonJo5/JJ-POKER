# JJ POKER

Poker with friends, blackjack, 4-player mahjong, mahjong solitaire and Lucky Slots, in one web page.
Play money only: no real cash, no payouts.

## Put it on GitHub Pages

1. Create a new repository on GitHub (for example `jj-poker`). Public repositories get Pages for free.
2. Upload **everything in this folder** to the repository root (drag the files onto "Add file → Upload files"), keeping the `src` folder.
3. In the repository, open **Settings → Pages**. Under "Build and deployment" choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. Wait a minute. Your site appears at `https://YOUR-USERNAME.github.io/jj-poker/`.

## Playing online with friends

1. Everyone opens the same site link.
2. One person types a name and presses **Create room**, then shares the room code (for example `t-4s2b`).
3. Friends type the code and press **Join**, or tap the room in the open-rooms list.
4. The host presses **Start game**.

Players connect directly to each other (WebRTC). Public Nostr relays are used only to help browsers find
each other, so you don't need a server or an account. The person who creates the room is the host and
runs the game, so their browser tab has to stay open.

**If a friend can never connect:** some mobile and office networks block direct connections. Add a TURN
server in `src/net-entry.js` (see the `turnConfig` comment), then rebuild `net.js`:

```
cd src
npm install
npm run build
```

## What works differently from the Claude version

- **Your sounds** (uploading your own meme clips) needs Claude's storage, so it isn't available here.
  The 12 built-in meme sounds still work and everyone at the table hears them.
- Coins, XP, achievements and settings are saved in each player's own browser.

## Files

| File | What it is |
|---|---|
| `index.html` | The page, styles and layout |
| `core.js` | Shared pieces: settings, sounds, avatars, themes, coins, animations |
| `app.js` | Home screen, settings, help, rewards |
| `poker.js` | Texas Hold'em: game engine, bots, online play, tournaments |
| `blackjack.js` | Blackjack |
| `mahjong4.js` | 4-player mahjong |
| `mahjong.js` | Mahjong solitaire |
| `slots.js` | Lucky Slots |
| `i18n.js` | English, 한국어, 中文, Bahasa Indonesia |
| `net.js` | Built peer-to-peer room adapter (generated from `src/net-entry.js`) |
