import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { consentLevel, page, userAgent } = body;

    // Get real IP from headers (works behind Vercel / Cloudflare proxies)
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") ?? "unknown";

    // Detect device type from user agent
    let device = "desktop";
    if (/Mobi|Android|iPhone|iPad/i.test(userAgent ?? "")) {
      device = /iPad|Tablet/i.test(userAgent ?? "") ? "tablet" : "mobile";
    }

    // Geo-lookup via ipapi (free, no key needed, 1000 req/day limit)
    let country: string | null = null;
    let city: string | null = null;
    let region: string | null = null;
    let latitude: number | null = null;
    let longitude: number | null = null;

    if (ip && ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: AbortSignal.timeout(3000),
        });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          country = geo.country_name ?? null;
          city = geo.city ?? null;
          region = geo.region ?? null;
          latitude = geo.latitude ?? null;
          longitude = geo.longitude ?? null;
        }
      } catch {
        // Geo lookup failed silently – still log the visit
      }
    }

    await prisma.visitorLog.create({
      data: {
        ip,
        country,
        city,
        region,
        latitude,
        longitude,
        userAgent: userAgent?.slice(0, 512) ?? null,
        device,
        page: page?.slice(0, 256) ?? null,
        consentLevel: consentLevel ?? "essential",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track-visit]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
