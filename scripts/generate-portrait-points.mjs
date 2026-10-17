import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

async function generatePortraitPoints() {
  // Use a transparent-background cutout (public/portrait-cutout.png) if you have one;
  // otherwise fall back to the profile photo.
  const cutout = path.join(process.cwd(), 'public', 'portrait-cutout.png')
  const inputPath = fs.existsSync(cutout) ? cutout : path.join(process.cwd(), 'public', 'profile.jpg')
  const outputPath = path.join(process.cwd(), 'public', 'portrait-points.json')

  console.log(`Loading image from ${inputPath}...`)

  // Sample at 500x500 grid for crisp feature extraction
  const GRID_SIZE = 500
  const { data, info } = await sharp(inputPath)
    .resize(GRID_SIZE, GRID_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const width = info.width
  const height = info.height

  // Helper to read RGBA at (x, y)
  function getPixel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return { r: 0, g: 0, b: 0, a: 0, lum: 0 }
    const idx = (y * width + x) * 4
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]
    const a = data[idx + 3]
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    return { r, g, b, a, lum }
  }

  // 1. Calculate Edge Gradient and Density Map
  const densityMap = new Float32Array(width * height)
  let maxDensity = 0

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = getPixel(x, y)
      if (p.a < 35) {
        densityMap[y * width + x] = 0
        continue
      }

      // Check alpha boundary (contour of shoulders and head)
      const isContour =
        getPixel(x - 1, y).a < 30 ||
        getPixel(x + 1, y).a < 30 ||
        getPixel(x, y - 1).a < 30 ||
        getPixel(x, y + 1).a < 30

      // Sobel gradient on luminance
      const gx =
        -1 * getPixel(x - 1, y - 1).lum +
        1 * getPixel(x + 1, y - 1).lum +
        -2 * getPixel(x - 1, y).lum +
        2 * getPixel(x + 1, y).lum +
        -1 * getPixel(x - 1, y + 1).lum +
        1 * getPixel(x + 1, y + 1).lum

      const gy =
        -1 * getPixel(x - 1, y - 1).lum +
        -2 * getPixel(x, y - 1).lum +
        -1 * getPixel(x + 1, y - 1).lum +
        1 * getPixel(x - 1, y + 1).lum +
        2 * getPixel(x, y + 1).lum +
        1 * getPixel(x + 1, y + 1).lum

      const grad = Math.sqrt(gx * gx + gy * gy)

      // Facial region weighting (upper center, roughly y: 15% - 55%, x: 25% - 75%)
      const ny = y / height
      const nx = x / width
      const isFaceRegion = ny > 0.15 && ny < 0.58 && nx > 0.28 && nx < 0.72

      let weight = 0.25 // Base body fill weight
      if (isContour) weight += 1.8 // Strong silhouette definition
      if (grad > 40) weight += (grad / 255) * 2.2 // Sharp features: eyes, nose, lips, hair texture
      if (isFaceRegion) weight *= 1.4 // Higher point density on facial expressions

      densityMap[y * width + x] = weight
      if (weight > maxDensity) maxDensity = weight
    }
  }

  console.log('Density map generated. Max density:', maxDensity.toFixed(2))

  // 2. Poisson-Disc / Rejection Candidate Sampling
  const TARGET_DESKTOP_POINTS = 1150
  const sampledPoints = [] // array of [nx, ny, weight]
  const minDistance = 0.016 // Minimum distance in normalized [0, 1] units
  const minDistanceSq = minDistance * minDistance

  // Spatial bucket grid for fast distance checks (normalized 0..1 space)
  const cellSize = minDistance
  const gridDim = Math.ceil(1 / cellSize)
  const grid = new Map()

  function getCellKey(gx, gy) {
    return `${gx}_${gy}`
  }

  function canPlacePoint(nx, ny) {
    const gx = Math.floor(nx / cellSize)
    const gy = Math.floor(ny / cellSize)

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const key = getCellKey(gx + dx, gy + dy)
        const cellPoints = grid.get(key)
        if (cellPoints) {
          for (const [px, py] of cellPoints) {
            const distSq = (nx - px) * (nx - px) + (ny - py) * (ny - py)
            if (distSq < minDistanceSq) return false
          }
        }
      }
    }
    return true
  }

  function addPoint(nx, ny, weight) {
    const gx = Math.floor(nx / cellSize)
    const gy = Math.floor(ny / cellSize)
    const key = getCellKey(gx, gy)
    if (!grid.has(key)) grid.set(key, [])
    grid.get(key).push([nx, ny])
    sampledPoints.push([Number(nx.toFixed(4)), Number(ny.toFixed(4)), Number(weight.toFixed(2))])
  }

  // First pass: sample high-density edge & facial points
  let attempts = 0
  const maxAttempts = 150000

  while (sampledPoints.length < TARGET_DESKTOP_POINTS && attempts < maxAttempts) {
    attempts++
    const rx = 1 + Math.floor(Math.random() * (width - 2))
    const ry = 1 + Math.floor(Math.random() * (height - 2))
    const d = densityMap[ry * width + rx]

    if (d <= 0) continue

    // Acceptance probability proportional to density
    const prob = d / maxDensity
    if (Math.random() < prob) {
      const nx = rx / width
      const ny = ry / height

      if (canPlacePoint(nx, ny)) {
        addPoint(nx, ny, d)
      }
    }
  }

  console.log(`Sampled ${sampledPoints.length} points in ${attempts} iterations.`)

  // Sort points by visual importance (so mobile can simply take the first 450 points)
  sampledPoints.sort((a, b) => b[2] - a[2])

  const TARGET_MOBILE_POINTS = Math.min(460, Math.floor(sampledPoints.length * 0.4))
  const mobilePoints = sampledPoints.slice(0, TARGET_MOBILE_POINTS)

  // 3. Precompute Plexus Neighbor Edges (Max 3 lines per node, distance threshold <= 0.075)
  function computeEdges(points, maxDist = 0.075, maxLinesPerNode = 3) {
    const edges = []
    const edgeSet = new Set()
    const degree = new Array(points.length).fill(0)
    const maxDistSq = maxDist * maxDist

    for (let i = 0; i < points.length; i++) {
      if (degree[i] >= maxLinesPerNode) continue
      const [x1, y1] = points[i]

      // Find candidate neighbors sorted by distance
      const candidates = []
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue
        const [x2, y2] = points[j]
        const dSq = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)
        if (dSq <= maxDistSq) {
          candidates.push({ j, dSq })
        }
      }

      candidates.sort((a, b) => a.dSq - b.dSq)

      for (const { j } of candidates) {
        if (degree[i] >= maxLinesPerNode) break
        if (degree[j] >= maxLinesPerNode) continue

        const edgeKey = i < j ? `${i}_${j}` : `${j}_${i}`
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey)
          edges.push([Math.min(i, j), Math.max(i, j)])
          degree[i]++
          degree[j]++
        }
      }
    }
    return edges
  }

  console.log('Precomputing neighbor edges for plexus mesh...')
  const desktopEdges = computeEdges(sampledPoints, 0.072, 3)
  const mobileEdges = computeEdges(mobilePoints, 0.095, 3)

  console.log(`Desktop Edges: ${desktopEdges.length} | Mobile Edges: ${mobileEdges.length}`)

  // Calculate face bounding box center (for camera centering if needed)
  let minX = 1, minY = 1, maxX = 0, maxY = 0
  for (const [x, y] of sampledPoints) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  const result = {
    bounds: {
      minX: Number(minX.toFixed(4)),
      minY: Number(minY.toFixed(4)),
      maxX: Number(maxX.toFixed(4)),
      maxY: Number(maxY.toFixed(4)),
      aspectRatio: 1.0,
    },
    totalDesktopPoints: sampledPoints.length,
    totalMobilePoints: mobilePoints.length,
    points: sampledPoints.map(([x, y]) => [x, y]),
    mobilePoints: mobilePoints.map(([x, y]) => [x, y]),
    edges: desktopEdges,
    mobileEdges: mobileEdges,
  }

  fs.writeFileSync(outputPath, JSON.stringify(result))
  const stats = fs.statSync(outputPath)
  console.log(`Generated ${outputPath} (${(stats.size / 1024).toFixed(1)} KB) successfully.`)
}

generatePortraitPoints().catch(console.error)
