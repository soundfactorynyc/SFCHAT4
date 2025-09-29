# Sound Factory iMessage (Messages) App plan

Goal: Bring the Sound Factory chat + auth experience into a Messages app (iMessage extension) so fans can interact natively across Apple devices, and receive live-stream and club updates.

## Vision
- A Messages app with a compact composer UI and a full-screen experience mirroring your web chat (personality toggles, energy, SMS-like verification replaced by Apple ID auth signals).
- Deep-links to join/RSVP, promo offers, and stream notifications.
- Optional Business Chat/Message for Business escalation later (requires Apple approval + brand registration).

## Architecture
- Client: iOS Messages Extension (iOS 15+), built with Swift + Messages framework (MSMessagesAppViewController).
- Backend: Reuse your Netlify Functions (Supabase fans API, invites, promo scheduler) via HTTPS; add a small auth layer for device identity.
- Identity: Use Sign in with Apple (SIWA) inside the extension to establish a user and link to your existing fans table.
- Data: Store lightweight state in app group container; persist conversation context to your backend.

## Feature set (MVP)
1) Auth
   - SIWA to create/link fan record (email relay possible) and store a device token.
   - Map to `fans` (audience_bucket, consent, platform='imessage').
2) Chat UI
   - Personalities: Neutral/Funny/Smart/Shady/Demon toggles.
   - Quick replies and stickers (brand pack).
   - Energy meter UI for fun feedback.
3) Messaging
   - Local simulated replies (offline fun) + cloud-backed replies via your chat endpoint (future).
   - Share actions: Create an MSSession message with rich layout (image/title/cta) linking to RSVP/join.
4) Notifications (Later)
   - Push via APNs to the container app (not possible directly inside iMessage without a containing app).
   - Live stream alerts via link previews.

## Technical components
- Xcode project with an iOS App target + Messages Extension target.
- `MessagesViewController` subclass (MSMessagesAppViewController) for the extension UI.
- SwiftUI or UIKit components for chat + personality bar.
- Network layer hitting `/.netlify/functions/fans` + future `/.netlify/functions/chat`.
- SIWA integration using `ASAuthorizationAppleIDProvider`.
- App Groups for shared storage if needed.

## Milestones
- M0: Create Xcode workspace, add Messages Extension, build placeholder UI (buttons, input, energy).
- M1: Wire SIWA + link to fans API (create/update fan with platform='imessage', consent true on explicit agree).
- M2: Implement local personality responses; add session-based messages (MSMessage) with rich layout.
- M3: Backend chat endpoint and streaming hooks (optional).
- M4: TestFlight distribution.

## Open questions
- Branding assets and stickers set (512x512 PNGs, APNG for animated).
- Exact live stream integration (Twitch/YouTube/RTMP? Deep-link strategy).
- Business Chat vs consumer Messages app (we start with consumer app for speed).

## Next steps
- I can scaffold the Xcode project structure and add stub Swift files, plus a tiny Node function `chat.mjs` to prepare for server responses. Let me know and I’ll generate the minimal files and a quick guide.
