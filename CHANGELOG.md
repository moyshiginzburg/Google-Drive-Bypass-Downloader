# Changelog

Versions are the release date (YYYY.MM.DD). Several changes on the same day share one version.

## 2026.11.08
- **Triggers: one-shot instead of every-minute.** The recurring 1-minute trigger was replaced by one-shot triggers:
  a run that still has work schedules the next run in 1 minute; an idle script has no pending trigger. Scheduling always
  deletes and recreates (never "skip if one exists"), so a fired trigger that Google leaves registered cannot block
  processing. Each run arms a 7-minute safety-net trigger so a run killed at the 6-minute hard limit resumes on its own;
  a run that ends idle removes only that safety-net trigger, keeping one created meanwhile by a new form submission.
  A run that finds the lock busy schedules a follow-up run instead of silently exiting. Old recurring triggers are
  removed automatically on the first run.
- **Error classification for downloads (direct files and HLS).** Time-limit stops are not errors. UrlFetch bandwidth
  limits are treated like a time-limit stop (continue later, not counted). Network errors and HTTP 408/429/5xx (source
  or Drive, including Drive rate limits) are retried up to 5 runs while keeping the Drive upload session. Other HTTP
  errors are final. A Drive 403 is reported as "storage full" only when Drive says `storageQuotaExceeded`.
- **No duplicate file after a finalized upload.** If Drive reports the upload session as already complete (a run killed
  right after the last chunk), the direct-download job now finishes instead of starting a new file.
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
