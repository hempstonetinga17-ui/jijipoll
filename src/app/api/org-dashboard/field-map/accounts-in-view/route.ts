import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── In-memory cache so we only parse the JSON once per server lifecycle ──────
let accountsCache: any[] | null = null;

function getAccounts(): any[] {
  if (accountsCache) return accountsCache;
  const dataPath = path.join(process.cwd(), "public", "data", "accounts.json");
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, "utf-8");
  accountsCache = JSON.parse(raw);
  console.log(`[accounts-in-view] Loaded ${accountsCache!.length} accounts into cache.`);
  return accountsCache!;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minLat = parseFloat(searchParams.get("minLat") || "-90");
    const maxLat = parseFloat(searchParams.get("maxLat") || "90");
    const minLng = parseFloat(searchParams.get("minLng") || "-180");
    const maxLng = parseFloat(searchParams.get("maxLng") || "180");
    const search = (searchParams.get("search") || "").toLowerCase();
    const salesStage = searchParams.get("salesStage");
    const priority = searchParams.get("priority");

    const allAccounts = getAccounts();

    // ── Filter by viewport bounds ─────────────────────────────────────────────
    let filtered = allAccounts.filter((acc: any) => {
      return (
        acc.latitude >= minLat &&
        acc.latitude <= maxLat &&
        acc.longitude >= minLng &&
        acc.longitude <= maxLng
      );
    });

    // ── Optional text search ──────────────────────────────────────────────────
    if (search) {
      filtered = filtered.filter((acc: any) =>
        acc.name.toLowerCase().includes(search)
      );
    }

    // ── Optional filters ─────────────────────────────────────────────────────
    if (salesStage) {
      const stages = salesStage.split(",");
      filtered = filtered.filter((acc: any) => stages.includes(acc.salesStage));
    }
    if (priority) {
      const prios = priority.split(",");
      filtered = filtered.filter((acc: any) => prios.includes(acc.priority));
    }

    const totalInView = filtered.length;

    // ── Cap to 2000 for browser performance ───────────────────────────────────
    const capped = filtered.slice(0, 2000);

    // ── Shape to FieldMapContext FieldAccount format ───────────────────────────
    const accounts = capped.map((acc: any) => ({
      id: acc.id,
      name: acc.name,
      company: acc.name,
      phone: acc.customFields?.phone || "",
      email: acc.customFields?.email || "",
      salesYTD: acc.salesYTD || 0,
      nextStep: "follow up",
      nextStepDate: new Date().toISOString(),
      daysSinceVisit: acc.daysSinceVisit || 0,
      salesStage: acc.salesStage || "NEW",
      priority: acc.priority || "Medium",
      lat: acc.latitude,
      lng: acc.longitude,
      address: "",
      businessType: acc.customFields?.businessType || "Other",
      notes: [],
      photos: [],
      createdAt: acc.createdAt || new Date().toISOString(),
    }));

    return NextResponse.json({
      accounts,
      clusters: [],
      totalInView,
      totalAll: allAccounts.length,
    });
  } catch (error) {
    console.error("[accounts-in-view] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
