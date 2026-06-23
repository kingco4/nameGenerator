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
    // RDAP lookup: 200 = domain registered (taken), 404 = available
    const response = await fetch(`https://rdap.org/domain/${slug}.com`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (response.status === 404) {
      return NextResponse.json({ available: true, domain: `${slug}.com` });
    }

    if (response.ok) {
      return NextResponse.json({ available: false, domain: `${slug}.com` });
    }

    return NextResponse.json({ error: "Registry unavailable." }, { status: 502 });
  } catch {
    return NextResponse.json(
      { error: "Could not check name availability." },
      { status: 500 }
    );
  }
}
