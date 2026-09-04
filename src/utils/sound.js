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

// Automatically unlock audio on first user gesture
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext()
      if (ctx && ctx.state === 'suspended') {
        ctx.resume()
      }
    } catch (_) {}
    window.removeEventListener('click', unlockAudio)
    window.removeEventListener('keydown', unlockAudio)
    window.removeEventListener('touchstart', unlockAudio)
  }

  window.addEventListener('click', unlockAudio, { passive: true })
  window.addEventListener('keydown', unlockAudio, { passive: true })
  window.addEventListener('touchstart', unlockAudio, { passive: true })
}

/**
 * Play modern two-tone message / notification chime (Clear & Audible)
 */
export function playMessageSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playMessageSoundTone(ctx))
      return
    }

    playMessageSoundTone(ctx)
  } catch (err) {
    console.debug('Audio play skipped:', err)
  }
}

function playMessageSoundTone(ctx) {
  const now = ctx.currentTime

  // First Tone: 880Hz (A5)
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(880, now)
  gain1.gain.setValueAtTime(0.35, now)
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
  osc1.connect(gain1)
  gain1.connect(ctx.destination)
  osc1.start(now)
  osc1.stop(now + 0.35)

  // Second Tone: 1318.51Hz (E6 - sparkling bell chime)
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(1318.51, now + 0.09)
  gain2.gain.setValueAtTime(0.4, now + 0.09)
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.start(now + 0.09)
  osc2.stop(now + 0.6)
}

/**
 * Play pleasant success chord chime
 */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playSuccessTone(ctx))
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
    gain.gain.setValueAtTime(0.3, start)
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
      ctx.resume().then(() => playAlertTone(ctx))
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
  osc.frequency.setValueAtTime(660, now)
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.25)
  gain.gain.setValueAtTime(0.35, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.35)
}
