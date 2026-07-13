import { NextResponse } from "next/server";
import { getIndoflazzServices } from "@/lib/indoflazz";

export async function GET() {
  try {
    const data = await getIndoflazzServices();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { status: false, msg: error.message || "Failed to fetch services" },
      { status: 500 }
    );
  }
}
