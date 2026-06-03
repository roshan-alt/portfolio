import { Bounds, Center, Stars, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Box3, DoubleSide, Vector3, type Group, type Material, type Mesh, type Object3D } from 'three'
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js'
import { assetUrl } from '../lib/assetUrl'

export type DisciplineSceneProps = {
  scrollProgressRef: RefObject<number>
  /** Optional overrides: [arduino, esp32] — .glb, .gltf, or .dae */
  modelUrls?: string[]
}

const MODEL_BASE = assetUrl('models')

const DEFAULTS = {
  arduino: `${MODEL_BASE}/arduino/model.dae`,
  esp32: `${MODEL_BASE}/esp32-c6.glb`,
} as const

const SCROLL_START = 0.008
const BASE_TILT_X = 0.35
const HALF_TURN = Math.PI / 2

const DEPRECATED_URLS = new Set([
  `${MODEL_BASE}/ml.glb`,
  `${MODEL_BASE}/ai.glb`,
  `${MODEL_BASE}/iot.glb`,
  `${MODEL_BASE}/software.glb`,
])

function isModelUrl(url?: string) {
  return !!url && /\.(glb|gltf|dae)(\?|$)/i.test(url)
}

function resolveUrl(slot: 'arduino' | 'esp32', overrides?: string[]) {
  const idx = slot === 'arduino' ? 0 : 1
  const custom = overrides?.[idx]?.trim()
  if (custom && isModelUrl(custom) && !DEPRECATED_URLS.has(custom)) {
    if (custom.startsWith('/models/') && !custom.includes('..')) {
      return assetUrl(custom.slice(1))
    }
    if (custom.startsWith('/') && !custom.includes('..')) return custom
    if (/^https?:\/\//i.test(custom)) return custom
  }
  return DEFAULTS[slot]
}

function arduinoOpacity(p: number) {
  if (p >= 0.55) return 0
  if (p >= 0.45) return 1 - (p - 0.45) / 0.1
  return 1
}

function esp32Opacity(p: number) {
  if (p <= 0.45) return 0
  if (p <= 0.55) return (p - 0.45) / 0.1
  return 1
}

function applyArduinoRotation(group: Group, scrollProgress: number) {
  group.rotation.x = BASE_TILT_X
  group.rotation.y = 0

  if (scrollProgress <= SCROLL_START) {
    group.rotation.z = 0
    return
  }
  if (scrollProgress < 0.5) {
    const t = Math.min(1, (scrollProgress - SCROLL_START) / (0.5 - SCROLL_START))
    group.rotation.z = t * HALF_TURN
    return
  }
  group.rotation.z = HALF_TURN
}

/** ESP32 faces the camera, then rotates on Y (front axis) through the second scroll half. */
function applyEsp32FrontRotation(group: Group, scrollProgress: number) {
  group.rotation.x = BASE_TILT_X
  group.rotation.z = 0

  if (scrollProgress <= 0.5) {
    group.rotation.y = 0
    return
  }
  const t = Math.min(1, (scrollProgress - 0.5) / (0.5 - SCROLL_START))
  group.rotation.y = t * HALF_TURN
}

function applyModelRotation(group: Group, scrollProgress: number, phase: 'arduino' | 'esp32') {
  if (phase === 'arduino') {
    applyArduinoRotation(group, scrollProgress)
  } else {
    applyEsp32FrontRotation(group, scrollProgress)
  }
}

function prepareClone(object: Object3D) {
  const clone = object.clone(true)
  clone.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh || !mesh.material) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((mat) => {
      const m = mat as Material
      m.side = DoubleSide
    })
  })
  return clone
}

/** Espressif GLBs are in meters (~13 mm). Pre-scale so Bounds always has sensible input. */
function normalizeSmallGlb(object: Object3D) {
  const clone = prepareClone(object)
  const box = new Box3().setFromObject(clone)
  const size = new Vector3()
  box.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim > 0 && maxDim < 1) {
    clone.scale.setScalar(1 / maxDim)
  }
  return clone
}

function fadeGroup(group: Group | null, opacity: number) {
  if (!group) return
  group.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh || !mesh.material) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((mat) => {
      const m = mat as Material
      if (opacity >= 1) {
        m.transparent = false
        m.opacity = 1
        m.depthWrite = true
      } else if (opacity <= 0) {
        m.transparent = true
        m.opacity = 0
        m.depthWrite = false
      } else {
        m.transparent = true
        m.opacity = opacity
        m.depthWrite = false
      }
      m.needsUpdate = true
    })
  })
}

