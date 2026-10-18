# gpu-specs

Cited specifications for NVIDIA and AMD GPUs. Every number carries its source document and the vendor's own words, so you can check it in one click.

Data center, workstation and GeForce parts are covered, including laptop GPUs. Each memory size, form factor and edition of a part is its own record.

| Family | Records |
|---|---|
| NVIDIA data center: Hopper, Blackwell, Blackwell Ultra | H100 (SXM5 80 GB, SXM5 94 GB, PCIe, NVL), H200 (SXM, NVL), B200, GB200 (NVL72, NVL4), B300, GB300 (NVL72, DGX Station) |
| NVIDIA data center: Ampere, Volta, Turing, Ada | A2, A10, A16, A30, A40, A100 (40 GB and 80 GB, PCIe and SXM4), V100 (PCIe, SXM2, SXM3, FHHL), V100S, T4, L4, L40, L40S |
| AMD Instinct | MI300X, MI300A, MI325X, MI350X, MI355X, MI350P, MI455X |
| NVIDIA workstation | RTX A400 to A6000, RTX 2000 to 6000 Ada Generation, RTX PRO 2000 to 6000 Blackwell (Workstation, Max-Q and Server Editions) |
| NVIDIA GeForce desktop | RTX 30, 40 and 50 Series, each memory variant |
| NVIDIA GeForce laptop | RTX 30, 40 and 50 Series Laptop GPUs |

121 records, 166 sources, retrieved 2026-10-18. `NOTES.md` lists every variant found and left out, with the reason.

## Files

| File | What it holds |
|---|---|
| `data/gpus.json` | The dataset: every value with its unit, source id and quote. The source of truth. |
| `data/gpus.csv` | One row per GPU, one column per field, generated from the JSON. No sources or quotes. |
| `NOTES.md` | The decision behind each record, every conflict between vendor documents, and the excluded variants. |
| `scripts/validate.mjs` | Checks the dataset against the rules below. |
| `scripts/build-csv.mjs` | Writes the CSV; `--check` fails when it is stale. |

The scripts need Node 20 or later and no packages. `npm run check` runs both.

## Rules

1. **Vendor documents only.** A value comes from the vendor's datasheet, product page, product brief or architecture whitepaper. A third-party database can help find a document, but it is never the citation. The one exception is driver-reported memory (below), marked `tier: "secondary"`.
2. **Quote what you cite.** Each value names a source and holds a short verbatim quote. In a quote, ` | ` joins a table row label and its cell, and `...` marks omitted text.
3. **Dense compute only.** Tensor figures with sparsity are not stored. When a vendor prints only a sparse figure and states that dense is one half of it, the value is the sparse figure divided by 2, flagged `derivedFromSparse` with `sparseValue` and `formula`.
4. **Never estimate.** A value the vendor does not publish is `"TBD"` with a `reason`. A feature the part does not have is `null` with `status: "not-supported"` and a `reason`. In the CSV these read `TBD` and `n/a`.
5. **One unit per field.** Where the vendor printed another unit, the value was converted, and `printed` keeps the vendor's own number and unit.
6. **Memory as printed, and as reported.** `memory.capacity` is the vendor's figure. Vendors write "80 GB" for HBM that is binary-sized, so `memory.reported` holds what `nvidia-smi` reports, in MiB, where a public sample exists.
7. **Conflicts are recorded, not hidden.** When two vendor documents disagree, the record uses the datasheet value, and `NOTES.md` states both.

| Field | Unit |
|---|---|
| `memory.capacity` | GB, as the vendor prints it |
| `memory.reported` | MiB |
| `memory.bandwidth`, `interconnect.gpuLink`, `interconnect.gpuLinkPerDirection` | GB/s |
| `memory.busWidth` | bits |
| `compute.fp64` to `compute.fp4Tensor` | TFLOPS, dense |
| `compute.int8Tensor` | TOPS, dense |
| `maxPowerW` | W |

`compute.fp16Tensor` and `compute.fp8Tensor` are with FP32 accumulate on GeForce and workstation parts. `compute.fp16TensorFp16Acc` and `compute.fp8TensorFp16Acc` hold the FP16-accumulate figures where NVIDIA prints them.

## A record

```json
{
  "id": "a100-sxm4-80gb",
  "vendor": "NVIDIA",
  "segment": "datacenter",
  "memory": {
    "bandwidth": {
      "value": 2039,
      "unit": "GB/s",
      "source": "dc-a100-ds-may22",
      "quote": "GPU Memory Bandwidth 2,039GB/s"
    }
  }
}
```

Each `source` id resolves to an entry in `sources` with its title, publisher, URL, document date and retrieval date.

## Use it

Pin a release tag, not `main`, so your numbers do not move under you:

```bash
curl -LO https://raw.githubusercontent.com/DarkStark9000/gpu-specs/v0.1.0/data/gpus.json
```

The KV cache calculator on [debarshidas.dev](https://debarshidas.dev/tools/kv-cache-calculator) reads a pinned tag of this dataset.

## Limits

- **A snapshot.** Vendors revise pages and datasheets. Each source records its retrieval date.
- **Preliminary figures.** Some vendor documents mark their specifications preliminary or estimated (H200, MI350P, RTX PRO 5500). `NOTES.md` names each one.
- **Laptop GPUs.** NVIDIA publishes no per-precision compute for its laptop GPUs, so those fields are `TBD`. The laptop maker sets the power level inside NVIDIA's published range, and `maxPowerW` is the top of that range.
- **Peak, not delivered.** These are the vendor's theoretical peaks at boost clock. A real workload reaches a fraction of them.

## Correct a value or add a GPU

Read `CONTRIBUTING.md`. Every change needs a vendor source and a quote.

## License

- Data (`data/`, `NOTES.md`): [Creative Commons Attribution 4.0](LICENSE-DATA). Credit: "GPU specifications from gpu-specs by Debarshi Das, CC BY 4.0, https://github.com/DarkStark9000/gpu-specs".
- Code (`scripts/`): [MIT](LICENSE).

Product names are trademarks of their owners. The figures are facts from each vendor's public documents. This project is independent of NVIDIA and AMD.
