import { NextResponse } from "next/server";
import { listModels } from "@/lib/llm";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function GET() {
  const models = await listModels();

  return NextResponse.json(
    {
      models: models.map((model) => ({ id: model.id, label: model.label })),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
