import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    zerodha: Boolean(process.env.ZERODHA_API_KEY && process.env.ZERODHA_API_SECRET),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    database: Boolean(process.env.DATABASE_URL),
    mode: process.env.TRADING_APP_MODE || "mock",
  });
}
