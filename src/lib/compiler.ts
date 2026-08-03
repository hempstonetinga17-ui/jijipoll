/**
 * Dataset Compiler — core logic for Phase 11 + 12
 *
 * Packages VERIFIED submissions into structured, versioned datasets
 * for the marketplace. Writes to Cloudflare R2 (jijipoll-datasets bucket).
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { prisma } from "@/lib/auth"
import crypto from "crypto"

// R2 client for the datasets bucket
const r2Datasets = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || "",
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
})

const DATASETS_BUCKET = process.env.CLOUDFLARE_R2_DATASETS_BUCKET || process.env.CLOUDFLARE_R2_BUCKET_NAME || ""

export interface CompileOptions {
  taskIds?: string[]
  languageIds?: string[]
  dateFrom?: Date
  dateTo?: Date
  dataType: "AUDIO" | "PHOTO" | "TEXT" | "VIDEO" | "MIXED"
  format: "RAW" | "COCO" | "COMMON_VOICE" | "HUGGINGFACE" | "ALPACA"
  licenseType: "RESEARCH" | "COMMERCIAL" | "EXCLUSIVE"
  priceUsd: number
  name: string
  description?: string
  compiledBy: string
}

export interface DatasetStats {
  totalItems: number
  totalDurationSecs?: number
  averageGrade: number
  languages: Record<string, number>
  categories: Record<string, number>
  qaPassRate: number
  dateRange: { from: string; to: string }
}

/** Fetch all VERIFIED submissions matching the compile filters */
export async function queryVerifiedSubmissions(opts: CompileOptions) {
  const dateFilter = {
    ...(opts.dateFrom ? { gte: opts.dateFrom } : {}),
    ...(opts.dateTo ? { lte: opts.dateTo } : {}),
  }

  const results: any[] = []

  if (opts.dataType === "PHOTO" || opts.dataType === "MIXED") {
    const photoSubs = await prisma.dataSubmission.findMany({
      where: {
        status: "VERIFIED",
        ...(opts.taskIds?.length ? {} : {}), // DataSubmission has no taskId, filter by date
        createdAt: Object.keys(dateFilter).length ? dateFilter : undefined,
      },
      include: { agent: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    })
    results.push(...photoSubs.map(s => ({ ...s, _type: "PHOTO" })))
  }

  if (opts.dataType === "AUDIO" || opts.dataType === "MIXED") {
    const audioSubs = await prisma.audioSubmission.findMany({
      where: {
        status: "VERIFIED",
        ...(opts.taskIds?.length ? { taskId: { in: opts.taskIds } } : {}),
        ...(opts.languageIds?.length ? { languageId: { in: opts.languageIds } } : {}),
        createdAt: Object.keys(dateFilter).length ? dateFilter : undefined,
      },
      include: {
        agent: { select: { id: true, name: true } },
        language: true,
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "asc" },
    })
    results.push(...audioSubs.map(s => ({ ...s, _type: "AUDIO" })))
  }

  if (opts.dataType === "TEXT" || opts.dataType === "MIXED") {
    const textSubs = await prisma.textSubmission.findMany({
      where: {
        status: "VERIFIED",
        ...(opts.taskIds?.length ? { taskId: { in: opts.taskIds } } : {}),
        ...(opts.languageIds?.length ? { languageId: { in: opts.languageIds } } : {}),
        createdAt: Object.keys(dateFilter).length ? dateFilter : undefined,
      },
      include: {
        agent: { select: { id: true, name: true } },
        language: true,
      },
      orderBy: { createdAt: "asc" },
    })
    results.push(...textSubs.map(s => ({ ...s, _type: "TEXT" })))
  }

  return results
}

/** Compute statistics from a list of submissions */
export function computeStats(submissions: any[]): DatasetStats {
  const grades = submissions.filter(s => s.grade != null).map(s => s.grade as number)
  const averageGrade = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0
  const totalDuration = submissions
    .filter(s => s._type === "AUDIO" && s.durationSecs)
    .reduce((acc, s) => acc + (s.durationSecs || 0), 0)

  // Language breakdown
  const languages: Record<string, number> = {}
  for (const s of submissions) {
    const lang = s.language?.code || s.language?.name || "unknown"
    languages[lang] = (languages[lang] || 0) + 1
  }

  // Category breakdown (photo)
  const categories: Record<string, number> = {}
  for (const s of submissions.filter(s => s._type === "PHOTO")) {
    const cat = s.category || "OTHER"
    categories[cat] = (categories[cat] || 0) + 1
  }

  const dates = submissions.map(s => new Date(s.createdAt).getTime()).sort()

  return {
    totalItems: submissions.length,
    totalDurationSecs: totalDuration || undefined,
    averageGrade: Math.round(averageGrade * 10) / 10,
    languages,
    categories,
    qaPassRate: 100, // All are VERIFIED
    dateRange: {
      from: dates.length > 0 ? new Date(dates[0]).toISOString().split("T")[0] : "",
      to: dates.length > 0 ? new Date(dates[dates.length - 1]).toISOString().split("T")[0] : "",
    },
  }
}

/** Split submissions into train/val/test sets */
export function generateTrainValTestSplit(
  submissions: any[],
  ratios: [number, number, number] = [0.8, 0.1, 0.1]
): { train: any[]; val: any[]; test: any[] } {
  const shuffled = [...submissions].sort(() => Math.random() - 0.5)
  const total = shuffled.length
  const trainEnd = Math.floor(total * ratios[0])
  const valEnd = trainEnd + Math.floor(total * ratios[1])
  return {
    train: shuffled.slice(0, trainEnd),
    val: shuffled.slice(trainEnd, valEnd),
    test: shuffled.slice(valEnd),
  }
}

/** Generate a sample (stratified 5%, max 500) */
export function generateSample(submissions: any[], totalCount: number): any[] {
  const sampleSize = Math.min(Math.ceil(totalCount * 0.05), 500)
  const shuffled = [...submissions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, sampleSize)
}

/** Build a JSONL string from an array of objects */
function toJsonl(items: any[]): string {
  return items.map(item => JSON.stringify(item)).join("\n")
}

/** Build COCO-format annotations JSON for photo submissions */
function buildCocoAnnotations(submissions: any[]): string {
  const images = submissions.map((s, i) => ({
    id: i + 1,
    file_name: `${s.id}.jpg`,
    coco_url: s.photoUrl,
    latitude: s.latitude,
    longitude: s.longitude,
    date_captured: s.createdAt,
  }))
  const annotations = submissions.map((s, i) => ({
    id: i + 1,
    image_id: i + 1,
    category_id: 1,
    category: s.category,
    contact_info: s.contactInfo,
    grade: s.grade,
  }))
  return JSON.stringify({ images, annotations, info: { version: "1.0", contributor: "JijiPoll" } }, null, 2)
}

/** Build Common Voice TSV for audio submissions */
function buildCommonVoiceTsv(submissions: any[]): string {
  const header = "client_id\tpath\tsentence\tup_votes\tdown_votes\tage\tgender\taccent\tduration"
  const rows = submissions.map(s =>
    [
      s.agentId,
      s.audioUrl,
      s.scriptPrompt || "",
      "1",
      "0",
      s.speakerAge || "",
      s.speakerGender?.toLowerCase() || "",
      s.dialect || "",
      s.durationSecs || "",
    ].join("\t")
  )
  return [header, ...rows].join("\n")
}

/** Build HuggingFace-format JSONL for text submissions */
function buildHuggingFaceJsonl(submissions: any[]): string {
  return toJsonl(
    submissions.map(s => ({
      id: s.id,
      text: s.submittedText,
      source_text: s.sourceText || null,
      language: s.language?.code || null,
      type: s.textType,
      domain: s.domain || null,
      grade: s.grade,
    }))
  )
}

/** Generate dataset card markdown */
export function generateDatasetCard(opts: {
  name: string
  description?: string
  dataType: string
  format: string
  stats: DatasetStats
  licenseType: string
  version: string
  compiledAt: string
}): string {
  const durationStr =
    opts.stats.totalDurationSecs !== undefined
      ? `${Math.round(opts.stats.totalDurationSecs / 3600 * 10) / 10} hours`
      : "N/A"
  const langBreakdown = Object.entries(opts.stats.languages)
    .map(([l, n]) => `- **${l}**: ${n} items`)
    .join("\n")
  const catBreakdown = Object.entries(opts.stats.categories)
    .map(([c, n]) => `- **${c}**: ${n} items`)
    .join("\n")

  return `---
dataset_name: ${opts.name}
version: ${opts.version}
data_type: ${opts.dataType}
format: ${opts.format}
license: ${opts.licenseType}
compiled_at: ${opts.compiledAt}
---

# ${opts.name}

${opts.description || "A curated dataset collected via the JijiPoll field data platform in Kenya."}

## Dataset Summary

| Property | Value |
|---|---|
| **Data Type** | ${opts.dataType} |
| **Format** | ${opts.format} |
| **Total Items** | ${opts.stats.totalItems.toLocaleString()} |
| **Total Audio Duration** | ${durationStr} |
| **Average Quality Grade** | ${opts.stats.averageGrade}/100 |
| **QA Pass Rate** | ${opts.stats.qaPassRate}% |
| **Collection Period** | ${opts.stats.dateRange.from} → ${opts.stats.dateRange.to} |
| **License** | ${opts.licenseType} |

## Language Breakdown

${langBreakdown || "- Not language-specific"}

${catBreakdown ? `## Category Breakdown\n\n${catBreakdown}` : ""}

## Collection Methodology

Data was collected by trained field agents across Kenya using the JijiPoll mobile data collection platform. All submissions went through:

1. **Automated Pre-Screening** — GPS bounds validation, file integrity checks, audio duration checks
2. **Human Review** — First-pass grading by certified reviewers (calibrated via golden set system)
3. **QA Certification** — Final verification by a QA supervisor with grade ≥ threshold
4. **Admin Spot-Check** — Random audit of QA decisions for quality assurance

## Known Limitations

- Geographic coverage is primarily Kenya (lat/lng bounds: -4.67°N to 4.62°N, 33.91°E to 41.90°E)
- Audio recordings may include ambient noise typical of East African urban/peri-urban environments
- Demographic balance not guaranteed; see language/category breakdowns above

## Citation

\`\`\`
@dataset{jijipoll_${opts.name.toLowerCase().replace(/\s+/g, "_")}_${opts.version.replace(".", "_")},
  title = {${opts.name}},
  author = {JijiPoll},
  year = {${new Date().getFullYear()}},
  version = {${opts.version}},
  url = {https://jijipoll.com/datasets}
}
\`\`\`

## License

${opts.licenseType === "RESEARCH" ? "Research License — Non-commercial use only. Attribution required." : ""}
${opts.licenseType === "COMMERCIAL" ? "Commercial License — Full commercial use permitted." : ""}
${opts.licenseType === "EXCLUSIVE" ? "Exclusive License — Dataset locked to one buyer. Commercial use permitted." : ""}

---
*Compiled by JijiPoll Platform on ${opts.compiledAt}*
`
}

/** Build metadata.json */
function buildMetadataJson(opts: CompileOptions, stats: DatasetStats, datasetId: string, version: string): string {
  return JSON.stringify(
    {
      id: datasetId,
      name: opts.name,
      version,
      dataType: opts.dataType,
      format: opts.format,
      licenseType: opts.licenseType,
      priceUsd: opts.priceUsd,
      stats,
      compiledAt: new Date().toISOString(),
      compiledBy: opts.compiledBy,
      jijipollVersion: "2.0",
    },
    null,
    2
  )
}

/** Upload a text file to R2 */
async function uploadToR2(key: string, body: string, contentType = "application/json"): Promise<void> {
  await r2Datasets.send(
    new PutObjectCommand({
      Bucket: DATASETS_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
}

/** Generate a presigned download URL for a dataset (72-hour expiry) */
export async function getDatasetDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: DATASETS_BUCKET, Key: key })
  return getSignedUrl(r2Datasets, command, { expiresIn: 72 * 3600 })
}

/** Generate a presigned download URL for a sample (15-minute expiry, free) */
export async function getSampleDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: DATASETS_BUCKET, Key: key })
  return getSignedUrl(r2Datasets, command, { expiresIn: 900 })
}

