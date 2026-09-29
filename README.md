# Monetaur

**Your personal art gallery, one artwork at a time.**

Monetaur is a React Native mobile app for discovering and collecting art. Meet a new Artist of the Day every day, browse artworks by famous painters and sculptors, filter by art movement, and save your favorites into a personal gallery.

## Table of Contents

- [💡 Main Idea](#-main-idea)
- [🎯 Goals](#-goals)
- [📋 Scope](#-scope)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📚 Documentation](#-documentation)
- [🙏 Acknowledgements](#-acknowledgements)

## 💡 Main Idea

Monetaur is a digital art gallery in your pocket. All artwork data comes from **Wikidata**, which aggregates artworks held by museums around the world, so an artist's page isn't limited to a single museum's collection.

The interface is Pinterest-inspired: clean white surfaces, bold typography, and the artwork always in focus.

| Tab     | What it does                                                                                                    |
| ------- | --------------------------------------------------------------------------------------------------------------- |
| Home    | Artist of the Day by default, an Instagram-style feed, art movement filters, and search for artists or artworks |
| Saved   | Your saved artworks in a Pinterest-style masonry layout, with the same filters and search                       |
| Profile | Your account: avatar, username, email, change password, log out, and delete account                             |

Tap any artwork to open the **Art View** with its details: artist, year, movement, genre, material, and the museum where it's held. Save it with the ♥ or a double-tap.

## 🎯 Goals

- Deliver a complete, polished mobile app within one academic module (about 4 weeks).
- Demonstrate core mobile development concepts: authentication, remote data fetching, caching, persistence, form validation, and user data management.
- Integrate a real public data source and validate its responses before they reach the UI.
- Keep the architecture light: no custom backend, no global state library, free-tier services only.

## 📋 Scope

**In scope (v1)**

- Email/password registration and login, with persistent sessions
- Artist of the Day, movement filters, and search on Home
- Save and unsave artworks from the feed, via double-tap, or from the Art View
- Saved tab with masonry layout, pagination, filters, and search
- Profile with change password, log out, and hard account deletion
- Loading, empty, and error states across all screens

**Out of scope (v1)**

- iOS, dark mode, localization
- Profile picture changes (planned QOL)
- Full-screen pinch-to-zoom (planned QOL)
- Custom image uploads, push notifications, sharing

**Platform:** Android, via Expo Go.

## 🛠️ Tech Stack

| Category           | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Framework          | React Native + Expo SDK 57 (Expo Router)           |
| Language           | TypeScript                                         |
| UI & Styling       | HeroUI Native + Uniwind (Tailwind CSS v4)          |
| Lists & Images     | FlashList + expo-image                             |
| Animations         | React Native Reanimated + Gesture Handler          |
| Data & Caching     | TanStack Query + AsyncStorage persistence          |
| Forms & Validation | TanStack Form + Zod                                |
| Backend            | Firebase Authentication + Cloud Firestore          |
| Artwork Data       | Wikidata (SPARQL + search API) + Wikimedia Commons |
| Avatars            | DiceBear                                           |
| Icons & Fonts      | Lucide + Inter                                     |

## 🚀 Quick Start

**Prerequisites:** Node.js ≥ 20.19.4, pnpm 10, an Android device with [Expo Go](https://expo.dev/go) or an Android emulator, and a Firebase project with **Email/Password** auth and **Cloud Firestore** enabled.

```bash
git clone <repository-url>
cd monetaur
pnpm install
cp .env.example .env      # fill in your Firebase config (EXPO_PUBLIC_FIREBASE_*)
pnpm expo start           # press "a" for the emulator, or scan the QR code in Expo Go
```

Deploy the Firestore security rules and indexes:

```bash
pnpm dlx firebase-tools login
pnpm dlx firebase-tools deploy --only firestore:rules,firestore:indexes
```

## 📚 Documentation

**Project docs**

| Document                                    | Contents                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| [Technical Documentation](documentation.md) | Screen specs, design system, Firestore data model, Wikidata queries, states |

**Stack docs**

- [Expo](https://docs.expo.dev/) · [Expo Router](https://docs.expo.dev/router/introduction/)
- [HeroUI Native](https://heroui.com/en/docs/native) · [Uniwind](https://docs.uniwind.dev/)
- [TanStack Query](https://tanstack.com/query/latest) · [TanStack Form](https://tanstack.com/form/latest) · [Zod](https://zod.dev/)
- [Firebase Auth](https://firebase.google.com/docs/auth) · [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Wikidata Query Service](https://query.wikidata.org/) · [SPARQL tutorial](https://www.wikidata.org/wiki/Wikidata:SPARQL_tutorial)
- [FlashList](https://shopify.github.io/flash-list/) · [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) · [DiceBear](https://www.dicebear.com/)

## 🙏 Acknowledgements

Developed as an academic mobile development project at `<Universitatea Romano-Americana>`.

Artwork data from [Wikidata](https://www.wikidata.org/) and images from [Wikimedia Commons](https://commons.wikimedia.org/), used under their respective open licenses.

Made with lots of ❤️ for art and culture by `<Nicolae-Octavian Mihaila>`
