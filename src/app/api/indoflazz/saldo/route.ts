import { NextResponse } from "next/server";
import { getIndoflazzSaldo } from "@/lib/indoflazz";

export async function GET() {
  try {
    const data = await getIndoflazzSaldo();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { status: false, msg: error.message || "Failed to fetch saldo" },
      { status: 500 }
    );
  }
}
