import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MINIAPP_URL = process.env.MINIAPP_URL;

if (\!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN yo\'q');
if (\!MINIAPP_URL) throw new Error('MINIAPP_URL yo\'q');

const bot = new Bot(BOT_TOKEN);

bot.command('start', async (ctx) => {
  const kb = new InlineKeyboard().webApp('Ochish — MedSmart-Pro', MINIAPP_URL\!);
  await ctx.reply(
    "Assalomu alaykum\!\n\nMedSmart-Pro — tibbiy yordamchingiz. Pastdagi tugma orqali ochib, AI konsultatsiya, uy-vizit, radiologiya xizmatlaridan foydalaning.",
    { reply_markup: kb },
  );
});

bot.command('help', (ctx) =>
  ctx.reply(
    [
      '/start — asosiy menyu',
      '/help — bu yordam',
      '/about — loyiha haqida',
    ].join('\n'),
  ),
);

bot.command('about', (ctx) =>
  ctx.reply(
    'MedSmart-Pro — AI radiologiya, konsultatsiya, uy-vizit va kasalliklar bazasi. O\'zbekiston uchun.',
  ),
);

bot.catch((err) => {
  console.error('Bot error:', err);
});

console.log('MedSmart-Pro bot ishga tushdi');
bot.start();
