// Web Audio API synthesized notification sound utility
let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null

  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }

  return audioCtx
}

// Persistent user interaction unlocker to ensure sounds play on any live alert
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext()
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
    } catch (_) {}
  }

  window.addEventListener('click', unlockAudio, { passive: true })
  window.addEventListener('keydown', unlockAudio, { passive: true })
  window.addEventListener('touchstart', unlockAudio, { passive: true })
  window.addEventListener('pointerdown', unlockAudio, { passive: true })
}

/**
 * Play modern two-tone message / notification chime (Clear & Audible)
 */
export function playMessageSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playMessageSoundTone(ctx)).catch(() => {})
      return
    }

    playMessageSoundTone(ctx)
  } catch (err) {
    console.debug('Audio play skipped:', err)
  }
}

function playMessageSoundTone(ctx) {
  const now = ctx.currentTime

  // Tone 1: 880Hz (A5)
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(880, now)
  gain1.gain.setValueAtTime(0.45, now)
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
  osc1.connect(gain1)
  gain1.connect(ctx.destination)
  osc1.start(now)
  osc1.stop(now + 0.35)

  // Tone 2: 1318.51Hz (E6 - sparkling bell chime)
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(1318.51, now + 0.09)
  gain2.gain.setValueAtTime(0.5, now + 0.09)
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.start(now + 0.09)
  osc2.stop(now + 0.65)
}

/**
 * Play distinct high-clarity Security Alert Chime for Login, OTP, & Fraud events
 */
export function playSecurityAlertSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playSecurityAlertTone(ctx)).catch(() => {})
      return
    }

    playSecurityAlertTone(ctx)
  } catch (err) {
    console.debug('Security audio play skipped:', err)
  }
}

function playSecurityAlertTone(ctx) {
  const now = ctx.currentTime

  // Tri-tone urgent security chime (F#5 -> A#5 -> C#6)
  const tones = [
    { freq: 739.99, delay: 0.00, duration: 0.22, gain: 0.55 },
    { freq: 932.33, delay: 0.12, duration: 0.22, gain: 0.60 },
    { freq: 1108.73, delay: 0.24, duration: 0.45, gain: 0.65 },
  ]

  tones.forEach(({ freq, delay, duration, gain }) => {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const start = now + delay

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, start)
    gainNode.gain.setValueAtTime(gain, start)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + duration)
  })
}

/**
 * Play pleasant success chord chime
 */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playSuccessTone(ctx)).catch(() => {})
      return
    }

    playSuccessTone(ctx)
  } catch (err) {
    console.debug('Audio play skipped:', err)
  }
}

function playSuccessTone(ctx) {
  const now = ctx.currentTime
  const notes = [587.33, 739.99, 880.0, 1174.66] // D5, F#5, A5, D6 arpeggio

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const start = now + idx * 0.06
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, start)
    gain.gain.setValueAtTime(0.4, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.45)
  })
}

/**
 * Play warning alert sound
 */
export function playAlertSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playAlertTone(ctx)).catch(() => {})
      return
    }

    playAlertTone(ctx)
  } catch (err) {
    console.debug('Audio play skipped:', err)
  }
}

function playAlertTone(ctx) {
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(700, now)
  osc.frequency.exponentialRampToValueAtTime(460, now + 0.35)
  gain.gain.setValueAtTime(0.5, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.35)
}
