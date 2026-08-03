/**
 * Auto-screening quality checks for submissions
 * Runs before human review to filter obvious junk
 */

import { prisma } from "@/lib/auth"

const KENYA_BOUNDS = {
  minLat: -4.67, maxLat: 4.62,
  minLng: 33.91, maxLng: 41.90,
}

export interface ScreenResult {
  passed: boolean
  score: number // 0-100 overall screen score
  notes: string[]
}

/**
 * Check if an agent is submitting suspiciously fast (spam detection).
 * Returns true if ≥ 15 submissions in the last hour.
 */
export async function checkAgentVelocity(agentId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentCount = await prisma.dataSubmission.count({
    where: {
      agentId,
      createdAt: { gte: oneHourAgo },
    },
  })
  return recentCount >= 15
}

/**
 * Screen a DataSubmission for basic quality signals
 */
export function screenDataSubmission(params: {
  latitude: number
  longitude: number
  photoUrl: string
  contactInfo?: string | null
  customFeatures?: any
}): ScreenResult {
  const notes: string[] = []
  let deductions = 0

  // 1. GPS bounds check (Kenya)
  const { latitude, longitude } = params
  if (
    latitude < KENYA_BOUNDS.minLat || latitude > KENYA_BOUNDS.maxLat ||
    longitude < KENYA_BOUNDS.minLng || longitude > KENYA_BOUNDS.maxLng
  ) {
    notes.push("GPS coordinates outside Kenya bounds")
    deductions += 50 // Fatal
  }

  // 2. GPS precision check (must have at least 4 decimal places = ~11m accuracy)
  const latStr = latitude.toString()
  const lngStr = longitude.toString()
  const latDecimals = (latStr.split(".")[1] || "").length
  const lngDecimals = (lngStr.split(".")[1] || "").length
  if (latDecimals < 4 || lngDecimals < 4) {
    notes.push("Low GPS precision (< 4 decimal places)")
    deductions += 20
  }

  // 3. Photo URL validation
  if (!params.photoUrl || !params.photoUrl.startsWith("https://")) {
    notes.push("Invalid photo URL")
    deductions += 40
  }

  // 4. Caption quality check
  const caption = params.customFeatures?.caption
  if (caption) {
    if (caption.length < 20) {
      notes.push("Caption too short (< 20 characters)")
      deductions += 15
    }
    if (caption.length > 500) {
      notes.push("Caption suspiciously long (> 500 characters)")
      deductions += 5
    }
    // Check for generic/placeholder captions
    const genericPhrases = ["test", "hello", "123", "aaa", "photo", "image"]
    const lowerCaption = caption.toLowerCase()
    if (genericPhrases.some(p => lowerCaption === p || lowerCaption.startsWith(p + " "))) {
      notes.push("Caption appears to be placeholder text")
      deductions += 30
    }
  } else {
    notes.push("No caption provided")
    deductions += 10
  }

  // 5. Contact info check
  if (!params.contactInfo || params.contactInfo.trim().length < 5) {
    notes.push("Missing or invalid contact info")
    deductions += 10
  }

  const score = Math.max(0, 100 - deductions)
  const passed = score >= 40 && !notes.some(n => n.includes("outside Kenya") || n.includes("Invalid photo"))

  return { passed, score, notes }
}

/**
 * Screen an AudioSubmission
 */
export function screenAudioSubmission(params: {
  audioUrl: string
  durationSecs?: number | null
  scriptPrompt?: string | null
  dialect?: string | null
}): ScreenResult {
  const notes: string[] = []
  let deductions = 0

  if (!params.audioUrl || !params.audioUrl.startsWith("https://")) {
    notes.push("Invalid audio URL")
    deductions += 50
  }

  if (params.durationSecs !== undefined && params.durationSecs !== null) {
    if (params.durationSecs < 1) {
      notes.push("Audio too short (< 1 second)")
      deductions += 50
    } else if (params.durationSecs < 2) {
      notes.push("Audio very short (< 2 seconds)")
      deductions += 20
    } else if (params.durationSecs > 300) {
      notes.push("Audio unusually long (> 5 minutes)")
      deductions += 15
    }
  } else {
    notes.push("Duration not provided — cannot verify length")
    deductions += 5
  }

  if (!params.scriptPrompt || params.scriptPrompt.trim().length < 3) {
    notes.push("No script prompt attached")
    deductions += 10
  }

  const score = Math.max(0, 100 - deductions)
  const passed = score >= 40 && deductions < 50

  return { passed, score, notes }
}

/**
 * Screen a TextSubmission
 */
export function screenTextSubmission(params: {
  submittedText: string
  sourceText?: string | null
  textType?: string
}): ScreenResult {
  const notes: string[] = []
  let deductions = 0

  const text = params.submittedText?.trim() || ""

  if (!text) {
    notes.push("Empty submission text")
    deductions += 100
  } else {
    if (text.length < 10) {
      notes.push("Text too short (< 10 characters)")
      deductions += 40
    }
    // Check for placeholder patterns
    const genericPatterns = ["test", "hello world", "lorem ipsum", "aaa", "123"]
    if (genericPatterns.some(p => text.toLowerCase().startsWith(p))) {
      notes.push("Text appears to be placeholder")
      deductions += 50
    }
    // Check for excessive repetition (e.g. "aaaaaaaaa")
    const uniqueChars = new Set(text.toLowerCase().replace(/\s/g, "")).size
    if (text.length > 10 && uniqueChars < 3) {
      notes.push("Text has extremely low character diversity (possible spam)")
      deductions += 60
    }
    // For translations, source text should differ from submitted text
    if (params.textType === "TRANSLATION" && params.sourceText) {
      if (params.sourceText.trim().toLowerCase() === text.toLowerCase()) {
        notes.push("Translation identical to source text")
        deductions += 50
      }
    }
  }

  const score = Math.max(0, 100 - deductions)
  const passed = score >= 40

  return { passed, score, notes }
}

/**
 * Screen a VideoSubmission
 */
export function screenVideoSubmission(params: {
  videoUrl: string
  durationSecs?: number | null
  activityLabel?: string | null
}): ScreenResult {
  const notes: string[] = []
  let deductions = 0

  if (!params.videoUrl || !params.videoUrl.startsWith("https://")) {
    notes.push("Invalid video URL")
    deductions += 50
  }

  if (params.durationSecs !== undefined && params.durationSecs !== null) {
    if (params.durationSecs < 2) {
      notes.push("Video too short (< 2 seconds)")
      deductions += 50
    } else if (params.durationSecs > 600) {
      notes.push("Video unusually long (> 10 minutes)")
      deductions += 20
    }
  } else {
    notes.push("Duration not provided")
    deductions += 10
  }

  if (!params.activityLabel || params.activityLabel.trim().length < 2) {
    notes.push("No activity label provided")
    deductions += 15
  }

  const score = Math.max(0, 100 - deductions)
  const passed = score >= 40 && deductions < 50

  return { passed, score, notes }
}
