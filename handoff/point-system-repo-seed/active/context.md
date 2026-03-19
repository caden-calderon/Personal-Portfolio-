# Point-System Context

## Current Direction

This repo seed assumes a fresh point-system-first Chromatic codebase.

Key assumptions:

- persistent points/surfels are the rendering foundation
- the train/world concept remains part of the product
- the website is built around the runtime, not vice versa

## Current Technical Defaults

- renderer: `THREE.Points`
- first asset path: Blender mesh -> glTF
- first point generation path: runtime sampling from mesh surfaces

## What Happens Next

1. choose the first proof asset
2. build the first renderer
3. validate the look
4. then tackle animated point binding
