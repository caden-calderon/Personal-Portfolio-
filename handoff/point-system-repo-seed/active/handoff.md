# Point-System Handoff

## Baseline

- the train-compartment portfolio concept is still valid
- the rendering foundation is persistent points/surfels
- the next task is implementation, not more doc work

## Read Order

1. `CLAUDE.md`
2. `README.md`
3. `vision.md`
4. `architecture.md`
5. `roadmap.md`
6. `active/*`

## Immediate Recommended Path

1. pick the first Blender/glTF proof asset
2. build the first `THREE.Points` renderer
3. sample points from the mesh at load time
4. add the minimum controls
5. judge the look before generalizing

## Constraints

- keep the core runtime framework-agnostic where practical
- keep source ingestion separate from rendering
- keep accessibility-critical UI in the DOM
