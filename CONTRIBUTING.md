# Contributing

Corrections and new GPUs are welcome by pull request. The bar is the same for every change: a vendor source and the vendor's own words.

## Correct a value

1. Find the field in `data/gpus.json`.
2. Change `value`, and replace `source` and `quote` with the document that supports the new value.
3. If the source is new, add it to `sources` with its title, publisher, URL, document date (or `"not shown"`), retrieval date and `tier`.
4. When two vendor documents disagree, keep the datasheet value and add both to the record's section in `NOTES.md`.
5. Run `npm run build`, then `npm run check`.

## Add a GPU

1. Copy the closest record of the same family and give it a new `id`: lowercase kebab-case, ending in its memory size, such as `rtx-4070-12gb-gddr6`.
2. Fill every required field. A value the vendor does not publish is `"TBD"` with a `reason`; a feature the part lacks is `null` with `status: "not-supported"` and a `reason`.
3. Add a section for it in `NOTES.md` if any value needed a decision.
4. Run `npm run build`, then `npm run check`.

## What a pull request needs

- A vendor document for each value: datasheet, product page, product brief or architecture whitepaper. Link the vendor's own URL, not a copy hosted by someone else.
- Dense figures only, in the field's unit (see the README).
- No estimate, no value from a benchmark, a review site or a spec database.
- `npm run check` passing.

A driver-reported memory value (`memory.reported`, from `nvidia-smi` or `rocm-smi`) may cite a public log, such as a GitHub issue, with `tier: "secondary"`.

## Results from your own runs

This dataset holds vendor specifications, not measurements. Measured throughput belongs in a benchmark repository, such as [system-one-bench](https://github.com/DarkStark9000/system-one-bench).
