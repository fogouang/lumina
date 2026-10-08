<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    avatarUrl?: string
    body?: 'M' | 'F'
    speaking?: boolean
    listening?: boolean
    cameraView?: 'full' | 'mid' | 'upper' | 'head'
  }>(),
  {
    avatarUrl: '/avatars/examinateur.glb',
    body: 'F',
    speaking: false,
    listening: false,
    cameraView: 'upper',
  },
)

const emit = defineEmits<{
  ready: []
  error: [message: string]
}>()

const HEADAUDIO_BASE = '/vendor/headaudio'

const container = ref<HTMLDivElement | null>(null)
const loading = ref(true)
const progress = ref(0)
const failed = ref(false)

let head: any = null
let headaudio: any = null
let listenTimer: ReturnType<typeof setInterval> | null = null

async function init() {
  if (!container.value) return

  try {
    const { TalkingHead } = await import('@met4citizen/talkinghead')

    head = new TalkingHead(container.value, {
      ttsEndpoint: null,
      lipsyncModules: [],
      cameraView: props.cameraView,
      avatarMood: 'neutral',
      modelFPS: 30,
    })

    await head.showAvatar(
      {
        url: props.avatarUrl,
        body: props.body,
        avatarMood: 'neutral',
        lipsyncLang: 'fr',
      },
      (ev: ProgressEvent) => {
        if (ev.lengthComputable) {
          progress.value = Math.round((ev.loaded / ev.total) * 100)
        }
      },
    )

    // Lip-sync piloté par l'audio (pas besoin de timestamps de mots)
    await head.audioCtx.audioWorklet.addModule(`${HEADAUDIO_BASE}/headworklet.min.mjs`)
    const moduleUrl = `${HEADAUDIO_BASE}/headaudio.min.mjs`
    const mod = await import(/* @vite-ignore */ moduleUrl)
    const HeadAudioClass = mod.HeadAudio ?? mod.HeadAudioNode

    headaudio = new HeadAudioClass(head.audioCtx, {
      processorOptions: {},
      parameterData: {
        vadGateActiveDb: -40,
        vadGateInactiveDb: -60,
      },
    })
    await headaudio.loadModel(`${HEADAUDIO_BASE}/model-en-mixed.bin`)

    headaudio.onvalue = (key: string, value: number) => {
      const target = head.mtAvatar?.[key]
      if (target) Object.assign(target, { newvalue: value, needsUpdate: true })
    }
    head.opt.update = headaudio.update.bind(headaudio)
    head.audioSpeechGainNode.connect(headaudio)

    // Petit retard sur la voix pour compenser le temps d'analyse des lèvres
    try {
      const delayNode = new DelayNode(head.audioCtx, { delayTime: 0.08 })
      head.audioSpeechGainNode.disconnect(head.audioReverbNode)
      head.audioSpeechGainNode.connect(delayNode)
      delayNode.connect(head.audioReverbNode)
    } catch {
      // si la structure audio change dans une future version, on garde le son direct
    }

    // Début de phrase : regard caméra + geste des mains
    let lastEnded = 0
    headaudio.onended = () => {
      lastEnded = Date.now()
    }
    headaudio.onstarted = () => {
      if (Date.now() - lastEnded > 150) {
        head.lookAtCamera?.(500)
        head.speakWithHands?.()
      }
    }

    loading.value = false
    emit('ready')
  } catch (err: any) {
    console.error('[ExaminateurAvatar]', err)
    failed.value = true
    loading.value = false
    head = null
    emit('error', err?.message ?? 'Avatar indisponible')
  }
}

/**
 * Sortie audio à utiliser pour jouer la voix de l'examinateur.
 * Retourne null si l'avatar n'est pas prêt : la page garde alors sa lecture habituelle.
 */
function getAudioOutput(): { ctx: AudioContext; node: AudioNode } | null {
  if (!head || failed.value || loading.value) return null
  return { ctx: head.audioCtx, node: head.audioSpeechGainNode }
}

async function resume() {
  if (head?.audioCtx?.state === 'suspended') {
    await head.audioCtx.resume()
  }
}

// Écoute active : quand le candidat parle, l'examinatrice le regarde régulièrement
watch(
  () => props.listening,
  (isListening) => {
    if (listenTimer) {
      clearInterval(listenTimer)
      listenTimer = null
    }
    if (isListening) {
      head?.lookAtCamera?.(1500)
      listenTimer = setInterval(() => head?.lookAtCamera?.(1500), 4000)
    }
  },
)

watch(
  () => props.speaking,
  () => {
    head?.lookAtCamera?.(800)
  },
)

onMounted(init)

onBeforeUnmount(() => {
  if (listenTimer) clearInterval(listenTimer)
  try {
    head?.audioSpeechGainNode?.disconnect?.(headaudio)
    head?.stop?.()
    head?.dispose?.()
  } catch {
    // rien à faire, on quitte la page
  }
  head = null
  headaudio = null
})

defineExpose({ getAudioOutput, resume })
</script>

<template>
  <div class="relative h-full w-full overflow-hidden">
    <div v-show="!failed" ref="container" class="h-full w-full" />

    <div
      v-if="loading && !failed"
      class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-primary-950/50"
    >
      <i class="pi pi-spin pi-spinner text-2xl text-accent-300" />
      <span class="text-sm text-white/70">Arrivée de l'examinatrice... {{ progress }}%</span>
    </div>

    <div v-if="failed" class="flex h-full w-full items-center justify-center">
      <slot name="fallback" />
    </div>
  </div>
</template>