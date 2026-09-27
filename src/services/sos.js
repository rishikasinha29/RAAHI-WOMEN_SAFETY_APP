import { createSosSession } from "./api"

const WHATSAPP_SOS_NUMBER =
  import.meta.env.VITE_WHATSAPP_SOS_NUMBER || ""

function normalizeLocation(location) {
  if (!location) return null

  const latitude = Number(
    location.latitude ?? location.lat
  )

  const longitude = Number(
    location.longitude ?? location.lon
  )

  const accuracy =
    Number(location.accuracy) || null

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null
  }

  return {
    latitude,
    longitude,
    accuracy,
  }
}

function getPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      options
    )
  })
}

export async function getCurrentLocation(
  fallbackLocation = null
) {
  if (!navigator.geolocation) {
    const fallback =
      normalizeLocation(fallbackLocation)

    if (fallback) return fallback

    throw new Error(
      "Geolocation is not supported by this browser."
    )
  }

  let lastError = null

  // 1. Fresh high-accuracy location
  try {
    const position = await getPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    })

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    }
  } catch (error) {
    lastError = error
    console.warn(
      "High accuracy location failed:",
      error
    )
  }

  // 2. Network/browser location fallback
  try {
    const position = await getPosition({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 30000,
    })

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    }
  } catch (error) {
    lastError = error
    console.warn(
      "Fallback location failed:",
      error
    )
  }

  // 3. Use ANZEN live navigation location
  const fallback =
    normalizeLocation(fallbackLocation)

  if (fallback) {
    return fallback
  }

  if (lastError?.code === 1) {
    throw new Error(
      "Location permission was denied. Please allow location access for ANZEN."
    )
  }

  if (lastError?.code === 2) {
    throw new Error(
      "Your device could not determine your location. Please enable Location Services."
    )
  }

  if (lastError?.code === 3) {
    throw new Error(
      "Location request timed out. Please try again."
    )
  }

  throw new Error(
    "Unable to determine your current location."
  )
}

export async function activateSOS(
  fallbackLocation = null
) {
  const location =
    await getCurrentLocation(fallbackLocation)

  let sos = null

  try {
    sos = await createSosSession({
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
    })
  } catch (error) {
    console.error(
      "SOS backend session failed:",
      error
    )
  }

  return {
    ...location,
    sos,
  }
}

export function openWhatsAppSOS(location) {
  const normalized =
    normalizeLocation(location)

  if (!normalized) {
    throw new Error(
      "A valid current location is required."
    )
  }

  const phoneNumber =
    String(WHATSAPP_SOS_NUMBER || "").replace(
      /\D/g,
      ""
    )

  if (!phoneNumber || phoneNumber.length < 10) {
    throw new Error(
      "WhatsApp SOS number is not configured correctly."
    )
  }

  const {
    latitude,
    longitude,
    accuracy,
  } = normalized

  const mapUrl =
    `https://www.google.com/maps?q=${latitude},${longitude}`

  const message =
    `🚨 ANZEN EMERGENCY SOS 🚨\n\n` +
    `I need immediate assistance.\n\n` +
    `My current location:\n${mapUrl}\n\n` +
    `Latitude: ${latitude}\n` +
    `Longitude: ${longitude}\n` +
    (
      accuracy
        ? `Accuracy: approximately ${Math.round(
            accuracy
          )} m\n`
        : ""
    ) +
    `\nPlease contact me immediately.`

  const whatsappUrl =
    `https://wa.me/${phoneNumber}` +
    `?text=${encodeURIComponent(message)}`

  window.location.href = whatsappUrl
}

export function openWhatsAppCall() {
  const phoneNumber =
    String(WHATSAPP_SOS_NUMBER || "").replace(
      /\D/g,
      ""
    )

  if (!phoneNumber || phoneNumber.length < 10) {
    throw new Error(
      "WhatsApp SOS number is not configured correctly."
    )
  }

  const whatsappUrl =
    `https://wa.me/${phoneNumber}`

  window.location.href = whatsappUrl
}

export async function shareLocation(location) {
  const normalized =
    normalizeLocation(location)

  if (!normalized) {
    throw new Error(
      "Location is unavailable."
    )
  }

  const mapUrl =
    `https://www.google.com/maps?q=${normalized.latitude},${normalized.longitude}`

  const message =
    `My current ANZEN location:\n${mapUrl}`

  if (navigator.share) {
    await navigator.share({
      title: "ANZEN Emergency Location",
      text: message,
    })
    return
  }

  if (navigator.clipboard) {
    await navigator.clipboard.writeText(message)
    return
  }

  throw new Error(
    "Location sharing is not supported."
  )
}