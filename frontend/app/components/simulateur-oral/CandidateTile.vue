<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    micStream?: MediaStream | null
    speaking?: boolean
    cameraEnabled?: boolean
  }>(),
  {
    micStream: null,
    speaking: false,
    cameraEnabled: false,
  },
)

const emit = defineEmits<{
  'camera-error': []
}>()

// ── Niveau du micro (anneau qui réagit à la voix) ─────────────
const level = ref(0)
let meterCtx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let rafId = 0

function startMeter(stream: MediaStream) {
  stopMeter()
  meterCtx = new AudioContext()
  const source = meterCtx.createMediaStreamSource(stream)
  analyser = meterCtx.createAnalyser()
  analyser.fftSize = 256
  source.connect(analyser)

  const data = new Uint8Array(analyser.fftSize)
  const tick = () => {
    if (!analyser) return
    analyser.getByteTimeDomainData(data)
    let sum = 0
    for (const v of data) {
      const x = (v - 128) / 128
      sum += x * x
    }
    const rms = Math.sqrt(sum / data.length)
    level.value = Math.min(1, rms * 4)
    rafId = requestAnimationFrame(tick)
  }
  tick()
}

function stopMeter() {
  cancelAnimationFrame(rafId)
  analyser = null
  meterCtx?.close()
  meterCtx = null
  level.value = 0
}

watch(
  () => props.micStream,
  (stream) => {
    if (stream) startMeter(stream)
    else stopMeter()
  },
)

// ── Webcam (locale uniquement, rien n'est envoyé au serveur) ───
const videoEl = ref<HTMLVideoElement | null>(null)
const camError = ref(false)
let camStream: MediaStream | null = null

async function startCam() {
  camError.value = false
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: 'user' },
      audio: false,
    })
    await nextTick()
    if (videoEl.value) videoEl.value.srcObject = camStream
  } catch {
    camError.value = true
    emit('camera-error')
  }
}

function stopCam() {
  camStream?.getTracks().forEach((t) => t.stop())
  camStream = null
  if (videoEl.value) videoEl.value.srcObject = null
}

watch(
  () => props.cameraEnabled,
  (on) => {
    if (on) startCam()
    else stopCam()
  },
)

const showVideo = computed(() => props.cameraEnabled && !camError.value)

const ringStyle = computed(() => ({
  boxShadow: `0 0 0 ${2 + level.value * 8}px rgb(110 231 183 / ${0.2 + level.value * 0.5})`,
}))

onMounted(() => {
  if (props.micStream) startMeter(props.micStream)
  if (props.cameraEnabled) startCam()
})

onBeforeUnmount(() => {
  stopMeter()
  stopCam()
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl border bg-primary-950/80 shadow-xl shadow-black/40 backdrop-blur transition-colors duration-300"
    :class="speaking ? 'border-emerald-300/70' : 'border-white/15'"
  >
    <video
      v-show="showVideo"
      ref="videoEl"
      autoplay
      muted
      playsinline
      class="size-full -scale-x-100 object-cover"
    />

    <div v-if="!showVideo" class="grid size-full place-items-center">
      <span
        class="grid size-14 place-items-center rounded-full bg-linear-to-b from-primary-600 to-primary-800 transition-shadow duration-100"
        :style="ringStyle"
      >
        <i class="pi pi-user text-xl text-white/80" />
      </span>
    </div>

    <div
      class="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/40 px-1.5 py-0.5 text-[0.65rem] font-semibold text-white/85"
    >
      <i
        class="pi pi-microphone text-[0.6rem]"
        :class="level > 0.08 ? 'text-emerald-300' : 'text-white/60'"
      />
      Vous
    </div>
  </div>
</template>