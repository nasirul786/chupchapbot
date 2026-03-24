# 🤫 ChupChapBot — Telegram Whisper Bot

A Telegram inline bot that lets you send **secret messages** only a specific person can read. Built with [grammY](https://grammy.dev/) (Node.js).

## Features

- **Inline mode** — use it in any chat without opening the bot
- **Target by user ID, @username, or plain username**
- **Open button** — only the intended recipient (and admins) can reveal the message
- **Delete button** — only the sender, recipient, or admins can delete the whisper
- **Admin override** — configurable admin users can always view and delete whispers (for debugging)

## Usage

Type in any Telegram chat:

```
@ChupChapBot <target> <message>
```

| Target Format | Example |
|---------------|---------|
| User ID | `@ChupChapBot 123456789 Hey there!` |
| @username | `@ChupChapBot @john Secret message` |
| username | `@ChupChapBot john Secret message` |

Select the inline result to send. The recipient sees a message with two buttons:

- **👁 Open** — shows the secret message in a popup (only visible to the clicker)
- **🗑 Delete** — permanently deletes the whisper

Anyone else clicking the buttons gets: **"🚫 You are not allowed to do this!"**

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

### Steps

1. **Clone the repo**
   ```bash
   git clone https://github.com/nasirul786/chupchapbot.git
   cd chupchapbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in:
   ```env
   BOT_TOKEN=your_bot_token_here
   ADMIN_USERS=123456789,987654321
   ```

4. **Enable inline mode** — send `/setinline` to [@BotFather](https://t.me/BotFather) and set a placeholder text

5. **Run the bot**
   ```bash
   npm start
   ```
   Or in development mode (auto-reload on file changes):
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BOT_TOKEN` | ✅ | Telegram bot token from BotFather |
| `ADMIN_USERS` | ❌ | Comma-separated user IDs that can always open/delete any whisper |

## Tech Stack

- **Runtime**: Node.js
- **Framework**: [grammY](https://grammy.dev/)
- **Config**: dotenv

## License

ISC
