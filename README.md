# Forever Folded

11:FOLD — Premium Intimate Memory Capsule App

Lovable Build Prompt

Build a polished, interactive mobile-first web app prototype called “11:FOLD**”** for couples and romantic partners.

The product should feel like a digital love-letter experience mixed with a tactile memory journal — intimate, nostalgic, premium, calm, and emotionally warm.

This is NOT a generic social media app, chat app, or dating app.

The core experience should feel like opening a personal handwritten letter, listening to an old cassette recording, placing a photograph into a scrapbook, folding a letter, sealing it with wax, and discovering a partner's message.

1. PRODUCT CONCEPT

Product Name

11:FOLD

Tagline

“Fold today into forever.”

Product Purpose

11:FOLD gives two connected partners a private digital space where they can:

Capture a daily memory

Upload a photograph

Record a voice memo

Write a handwritten note

Fold the digital letter into an envelope

Seal it with a virtual wax stamp

Send it to their partner

Reveal their partner's message through a tactile scratch-card interaction

Browse their shared history inside a Memory Vault

The entire product should feel like a private ritual between two people, not a productivity tool.

2. TARGET USERS

Primary users:

Couples

Romantic partners

Long-distance couples

Newly dating couples

Married partners

Partners who enjoy journaling and preserving memories

User mindset:

“I want a little private place that belongs to just us.”

3. CORE USER JOURNEY

Implement the following complete prototype journey:

Step 1 — Welcome

User opens the app.

Show an emotionally warm introduction screen with:

11:FOLD logo

Elegant serif typography

Subtle animated paper/fold motif

Short emotional headline

Supporting description

Primary CTA: Begin Your Story

Example copy:

“Some moments deserve more than a message.”

Supporting copy:

“Turn little moments into something you can keep.”

CTA:

Begin Your Story →

4. ONBOARDING

After clicking “Begin Your Story”, create a minimal onboarding flow.

Screen 1 — Your Name

Ask:

“What should we call you?”

Input:

Name

CTA:
Continue

Screen 2 — Soul Pairing

Headline:

“Who are you folding memories for?”

Description:

“Connect with your person using a private Soul Code.”

Provide two options:

Create a Soul Code

and

Enter Partner's Code

Generate a visually elegant unique code such as:

FOLD-7K29

Include a copy button.

For prototype purposes, allow the user to enter a demo partner code:

FOLD-7K29

After pairing:

Show a beautiful animation where two small paper shapes move toward each other and become one folded symbol.

Success message:

“Soul connection made.”

CTA:

Enter Our Space →

5. MAIN HOME / DAILY CAPSULE SCREEN

The main screen should feel like a private journal dashboard.

At the top:

Small 11:FOLD logo

Current date

Settings icon

Hero section:

“Today, worth keeping.”

Supporting text:

“Leave something for your person.”

Display a large frosted-glass/parchment card.

Inside the card:

Daily Capsule

Show three visual elements:

Photo placeholder

Voice memo cassette

Handwritten note preview

Primary CTA:

Create Today's Capsule

If today's capsule already exists:

Show:

Today's capsule is sealed ✓

and allow viewing/editing where appropriate.

6. DAILY CANVAS CREATION

Create a dedicated full-screen/mobile canvas for creating today's memory.

Title:

“Today in a little piece of paper.”

Use a vertically scrollable layout.

The canvas contains three main sections.

A. PHOTO MEMORY

Create a Polaroid-style photo frame.

Visual:

Off-white paper

Slight rotation

Soft shadow

Subtle glass effect

Tape/paper detail

Empty state:

“Add a little moment.”

Allow:

Drag & drop image upload on desktop

Tap to select image on mobile

Image preview

Replace image

Remove image

After upload, display the image inside a Polaroid frame.

Add a tiny handwritten caption field:

“Write a tiny caption…”

Use Caveat font.

7. VINTAGE VOICE MEMO RECORDER

Create a visually distinctive vintage cassette recorder component.

It should look inspired by an old cassette player but remain elegant and minimal.

Include:

Cassette body

Two circular reels

Play button

Record button

Timer

Audio waveform/visualizer

Recording state

Playback state

Before recording:

“Leave a little whisper.”

CTA:

Hold to Record

For prototype purposes, if real microphone recording is difficult, implement a convincing simulated recorder interaction.

When recording:

Reels rotate

Waveform animates

Recording timer increases

