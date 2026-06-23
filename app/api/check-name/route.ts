import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(name)}&format=json`,
      { headers: { Accept: "application/json" }, next: { revalidate: 0 } }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Registry unavailable." }, { status: 502 });
    }

    const data = await response.json();
    const companies: { company: { name: string } }[] =
      data.results?.companies ?? [];

    const exactMatches = companies.filter(
      (c) => c.company.name.toLowerCase() === name.toLowerCase()
    );

    return NextResponse.json({
      available: exactMatches.length === 0,
      matchCount: exactMatches.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not check name availability." },
      { status: 500 }
    );
  }
}
