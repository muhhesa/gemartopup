import { NextResponse } from "next/server";
import { createIndoflazzOrder } from "@/lib/indoflazz";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceId, target, kontak, idtrx } = body;

    if (!serviceId || !target || !kontak || !idtrx) {
      return NextResponse.json(
        { status: false, msg: "Missing required parameters" },
        { status: 400 }
      );
    }

    const data = await createIndoflazzOrder(serviceId, target, kontak, idtrx);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { status: false, msg: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
