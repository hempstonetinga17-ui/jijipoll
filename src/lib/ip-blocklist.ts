const blocklist = (process.env.IP_BLOCKLIST || "")
  .split(",")
  .map(ip => ip.trim())
  .filter(Boolean);

export function isBlocked(ip: string): boolean {
  if (!ip || ip === "unknown") return false;
  return blocklist.includes(ip);
}