function HardwareModel({ object, scrollProgressRef, opacityFor, phase, margin, normalize }: {
  object: Object3D
  scrollProgressRef: RefObject<number>
  opacityFor: (p: number) => number
  phase: 'arduino' | 'esp32'
  margin?: number
  normalize?: boolean
}) {
  const group = useRef<Group>(null)
  const clone = useMemo(
    () => (normalize ? normalizeSmallGlb(object) : prepareClone(object)),
    [object, normalize],
  )

  useLayoutEffect(() => {
    fadeGroup(group.current, opacityFor(scrollProgressRef.current ?? 0))
  }, [clone, opacityFor, scrollProgressRef])

  useFrame(() => {
    const g = group.current
    if (!g) return
    const scrollProgress = scrollProgressRef.current ?? 0
    const opacity = opacityFor(scrollProgress)
    applyModelRotation(g, scrollProgress, phase)
    fadeGroup(g, opacity)
  })

  return (
    <group ref={group}>
      <Bounds fit observe margin={margin ?? 1.35} maxDuration={0}>
        <Center>
          <primitive object={clone} />
        </Center>
      </Bounds>
    </group>
  )
}

function ArduinoCollada({ url, scrollProgressRef, opacityFor }: {
  url: string
  scrollProgressRef: RefObject<number>
  opacityFor: (p: number) => number
}) {
  const collada = useLoader(ColladaLoader, url)
  if (!collada?.scene) return null
  return (
    <HardwareModel
      object={collada.scene}
      scrollProgressRef={scrollProgressRef}
      opacityFor={opacityFor}
      phase="arduino"
      margin={1.35}
    />
  )
}

function ArduinoGltf({ url, scrollProgressRef, opacityFor }: {
  url: string
  scrollProgressRef: RefObject<number>
  opacityFor: (p: number) => number
}) {
  const { scene } = useGLTF(url)
  return (
    <HardwareModel
      object={scene}
      scrollProgressRef={scrollProgressRef}
      opacityFor={opacityFor}
      phase="arduino"
      margin={1.35}
    />
  )
}

function Esp32Model({ url, scrollProgressRef, opacityFor }: {
  url: string
  scrollProgressRef: RefObject<number>
  opacityFor: (p: number) => number
}) {
  const { scene } = useGLTF(url)
  return (
    <HardwareModel
      object={scene}
      scrollProgressRef={scrollProgressRef}
      opacityFor={opacityFor}
      phase="esp32"
      margin={1.4}
      normalize
    />
  )
}

function ArduinoModel({ url, scrollProgressRef, opacityFor }: {
  url: string
  scrollProgressRef: RefObject<number>
  opacityFor: (p: number) => number
}) {
  const isGlb = /\.(glb|gltf)(\?|$)/i.test(url)
  if (isGlb) {
    return <ArduinoGltf url={url} scrollProgressRef={scrollProgressRef} opacityFor={opacityFor} />
  }
  return <ArduinoCollada url={url} scrollProgressRef={scrollProgressRef} opacityFor={opacityFor} />
}

/** Load ESP32 only when scroll nears the handoff (~45%) to avoid ~1MB fetch on first paint. */
function DeferredEsp32Model({
  scrollProgressRef,
  modelUrls,
}: Pick<DisciplineSceneProps, 'scrollProgressRef' | 'modelUrls'>) {
  const [load, setLoad] = useState(false)

  useFrame(() => {
    if (load) return
    if ((scrollProgressRef.current ?? 0) >= 0.28) setLoad(true)
  })

  useEffect(() => {
    const t = window.setTimeout(() => setLoad(true), 8000)
    return () => window.clearTimeout(t)
  }, [])

  if (!load) return null

  return (
    <Esp32Model
      url={resolveUrl('esp32', modelUrls)}
      scrollProgressRef={scrollProgressRef}
      opacityFor={esp32Opacity}
    />
  )
}

function DisciplineModels({ scrollProgressRef, modelUrls }: DisciplineSceneProps) {
  return (
    <>
      <ArduinoModel
        url={resolveUrl('arduino', modelUrls)}
        scrollProgressRef={scrollProgressRef}
        opacityFor={arduinoOpacity}
      />
      <DeferredEsp32Model scrollProgressRef={scrollProgressRef} modelUrls={modelUrls} />
    </>
  )
}

function Scene({ scrollProgressRef, modelUrls }: DisciplineSceneProps) {
  return (
    <>
      <color attach="background" args={['#14141f']} />
      <fog attach="fog" args={['#14141f', 10, 28]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 6]} intensity={1.2} color="#fff7ed" castShadow />
      <directionalLight position={[-5, 4, -4]} intensity={0.7} color="#99f6e4" />
      <pointLight position={[-4, 2, 4]} intensity={1.4} color="#2dd4bf" />
      <pointLight position={[4, -1, 3]} intensity={1.1} color="#a78bfa" />

      <Stars radius={80} depth={40} count={500} factor={1.5} saturation={0.15} fade speed={0.4} />

      <Suspense fallback={null}>
        <DisciplineModels scrollProgressRef={scrollProgressRef} modelUrls={modelUrls} />
      </Suspense>
    </>
  )
}

export function DisciplineScene3D({ scrollProgressRef, modelUrls }: DisciplineSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 7], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      frameloop="always"
      style={{ width: '100%', height: '100%' }}
    >
      <Scene scrollProgressRef={scrollProgressRef} modelUrls={modelUrls} />
    </Canvas>
  )
}
