require("dotenv").config();
const { Bot, InlineKeyboard } = require("grammy");


const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌  BOT_TOKEN is missing in .env");
  process.exit(1);
}

const ADMIN_USERS = (process.env.ADMIN_USERS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean)
  .map(Number);

const bot = new Bot(BOT_TOKEN);



const whispers = new Map();
let whisperCounter = 0;




function parseQuery(text) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const targetRaw = parts[0];
  const message = parts.slice(1).join(" ");

  let targetId = null;
  let targetUsername = null;

  if (/^\d+$/.test(targetRaw)) {

    targetId = Number(targetRaw);
  } else {

    targetUsername = targetRaw.replace(/^@/, "").toLowerCase();
  }

  return { targetId, targetUsername, message };
}

function isAdmin(userId) {
  return ADMIN_USERS.includes(userId);
}

function isAuthorised(userId, whisper) {
  if (userId === whisper.senderId) return true;
  if (whisper.targetId && userId === whisper.targetId) return true;
  if (isAdmin(userId)) return true;
  return false;
}

function isTarget(userId, username, whisper) {
  if (whisper.targetId && userId === whisper.targetId) return true;
  if (
    whisper.targetUsername &&
    username &&
    username.toLowerCase() === whisper.targetUsername
  )
    return true;
  if (isAdmin(userId)) return true;
  return false;
}


bot.command("start", async (ctx) => {
  await ctx.reply(
    `🤫 *WhisperBot*\n\n` +
    `Send secret messages that only a specific person can read\\!\n\n` +
    `*How to use:*\n` +
    `1\\. Type \`@${ctx.me.username}\` in any chat\n` +
    `2\\. Enter: \`<user\\_id or @username> <your message>\`\n` +
    `3\\. Select the result to send it\n\n` +
    `Only the intended recipient can reveal the message\\. ` +
    `Both sender and recipient can delete it\\.`,
    { parse_mode: "MarkdownV2" }
  );
});


bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query;
  const parsed = parseQuery(query);

  if (!parsed) {

    return ctx.answerInlineQuery(
      [
        {
          type: "article",
          id: "help",
          title: "💡 How to use WhisperBot",
          description:
            "Type: @username or user_id followed by your secret message",
          input_message_content: {
            message_text:
              "🤫 Use WhisperBot to send secret messages!\nType: @" +
              ctx.me.username +
              " <@username or user_id> <message>",
          },
        },
      ],
      { cache_time: 5 }
    );
  }


  const targetLabel = parsed.targetId
    ? `User ${parsed.targetId}`
    : `@${parsed.targetUsername}`;


  const whisperId = `w_${Date.now()}_${++whisperCounter}`;


  whispers.set(whisperId, {
    senderId: ctx.inlineQuery.from.id,
    senderName:
      ctx.inlineQuery.from.first_name +
      (ctx.inlineQuery.from.last_name
        ? " " + ctx.inlineQuery.from.last_name
        : ""),
    targetId: parsed.targetId,
    targetUsername: parsed.targetUsername,
    message: parsed.message,
  });

  const keyboard = new InlineKeyboard()
    .text("👁 Open", `open_${whisperId}`)
    .text("🗑 Delete", `del_${whisperId}`);

  return ctx.answerInlineQuery(
    [
      {
        type: "article",
        id: whisperId,
        title: `🤫 Whisper to ${targetLabel}`,
        description: "Tap to send this secret whisper",
        input_message_content: {
          message_text: `🤫 *A whisper for ${targetLabel}*\n\nOnly ${targetLabel} can open this message\\.`,
          parse_mode: "MarkdownV2",
        },
        reply_markup: keyboard,
      },
    ],
    { cache_time: 0 }
  );
});


bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  const userId = ctx.callbackQuery.from.id;
  const username = ctx.callbackQuery.from.username || "";


  if (data.startsWith("open_")) {
    const whisperId = data.slice(5);
    const whisper = whispers.get(whisperId);

    if (!whisper) {
      return ctx.answerCallbackQuery({
        text: "⚠️ This whisper has expired or was deleted.",
        show_alert: true,
      });
    }


    if (!isTarget(userId, username, whisper)) {
      return ctx.answerCallbackQuery({
        text: "🚫 You are not allowed to open this whisper!",
        show_alert: true,
      });
    }


    return ctx.answerCallbackQuery({
      text: `💬 From ${whisper.senderName}:\n\n${whisper.message}`,
      show_alert: true,
    });
  }


  if (data.startsWith("del_")) {
    const whisperId = data.slice(4);
    const whisper = whispers.get(whisperId);

    if (!whisper) {
      return ctx.answerCallbackQuery({
        text: "⚠️ This whisper has already been deleted.",
        show_alert: true,
      });
    }


    if (!isAuthorised(userId, whisper)) {
      return ctx.answerCallbackQuery({
        text: "🚫 You are not allowed to delete this whisper!",
        show_alert: true,
      });
    }


    whispers.delete(whisperId);


    try {
      await ctx.editMessageText("🗑 _This whisper has been deleted\\._", {
        parse_mode: "MarkdownV2",
      });
    } catch {

    }

    return ctx.answerCallbackQuery({
      text: "✅ Whisper deleted.",
      show_alert: false,
    });
  }
});


bot.catch((err) => {
  console.error("Bot error:", err);
});


bot.start({
  onStart: (botInfo) => {
    console.log(`✅ WhisperBot @${botInfo.username} is running!`);
    if (ADMIN_USERS.length) {
      console.log(`👑 Admin users: ${ADMIN_USERS.join(", ")}`);
    }
  },
});
