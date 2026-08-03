/**
 * Auto-screening quality checks for submissions
 * Runs before human review to filter obvious junk
 */

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
  }

  const score = Math.max(0, 100 - deductions)
  const passed = score >= 40 && deductions < 50

  return { passed, score, notes }
}
