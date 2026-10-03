# Klaskanie Live

Architecture:

TikTok LIVE -> TikFinity Desktop -> local bridge -> online Node.js server -> GitHub Pages website -> TikTok LIVE Studio

TikFinity's Event API is local to the PC running TikFinity:
ws://127.0.0.1:21213/

## Folders

- docs/ = GitHub Pages website
- server/ = online Node.js server
- bridge/ = Node.js program that runs on the same PC as TikFinity

## Commands

### Server
cd server
npm install
npm start

### Bridge
cd bridge
npm install
set CLOUD_SERVER_URL=https://YOUR-SERVER.onrender.com
set BRIDGE_TOKEN=YOUR_SECRET
npm start

PowerShell:
$env:CLOUD_SERVER_URL="https://YOUR-SERVER.onrender.com"
$env:BRIDGE_TOKEN="YOUR_SECRET"
npm start

## GitHub Pages

Publish the docs/ folder. Then edit docs/index.html and replace:
https://YOUR-SERVER.onrender.com
with your real server URL.

Add these files to docs/sounds/:
scream1.mp3
scream2.mp3
scream3.mp3
scream4.mp3

Do not put BRIDGE_TOKEN in docs/index.html or any public GitHub file.