Record button changes state

When stopped:

Show:

“Voice memo saved.”

Allow:

Play

Pause

Delete

Re-record

The cassette reels should rotate smoothly during playback.

8. HANDWRITTEN LOVE NOTE

Create a parchment-style writing area.

Title:

“Write what you don't want to text.”

Large writing area using:

Caveat

Typography should feel handwritten.

Placeholder:

“Dear you…”

Include subtle paper texture.

Optional controls:

Clear

Undo

Character counter

Keep this section intentionally simple.

The note should visually resemble a handwritten letter rather than a normal text input.

9. CAPSULE PREVIEW

After the user adds:

Photo

Voice memo

Note

show a beautiful preview of the completed letter.

Button:

Fold This Memory

The transition into the folding experience should feel ceremonial.

10. INTERACTIVE LETTER FOLDING

This is one of the most important interactions.

Create a tactile digital folding animation.

The handwritten letter should visually fold through multiple stages:

Stage 1

Flat parchment letter.

Stage 2

Bottom section folds upward.

Stage 3

Side sections fold inward.

Stage 4

Top flap folds downward.

Stage 5

The final folded letter becomes an envelope.

Use smooth physics-like motion.

Use CSS transforms, perspective, spring-style transitions, or Framer Motion where appropriate.

The animation should feel:

Soft

Physical

Slow enough to appreciate

Premium

Satisfying

Avoid excessive bounce.

During the animation show:

“Folding your little moment…”

After folding:

“Ready to seal.”

11. VIRTUAL WAX SEAL

Create a dedicated sealing interaction.

Show:

Folded parchment envelope

Wax seal tray below

One or more decorative wax stamps

Example stamp initials:

11

or

♡

Allow the user to drag and drop the wax seal onto the envelope.

On successful placement:

Snap seal into position

Slight scale animation

Soft impact animation

Subtle wax shine

Tiny vibration-style visual feedback

Envelope becomes locked

Text:

“Sealed for your person.”

CTA:

Send Capsule →

For desktop, support mouse drag.

For mobile, support touch drag.

If drag-and-drop becomes unreliable on mobile, provide a fallback tap-to-place interaction.

12. CAPSULE SENT STATE

After sealing:

Show an emotionally warm confirmation screen.

Headline:

“A little piece of today is on its way.”

Show:

Sealed envelope

Timestamp

Small status indicator

Status:

Sealed · Waiting to be opened

CTA:

Back to Our Space

13. PARTNER WHISPER / SCRATCH CARD

The home screen should show when a partner has sent a capsule.

Create a premium scratch-card interaction.

Visual:

A frosted/parchment card covered by a textured layer.

Text:

“Someone left you something.”

Supporting text:

“Scratch gently to reveal.”

The user should be able to scratch using:

Mouse

Touch

Reveal the underlying content progressively.

Use canvas or an equivalent implementation for realistic scratch behavior.

When enough of the surface has been scratched:

Reveal:

Partner Whisper

Show:

Handwritten note

Photo

Voice memo player

Use Caveat for the handwritten message.

Include subtle reveal animation.

Message example:

“I saw this today and thought of you.”

Do not make this look like a standard chat message.

It should feel like discovering a hidden letter.

14. MEMORY VAULT

Create a dedicated Memory Vault accessible from the settings/navigation area.

The Vault is the historical archive of all shared capsules.

Title:

“Our little archive.”

Subtitle:

“Everything worth keeping, folded together.”

Display memories in a vertical timeline.

Each memory card can contain:

Date

Polaroid photo

Short handwritten preview

Voice memo indicator

Small wax seal

Partner initials

Example timeline:

AUG 04, 2026

Photo

“Coffee, rain & you.”

Voice memo • 00:18

Cards should feel like:

Scrapbook pages

Polaroids

Folded letters

Personal keepsakes

Allow the user to tap a memory to open the complete capsule.

15. MEMORY DETAIL VIEW

When a memory is opened:

Display:

Full photo

Handwritten note

Voice memo player

Date

Wax seal

Partner information

Use a paper/card presentation.

Include:

Close Memory

Avoid standard dashboard layouts.

16. SETTINGS

Create a minimal settings screen.

Sections:

Our Space

Partner name

Soul Code

Connection status

Memories

Memory Vault

Capsule history

Preferences

Notifications

Sound

Haptic feedback toggle

Animation toggle

Account

Profile

