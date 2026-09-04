import { NextRequest, NextResponse } from "next/server";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const slug = toSlug(name);
  if (!slug) {
    return NextResponse.json({ error: "Invalid name." }, { status: 400 });
  }

  try {
    const domain = `${slug}.com`;
    // Direct .com RDAP lookup. rdap.org's redirector returns 403 to Node fetch.
    // Verisign returns 200 for registered domains and 404 for available names.
    const response = await fetch(`https://rdap.verisign.com/com/v1/domain/${domain}`, {
      headers: {
        Accept: "application/rdap+json, application/json",
        "User-Agent": "name-generator/0.1",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      return NextResponse.json({ available: true, domain });
    }

    if (response.ok) {
      return NextResponse.json({ available: false, domain });
    }

    return NextResponse.json({ error: "Registry unavailable." }, { status: 502 });
  } catch {
    return NextResponse.json(
      { error: "Could not check name availability." },
      { status: 500 }
    );
  }
}
