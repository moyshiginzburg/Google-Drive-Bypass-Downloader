# Changelog

Versions are the release date (YYYY.MM.DD). Several changes on the same day share one version.

## 2026.11.08
- **Version visibility for bug reports.** New `SCRIPT_VERSION` constant. The script keeps a "גרסה: X" line at the end
  of the form description (updated automatically on each run when outdated), appends the same line to the footer of every
  outgoing email, and the landing page footer (`index.html`) shows the same version string.
- **HLS: fragmented MP4 support.** `EXT-X-MAP` init segments are downloaded before the media segments and the file is saved as `.mp4`.
- **HLS: AES-128 decryption.** Segments encrypted with `METHOD=AES-128` are decrypted in pure JS (explicit IV or media-sequence IV).
  `SAMPLE-AES`/DRM streams are rejected with an error email instead of silently saving unplayable data.
- **HLS: `EXT-X-BYTERANGE` support** (single-file playlists).
- **Fix: long HLS downloads could not resume.** The full segment list was stored in the job state, exceeding the 9KB
  PropertiesService value limit after ~60 segments. The playlist is now re-read on each run and only the resume point is stored.
- **Fix: possible gaps in HLS output files.** Drive resumable uploads only persist 256KB-aligned chunks (except the last),
  but each segment was uploaded as its own odd-sized chunk. Segments are now buffered and uploaded in aligned chunks, and the
  resume point is derived from Drive's confirmed offset.
- Verified locally with a mocked Drive (strict 256KB alignment, forced resumes, simulated network errors) against TS, fMP4,
  AES-128 and byte-range streams, and against a real cdn-redge.media stream (byte-exact output).

- **Fix: HLS streams with a separate audio track downloaded silent video.**
  Master playlists that declare audio via `#EXT-X-MEDIA:TYPE=AUDIO` (e.g. Israeli TV CDNs such as cdn-redge.media) are now parsed.
  The quality-selection email links carry the matching audio playlist (`#hls_audio=<url>`), and after the video track
  finishes, the same job downloads the audio into `<name>_audio.ts` next to the video.
- HLS playlists with CRLF line endings are now parsed correctly (segment lines are trimmed).
- Relative segment URLs are resolved against the playlist path without its query string.

## 2026.08.11
- Smart auto-detection, resumable uploads and HTML page detection (see git history).
