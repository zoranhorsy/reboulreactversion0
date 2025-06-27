import { NextResponse } from "next/server";
import crypto from "crypto";

const generateSHA1 = (data: string) => {
  const hash = crypto.createHash("sha1");
  hash.update(data);
  return hash.digest("hex");
};

const generateSignature = (timestamp: number, folder: string) => {
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!secret) {
    throw new Error("CLOUDINARY_API_SECRET is not defined");
  }

  const str = `folder=${folder}&timestamp=${timestamp}${secret}`;
  return generateSHA1(str);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { timestamp, folder } = body;

    if (!timestamp || !folder) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const signature = generateSignature(timestamp, folder);

    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Error generating signature:", error);
    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 },
    );
  }
}