Privacy

Sign out

The settings screen should remain visually consistent with the rest of the app.

17. NAVIGATION

Use a minimal mobile navigation system.

Recommended:

Home | Create | Vault | Settings

Use elegant line icons.

Do not make the navigation feel like a generic SaaS dashboard.

The navigation can use a frosted glass bottom bar.

18. VISUAL DESIGN SYSTEM

Overall aesthetic

The design must feel:

Intimate

Premium

Romantic

Nostalgic

Editorial

Tactile

Calm

Modern

Sophisticated

Avoid:

Generic pink romance aesthetics

Excessive hearts

Cartoon graphics

Gaming UI

Neon colors

Generic social-media cards

Corporate SaaS styling

Excessive gradients

The romantic feeling should come from materials, typography, motion, and storytelling, not from excessive hearts.

19. COLOR PALETTE

Use this exact palette as the foundation.

Background gradient

Start:

#EFE8DC

End:

#D6CFC2

Use subtle warm gradients.

Parchment

#FAF7F2

Soft Coral

#E8A598

Gentle Teal

#92C6C2

Primary Text

Use a deep warm charcoal such as:

#2F2B27

Secondary Text

Use:

#77716A

Glass Surface

Use translucent off-white surfaces with:

rgba(250,247,242,0.55)

Borders

Use soft translucent borders:

rgba(255,255,255,0.55)

Do not overuse saturated colors.

20. GLASSMORPHISM

Use glassmorphism throughout the interface.

Apply:

backdrop-filter: blur(...)

Semi-transparent surfaces

Frosted borders

Soft shadows

Slight background transparency

Glass should be subtle.

Do not make the interface look like a futuristic cyberpunk dashboard.

The glass should feel like frosted stationery.

21. TYPOGRAPHY

Use these fonts:

Headings

Cormorant Garamond

Use for:

Hero headings

Section titles

Emotional statements

Important moments

Handwritten content

Caveat

Use for:

Love notes

Captions

Partner messages

Handwritten labels

UI

Plus Jakarta Sans

Use for:

Buttons

Navigation

Labels

Metadata

Forms

Settings

Create a clear typography hierarchy.

22. COMPONENT STYLE

Buttons should have:

Rounded corners

Soft shadows

Subtle translucent surfaces

Smooth hover/tap transitions

Primary CTA:

Warm coral or dark charcoal depending on context.

Secondary buttons:

Frosted glass.

Cards:

Rounded corners

20–28px radius

Soft shadows

Thin translucent borders

Avoid excessive pill-shaped UI.

23. MICRO-INTERACTIONS

Interactions are extremely important.

Implement:

Photo upload

Photo gently slides into the Polaroid frame.

Cassette recorder

Reels rotate during recording/playback.

Voice waveform

Animated waveform while recording.

Letter folding

Multi-step 3D folding animation.

Wax seal

Drag → snap → subtle impact.

Scratch card

Realistic scratch interaction with progressive reveal.

Navigation

Soft page transitions.

Buttons

Small scale/opacity feedback on press.

Animations should generally use smooth easing.

Prefer spring-like motion where appropriate.

24. RESPONSIVE MOBILE CONTAINER

The prototype must be designed mobile-first.

On desktop:

Place the application inside a centered smartphone-like container.

Suggested dimensions:

Width: approximately 390–430px

Height: approximately 844–900px

Rounded outer corners

Soft shadow

Warm background surrounding the device

The application itself should remain responsive.

On actual mobile:

The app should use the entire viewport.

Do not make desktop layouts dominate the design.

25. BACKGROUND DETAILS

Create subtle atmospheric details:

Paper grain

Very subtle noise texture

Soft blurred shapes

Organic shadows

Faint paper folds

Minimal decorative elements

Keep them extremely subtle.

The UI should remain clean.

26. LOGO

Create a simple typographic logo:

11

Style:

Elegant serif

Editorial

Minimal

Slightly mysterious

Possible treatment:

11:FOLD

with the colon visually resembling two tiny folded-paper dots.

Do not use a generic heart logo.

27. DATA / PROTOTYPE BEHAVIOR

For the prototype, create realistic local demo data.

Create two demo users:

User

Kanika

Partner

Jignesh

Use a demo Soul Code:

FOLD-7K29

Create several historical demo memories.

Example:

“Rainy evening.”

“Coffee before class.”

“That tiny sunset.”