/**
 * Main compile function — called by the API route.
 * Writes all dataset files to R2 and updates the Dataset record.
 */
export async function compileDataset(datasetId: string, opts: CompileOptions): Promise<void> {
  const version = "1.0"
  const prefix = `${datasetId}/v${version}`

  // 1. Fetch all VERIFIED submissions
  const allSubmissions = await queryVerifiedSubmissions(opts)

  if (allSubmissions.length === 0) {
    await prisma.dataset.update({
      where: { id: datasetId },
      data: { status: "ARCHIVED", datasetCard: "# No data\n\nNo verified submissions matched the compile criteria." },
    })
    return
  }

  // 2. Compute stats
  const stats = computeStats(allSubmissions)

  // 3. Split data
  const { train, val, test } = generateTrainValTestSplit(allSubmissions)

  // 4. Build format-specific files
  let trainContent: string
  let valContent: string
  let testContent: string
  let annotationsContent: string | undefined

  if (opts.format === "COCO" || opts.dataType === "PHOTO") {
    trainContent = buildCocoAnnotations(train)
    valContent = buildCocoAnnotations(val)
    testContent = buildCocoAnnotations(test)
    annotationsContent = buildCocoAnnotations(allSubmissions)
  } else if (opts.format === "COMMON_VOICE" || opts.dataType === "AUDIO") {
    trainContent = buildCommonVoiceTsv(train)
    valContent = buildCommonVoiceTsv(val)
    testContent = buildCommonVoiceTsv(test)
  } else {
    // HuggingFace JSONL (default for text/eval)
    trainContent = buildHuggingFaceJsonl(train)
    valContent = buildHuggingFaceJsonl(val)
    testContent = buildHuggingFaceJsonl(test)
  }

  // 5. Generate dataset card and metadata
  const compiledAt = new Date().toISOString().split("T")[0]
  const qualityTier = stats.averageGrade >= 85 ? "A" : stats.averageGrade >= 70 ? "B" : "C"
  const datasetCard = generateDatasetCard({
    name: opts.name,
    description: opts.description,
    dataType: opts.dataType,
    format: opts.format,
    stats,
    licenseType: opts.licenseType,
    version,
    compiledAt,
  })
  const metadataJson = buildMetadataJson(opts, stats, datasetId, version)

  // 6. Generate sample (5%, max 500)
  const sample = generateSample(allSubmissions, allSubmissions.length)
  let sampleContent: string
  if (opts.format === "COCO" || opts.dataType === "PHOTO") {
    sampleContent = buildCocoAnnotations(sample)
  } else if (opts.format === "COMMON_VOICE" || opts.dataType === "AUDIO") {
    sampleContent = buildCommonVoiceTsv(sample)
  } else {
    sampleContent = buildHuggingFaceJsonl(sample)
  }

  // 7. Compute checksum of all data
  const allDataStr = trainContent + valContent + testContent
  const checksum = crypto.createHash("sha256").update(allDataStr).digest("hex")

  // 8. Upload to R2
  const fileExt = opts.format === "COMMON_VOICE" || opts.dataType === "AUDIO" ? "tsv" : opts.format === "COCO" || opts.dataType === "PHOTO" ? "json" : "jsonl"
  const contentType = fileExt === "tsv" ? "text/tab-separated-values" : "application/json"

  await Promise.all([
    uploadToR2(`${prefix}/dataset_card.md`, datasetCard, "text/markdown"),
    uploadToR2(`${prefix}/metadata.json`, metadataJson),
    uploadToR2(`${prefix}/train/data.${fileExt}`, trainContent, contentType),
    uploadToR2(`${prefix}/val/data.${fileExt}`, valContent, contentType),
    uploadToR2(`${prefix}/test/data.${fileExt}`, testContent, contentType),
    uploadToR2(`${prefix}/sample/data.${fileExt}`, sampleContent, contentType),
    ...(annotationsContent ? [uploadToR2(`${prefix}/annotations.json`, annotationsContent)] : []),
  ])

  const languages = Object.keys(stats.languages)

  // 9. Update Dataset record
  await prisma.dataset.update({
    where: { id: datasetId },
    data: {
      status: "AVAILABLE",
      itemCount: allSubmissions.length,
      totalDurationSecs: stats.totalDurationSecs,
      averageGrade: stats.averageGrade,
      qualityTier,
      languages,
      storageUrl: `${prefix}/`,
      sampleUrl: `${prefix}/sample/data.${fileExt}`,
      datasetCard,
      version,
      compiledAt: new Date(),
    },
  })
}
