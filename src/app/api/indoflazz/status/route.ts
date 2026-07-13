import { NextResponse } from "next/server";
import { checkIndoflazzStatus } from "@/lib/indoflazz";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { status: false, msg: "Missing orderId" },
        { status: 400 }
      );
    }

    const data = await checkIndoflazzStatus(orderId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { status: false, msg: error.message || "Failed to check status" },
      { status: 500 }
    );
  }
}
