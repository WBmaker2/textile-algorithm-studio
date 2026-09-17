import { useEffect, useRef, useState } from 'react'
import {
  AmbientLight,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import { buildThreads, THREAD_RADIUS } from '../engine/threadGeometry'
import type { Matrix } from '../engine/weaveModel'

type Props = {
  matrix: Matrix
  warpColor: string
  weftColor: string
  highlight?: { row: number; col: number } | null
}

const MAX_CROSSINGS = 12

const WEBGL_FALLBACK_TEXT =
  '이 기기에서는 입체 보기를 열 수 없습니다. 위에서 본 교차 확대와 옆 단면 보기로 같은 구조를 확인할 수 있습니다.'

function supportsWebGL(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}

export function LoomScene({ matrix, warpColor, weftColor, highlight }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [webglAvailable] = useState(supportsWebGL)
  const size = matrix.length
  const tiles = Math.max(1, Math.floor(MAX_CROSSINGS / size))

  useEffect(() => {
    const host = hostRef.current
    if (!host || !webglAvailable) return

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      host.textContent = WEBGL_FALLBACK_TEXT
      return
    }

    let width = host.clientWidth || 640
    let height = host.clientHeight || 400

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    host.appendChild(renderer.domElement)

    const scene = new Scene()
    scene.background = null

    const camera = new PerspectiveCamera(42, width / height, 0.1, 100)
    const crossings = size * tiles
    const target = (crossings - 1) / 2

    const applyCamera = (azimuth: number, elevation: number, distance: number) => {
      const phi = (90 - elevation) * (Math.PI / 180)
      const theta = azimuth * (Math.PI / 180)
      camera.position.set(
        target + distance * Math.sin(phi) * Math.cos(theta),
        target + distance * Math.cos(phi),
        target + distance * Math.sin(phi) * Math.sin(theta),
      )
      camera.lookAt(target, target, 0)
    }

    applyCamera(38, 52, crossings * 1.5)

    scene.add(new AmbientLight(0xffffff, 1.55))
    const key = new DirectionalLight(0xffffff, 2.1)
    key.position.set(crossings, crossings * 1.6, crossings)
    scene.add(key)
    const fill = new DirectionalLight(0xffffff, 0.6)
    fill.position.set(-crossings, -crossings, -crossings * 0.5)
    scene.add(fill)

    const threads = buildThreads(matrix, tiles)
    for (const thread of threads) {
      const points = thread.points.map(
        (point) => new Vector3(point.x, point.z, point.y),
      )
      const curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.0)
      const geometry = new TubeGeometry(
        curve,
        Math.max(12, points.length * 3),
        THREAD_RADIUS,
        8,
        false,
      )
      const color = new Color(
        thread.kind === 'warp' ? warpColor : weftColor,
      )
      const mesh = new Mesh(
        geometry,
        new MeshStandardMaterial({
          color,
          roughness: 0.72,
          metalness: 0.04,
        }),
      )
      scene.add(mesh)
      scene.add(
        new Line(
          new BufferGeometry().setFromPoints(points),
          new LineBasicMaterial({ color: color.clone().multiplyScalar(0.6) }),
        ),
      )
    }

    if (highlight) {
      const col = Math.min(highlight.col, crossings - 1)
      const row = Math.min(highlight.row, crossings - 1)
      const ring = new Mesh(
        new RingGeometry(0.34, 0.42, 32),
        new MeshStandardMaterial({ color: 0xa2620c, roughness: 0.5 }),
      )
      ring.rotation.x = -Math.PI / 2
      ring.position.set(row, 0.24, col)
      scene.add(ring)
    }

    let dragging = false
    let azimuth = 38
    let elevation = 52
    let distance = crossings * 1.5
    let lastX = 0
    let lastY = 0

    const onPointerDown = (event: PointerEvent) => {
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      host.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      azimuth -= (event.clientX - lastX) * 0.4
      elevation = Math.min(
        86,
        Math.max(8, elevation + (event.clientY - lastY) * 0.3),
      )
      lastX = event.clientX
      lastY = event.clientY
      applyCamera(azimuth, elevation, distance)
    }
    const onPointerUp = (event: PointerEvent) => {
      dragging = false
      if (host.hasPointerCapture(event.pointerId)) {
        host.releasePointerCapture(event.pointerId)
      }
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      distance = Math.min(crossings * 4, Math.max(crossings * 0.7, distance + event.deltaY * 0.01))
      applyCamera(azimuth, elevation, distance)
    }

    host.addEventListener('pointerdown', onPointerDown)
    host.addEventListener('pointermove', onPointerMove)
    host.addEventListener('pointerup', onPointerUp)
    host.addEventListener('wheel', onWheel, { passive: false })

    let frame = 0
    const render = () => {
      renderer.render(scene, camera)
      frame = requestAnimationFrame(render)
    }
    render()

    const onResize = () => {
      if (!host.clientWidth || !host.clientHeight) return
      width = host.clientWidth
      height = host.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    const observer = new ResizeObserver(onResize)
    observer.observe(host)

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
      } else {
        frame = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      host.removeEventListener('pointerdown', onPointerDown)
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerup', onPointerUp)
      host.removeEventListener('wheel', onWheel)
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof Line) {
          object.geometry.dispose()
          const material = object.material
          if (Array.isArray(material)) material.forEach((item) => item.dispose())
          else material.dispose()
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement)
      }
    }
  }, [matrix, warpColor, weftColor, highlight, size, tiles, webglAvailable])

  if (!webglAvailable) {
    return <div className="viewport__fallback">{WEBGL_FALLBACK_TEXT}</div>
  }

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />
}
