# Deadlock Studio

Interactive Next.js + Tailwind CSS deadlock detector for an Operating Systems project.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Algorithm

The multi-instance deadlock detection algorithm uses Allocation, outstanding Request, and Available. `Total` is used only to validate conservation of resource instances. Processes holding no resources are initialized as finished, as in the standard detection algorithm. Remaining unfinished processes after the scan are identified as deadlocked.

## Features

- Editable process/resource counts, matrices, vectors
- Three preset scenarios
- Live validation of nonnegative integer values and total resource counts
- Deadlock verdict and process identifiers
- Step-by-step Work/Finish trace
- Resource allocation graph and edge list
- Expandable OS theory and viva notes
- Responsive layout

## Design references

- https://indxd-landing.krishangzinzuwadia.workers.dev/
- https://knowhelios.tech/
- https://github.com/Leonxlnx/taste-skill

To install the optional design skill in a compatible coding agent:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend
```
