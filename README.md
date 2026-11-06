# JJ POKER

Poker with friends, blackjack, 4-player mahjong, mahjong solitaire, Lucky Slots and King's Cup, in one web page.
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

## Adding your own meme sounds

Sounds live in the `sounds` folder of this repository, so every player loads the same clips.

1. Download a short clip (MP3 works best), for example from myinstants.com.
2. Upload it into the `sounds` folder with a simple name, like `laughing-dog.mp3`.
3. Edit `sounds/sounds.json` and list every clip, separated by commas:

```json
[
  {"file": "laughing-dog.mp3", "name": "Laughing dog", "icon": "🐶"},
  {"file": "bruh.mp3", "name": "Bruh", "icon": "😐"}
]
```

4. Commit, wait about a minute for GitHub Pages to update, then reload the game.
   The clips appear under **Your sounds** in the meme menu (♫). Each one plays for up to 8 seconds.

## What works differently from the Claude version

- **Your sounds** come from the `sounds` folder (see above) instead of an upload button.
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
| `kingscup.js` | King's Cup party drinking game (one phone, pass it around) |
| `i18n.js` | English, 한국어, 中文, Bahasa Indonesia |
| `sounds/` | Your own meme clips and `sounds.json`, the list of them |
| `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon.png` | Lets players add the game to their home screen and play full screen |
| `net.js` | Built peer-to-peer room adapter (generated from `src/net-entry.js`) |
