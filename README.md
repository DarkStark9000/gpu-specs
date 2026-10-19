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

## Ask it a question

The dataset is one JSON file, so `jq` can answer a question in one command. Each command below needs `curl` and `jq` 1.6 or later, and reads the pinned release. The commands sort and filter inside `jq`, so they run the same in bash, zsh and PowerShell 7. In Windows PowerShell 5.1, write `curl.exe`, because `curl` is an alias there. Change a value after `--argjson` or `--arg` to ask a different question.

Which GPUs have at least 192 GB of memory, as the vendor prints it? The result is GB, then the record id, largest first.

```bash
curl -s https://raw.githubusercontent.com/DarkStark9000/gpu-specs/v0.1.0/data/gpus.json | jq -r --argjson min 192 '
  [.gpus[] | select(.memory.capacity.value | numbers | . >= $min) | [.memory.capacity.value, .id]]
  | sort_by(-.[0])[]
  | @tsv
'
```

Which GPUs have under 100 GiB of usable memory, as the driver reports it? Only a record with a public `nvidia-smi` sample has this figure, and the others are skipped, not guessed.

```bash
curl -s https://raw.githubusercontent.com/DarkStark9000/gpu-specs/v0.1.0/data/gpus.json | jq -r --argjson max 100 '
  [.gpus[] | select(.memory.reported.value | numbers | . < $max * 1024) | [(.memory.reported.value / 1024 * 10 | round / 10), .id]]
  | sort_by(-.[0])[]
  | @tsv
'
```

Which Blackwell data center parts are there, and what is their dense FP8 compute in TFLOPS? `TBD` means the vendor does not publish the figure.

```bash
curl -s https://raw.githubusercontent.com/DarkStark9000/gpu-specs/v0.1.0/data/gpus.json | jq -r --arg arch Blackwell --arg seg datacenter '
  .gpus[]
  | select(.architecture.value == $arch and .segment == $seg)
  | [.compute.fp8Tensor.value, .id]
  | @tsv
'
```

Which data center GPUs give the most memory bandwidth for each watt of maximum board power? The ratio is GB/s per W, and it is derived from two cited values.

```bash
curl -s https://raw.githubusercontent.com/DarkStark9000/gpu-specs/v0.1.0/data/gpus.json | jq -r --arg seg datacenter '
  [.gpus[]
   | select(.segment == $seg)
   | (.memory.bandwidth.value | numbers) as $bw
   | (.maxPowerW.value | numbers) as $w
   | [($bw / $w * 100 | round / 100), .id]]
  | sort_by(-.[0])[:5][]
  | @tsv
'
```

What did the vendor say about a number, and where? Change the record id and the field to look up another value.

```bash
curl -s https://raw.githubusercontent.com/DarkStark9000/gpu-specs/v0.1.0/data/gpus.json | jq -r --arg id h100-sxm5-80gb '
  . as $d
  | .gpus[] | select(.id == $id)
  | .memory.bandwidth as $v
  | ($d.sources[] | select(.id == $v.source)) as $s
  | $v.value, $v.unit, $v.quote, $s.url
'
```

The data has no launch date for a part. To filter by generation, use `architecture`, as in the third command.

## Give it to an AI agent

Paste this block into a chat or an agent's instructions, then add your question at the end. It tells the agent how to fetch the data, how to filter it, and how to credit it.

```text
You can use gpu-specs, an open dataset of cited NVIDIA and AMD GPU specifications.

Data (JSON, the source of truth): https://raw.githubusercontent.com/DarkStark9000/gpu-specs/v0.1.0/data/gpus.json
Same GPUs as a table, with no sources or quotes: https://raw.githubusercontent.com/DarkStark9000/gpu-specs/v0.1.0/data/gpus.csv
Rules and field units: https://github.com/DarkStark9000/gpu-specs#readme

Shape of the JSON: { "sources": [...], "gpus": [...] }. A GPU has id, vendor, segment (datacenter, workstation, geforce-desktop or geforce-laptop), name, architecture, formFactor, memory, compute, interconnect and maxPowerW. Each value is an object with value, unit, source and quote. The source is an id in the top-level sources list, which gives the document title, publisher and url.

How to answer:
1. Fetch the file. Never answer a number from memory.
2. Filter it with jq or a short script. Do not read the whole file into the conversation.
3. A value of "TBD" means the vendor does not publish it. A value of null with status "not-supported" means the part does not have the feature. Report both as they are. Never estimate and never fill a gap from another source.
4. Compute figures are dense, not sparse. memory.capacity is the vendor's printed figure in GB. memory.reported is the driver-reported (usable) figure in MiB, and few records have it. Say which one you use.
5. For each number, give the record id, the value with its unit, the vendor's quote and the source url.
6. The data is a snapshot. Give the release tag and the source's retrieval date.

When you publish or reuse the data, credit it as the CC BY 4.0 license (https://creativecommons.org/licenses/by/4.0/) requires, and say if you changed it:
"GPU specifications from gpu-specs by Debarshi Das, CC BY 4.0, https://github.com/DarkStark9000/gpu-specs"

My question:
```

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