“Sunday walk.”

“The day we couldn't stop laughing.”

Each should have:

Date

Photo placeholder

Handwritten note

Voice memo indicator

Use local state/localStorage or a lightweight mock data layer so interactions persist during the prototype session.

28. INTERACTION STATES

Every important interaction should have clear states.

For example:

Photo

Empty → Uploading → Uploaded → Replace

Voice

Idle → Recording → Recorded → Playing

Letter

Empty → Writing → Complete → Folding → Folded

Seal

Available → Dragging → Placement → Sealed

Partner message

Locked → Scratching → Partially Revealed → Fully Revealed

Capsule

Draft → Sealed → Sent → Opened → Archived

29. ACCESSIBILITY

Maintain good accessibility despite the aesthetic.

Include:

Accessible button labels

Keyboard support where applicable

Visible focus states

Sufficient text contrast

Touch targets of at least ~44px

Reduced-motion support

For users with reduced motion enabled, replace complex animations with simpler transitions.

30. TECHNICAL IMPLEMENTATION

Use a modern React-based implementation suitable for Lovable.

Recommended:

React

TypeScript

Tailwind CSS

Framer Motion for animations

Lucide icons

HTML Canvas where useful for scratch interaction

LocalStorage/mock state for prototype persistence

Structure the application using reusable components.

Suggested components:

WelcomeScreen

Onboarding

SoulPairing

Home

DailyCanvas

PhotoPolaroid

VoiceCassette

HandwrittenNote

LetterFold

WaxSeal

CapsuleSent

PartnerWhisper

ScratchCard

MemoryVault

MemoryDetail

Settings

BottomNavigation

Keep components modular and maintainable.

31. UX PRINCIPLES

Follow these principles throughout the product:

1. Private, not social

Never make it feel like Instagram, WhatsApp, or Facebook.

2. Tactile, not technical

Use physical-world metaphors.

Paper.

Cassette.

Wax.

Polaroid.

Envelope.

Scratch card.

3. Slow moments matter

Do not rush meaningful interactions.

4. Minimal UI

The content and emotion should be the focus.

5. Delight through motion

Use animation to communicate state and emotion, not decoration.

32. IMPORTANT EMPTY STATES

Create beautiful empty states.

No capsule yet

“Today is still unwritten.”

“Leave a little piece of it here.”

CTA:

Create Today's Capsule

No partner message

“Nothing from your person yet.”

“Maybe they're folding something for you.”

Empty Vault

“Your story starts here.”

“Every little moment will have a place.”

33. DEMO EXPERIENCE

When the prototype is launched, the user should be able to experience the entire journey without needing a backend.

Create a polished demo flow:

Welcome

Begin Your Story

Enter name

Soul Pairing

Home

Create Daily Capsule

Upload photo

Record simulated voice memo

Write note

Preview

Fold letter

Drag wax seal

Send

Return Home

See partner capsule

Scratch to reveal

Listen to voice memo

Open Memory Vault

Browse historical memories

Open Settings

Make all transitions functional.

34. CONTENT STYLE

Copy should feel intimate but not overly cheesy.

Use short, emotionally intelligent sentences.

Examples:

“Today, worth keeping.”

“Leave a little piece of today.”

“Write what you don't want to text.”

“Some things sound better in your voice.”

“Fold this memory.”

“Seal it for your person.”

“Someone left you something.”

“Scratch gently to reveal.”

“Our little archive.”

Avoid excessive romantic clichés.

35. FINAL QUALITY BAR

The final prototype should look like a high-end mobile product concept suitable for a Behance case study or premium startup pitch.

It should feel closer to:

digital stationery + private memory journal + tactile love letters

than:

social network + messaging app.

Prioritize visual polish, spacing, typography, animation, tactile interactions, and emotional storytelling.

Every screen should feel intentionally designed.

Do not generate generic dashboard layouts.

Do not use placeholder-looking components.

Do not use default browser inputs where a custom component would improve the experience.

Make the prototype feel finished, premium, intimate, and believable.

PRIMARY SUCCESS CRITERIA

The prototype succeeds if a user can immediately understand:

“This is a private space where my partner and I preserve little moments for each other.”

And the core emotional loop should be:

Capture → Write → Fold → Seal → Send → Reveal → Remember

Build the complete experience around this loop.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://fold-your-forever.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a078a10e-d686-49a9-adc1-b12260e80e65).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
