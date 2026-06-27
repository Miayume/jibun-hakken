import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const candidates = [
    path.join(process.cwd(), "app/generated/prisma"),
    "/var/task/app/generated/prisma",
    "/var/task/app/generated",
  ];
  const result: Record<string, string[] | string> = {};
  for (const dir of candidates) {
    try {
      result[dir] = fs.readdirSync(dir);
    } catch (e) {
      result[dir] = String(e);
    }
  }
  result["cwd"] = process.cwd();
  return NextResponse.json(result);
}
