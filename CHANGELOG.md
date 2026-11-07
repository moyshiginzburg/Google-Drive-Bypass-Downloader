# Changelog

## v2026.11.08
- **Fix: HLS streams with a separate audio track downloaded silent video.**
  Master playlists that declare audio via `#EXT-X-MEDIA:TYPE=AUDIO` (e.g. Israeli TV CDNs such as cdn-redge.media) are now parsed.
  The quality-selection email links carry the matching audio playlist (`#hls_audio=<url>`), and after the video track
  finishes, the same job downloads the audio into `<name>_audio.ts` next to the video.
- HLS playlists with CRLF line endings are now parsed correctly (segment lines are trimmed).
- Relative segment URLs are resolved against the playlist path without its query string.

## v2026.08.11
- Smart auto-detection, resumable uploads and HTML page detection (see git history).
