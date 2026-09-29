# Monetaur — Technical Documentation

| Field             | Value                                                     |
| ----------------- | --------------------------------------------------------- |
| **Product**       | Monetaur                                                  |
| **Version**       | v1 (MVP)                                                  |
| **Document Type** | Technical Documentation                                   |
| **Audience**      | Developer, AI design and prototyping tools (e.g. Lovable) |
| **Status**        | Source of truth for v1 implementation and Hi-Fi design    |
| **Date**          | 2026-09-29                                                |

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Information Architecture & Navigation](#3-information-architecture--navigation)
4. [Design System](#4-design-system)
5. [Data Model (Firestore)](#5-data-model-firestore)
6. [Wikidata Integration](#6-wikidata-integration)
7. [Screen Specifications](#7-screen-specifications)
8. [Reusable Components & Patterns](#8-reusable-components--patterns)
9. [Empty, Loading & Error States](#9-empty-loading--error-states)
10. [Asset Inventory](#10-asset-inventory)
11. [Out of Scope for v1](#11-out-of-scope-for-v1)
12. [Open Decisions](#12-open-decisions)

---

## 1. Product Overview

### 1.1 What Monetaur Is

Monetaur is an Android mobile application that works as a personal digital art gallery. Users discover artworks by famous painters and sculptors across all eras, meet a new **Artist of the Day** every day, filter artworks by art movement, search for artists or artworks, and save favorites into a personal collection.

All artwork data comes from **Wikidata**, an open knowledge base that aggregates artworks held by museums worldwide. User accounts and saved collections live in **Firebase**.

### 1.2 Design Philosophy

The interface is inspired by **Pinterest**: white surfaces, bold black typography, a single strong red accent, generously rounded images, pill-shaped controls, and an almost flat look. The artwork is always the focus; the UI stays quiet.

Two layouts coexist:

- **Home** uses an **Instagram-style** single-column feed, so each artwork gets the full screen width.
- **Saved** uses a **Pinterest-style** two-column masonry, so a personal collection can be scanned at a glance.

Both share the same colors, typography, and components, so the app reads as one product.

### 1.3 Core User Loop

1. User registers (email, username, password) or logs in.
2. Home opens on the **Artist of the Day**, showing that artist's works in a feed.
3. User browses, filters by art movement, or searches for an artist or artwork.
4. User saves artworks with the ♥ button or a double-tap on the image.
5. Tapping any artwork opens the **Art View** with full details.
6. The **Saved** tab collects all saved artworks in a masonry layout, with its own filter and search.
7. The **Profile** tab shows account info and lets the user change their password, log out, or permanently delete their account.

### 1.4 Constraints That Shape the Product

- **Timeline:** 4 weeks.
- **Team:** 1 developer, no dedicated designer.
- **Platform:** Android only, run through Expo Go (no development build required).
- **Budget:** free tiers only. Firebase stays on the **Spark** plan, which is why there is no Cloud Storage and no custom image uploads.
- **Backend:** no custom server code. No Cloud Functions; all logic runs in the client, protected by Firestore Security Rules.
- **Component reuse:** HeroUI Native components are used as-is wherever possible. Custom components only where HeroUI Native has no equivalent.

---

## 2. Tech Stack

### 2.1 Platform Versions

| Concern         | Version  | Notes                                                        |
| --------------- | -------- | ------------------------------------------------------------ |
| Expo SDK        | 57       | Latest stable. **Fixed for the whole project; no upgrades.** |
| React Native    | 0.86     | Bundled with SDK 57                                          |
| React           | 19.2     | Bundled with SDK 57                                          |
| Node.js         | 20.19.4+ | Required by the Expo toolchain                               |
| pnpm            | 10       | Package manager                                              |
| Target platform | Android  | Tested in Expo Go on a physical device and/or emulator       |

**Package manager: pnpm.** All Expo-aware packages are installed with `pnpm expo install <package>` so versions match SDK 57. The project is scaffolded with `pnpm dlx create-heroui-native-app@latest` using the tabs template, which wires up Expo Router, HeroUI Native, Uniwind, and all peer dependencies.

### 2.2 Stack Decisions

| Concern              | Choice                                                          | Reason                                                                                         |
| -------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Mobile framework     | Expo (React Native)                                             | Prior experience; Expo Go removes native build setup                                           |
| Routing              | Expo Router (file-based, typed routes)                          | Built into Expo; tabs + stack with protected routes                                            |
| Language             | TypeScript (strict)                                             | Type safety; types inferred from Zod schemas                                                   |
| Component library    | HeroUI Native                                                   | Polished, accessible components; officially supports Expo 57 and Uniwind                       |
| Styling              | Uniwind (Tailwind CSS v4 for React Native)                      | Utility classes; the styling layer HeroUI Native is built on                                   |
| Icons                | `lucide-react-native`                                           | Clean line icons matching the Pinterest style; uses `react-native-svg` (already a HeroUI peer) |
| Fonts                | Inter via `@expo-google-fonts/inter` + `expo-font`              | Closest free alternative to Pinterest's proprietary typeface                                   |
| Images               | `expo-image`                                                    | Memory + disk caching; `onLoad` exposes image dimensions for masonry                           |
| Lists                | `@shopify/flash-list` (v2)                                      | Smooth image-heavy lists, infinite scroll, masonry support                                     |
| Animations, gestures | `react-native-reanimated`, `react-native-gesture-handler`       | HeroUI peers; also used for the collapsing header and double-tap heart                         |
| Safe areas           | `react-native-safe-area-context`                                | HeroUI peer; status and navigation bar insets                                                  |
| Server state / cache | TanStack Query (v5)                                             | Caching, loading/error states, infinite queries for Wikidata and Firestore reads               |
| Cache persistence    | `@tanstack/react-query-persist-client` + AsyncStorage persister | Previously viewed Wikidata content survives app restarts                                       |
| Local storage        | `@react-native-async-storage/async-storage`                     | Query cache persistence + Firebase Auth session persistence; works in Expo Go                  |
| Forms                | TanStack Form (v1)                                              | Headless, type-safe field state; accepts Zod schemas directly (Standard Schema)                |
| Schema validation    | Zod (v4)                                                        | One source of truth for form rules and external API response shapes                            |
| Auth                 | Firebase Authentication (email/password)                        | Managed auth, reauthentication, account deletion; free                                         |
| Database             | Cloud Firestore                                                 | NoSQL document store for users and saved artworks; cursor pagination; free                     |
| Artwork data         | Wikidata SPARQL endpoint + `wbsearchentities` API               | Free, keyless, aggregates artworks across museums                                              |
| Artwork images       | Wikimedia Commons (`Special:FilePath`)                          | Hosts the images Wikidata links to, resizable via `?width=`                                    |
| Avatars              | DiceBear HTTP API                                               | Generated avatars from a seed; no uploads, no Cloud Storage                                    |
| Global state         | None                                                            | Server state lives in TanStack Query; auth in a small React context; the rest is local state   |
| Theme                | Light only                                                      | Dark theme deferred                                                                            |
| Localization         | English only                                                    | i18n deferred                                                                                  |

### 2.3 Folder Structure

Hybrid vertical: Expo Router routes in `app/`, feature logic in `src/features/`, shared building blocks in `src/shared/`. A feature never imports from another feature; anything needed by two features is lifted into `src/shared/`.

```
app/                              # Expo Router routes ONLY
  _layout.tsx                     # Providers: fonts, HeroUI, QueryClient (persisted), AuthProvider
  (auth)/
    _layout.tsx                   # Stack, no header
    login.tsx
    register.tsx
  (app)/
    _layout.tsx                   # Stack: tabs + artwork detail
    (tabs)/
      _layout.tsx                 # Bottom tab bar
      index.tsx                   # Home
      saved.tsx                   # Saved
      profile.tsx                 # Profile
    artwork/
      [id].tsx                    # Art View (id = Wikidata QID, e.g. Q12418)

src/
  features/
    auth/                         # login, register, session, AuthProvider
    home/                         # artist of the day, adaptive header, search, movement filter
    artworks/                     # Wikidata queries, feed card, Art View
    saved/                        # save/unsave, saved list, masonry, saved search
    profile/                      # profile screen, change password, delete account
  shared/
    components/                   # SearchBar, MovementSheet, HeartButton, EmptyState, FormField, ...
    hooks/                        # useSavedIds, useAuth, useDebouncedValue, ...
    services/
      firebase.ts                 # initializeApp, auth (AsyncStorage persistence), firestore
      wikidata.ts                 # sparql() and searchEntities() fetch helpers
    schemas/                      # shared Zod primitives and API response schemas
    data/
      artists.ts                  # curated Artist of the Day list
      movements.ts                # curated art movement list
    utils/                        # imageUrl(), searchTokens(), artistOfTheDay(), formatYear()
    types/                        # global types

global.css                        # Uniwind + Tailwind v4 theme tokens, HeroUI theme overrides
firestore.rules                   # Security Rules (checked into the repo)
firestore.indexes.json            # Composite indexes (checked into the repo)
```

---

## 3. Information Architecture & Navigation

### 3.1 Auth State Routing

The root layout subscribes to Firebase `onAuthStateChanged` through an `AuthProvider`. Route groups are guarded with Expo Router protected routes (`Stack.Protected` with a `guard` prop). While the initial auth state resolves, the splash screen stays visible.

| Auth State            | Routed To              |
| --------------------- | ---------------------- |
| Resolving (app start) | Splash screen held     |
| Not logged in         | `/(auth)/login`        |
| Logged in             | `/(app)/(tabs)` (Home) |

### 3.2 Navigation Shells

**Shell A — Auth shell** (Login, Register)

- No bottom tab bar, no top bar.
- Register has a back button to Login; Login is the root.

**Shell B — App shell** (Home, Saved, Profile)

- Persistent bottom tab bar with three icon-only tabs.
- No persistent top bar. Each tab owns its own header (the adaptive header on Home, a title on Saved and Profile).

**Stack screen over the tabs** — **Art View** (`/artwork/[id]`)

- Pushed on top of the tab bar (tab bar hidden).
- Floating round back button over the image.

### 3.3 Bottom Tab Bar

| Tab     | Icon (Lucide)          | Label | Route      |
| ------- | ---------------------- | ----- | ---------- |
| Home    | `House`                | none  | `/`        |
| Saved   | `Heart`                | none  | `/saved`   |
| Profile | User's DiceBear avatar | none  | `/profile` |

- **Active:** icon filled (`fill="currentColor"`), `text-primary` color. For Profile, the avatar gets a 2px `text-primary` ring.
- **Inactive:** outline icon, `text-secondary` color. Avatar without ring.
- Bar background `background`, no top border, no shadow. Icon size 24. Bar height 56 + bottom safe-area inset.
- Home is the default tab after login.

### 3.4 Sheet Patterns

All overlays are **bottom sheets** (HeroUI Native `BottomSheet`). Center dialogs are not used in v1.

- Art movements picker
- Change password
- Delete account confirmation

Sheets dismiss via swipe-down or backdrop tap, except while a submit is in flight.

### 3.5 Full Screen Map

```
AUTH (Shell A)
├── /login                      Login
└── /register                   Register

APP (Shell B, tabs)
├── /                           Home — Artist of the Day, movement filter, search, feed
├── /saved                      Saved — masonry, movement filter, search
└── /profile                    Profile — account info and actions

STACK (over tabs)
└── /artwork/[id]               Art View

BOTTOM SHEETS
├── Art movements picker        (Home, Saved)
├── Change password             (Profile)
└── Delete account              (Profile)
```

### 3.6 Back Navigation Rules

Android hardware back button follows the same rules.

| From             | Back Behavior                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Login            | Exits the app (root screen)                                                                |
| Register         | Back to Login                                                                              |
| Home             | If an artist, movement, or search is active: resets to Artist of the Day. Otherwise exits. |
| Saved            | Back to Home tab                                                                           |
| Profile          | Back to Home tab                                                                           |
| Art View         | Back to the screen it was opened from, preserving scroll position                          |
| Any bottom sheet | Closes the sheet                                                                           |

---

## 4. Design System

### 4.1 Visual Identity

Pinterest-inspired: white surfaces, near-black bold type, one red accent used sparingly, 16px rounded images, pill controls. Hierarchy comes from spacing, weight, and size rather than color or shadows. Images are never cropped, never bordered, never shadowed.

### 4.2 Color Palette

Light theme only. Values approximate Pinterest's palette. Tokens are defined once in `global.css` (Section 4.9); component code references tokens, never raw hex values.

#### Core

| Token             | Hex       | Use                                                                  |
| ----------------- | --------- | -------------------------------------------------------------------- |
| `background`      | `#FFFFFF` | All screen backgrounds, tab bar, sheets                              |
| `surface`         | `#EFEFEF` | Search bar, inputs, secondary buttons, skeletons, image placeholders |
| `surface-pressed` | `#E2E2E2` | Pressed state of `surface` elements, pressed list rows               |
| `border`          | `#E9E9E9` | Hairline dividers between settings rows                              |
| `text-primary`    | `#111111` | Titles, body text, active icons                                      |
| `text-secondary`  | `#767676` | Artist names, years, captions, placeholders, inactive icons          |
| `text-inverse`    | `#FFFFFF` | Text on accent fills and on toasts                                   |

#### Accent

| Token            | Hex       | Use                                               |
| ---------------- | --------- | ------------------------------------------------- |
| `accent`         | `#E60023` | Primary buttons, filled ♥, double-tap heart burst |
| `accent-pressed` | `#AD081B` | Pressed state of primary buttons                  |

The accent is used **only** for primary buttons, the filled ♥, and destructive actions. Everything else stays black, white, and gray.

#### Semantic & overlays

| Token      | Value                 | Use                                                     |
| ---------- | --------------------- | ------------------------------------------------------- |
| `danger`   | `#E60023`             | Delete account, inline form errors (same hue as accent) |
| `toast`    | `#111111`             | Toast background                                        |
| `backdrop` | `rgba(0, 0, 0, 0.4)`  | Bottom sheet backdrop                                   |
| `scrim`    | `rgba(0, 0, 0, 0.25)` | Behind the white heart burst on double-tap (optional)   |

### 4.3 Typography

Single family: **Inter** (Google Fonts, free), loaded with `@expo-google-fonts/inter`. Weights loaded: 400, 600, 700, 800.

On Android, `fontWeight` does not select a different font file for custom fonts, so each weight is a **separate font family** (`Inter_400Regular`, `Inter_600SemiBold`, `Inter_700Bold`, `Inter_800ExtraBold`). Typography tokens map to font families, not to `fontWeight`.

| Token            | Size / Line | Family / Weight     | Letter spacing | Use                                                      |
| ---------------- | ----------- | ------------------- | -------------- | -------------------------------------------------------- |
| `display`        | 28 / 34     | Inter 800 ExtraBold | -0.5           | Artist of the Day name, screen titles, Profile username  |
| `title`          | 20 / 26     | Inter 700 Bold      | -0.3           | Art View artwork title                                   |
| `subtitle`       | 16 / 22     | Inter 600 SemiBold  | 0              | Feed card title, section headers, settings row labels    |
| `button`         | 16 / 20     | Inter 700 Bold      | 0              | All button labels                                        |
| `body`           | 14 / 20     | Inter 400 Regular   | 0              | Art View values, sheet descriptions, input text          |
| `body-strong`    | 14 / 20     | Inter 600 SemiBold  | 0              | Art View artist name, movement rows in the picker        |
| `caption`        | 12 / 16     | Inter 400 Regular   | 0              | "Artist · Year" under artworks, helper text, error text  |
| `caption-strong` | 12 / 16     | Inter 600 SemiBold  | 0              | "Artist of the Day" label, masonry titles, detail labels |

Numerals: proportional; no tabular figures needed.

### 4.4 Spacing Scale

4px base unit, mapped to Tailwind spacing tokens.

| Token | Pixels |
| ----- | ------ |
| `1`   | 4      |
| `2`   | 8      |
| `3`   | 12     |
| `4`   | 16     |
| `6`   | 24     |
| `8`   | 32     |
| `12`  | 48     |

- Screen horizontal padding: `4` (16px).
- Vertical rhythm between content blocks: `6` (24px).
- Between feed cards: `8` (32px).
- Between image and its caption: `2` (8px).
- Masonry gutter (horizontal and vertical): `2` (8px).

### 4.5 Radii

| Token  | Pixels | Use                                              |
| ------ | ------ | ------------------------------------------------ |
| `sm`   | 8      | Small thumbnails in search result rows           |
| `md`   | 16     | Artwork images, inputs, skeletons                |
| `lg`   | 24     | Bottom sheet top corners                         |
| `full` | 9999   | Buttons, search bar, pills, avatars, back button |

### 4.6 Elevation

Flat by default. Only two levels:

| Token      | Definition                      | Use                                                               |
| ---------- | ------------------------------- | ----------------------------------------------------------------- |
| `flat`     | none                            | Everything by default                                             |
| `floating` | `0 2px 8px rgba(0, 0, 0, 0.12)` | Floating back button over images, toasts, collapsed sticky header |

No shadows on images, cards, buttons, text, or icons.

### 4.7 Iconography

**`lucide-react-native`** for all icons. Stroke width **2**. Icons inherit the current text color.

| Size | Use                                             |
| ---- | ----------------------------------------------- |
| 24   | Tab bar, ♥ on feed cards, back button           |
| 20   | Inside inputs and the search bar, settings rows |
| 48   | Empty and error state icons                     |

| Use                           | Icon                                |
| ----------------------------- | ----------------------------------- |
| Home tab                      | `House`                             |
| Saved tab                     | `Heart`                             |
| Movements picker (search bar) | `Layers`                            |
| Search                        | `Search`                            |
| Clear search / remove pill    | `X`                                 |
| Selected movement             | `Check`                             |
| Back                          | `ChevronLeft`                       |
| Save / saved                  | `Heart` (outline / filled `accent`) |
| Settings row chevron          | `ChevronRight`                      |
| Change password               | `KeyRound`                          |
| Log out                       | `LogOut`                            |
| Delete account                | `Trash2`                            |
| Password visibility           | `Eye` / `EyeOff`                    |
| Empty saved                   | `Heart`                             |
| No search results             | `SearchX`                           |
| Generic error                 | `CircleAlert`                       |
| No connection                 | `WifiOff`                           |
| Missing artwork image         | `ImageOff`                          |

### 4.8 Component Strategy

**HeroUI Native components used as-is** (exact names verified against the HeroUI Native docs at setup, see Section 12):

- `Button` — primary (accent), secondary (surface), ghost variants
- `TextField` / `InputGroup` — form inputs with start/end icons
- `Typography` — all text, mapped to the tokens in Section 4.3
- `Avatar` — profile and tab bar avatar
- `BottomSheet` — movements picker, change password, delete account
- `Toast` — transient confirmations
- `Chip` — removable movement pill inside the search bar
- `Spinner` — button loading state
- `Skeleton` — loading placeholders
- `Divider` — settings list separators

**Custom components** (built on HeroUI primitives, Section 8.1):

`SearchBar`, `MovementSheet`, `AdaptiveHeader`, `ArtworkFeedCard`, `MasonryPin`, `HeartButton`, `DoubleTapHeart`, `ArtistResultRow`, `DetailRow`, `EmptyState`, `SettingsRow`, `FormField`, `ScreenContainer`.

### 4.9 Theming Implementation

Uniwind uses Tailwind CSS v4, which is configured **in CSS**, not in `tailwind.config.js`. All tokens from Sections 4.2–4.6 are declared once in `global.css` as theme variables, and HeroUI Native's theme variables are overridden in the same file so its components inherit the palette (accent color, surfaces, radii, font families).

Rules:

- Components reference tokens via Uniwind classes (`bg-surface`, `text-secondary`, `rounded-md`), never raw hex values.
- No platform-prefixed classes (`ios:`, `android:`). The app targets Android only.
- The four Inter families are registered as font tokens (`font-regular`, `font-semibold`, `font-bold`, `font-extrabold`) and used through the typography tokens.

---

## 5. Data Model (Firestore)

### 5.1 Collections

| Path                                    | Purpose                                     |
| --------------------------------------- | ------------------------------------------- |
| `users/{uid}`                           | Profile and the list of saved artwork IDs   |
| `users/{uid}/savedArtworks/{artworkId}` | One document per saved artwork (a snapshot) |

Artwork data itself is **not** stored in Firestore except as the snapshot inside a saved document. Wikidata is the source of truth for artworks.

### 5.2 `users/{uid}`

Document ID = Firebase Auth `uid`. Created immediately after `createUserWithEmailAndPassword` succeeds.

| Field         | Type      | Notes                                                                     |
| ------------- | --------- | ------------------------------------------------------------------------- |
| `username`    | string    | 3–20 chars, letters, numbers, `_` and `.`. Not unique in v1 (Section 12). |
| `email`       | string    | Copy of the Auth email, for display                                       |
| `avatarStyle` | string    | DiceBear style, e.g. `notionists`                                         |
| `avatarSeed`  | string    | Random seed generated at registration                                     |
| `savedIds`    | string[]  | Wikidata QIDs of saved artworks; drives the ♥ state everywhere            |
| `createdAt`   | timestamp | `serverTimestamp()`                                                       |

**Why `savedIds`:** every feed card must know whether its artwork is saved. Reading one document per card would cost many reads; listening to the whole `savedArtworks` subcollection would load every saved document. A single array on the user document, listened to with `onSnapshot`, gives an instant `Set<string>` of saved IDs for one document read. Firestore's 1 MB document limit allows tens of thousands of IDs.

### 5.3 `users/{uid}/savedArtworks/{artworkId}`

Document ID = the artwork's Wikidata QID (e.g. `Q12418`), which prevents duplicates and makes "is saved?" a direct lookup.

| Field          | Type           | Notes                                                                    |
| -------------- | -------------- | ------------------------------------------------------------------------ |
| `artworkId`    | string         | Wikidata QID                                                             |
| `title`        | string         | English label at save time                                               |
| `artistId`     | string \| null | Creator QID                                                              |
| `artistName`   | string \| null | Creator English label                                                    |
| `movementId`   | string \| null | Primary movement QID (artwork's own, else creator's); used for filtering |
| `movementName` | string \| null | Movement English label                                                   |
| `year`         | number \| null | Year from inception date                                                 |
| `imageUrl`     | string         | Commons `Special:FilePath` URL without width parameter                   |
| `imageWidth`   | number         | Captured from `expo-image` `onLoad` at save time                         |
| `imageHeight`  | number         | Captured from `expo-image` `onLoad` at save time                         |
| `searchTokens` | string[]       | Lowercase prefixes of title and artist words (Section 5.5)               |
| `savedAt`      | timestamp      | `serverTimestamp()`                                                      |

Saving is only possible where the image has loaded (feed card, Art View), so `imageWidth` and `imageHeight` are always known. The masonry layout therefore knows every aspect ratio in advance and never shifts while loading.

### 5.4 Write Operations

| Operation       | Implementation                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| Register        | `createUserWithEmailAndPassword` → `setDoc(users/{uid})` with username, email, random avatar seed, `savedIds: []` |
| Save            | `writeBatch`: `set(savedArtworks/{id}, snapshot)` + `update(users/{uid}, { savedIds: arrayUnion(id) })`           |
| Unsave          | `writeBatch`: `delete(savedArtworks/{id})` + `update(users/{uid}, { savedIds: arrayRemove(id) })`                 |
| Change password | `reauthenticateWithCredential(EmailAuthProvider.credential(email, current))` → `updatePassword(newPassword)`      |
| Log out         | `signOut()` → `queryClient.clear()`                                                                               |
| Hard delete     | See Section 5.8                                                                                                   |

Because the user document is observed with `onSnapshot`, Firestore's latency compensation updates `savedIds` locally the moment the batch is written. The ♥ fills instantly everywhere, before the server confirms. On failure, the listener reverts it and a toast shows the error.

### 5.5 Saved Tab Queries

Firestore has no full-text search. Search on saved artworks uses a `searchTokens` array of **lowercase word prefixes** (minimum 2 characters) from the title and artist name. Example for "Water Lilies" by "Claude Monet":

```
["wa","wat","wate","water","li","lil","lili","lilie","lilies",
 "cl","cla","clau","claud","claude","mo","mon","mone","monet"]
```

The query uses the **first word** of the search input with `array-contains`; any additional words are filtered client-side on the returned page.

| State             | Query                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Default           | `orderBy("savedAt","desc"), limit(20), startAfter(cursor)`                                           |
| Movement          | `where("movementId","==",m), orderBy("savedAt","desc"), limit(20), startAfter(cursor)`               |
| Search            | `where("searchTokens","array-contains",t), orderBy("savedAt","desc"), limit(20), startAfter(cursor)` |
| Movement + search | Both `where` clauses + `orderBy("savedAt","desc")`, same pagination                                  |

Page size: **20**. Implemented with TanStack Query `useInfiniteQuery`, using the last document snapshot as the page cursor. Saved queries are invalidated after every save or unsave. The saved count shown in the header is `savedIds.length`, which costs no extra reads.

### 5.6 Composite Indexes (`firestore.indexes.json`)

| Collection      | Fields                                                          |
| --------------- | --------------------------------------------------------------- |
| `savedArtworks` | `movementId` ASC, `savedAt` DESC                                |
| `savedArtworks` | `searchTokens` ARRAY_CONTAINS, `savedAt` DESC                   |
| `savedArtworks` | `movementId` ASC, `searchTokens` ARRAY_CONTAINS, `savedAt` DESC |

If an index is missing, Firestore returns an error containing a direct link to create it.

### 5.7 Security Rules (`firestore.rules`)

Users can only read and write their own data.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /savedArtworks/{artworkId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

### 5.8 Hard Delete Sequence

Order matters: once the Auth account is deleted, Security Rules block access to the user's data.

1. Reauthenticate with the password entered in the Delete Account sheet.
2. Delete all `savedArtworks` documents in batches of up to 450 (loop until empty).
3. Delete `users/{uid}`.
4. `deleteUser(auth.currentUser)`.
5. `queryClient.clear()` and remove the persisted query cache from AsyncStorage.
6. Route to `/login` and show the toast "Your account was deleted."

If step 4 fails after data deletion, the user stays logged in with an empty collection and can retry. On any login where `users/{uid}` is missing, a fresh user document is recreated.

---

## 6. Wikidata Integration

### 6.1 Endpoints

| Purpose            | Endpoint                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Structured queries | `GET https://query.wikidata.org/sparql?format=json&query=<urlencoded SPARQL>`                                                     |
| Name search        | `GET https://www.wikidata.org/w/api.php?action=wbsearchentities&search=<q>&language=en&uselang=en&type=item&limit=20&format=json` |
| Images             | `https://commons.wikimedia.org/wiki/Special:FilePath/<file>?width=<px>`                                                           |

Every request sends an identifying header, as Wikimedia requires for API clients:

```
Api-User-Agent: Monetaur/1.0 (student project; <contact email>)
```

The same header is passed to `expo-image` through `source.headers` for Commons images.

### 6.2 Properties & Entities Used

| ID          | Meaning            | Used for                                 |
| ----------- | ------------------ | ---------------------------------------- |
| `P170`      | creator            | Artist of an artwork                     |
| `P18`       | image              | Artwork image, artist portrait           |
| `P571`      | inception          | Year                                     |
| `P135`      | movement           | Movement filter, detail row              |
| `P136`      | genre              | Detail row                               |
| `P186`      | made from material | Detail row                               |
| `P195`      | collection         | "Held at" detail row                     |
| `P31`       | instance of        | Restrict results to paintings/sculptures |
| `P106`      | occupation         | Identify artists in search results       |
| `P569/P570` | birth / death date | Artist years in the header               |
| `Q3305213`  | painting           | Artwork type                             |
| `Q860861`   | sculpture          | Artwork type                             |
| `Q1028181`  | painter            | Artist occupation                        |
| `Q1281618`  | sculptor           | Artist occupation                        |

### 6.3 Curated Local Data

**`src/shared/data/artists.ts`** — around 30 artists for Artist of the Day, mixing painters and sculptors across eras. Each entry: `id` (QID), `name`, `birthYear`, `deathYear`, `movementName`, `occupation` (`painter` | `sculptor`). Stored locally so the Home header renders instantly with no query.

**`src/shared/data/movements.ts`** — 10–12 movements for the picker. Each entry: `id` (QID), `name`. Proposed list: Renaissance, Mannerism, Baroque, Rococo, Neoclassicism, Romanticism, Realism, Impressionism, Post-Impressionism, Symbolism, Art Nouveau, Cubism. QIDs are looked up and verified in the Wikidata Query Service before build.

### 6.4 Artist of the Day

```ts
const dayIndex = Math.floor(Date.UTC(y, m, d) / 86_400_000); // local calendar date
const artist = ARTISTS[dayIndex % ARTISTS.length];
```

Every user sees the same artist on the same date; it changes at local midnight. No backend involved.

### 6.5 Queries

All list queries require an image, restrict to paintings and sculptures, collapse duplicate rows with `SAMPLE`, and use a stable `ORDER BY` so `LIMIT`/`OFFSET` pagination is consistent. Page size: **20**.

**Works by artist** (Artist of the Day, artist selected from search):

```sparql
SELECT ?work (SAMPLE(?workLabel) AS ?title) (SAMPLE(?image) AS ?img)
       (SAMPLE(?date) AS ?inception) (SAMPLE(?creatorLabel) AS ?artist)
WHERE {
  VALUES ?creator { wd:Q296 }
  VALUES ?type { wd:Q3305213 wd:Q860861 }
  ?work wdt:P170 ?creator; wdt:P31 ?type; wdt:P18 ?image.
  OPTIONAL { ?work wdt:P571 ?date. }
  ?work rdfs:label ?workLabel. FILTER(LANG(?workLabel) = "en")
  ?creator rdfs:label ?creatorLabel. FILTER(LANG(?creatorLabel) = "en")
}
GROUP BY ?work
ORDER BY ?work
LIMIT 20 OFFSET 0
```

**Works by movement** (movement picker). Includes works whose own movement matches **or** whose creator's movement matches, since many artworks lack `P135`:

```sparql
SELECT ?work (SAMPLE(?workLabel) AS ?title) (SAMPLE(?image) AS ?img)
       (SAMPLE(?date) AS ?inception) (SAMPLE(?creator) AS ?artistId)
       (SAMPLE(?creatorLabel) AS ?artist)
WHERE {
  VALUES ?movement { wd:<MOVEMENT_QID> }
  VALUES ?type { wd:Q3305213 wd:Q860861 }
  { ?work wdt:P135 ?movement. } UNION { ?work wdt:P170/wdt:P135 ?movement. }
  ?work wdt:P31 ?type; wdt:P18 ?image; wdt:P170 ?creator.
  OPTIONAL { ?work wdt:P571 ?date. }
  ?work rdfs:label ?workLabel. FILTER(LANG(?workLabel) = "en")
  ?creator rdfs:label ?creatorLabel. FILTER(LANG(?creatorLabel) = "en")
}
GROUP BY ?work
ORDER BY ?work
LIMIT 20 OFFSET 0
```

**Artwork detail** (Art View):

```sparql
SELECT ?workLabel ?creator ?creatorLabel ?date ?image
       (GROUP_CONCAT(DISTINCT ?movementLabel; separator=", ") AS ?movements)
       (SAMPLE(?movementId) AS ?primaryMovementId)
       (GROUP_CONCAT(DISTINCT ?genreLabel; separator=", ") AS ?genres)
       (GROUP_CONCAT(DISTINCT ?materialLabel; separator=", ") AS ?materials)
       (GROUP_CONCAT(DISTINCT ?collectionLabel; separator=", ") AS ?collections)
WHERE {
  VALUES ?work { wd:<ARTWORK_QID> }
  OPTIONAL { ?work wdt:P170 ?creator. }
  OPTIONAL { ?work wdt:P18 ?image. }
  OPTIONAL { ?work wdt:P571 ?date. }
  OPTIONAL { ?work wdt:P135 ?movementId. ?movementId rdfs:label ?movementLabel. FILTER(LANG(?movementLabel) = "en") }
  OPTIONAL { ?work wdt:P136 ?g. ?g rdfs:label ?genreLabel. FILTER(LANG(?genreLabel) = "en") }
  OPTIONAL { ?work wdt:P186 ?m. ?m rdfs:label ?materialLabel. FILTER(LANG(?materialLabel) = "en") }
  OPTIONAL { ?work wdt:P195 ?c. ?c rdfs:label ?collectionLabel. FILTER(LANG(?collectionLabel) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
GROUP BY ?workLabel ?creator ?creatorLabel ?date ?image
```

If the artwork has no movement, the Art View falls back to the creator's movement (a second small query, or the curated artist entry when available).

### 6.6 Search Flow

SPARQL is too slow for search-as-you-type, so search uses two steps:

1. **Name lookup:** `wbsearchentities` with the debounced input (350 ms, minimum 2 characters) returns up to 20 QIDs.
2. **Classification:** one SPARQL query with `VALUES ?item { ...those QIDs }` splits them into:
   - **Artists:** items with `P106` = painter or sculptor. Returns name, birth/death years, optional portrait.
   - **Artworks:** items with `P170` (creator) and `P18` (image). Returns the same fields as a feed item.
   - Anything else is discarded.

Artists render first as rows; artworks render below as feed cards. No pagination in search results (20 candidates maximum).

### 6.7 Image URLs

`P18` returns URLs of the form `http://commons.wikimedia.org/wiki/Special:FilePath/<file>`. The helper `imageUrl(raw, width)` forces `https` and appends `?width=`:

| Context            | Width |
| ------------------ | ----- |
| Search artist rows | 120   |
| Masonry pin        | 400   |
| Feed card          | 800   |
| Art View           | 1200  |

`expo-image` uses `cachePolicy="memory-disk"`, `contentFit="contain"`, and a `surface` placeholder. Aspect ratio for feed and Art View comes from the `onLoad` event; before load, a 4:5 placeholder is shown.

### 6.8 Caching (TanStack Query)

| Query key                                      | Source            | `staleTime` | Persisted |
| ---------------------------------------------- | ----------------- | ----------- | --------- |
| `["artistWorks", artistId]` (infinite)         | SPARQL            | 24 h        | Yes       |
| `["movementWorks", movementId]` (infinite)     | SPARQL            | 24 h        | Yes       |
| `["artwork", artworkId]`                       | SPARQL            | 7 days      | Yes       |
| `["search", query]`                            | wbsearch + SPARQL | 1 h         | No        |
| `["saved", uid, movementId, token]` (infinite) | Firestore         | 0           | No        |

- Persister: AsyncStorage, `maxAge` 7 days, `gcTime` 7 days on persisted queries.
- Only Wikidata queries are persisted; Firestore data is always fetched fresh.
- Retries: 2 for Wikidata (SPARQL can time out), 1 for Firestore.
- When opening the Art View from a feed card, the card's data seeds `["artwork", id]` as `placeholderData`, so the image, title, and artist render instantly while details load.

---

## 7. Screen Specifications

Every screen, sheet, and state in v1, in the order a new user encounters them.

### 7.1 Login

**Route:** `/login` (Shell A)

**Purpose:** Authenticate a returning user with email and password.

**Layout (top to bottom):**

1. Status bar safe area + `12` (48px) top spacing.
2. **App name** "Monetaur" (`display`, `text-primary`, centered).
3. **Tagline** (`body`, `text-secondary`, centered): "Your personal art gallery".
4. Vertical spacing `8`.
5. **Form** (stacked, `4` between fields):
   - **Email** — label "Email", `keyboardType="email-address"`, `autoCapitalize="none"`, `autoComplete="email"`.
   - **Password** — label "Password", secure entry with `Eye` / `EyeOff` toggle.
6. Form-level error line (Section 8.2), shown above the button when present.
7. Vertical spacing `6`.
8. **Primary button** "Log in" (full width).
9. Vertical spacing `4`.
10. Centered `body` text: "Don't have an account? **Sign up**" — "Sign up" (`body-strong`) routes to `/register`.

**States:** loading (button spinner, fields disabled); errors per Section 9.3.

**Not in v1:** forgot password.

### 7.2 Register

**Route:** `/register` (Shell A)

**Layout (top to bottom):**

1. Status bar safe area. `ChevronLeft` back button (top-left, 24px) → Login.
2. Vertical spacing `6`.
3. **Title** (`display`): "Create your account".
4. Vertical spacing `8`.
5. **Form** (stacked, `4` between fields):
   - **Username** — helper text "3–20 characters: letters, numbers, \_ and .".
   - **Email**.
   - **Password** — helper text "At least 8 characters".
   - **Confirm password**.
6. Form-level error line.
7. Vertical spacing `6`.
8. **Primary button** "Create account".
9. Vertical spacing `4`.
10. Centered text: "Already have an account? **Log in**" → `/login`.

**On success:** creates the Auth account and `users/{uid}` document (Section 5.4), then routes to Home. No email verification in v1.

### 7.3 Home

**Route:** `/` (Shell B, Home tab)

**Purpose:** Discover artworks: Artist of the Day by default, or by movement, artist, or search.

**Layout (top to bottom):**

1. Status bar safe area.
2. **Adaptive header** (`AdaptiveHeader`, padded `4` horizontal, `4` top, `3` bottom). Content depends on the Home mode (see mode table below).
3. **Search bar** (`SearchBar`, padded `4` horizontal). Placeholder: "Search an artwork, artist or art movement".
4. Vertical spacing `4`.
5. **Content** (FlashList):
   - **Browse modes** (Artist of the Day, artist, movement): feed of `ArtworkFeedCard`, infinite scroll, next page requested 2 screens before the end.
   - **Search mode:** section "Artists" (`subtitle`) with up to 5 `ArtistResultRow`s, then section "Artworks" (`subtitle`) with `ArtworkFeedCard`s. Sections with no results are hidden.

**Home modes:**

| Mode              | Trigger                      | Header content                                                                                                                                 | Feed source               |
| ----------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Artist of the Day | Default                      | `caption-strong` "ARTIST OF THE DAY" (`text-secondary`), then name (`display`), then "1840–1926 · Impressionism" (`caption`, `text-secondary`) | Works by artist           |
| Artist            | Tap an artist row in search  | `caption-strong` "ARTIST", name (`display`), years · movement if known                                                                         | Works by artist           |
| Movement          | Pick a movement in the sheet | `caption-strong` "MOVEMENT", movement name (`display`)                                                                                         | Works by movement         |
| Search            | Input ≥ 2 characters         | "Results for '<query>'" (`display`, max 2 lines, truncated)                                                                                    | Search flow (Section 6.6) |

**Mode rules:**

- On Home, **movement and search are mutually exclusive**: picking a movement clears the search text, and typing removes the movement pill. (Wikidata name search cannot be filtered by movement.)
- Tapping an artist row clears the search text and enters Artist mode.
- Clearing everything (✕ in the search bar, removing the pill, or Android back) returns to Artist of the Day.

**Collapsing header:** as the list scrolls down, the header text fades and collapses (Reanimated scroll handler) over the first 80px, leaving only the search bar pinned at the top with the `floating` shadow. Scrolling back to the top restores it.

**Feed card interactions:** see `ArtworkFeedCard` (Section 8.1).

### 7.4 Art Movements Sheet

**Triggered from:** the `Layers` icon inside the search bar (Home and Saved).

**Sheet contents (`BottomSheet`, max 70% screen height):**

1. Drag handle.
2. Title (`subtitle`): "Art movements". Padded `4`.
3. Scrollable list of movements from `movements.ts`, in chronological order. Each row: full width, 52px tall, padded `4` horizontal, movement name in `body-strong`. Selected row shows `Check` (20px, `text-primary`) on the right. Pressed row: `surface-pressed` background.
4. Bottom safe-area padding.

**Behavior:** tapping a row selects it, closes the sheet, shows the movement as a removable `Chip` inside the search bar, and updates results. Tapping the selected row again deselects it.

### 7.5 Art View

**Route:** `/artwork/[id]` (stack over tabs)

**Purpose:** Show one artwork with its full details and let the user save it.

**Layout (top to bottom, scrollable):**

1. **Image** — full width minus `4` padding, `md` radius, natural aspect ratio, 1200px source. Status bar safe area above it.
2. **Floating back button** — 40px circle, `background` fill, `floating` shadow, `ChevronLeft` 24px, positioned `4` from the top-left over the image.
3. Vertical spacing `4`.
4. **Save button** — full width pill:
   - Not saved: primary (`accent`), `Heart` outline icon + "Save".
   - Saved: secondary (`surface`), `Heart` filled `accent` icon + "Saved" (`text-primary`). Tap to unsave.
5. Vertical spacing `6`.
6. **Title** (`title`).
7. **Artist** (`body-strong`), vertical spacing `1`, **year** (`body`, `text-secondary`).
8. Vertical spacing `6`.
9. **Details list** of `DetailRow`s, separated by `border` dividers:
   - Movement
   - Genre
   - Material
   - Held at
     Each row: label (`caption-strong`, `text-secondary`) above value (`body`, `text-primary`). Rows with no value are **hidden**; if all are empty, the list is hidden.
10. Bottom safe-area padding + `8`.

**States:** title, artist, and image appear instantly from placeholder data; the details list shows 4 skeleton rows until loaded. If details fail, the details list is replaced by "Couldn't load details." with a "Try again" ghost button; the image and save button remain usable.

### 7.6 Saved

**Route:** `/saved` (Shell B, Saved tab)

**Purpose:** Browse, filter, and search the user's saved artworks.

**Layout (top to bottom):**

1. Status bar safe area.
2. **Header** (padded `4`): "Saved" (`display`), and below it the count (`caption`, `text-secondary`): "24 artworks" / "1 artwork".
3. **Search bar** — same component; placeholder "Search your saved artworks"; movements sheet applies to saved items.
4. Vertical spacing `4`.
5. **Masonry** (FlashList with `masonry`, 2 columns, `2` gutter, `4` screen padding) of `MasonryPin`s. Next page (20 items) requested when within 2 screens of the end; a small centered `Spinner` shows while loading more.

**Filter and search** combine freely here (Section 5.5), debounced 350 ms.

**States:** empty collection, empty results, loading, and error per Section 9.

### 7.7 Profile

**Route:** `/profile` (Shell B, Profile tab)

**Layout (top to bottom, padded `4`):**

1. Status bar safe area + `6`.
2. **Avatar** — 96px circle, DiceBear image, `surface` background while loading.
3. Vertical spacing `3`.
4. **Username** (`display`, centered).
5. **Email** (`body`, `text-secondary`, centered).
6. Vertical spacing `8`.
7. **Settings list** (`SettingsRow`s, `border` dividers between):
   - `KeyRound` + "Change password" + `ChevronRight` → Change Password sheet.
   - `LogOut` + "Log out" (no chevron) → signs out immediately, routes to `/login`.
8. Vertical spacing `8`.
9. **Danger row** (separated from the list): `Trash2` + "Delete account" in `danger` color → Delete Account sheet.

DiceBear URL: `https://api.dicebear.com/<version>/<avatarStyle>/png?seed=<avatarSeed>&size=192` (PNG for simple rendering with `expo-image`).

### 7.8 Change Password Sheet

**Sheet contents (`BottomSheet`, keyboard-aware):**

1. Drag handle.
2. Title (`subtitle`): "Change password".
3. Vertical spacing `4`.
4. Fields (stacked, `4` between): "Current password", "New password" (helper: "At least 8 characters"), "Confirm new password". All with visibility toggles.
5. Form-level error line.
6. Vertical spacing `6`.
7. **Primary button** "Update password".
8. Bottom safe area.

**On success:** sheet closes, form resets, toast "Password updated".

### 7.9 Delete Account Sheet

**Sheet contents (`BottomSheet`, keyboard-aware):**

1. Drag handle.
2. Title (`subtitle`, `danger`): "Delete your account?".
3. Description (`body`, `text-secondary`, max 3 lines): "This permanently deletes your account and all your saved artworks. This cannot be undone."
4. Vertical spacing `4`.
5. Field: "Enter your password to confirm".
6. Form-level error line.
7. Vertical spacing `6`.
8. **Destructive button** "Delete account" (`danger` fill, `text-inverse`), disabled until the password is non-empty.
9. Vertical spacing `3`.
10. **Ghost button** "Cancel".
11. Bottom safe area.

**On confirm:** runs the hard delete sequence (Section 5.8). The sheet cannot be dismissed while deletion is in progress.

---

## 8. Reusable Components & Patterns

### 8.1 Custom Component Catalog

| Component         | Where used            | Description                                                                                                                                                                                                                                                                                                                                              |
| ----------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SearchBar`       | Home, Saved           | 48px pill, `surface` fill, no border. Left: `Layers` icon button (opens `MovementSheet`), then the movement `Chip` if selected. Middle: text input (`body`, placeholder `text-secondary`). Right: `Search` icon, replaced by `X` while text is present. Props: `value`, `onChangeText`, `placeholder`, `movement`, `onMovementPress`, `onMovementClear`. |
| `MovementSheet`   | Home, Saved           | Bottom sheet listing curated movements (Section 7.4). Props: `open`, `selectedId`, `onSelect`, `onClose`.                                                                                                                                                                                                                                                |
| `AdaptiveHeader`  | Home                  | Renders the header for the current Home mode; collapses on scroll. Props: `mode`, `scrollY` (shared value).                                                                                                                                                                                                                                              |
| `ArtworkFeedCard` | Home                  | Full-width image (`md` radius, natural ratio, 800px source) wrapped in `DoubleTapHeart`. Below (`2` gap): left column with title (`subtitle`, max 2 lines) and "Artist · Year" (`caption`, `text-secondary`, 1 line); right: `HeartButton`. Tap outside the heart → Art View. Props: `artwork`.                                                          |
| `MasonryPin`      | Saved                 | Image at stored aspect ratio (`md` radius, 400px source). Below (`2` gap): title (`caption-strong`, 1 line) and artist (`caption`, `text-secondary`, 1 line). Tap → Art View. Props: `saved`.                                                                                                                                                            |
| `HeartButton`     | Feed card             | 44×44 touch target, `Heart` 24px. Outline `text-primary` when not saved; filled `accent` when saved. Scale bump (1 → 1.2 → 1, 200 ms) on save. Props: `artwork`, `size`.                                                                                                                                                                                 |
| `DoubleTapHeart`  | Feed card             | Gesture wrapper: double-tap saves (never unsaves) and plays a centered white `Heart` (80px, filled) that scales 0 → 1.2 → 1 and fades out over 600 ms. Single tap passes through to open the Art View. Props: `onDoubleTap`, `children`.                                                                                                                 |
| `ArtistResultRow` | Home search           | 64px row: 48px round portrait (or initial letter on `surface`), name (`subtitle`), "1840–1926 · Painter" (`caption`, `text-secondary`). Props: `artist`, `onPress`.                                                                                                                                                                                      |
| `DetailRow`       | Art View              | Label above value, `3` vertical padding. Returns `null` when value is empty. Props: `label`, `value`.                                                                                                                                                                                                                                                    |
| `EmptyState`      | Saved, search, errors | Centered 48px icon (`text-secondary`), title (`subtitle`), helper text (`body`, `text-secondary`, max 2 lines), optional ghost action button. Props: `icon`, `title`, `message`, `action`.                                                                                                                                                               |
| `SettingsRow`     | Profile               | 56px row: 20px icon, label (`subtitle`), optional `ChevronRight`. Props: `icon`, `label`, `onPress`, `destructive`, `chevron`.                                                                                                                                                                                                                           |
| `FormField`       | All forms             | Bridges a TanStack Form field to a HeroUI text field: label, input, helper text, and first validation error (Section 8.4).                                                                                                                                                                                                                               |
| `ScreenContainer` | Every screen          | Handles safe-area insets, `background` color, and default horizontal padding.                                                                                                                                                                                                                                                                            |
| Skeletons         | Home, Saved, Art View | `FeedCardSkeleton`, `MasonryPinSkeleton`, `DetailRowSkeleton`: `surface` blocks in the exact shape of the real component, with a subtle pulse.                                                                                                                                                                                                           |

### 8.2 Recurring Patterns

**Buttons.** Height 48, full width in forms and sheets, `full` radius, `button` typography.

| Variant     | Fill      | Text           | Pressed           |
| ----------- | --------- | -------------- | ----------------- |
| Primary     | `accent`  | `text-inverse` | `accent-pressed`  |
| Secondary   | `surface` | `text-primary` | `surface-pressed` |
| Destructive | `danger`  | `text-inverse` | `accent-pressed`  |
| Ghost       | none      | `text-primary` | `surface` fill    |

**Disabled buttons:** opacity 0.4, no color change, no interaction.

**Loading buttons:** label replaced by a `Spinner` in the text color; width unchanged; disabled while loading.

**Inputs.** Height 48, `md` radius, `surface` fill, no border. Text `body`, placeholder `text-secondary`. Label above (`caption-strong`, `text-primary`, `2` margin below). Focused: 2px `text-primary` outline. Invalid: 2px `danger` outline.

**Inline field errors:** `caption`, `danger`, no icon, directly below the field with `1` margin. Replaces the helper text while shown.

**Form-level errors** (server or network errors not tied to a field): one line of `caption`, `danger`, centered, above the submit button.

**Toasts:** HeroUI `Toast`, bottom position above the tab bar, `toast` background, `text-inverse` `body` text, `full` radius, `floating` shadow, 2.5 s. Used only for non-destructive confirmations and for save/unsave failures. Form errors are always inline.

| Event              | Toast copy                    |
| ------------------ | ----------------------------- |
| Save               | "Saved to your gallery"       |
| Unsave             | "Removed from your gallery"   |
| Save/unsave failed | "Couldn't update. Try again." |
| Password updated   | "Password updated"            |
| Account deleted    | "Your account was deleted."   |

**Sheet padding:** `4` horizontal, `4` top, `6` bottom above the safe area.

**Transitions:** default Expo Router slide for the Art View; no custom transitions in v1.

### 8.3 Saved State Consistency

A single hook, `useSavedIds()`, subscribes to `users/{uid}` with `onSnapshot` and exposes a `Set<string>`. Every `HeartButton`, `DoubleTapHeart`, and the Art View save button read from it and call the same `save(artwork, dimensions)` / `unsave(id)` functions (Section 5.4). This guarantees the ♥ matches everywhere without prop drilling or a global store.

### 8.4 Forms & Validation

**Zod** owns the rules and types; **TanStack Form** owns field state and submission. TanStack Form v1 supports Standard Schema, so Zod schemas are passed directly as validators with no adapter package.

#### 8.4.1 Shared primitives (`src/shared/schemas/`)

| Primitive          | Definition (sketch)                                                                 | Used by                     |
| ------------------ | ----------------------------------------------------------------------------------- | --------------------------- |
| `Email`            | `z.email({ error: "Enter a valid email" })`                                         | Login, Register             |
| `Password`         | `z.string().min(8, { error: "At least 8 characters" })`                             | Register, Change password   |
| `RequiredPassword` | `z.string().min(1, { error: "Enter your password" })`                               | Login, reauthentication     |
| `Username`         | `z.string().trim().min(3).max(20).regex(/^[a-zA-Z0-9_.]+$/)` with explicit messages | Register                    |
| `SearchQuery`      | `z.string().trim().min(2).max(60)`                                                  | Home and Saved search       |
| `Qid`              | `z.string().regex(/^Q\d+$/)`                                                        | Route params, API responses |

Every rule carries an explicit error message matching the copy in Section 9.3. Screens never override schema messages.

#### 8.4.2 Per-form schemas

| Screen / Sheet      | Schema                 | Fields                                                                                                                                                          |
| ------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 Login           | `LoginSchema`          | `email: Email`, `password: RequiredPassword`                                                                                                                    |
| 7.2 Register        | `RegisterSchema`       | `username: Username`, `email: Email`, `password: Password`, `confirmPassword` — refined: passwords match (`path: ["confirmPassword"]`, "Passwords don't match") |
| 7.8 Change password | `ChangePasswordSchema` | `currentPassword: RequiredPassword`, `newPassword: Password`, `confirmPassword` — refined: match, and new ≠ current ("Choose a different password")             |
| 7.9 Delete account  | `DeleteAccountSchema`  | `password: RequiredPassword`                                                                                                                                    |

Each schema file exports the schema and its inferred type (`export type LoginInput = z.infer<typeof LoginSchema>`).

#### 8.4.3 Conventions

- **Validation timing:** `onBlur` for field rules (no errors while typing the first time), `onChange` after a field has shown an error (so it clears as soon as it's fixed), `onSubmit` as the final gate.
- **Server errors:** Firebase error codes are mapped to messages (Section 9.3) and set on the relevant field or as a form-level error.
- **Submit binding:** the submit button subscribes to `canSubmit` and `isSubmitting`.
- **Reset:** forms inside sheets call `form.reset()` when the sheet closes.

#### 8.4.4 API response schemas

Zod also validates every external response before it reaches the UI:

- `SparqlResponseSchema` — `{ head: { vars: string[] }, results: { bindings: Record<string, { type: string; value: string }>[] } }`.
- Per-query row schemas transform bindings into app types (`ArtworkListItem`, `ArtworkDetail`, `ArtistResult`): extract QIDs from entity URLs, parse years from ISO dates, normalize image URLs. Rows that fail parsing are **dropped**, not thrown, so one malformed Wikidata entry never breaks a page.
- `WbSearchResponseSchema` — `{ search: { id: string; label?: string; description?: string }[] }`.
- `SavedArtworkSchema` — validates Firestore documents read in the Saved tab.

---

## 9. Empty, Loading & Error States

### 9.1 Empty States

| Screen           | Condition                    | Treatment                                                                                                 |
| ---------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| Saved            | No saved artworks            | `EmptyState`: `Heart` icon, "Your gallery is empty", "Tap the heart on any artwork to save it here."      |
| Saved            | Filter/search has no results | `EmptyState`: `SearchX`, "No saved artworks found", "Try another title, artist or movement."              |
| Home search      | No artists and no artworks   | `EmptyState`: `SearchX`, "No artworks found", "Try another artist, artwork or movement."                  |
| Home movement    | Movement returns no artworks | `EmptyState`: `ImageOff`, "Nothing here yet", "Try another movement."                                     |
| Art View details | All detail fields missing    | Details list hidden; title, artist, and image still shown                                                 |
| Any image        | Image fails to load          | `surface` block at 4:5 ratio with centered `ImageOff` (24px, `text-secondary`); saving is disabled for it |

### 9.2 Loading States

| Screen           | Condition                           | Treatment                                                         |
| ---------------- | ----------------------------------- | ----------------------------------------------------------------- |
| App start        | Auth state resolving, fonts loading | Splash screen held                                                |
| Login / Register | Submitting                          | Button spinner, fields disabled                                   |
| Home             | First page loading                  | 2 `FeedCardSkeleton`s                                             |
| Home             | Next page loading                   | Centered `Spinner` below the last card                            |
| Home search      | Search in flight                    | 3 artist row skeletons + 1 `FeedCardSkeleton`                     |
| Art View         | Details loading                     | 4 `DetailRowSkeleton`s (image/title/artist from placeholder data) |
| Saved            | First page loading                  | 6 `MasonryPinSkeleton`s with varied heights                       |
| Saved            | Next page loading                   | Centered `Spinner` below the masonry                              |
| Profile          | User document loading               | Avatar circle + 2 text line skeletons                             |
| Sheets           | Submitting                          | Button spinner; sheet not dismissible                             |

### 9.3 Error States & Copy

| Screen          | Condition                           | Treatment / Copy                                                                             |
| --------------- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| Login           | `auth/invalid-credential`           | Form-level: "Email or password is incorrect."                                                |
| Login           | `auth/too-many-requests`            | Form-level: "Too many attempts. Try again later."                                            |
| Register        | `auth/email-already-in-use`         | Under email: "An account with this email already exists."                                    |
| Register        | Username / password rules           | Inline per field (schema messages)                                                           |
| Any auth form   | `auth/network-request-failed`       | Form-level: "Couldn't connect. Try again."                                                   |
| Home            | First page failed                   | `EmptyState`: `WifiOff` or `CircleAlert`, "Couldn't load artworks", ghost button "Try again" |
| Home            | Next page failed                    | Inline row under the feed: "Couldn't load more." + "Try again" ghost button                  |
| Home search     | Search failed                       | `EmptyState`: `CircleAlert`, "Search isn't available right now", "Try again"                 |
| Art View        | Details failed                      | Details replaced by "Couldn't load details." + "Try again" (Section 7.5)                     |
| Saved           | Query failed                        | `EmptyState`: `CircleAlert`, "Couldn't load your gallery", "Try again"                       |
| Save / unsave   | Write failed                        | ♥ reverts; toast "Couldn't update. Try again."                                               |
| Change password | `auth/invalid-credential` on reauth | Under current password: "Current password is incorrect."                                     |
| Change password | Network failure                     | Form-level: "Couldn't update your password. Try again."                                      |
| Delete account  | `auth/invalid-credential` on reauth | Under password: "Password is incorrect."                                                     |
| Delete account  | Network failure                     | Form-level: "Couldn't delete your account. Try again."                                       |

---

## 10. Asset Inventory

| #   | Asset                 | Type                              | Size / Format                                          | Description                                                                       |
| --- | --------------------- | --------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 1   | App icon              | Static raster                     | 1024×1024 master                                       | Simple original mark on `accent` or white background, recognizable at small sizes |
| 2   | Android adaptive icon | Foreground + background layers    | 1024×1024 foreground (safe zone 66%), solid background | Same mark as the app icon                                                         |
| 3   | Splash screen         | Centered image + background color | ~288×288 image on `background`                         | App mark only, no text                                                            |
| 4   | Inter font            | `@expo-google-fonts/inter`        | 400, 600, 700, 800                                     | Loaded at startup before hiding the splash                                        |
| 5   | Icons                 | `lucide-react-native`             | Vector                                                 | Section 4.7                                                                       |
| 6   | Avatars               | DiceBear HTTP API                 | PNG, 192px                                             | Generated from `avatarStyle` + `avatarSeed`                                       |
| 7   | Artwork images        | Wikimedia Commons                 | Resized via `?width=`                                  | Section 6.7                                                                       |
| 8   | Heart burst animation | Reanimated (code)                 | —                                                      | No Lottie files; built with `Heart` icon + scale/opacity animation                |

No illustrations in v1. Empty and error states use Lucide icons.

---

## 11. Out of Scope for v1

- iOS support.
- Dark theme.
- Localization (English only).
- Email verification and forgot/reset password.
- Changing email or username.
- Changing profile picture (planned QOL: DiceBear avatar picker).
- Full-screen image view with pinch-to-zoom (planned QOL).
- Custom image uploads (would require Firebase Cloud Storage and the Blaze plan).
- Unique usernames.
- Artwork descriptions or stories (e.g. Wikipedia summaries).
- Boards, folders, or collections inside Saved.
- Sharing artworks.
- Push notifications.
- Haptic feedback.
- Offline browsing beyond the persisted Wikidata cache.
- Web and tablet layouts.

---

## 12. Open Decisions

1. **Curated artist list.** Final ~30 artists (painters and sculptors) with verified Wikidata QIDs and image coverage checked in the Wikidata Query Service.
2. **Movement QIDs.** Look up and verify the QID for each movement in Section 6.3; drop any movement whose query returns too few results or times out.
3. **Movement query performance.** If the creator-movement `UNION` branch is too slow for large movements, keep only the artwork's own `P135`.
4. **DiceBear style and API version.** `notionists` or `lorelei`; confirm the current API version number in the URL.
5. **HeroUI Native component names.** Confirm exact component names and props (`TextField`, `BottomSheet`, `Skeleton`, etc.) against the current HeroUI Native docs during setup, and adjust Section 4.8 if needed.
6. **Contact email** for the `Api-User-Agent` header.

---

_End of document._
