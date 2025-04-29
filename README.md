# FlashSync - Language Learning Flashcards

FlashSync is a modern flashcard application designed for language learning and other educational purposes. It features offline support and device synchronization via GitHub.

## Features

- **Create and manage flashcard decks**: Organize your learning materials into different decks
- **Interactive flashcards**: Flip cards to reveal answers
- **Spaced repetition**: Cards are presented in an optimized order for learning
- **Offline support**: Full functionality without an internet connection
- **Cross-device synchronization**: Sync your cards between devices using GitHub
- **Progress tracking**: Monitor your learning progress

## Tech Stack

- **Next.js**: React framework for the web application
- **TailwindCSS & ShadcnUI**: For styling
- **IndexedDB**: For local storage and offline support
- **GitHub OAuth**: For authentication
- **GitHub Gists**: For secure cross-device synchronization
- **PWA**: Progressive Web App for offline usage and mobile installation

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A GitHub account (for authentication and synchronization)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/flashcard-sync.git
cd flashcard-sync
```

2. Install dependencies:

```bash
bun install
```

3. Create a `.env.local` file with your GitHub OAuth credentials:

```
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

You can generate a random string for NEXTAUTH_SECRET with `openssl rand -hex 32`.

4. Start the development server:

```bash
bun run dev
```

## Usage

1. Sign in with your GitHub account (optional but recommended for syncing)
2. Create a new deck for your flashcards
3. Add cards to your deck with questions on the front and answers on the back
4. Study your cards
5. Sync your progress to access from other devices

## GitHub Authentication and Synchronization

The application uses GitHub OAuth for authentication. When signed in, your flashcard data is stored in GitHub Gists, allowing you to synchronize your learning progress across multiple devices. All data is private to your GitHub account.

## Offline Support

The application is a Progressive Web App (PWA) that works offline. You can install it on your device and use it without an internet connection. Data will be automatically synchronized when you reconnect.

## Development

- `bun run dev`: Start the development server
- `bun run build`: Build the application
- `bun run start`: Start the production server
- `bun run lint`: Lint the codebase
- `bun run format`: Format the codebase

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
