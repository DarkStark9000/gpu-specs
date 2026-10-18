# GPU specification dataset: notes

Retrieved 2026-10-18. Companion to `data/gpus.json`: the decisions behind its values, the conflicts between vendor documents, and the variants left out.

## How to read the dataset

- Every value is cited: `source` points into the `sources` list, and `quote` is short verbatim text from that source. In quotes, " | " joins a table row label and its cell, and "..." marks omitted text.
- Compute fields are dense only. When a source prints only a figure with sparsity and states (or, for Hopper and DGX Station, implies through the same family's datasheet) that dense is one half, the value is sparse / 2, flagged `derivedFromSparse` with `sparseValue`, `footnoteQuote` and `formula`.
- The only other derivation is per-direction link bandwidth = bidirectional / 2, flagged with `formula`.
- `{"value": "TBD", "reason": ...}` marks a value the vendor does not publish. `{"value": null, "status": "not-supported"}` marks a precision or link the part does not have.
- Each field has one unit: GB/s for bandwidth, TFLOPS for floating-point compute, TOPS for INT8, bits for bus width. Where the vendor printed another unit (TB/s, PFLOPS, POPS, or TOPS for FP4), the value was converted and `printed` keeps the vendor's own number and unit beside the quote.
- `tier: "secondary"` marks the few non-vendor sources, used only for driver-reported memory (nvidia-smi totals in public GitHub issues and one Modal glossary page).
- Memory capacity is recorded as the vendor writes it. Vendors write decimal-looking "80 GB" for binary-sized HBM; `memory.reported` (MiB) shows what the driver reports, where a public sample exists.

## NVIDIA Hopper and Blackwell data center GPUs

Quote notation: " | " joins a table row label and its cell, and "..." marks omitted cells or text. Quotes are otherwise verbatim from the raw page text or `pdftotext` output.

### h100-sxm5-80gb (NVIDIA H100 SXM)
- Dense tensor figures come directly from the Hopper whitepaper V1.04, Table 3. That table prints each figure as "dense/sparse", with the footnote "Effective TOPS / TFLOPS using the Sparsity feature". The product page prints only the sparse figures (for example "1,979 teraFLOPS" BF16, "* With sparsity"), so this record does not need a divide-by-two step.
- Rounding differences: the page gives FP64 34, FP64 Tensor 67, and FP32 67 TFLOPS. The whitepaper gives 33.5, 66.9, and 66.9. The record uses the whitepaper values.
- Bandwidth: the page gives 3.35TB/s. The whitepaper gives 3352 GB/sec and marks it "Not Finalized for H100". The record uses the page value.
- FP64 and FP64 Tensor Core are separate figures on Hopper (34 and 67 TFLOPS).
- NVLink: the page gives "900GB/s", and the whitepaper calls it "900 GB/sec total bandwidth" (18 links at 25 GB/sec in each direction). The per-direction value of 450 GB/s is derived as 900 / 2.
- Reported memory: 81559 MiB. Source: the nvidia-smi sample output in NVIDIA's MIG User Guide, Release 615.
- The current NVIDIA H100 datasheet PDF (resources.nvidia.com, asset mfj81...) returned HTTP 403 to both curl and WebFetch, so the product page and the whitepaper replace it.

### h100-sxm5-94gb
- Only one NVIDIA source documents this variant: the MIG User Guide "Supported GPUs" table, row "H100-SXM5 | Hopper | GH100 | 9.0 | 94GB | 7". The guide also says "the supported profiles on the H100 94GB product (PCIe and SXM5)".
- No NVIDIA datasheet or product page gives its bandwidth, compute, or power, so every one of those fields is TBD. The H100 NVL (94 GB, PCIe) values must not be copied into this record.

### h100-pcie-80gb (NVIDIA H100 PCIe)
- The H100 product page no longer lists the PCIe card; its two columns are H100 SXM and H100 NVL. Sources for this record:
  - Product brief PB-11133-001_v02 (November 2022): memory, bus width, bandwidth, power, and NVLink.
  - Whitepaper V1.04, Table 3, PCIe column: dense compute.
- Bandwidth conflict: the brief gives 2,000 GB/s and the whitepaper gives 2039 GB/sec ("Not Finalized"). The record uses the brief value.
- NVLink conflict inside the brief: Table 6 gives "Total maximum NVLink bandwidth | 600 Gbytes per second", and the overview says three bridges "deliver 900 GB/s bidirectional bandwidth". The record uses the Table 6 value. No per-direction value is derived.
- Power: 350 W maximum in the 450 W or 600 W cable mode, and 310 W in the 300 W cable mode. The reported-memory sample (cudf issue 12867) shows a 310 W cap.
- Reported memory: 81559 MiB (secondary source, GitHub).

### h100-nvl-94gb (NVIDIA H100 NVL)
- Dense tensor values are derived as sparse / 2. The product page footnote says only "* With sparsity" and does not state the factor. The factor 2 is the Hopper ratio that the whitepaper's dense/sparse pairs show. This inference is stated in each derived field.
- Bandwidth: the brief gives 3,938 GB/s and the page gives 3.9TB/s (rounded). Bus width: 6,016 bits (brief).
- NVLink: the brief says "600 GB/s bidirectional", so the per-direction value of 300 GB/s is derived.
- Power: the page gives "350-400W (configurable)"; the record uses the maximum, 400 W.
- Reported memory: 95830 MiB (secondary source, gpu-burn issue 141).

### h200-sxm-141gb and h200-nvl-141gb
- Both the page and the datasheet carry the footnote "Preliminary specifications. May be subject to change."
- The dense values are derived as sparse / 2. The footnote reads "With sparsity." and does not state the factor (same reasoning as H100 NVL).
- The INT8 unit is printed as "TFLOPS" on both the page and the datasheet. The records use TOPS and note the misprint.
- Bus width is TBD. The page links an H200 NVL product brief (PB-12128-001_v01, April 2025) that is stamped "NVIDIA CONFIDENTIAL | PREPARED AND PROVIDED UNDER NDA". It was not used as a source, even though it is reachable from the public page.
- H200 NVL NVLink is written as "900GB/s per GPU" over a 2- or 4-way bridge. Its direction is not stated, so no per-direction value is derived.
- The HGX H100/H200 datasheet prints "GPU Aggregate Bandwidth 19GB/s / 38GB/s / 13GB/s / 27GB/s". These are misprints for TB/s. They are not used.
- Reported memory, H200 SXM: 143771 MiB (secondary source, NVIDIA/nccl-tests issue 363, 700 W board). No public H200 NVL sample was found.

### b200-sxm-180gb (HGX B200 / DGX B200)
- Per-GPU values come from the Blackwell datasheet (PDF metadata 2025-10-28), HGX B200 column. Every tensor row carries footnote 2: "Specifications in sparse. Dense is one-half of the sparse spec shown." The dense values (FP4 9, FP8/FP6 4.5, FP16/BF16 2.25, TF32 1.1 PFLOPS; INT8 4.5 POPS) are therefore sparse / 2.
- Memory conflict:
  - Blackwell datasheet: 180 GB, 7.7 TB/s.
  - DGX B200 datasheet and page: "1,440 GB total, 64 TB/s" for 8 GPUs, which is 8 TB/s per GPU.
  - Technical brief V2.1: "Up to 192 GB HBM3e | 7.7 TB/s".
  - MIG guide: 180GB.
  The record uses the datasheet values: 180 GB and 7.7 TB/s.
- FP64 and FP64 Tensor Core share one figure (37 TFLOPS).
- Power: "Configurable up to 1,000 W". The technical brief says "Each GPU is configurable up to 1000 Watts per GPU". NVIDIA documents no other B200 power or memory SKU.
- Reported memory: 183359 MiB (secondary source, Modal GPU Glossary).

### gb200-nvl72-gpu-186gb and gb200-nvl4-gpu-186gb
- Values are per GPU, from the "Individual Blackwell GPU Specifications" columns of the Blackwell datasheet. The NVL72 and NVL4 columns are identical.
- Per-GPU and per-superchip figures differ. The GB200 NVL72 product page gives per-superchip figures for 1 Grace CPU and 2 GPUs: "372 GB HBM3E | 16 TB/s", "NVFP4 ... 40 | 20 PFLOPS", and "FP64 / FP64 Tensor Core | 80 TFLOPS". Each is two times the per-GPU value. The record never divides these figures; it takes the datasheet per-GPU column.
- Rack HBM total conflict: the product page and the DGX GB200 datasheet give "13.4 TB". The Blackwell datasheet says "Supports up to 13.5 TB of HBM3E", and the technical brief says "13.5 TB". 72 x 186 GB = 13.39 TB.
- The 1.8 TB/s NVLink is bidirectional per the DGX GB200 datasheet. The technical brief states the per-direction value: "1.8 TB/sec total bandwidth, 900 GB/sec in each direction".
- The PCIe Gen5 row is one datasheet row that spans all three columns. In a GB200 the GPU reaches the Grace CPU over NVLink-C2C.
- The GB200 NVL4 product page returned "Page Not Found" on 2026-10-18.
- Reported memory, GB200: 189471 MiB (secondary source, vLLM issue 24272, 1200 W cap).

### b300-sxm-270gb (HGX B300 / DGX B300)
- Source: the Blackwell Ultra datasheet (PDF metadata 2025-10-02), HGX B300 column.
- FP4 is printed as "18 PFLOPS | 14 PFLOPS" (sparse | dense), so the dense value of 14 is taken directly. The other tensor rows follow "Dense is ½ sparse spec shown" and are halved.
- B300 FP64 reduction: FP64 and FP64 Tensor Core are 1.2 TFLOPS, against 37 TFLOPS on B200. The HGX page prints "FP64 / FP64 Tensor Core | 10 TFLOPS" for 8 GPUs.
- INT8 conflict: the datasheet gives 307 TOPS sparse per GPU (153.5 dense), and the technical brief gives "0.15/ 0.30 petaOPS". The HGX page gives "3 POPS" for 8 GPUs, which does not match 8 x 307 TOPS. The record uses the datasheet value. INT8 drops sharply against B200 (9 POPS sparse).
- The datasheet misprints the FP16/BF16 unit as "4.5 PLFOPS".
- PCIe: Gen6, 256 GB/s. Power: configurable up to 1,100 W.
- The HGX page names the GPU "Blackwell Ultra SXM". NVIDIA has no standalone "B300" product page. Driver strings in GitHub issues read "NVIDIA B300 SXM6 AC". No public nvidia-smi memory total was found, so reported memory is omitted.

### gb300-nvl72-gpu-279gb
- Source: the Blackwell Ultra datasheet, GB300 NVL72 column. Values: FP4 "20 PFLOPS|15 PFLOPS" (dense 15), FP64 1.3 TFLOPS, 279 GB, 8 TB/s, configurable up to 1,400 W.
- The PCIe Gen6 row spans both datasheet columns. On a GB300 the host link is NVLink-C2C to Grace.
- Rack totals on the GB300 page: "20 TB | Up to 576 TB/s" and "INT8 Tensor Core | 24 POPS". These agree with 72 x 330 TOPS = 23.8 POPS.

### gb300-dgx-station-252gb
- This is the desktop flavor of Blackwell Ultra. The DGX Station page and the MIG guide ("GB300 (DGX Station) ... GB110 ... 252GB") both give 252 GB and 7.1 TB/s.
- FP4 dense is 15 PFLOPS (footnote 3: "Without sparsity."). The other tensor rows fall under "All Tensor Core specifications are with sparsity unless otherwise noted.", so the records halve them.
- No GPU power figure is published. The page gives only "Total System Power | 1,600 W", so maxPowerW is TBD.
- The DGX Station has one GPU, so it has no GPU-to-GPU link. Its CPU-to-GPU link is NVLink-C2C at 900 GB/s.

### Values not sourced (TBD)
- h100-sxm5-94gb: memory type, bandwidth, bus width, all compute values, NVLink, PCIe, and power.
- h200-sxm-141gb and h200-nvl-141gb: bus width.
- b200, gb200 (both), b300, gb300 (both): bus width.
- gb300-dgx-station-252gb: PCIe host interface and GPU power.
- Reported memory is omitted for H100 SXM5 94GB, H200 NVL, GB200 NVL4, B300, GB300 NVL72, and DGX Station.

## AMD Instinct

Retrieved 2026-10-18. Source ids refer to the `sources` list in `data/gpus.json`.

### Method

- Spec values come from amd.com product pages, AMD data sheets (newest revision on amd.com), and the CDNA 3 and CDNA 4 white papers. The ROCm precision page supports only data type support and the FP8 encoding.
- The PDF spec tables come out of `pdftotext` in scrambled column order. Each row mapping for MI350X, MI355X, MI350P and MI455X was checked against a rendered image of the data sheet page. Quotes for table cells give the row label and its cells as the rendered table shows them: dense first, then sparsity.
- Every compute value is dense and was read directly. No value is derived from a sparsity figure. The only derived values are `gpuLinkPerDirection` (bidirectional / 2), each with a formula.
- For CDNA 3 parts, the TFLOPS figures come from AMD footnotes that state the clock: MI300-18 (MI300X, 750 W, 2,100 MHz peak boost engine clock) and MI325-008 (MI325X, 1000 W, 2,100 MHz). The spec tables on the product pages round these figures (for example 1307.4 TFLOPS shows as "1.3 PFLOPs").
- `memory.reported` is left out of every record. No AMD or public source found during this pass gives the capacity that rocm-smi or PyTorch reports.

### OCP FP8 and FNUZ

- CDNA 3 (MI300X, MI300A, MI325X): the CDNA 3 white paper says the compute units "support the two variants of the FP8 data type as defined in the OCP 8-bit Floating Point Specification". The ROCm precision page (amd-rocm-precision, ROCm 10.1.0) says "CDNA3 natively supports FP8 FNUZ (E4M3 and E5M2)". The HIP low precision types page adds "On a gfx94x GPU, the type will default to the fnuz type." The AMD sources disagree. In practice, the native CDNA 3 encoding is FNUZ, not OCP.
- CDNA 4 (MI350X, MI355X, MI350P): the product pages and data sheets name the format "OCP-FP8" (E5M2, E4M3), and MXFP8 is listed separately at the same dense rate.
- CDNA 5 (MI455X): the data sheet names "OCP FP8" and the "OCP MX" formats.

### Per GPU

#### mi300x-oam-192gb (AMD Instinct MI300X)

- Conflict, link count: the data sheet says "7x 128 GB/s" and "seven AMD Infinity Fabric links". The product page says "Infinity Fabric™ Links 8". CDNA 4 white paper footnote MI350-007 also says "up to eight AMD Infinity Fabric links providing up to 896 GB/s". The CDNA 3 white paper explains the difference: each of the four IODs has two links, and one link "can be configured to act as a x16 PCIe Gen 5". Seven links carry peer-to-peer traffic (7 x 128 = 896 GB/s). The record uses 7.
- Per-link 128 GB/s is bidirectional ("direct connectivity of 128 GB/s bidirectional bandwidth between each GPU", data sheet). The 896 GB/s aggregate is labeled bidirectional on the MI300X Platform page. The 448 GB/s per direction is derived.
- Power: the data sheet says "Maximum TBP 750W". The product page says "Typical Board Power (TBP) 750W Peak". The values agree, but the labels differ ("Maximum" against "Typical").
- Memory clock: the data sheet says "Up to 5.2 GT/s". The product page says "Memory Clock 5.2 GHz". The unit labels differ.
- Memory capacity: the data sheet says "Up to 192 GB HBM3". The product page says "192 GB".
- The bandwidth is "5.3 TB/s" on both. Footnote MI300-05A gives 5.325 TB/s. The record keeps 5.3 as written.
- The data sheet's decoder line says "V1, or AV1" (a typo for VP9 in the PDF). It does not affect any field.
- The data sheet is undated. The PDF metadata date is 2025-06-16. The copyright reads 2025, and there is no revision code.
- Platform: the AMD Instinct MI300X Platform is 8 GPUs on UBB 2.0, with 1.5 TB HBM3 in total. The platform data sheet is dated 2023-12-05 (PDF metadata). The record is per GPU.
- TBD: none.

#### mi300a-sh5-128gb (AMD Instinct MI300A)

- MI300A is a variant of the same CDNA 3 family as MI300X. AMD's CDNA 3 white paper describes the MI300X, MI325X and MI300A as variants built from the same chiplets. MI300A uses the SH5 socket, six XCDs (228 CUs) instead of eight, adds three Zen 4 CCDs (24 cores), and has 128 GB of HBM3 that the CPU and GPU share as unified, coherent memory. Its power is a socket TDP for the whole APU, not a GPU board power.
- Power is a range: "550W (air & liquid cooling)" and "760W (liquid cooling)" (data sheet). The product page says "550W | 760W Peak". The record uses maxPowerW = 760 and quotes the range. AMD does not say which power level the published TFLOPS assume. CDNA 3 white paper footnote MI300-14 uses "MI300A APU accelerator 760W" for its memory claim.
- Conflict, link count: the product page says "Infinity Fabric™ Links 8" and "Bus Type PCIe® 5.0 x16". The data sheet splits these into "Scale-up Infinity Fabric Links 4 x16 (128 GB/s)" and "Scale-out assignable PCIe Gen 5 or Infinity Fabric Links 4 x16 (128 GB/s)". The record uses 8 and notes the split.
- Link bandwidth: the "1 TB/s of bidirectional connectivity" counts all eight interfaces, including the four that may be PCIe. Peer-to-peer in a typical 4-APU node is 384 GB/s per APU (data sheet; CDNA 3 white paper Table 2 "384 GB/S (4 APUs)"). The CDNA 3 white paper prose also says each processor connects to each peer "using two AMD Infinity Fabric links with 256GB/s of bandwidth".
- The dense AI values come from CDNA 3 white paper Table 2 (MI300A column, dense value left of the pipe). They match the data sheet's dense column (490.3, 980.6, 980.6, 1961.2, 1961.2) and the product page rows (rounded to 1.96 PFLOPs for FP8).
- The fp6Tensor and fp4Tensor values are not-supported, cited from the ROCm matrix core support table. That table marks float4 and float6 as unsupported on CDNA3, which the page defines as including MI300A.
- The data sheet decoder line also says "V1, or AV1".
- TBD: none.

#### mi325x-oam-256gb (AMD Instinct MI325X)

- The PDF metadata title of the MI325X data sheet reads "AMD Instinct MI300X Accelerator". This is a metadata error, because the printed title is "AMD INSTINCT MI325X ACCELERATOR". The file lives under `product-briefs/` instead of `data-sheets/`.
- Conflict, link count: the data sheet says "7x 128 GB/s", and the product page says "Infinity Fabric™ Links 8". The explanation is the same as for MI300X.
- Clock: footnote MI325-008 states 1000 W and 2,100 MHz for FP64, FP32, TF32 and FP16. Footnote MI325-002 gives BF16, FP8 and INT8 with no clock stated. The values are identical to MI300X: same CUs and same clock.
- Power: the data sheet says "Maximum TBP 1000W". The product page says "Typical Board Power (TBP) 1000W Peak".
- Platform: the MI325X Platform page lists 8x MI325X with 2.048 TB HBM3E in total and per-GPU "Total Aggregate Bi-directional I/O Bandwidth (Peer-to-Peer) 896 GB/s". The record is per GPU. The platform data sheet PDF (`instinct-mi325x-platform-datasheet.pdf`) is linked from the platform page but was not downloaded. The platform page was enough to support the one link value.
- TBD: none.

#### mi350x-oam-288gb (AMD Instinct MI350X)

- Conflict, link bandwidth: the data sheet says "7x 153.6 GB/s". The product page rounds to "153 GB/s". The data sheet prose says "160 GB/s bidirectional bandwidth between each GPU", and the platform brochure says "153.6 GB/s bidirectional links". The CDNA 4 white paper gives 38.4 Gbps links at "76.8GB/s in each direction" (2 x 76.8 = 153.6). The record uses 153.6 per link. The 160 GB/s prose figure is treated as an inconsistency in the AMD document.
- Aggregate peer-to-peer: "1075.2 GB/S (8 GPUs)" (CDNA 4 white paper Table 2) and "up to 1,075.2 GB/s peak aggregate peer-to-peer (P2P)" (footnote MI350-007). Total I/O including the PCIe link is "1,203.2 GB/s". MI350-007 says "up to eight AMD Infinity Fabric links": seven are peer-to-peer, and one is PCIe Gen 5 to the host.
- TF32: CDNA 4 removed TF32 from hardware ("moved out of hardware and is supported through software emulation utilizing the BF16 datatype"). No AMD MI350 page lists TF32. The ROCm matrix core table marks tensorfloat32 as supported on CDNA4, but ROCm defines "full support" to include emulation. The record uses not-supported, because there is no native TF32 hardware path.
- FP6 and FP4: AMD publishes only MXFP6 and MXFP4 (OCP MX block-scaled) rates. These are recorded in fp6Tensor and fp4Tensor. Footnote MI350-009A and the white paper also name plain "FP6" and "FP4" ("3.9x greater peak performance using the new industry-standard reduced precision FP4 or FP6 datatypes"), but give no separate figure. The white paper treats them as the same rate as MXFP6 and MXFP4.
- FP16 vector (144.2 TFLOPS) appears both on the product page ("Peak Half Precision (FP16) Performance 144.2 TFLOPs") and in the data sheet. It is not the matrix figure. fp16Tensor uses the matrix row.
- Cooling: the product page says "Cooling Passive OAM". The CDNA 4 white paper Table 2 says "Passive/Liquid" for MI350X and also shows an "MI350X DLC RACK".
- Rounding: the product page shows 2.3, 4.6 and 9.2 PFLOPs. The data sheet shows 2.3096, 4.614 and 9.2275 (dense). The OCP-FP8 sparsity figure is 9.2274, against 9.2275 for MXFP4 dense: AMD rounds the two differently.
- TBD: none.

#### mi355x-oam-288gb (AMD Instinct MI355X)

- Power: 1400 W is the liquid-cooled rating. The MI355X Platform brochure says: "While an air-cooled option is available, the direct liquid cooling option enables AMD Instinct MI355X GPUs to consume up to 1400W." AMD publishes no TBP for an air-cooled MI355X. The CDNA 4 white paper calls MI355X "1400W DLC".
- Cooling: the product page says "Cooling Passive & Active". The CDNA 4 white paper Table 2 says "Passive/Liquid". The data sheet image shows cold-plate modules.
- The product page has no Memory Interface or Memory Clock row. The bus width comes from the data sheet ("8192 bits") and agrees with the white paper ("1024-bits x 8 Stacks HBM3E").
- The link conflict is the same as for MI350X: the data sheet prose says "160 GB/s bidirectional", while the tables and the platform brochure say 153.6 GB/s.
- CDNA 4 white paper Table 1 lists MI355X MXFP6 and MXFP4 at "16834" FLOPS/clock/CU. The value should be 16384 (2 x 8192), so this is an AMD typo. It does not affect a recorded field.
- The white paper Table 1 rounds MXFP6 and MXFP4 to "10 PF". The data sheet gives 10.0663.
- Clock: 2400 MHz (product page "Peak Engine Clock 2400 MHz"; data sheet "2.4 GHz"). The MI350 footnotes on the product page (MI350-009A, MI350-019) do not state a clock.
- TBD: none in the record. The air-cooled TBP is not published (see above).

#### mi350p-pcie-144gb (AMD Instinct MI350P)

- This is a PCIe card that AMD documents publicly with a spec page and a product brochure (LE-93401-00 05/26). It is half of an MI350X: 4 XCDs, 128 CUs, 144 GB HBM3E, 4096-bit, 4 TB/s, and 2200 MHz.
- Every brochure compute figure is labeled "(ESTIMATED)". The first table is headed "HPC PEAK PERFORMANCE (ESTIMATED)" but holds the AI rows (an AMD heading error). The MXFP4 label reads "MXFP4 (TFLOPS", missing its closing parenthesis.
- Power: the brochure says "600W (configurable to 450W)". The product page says "600W TBP (Max); 450W TBP configurable", and the brochure prose says "TDP can be reduced from 600W to 450W". The record uses 600 W.
- The product page lists no launch date. Partner quotes on the MI350 Series page describe support as in progress ("We're working with AMD to support AMD Instinct MI350P"). The brochure is a product brochure, filed under `epyc-business-docs`, not a data sheet. Its SR-IOV line reads "Future SR-IOV support for up to four partitions".
- TBD: gpuLink and infinityFabricLinks. AMD lists no GPU-to-GPU fabric for this card. The only I/O listed is "1 PCIe Gen 5 x16 (128 GB/s)".

#### mi455x-eam-432gb (AMD Instinct MI455X)

- Inclusion decision: the brief excludes MI400 parts "unless AMD has a shipped datasheet". The MI455X has an AMD data sheet (footer "DATASHEET: AMD INSTINCT MI455X GPU", LE-93204-00 07/26) and a product page with "Launch Date 7/23/2026". The MI400 Series page says Helios "volume deployments expected in 2H 2026", and the data sheet says OCI plans to deploy MI455X "beginning in 2026". Volume shipment is not confirmed in an AMD source. If the dataset needs confirmed volume shipment, drop this record.
- Form factor: "Enhanced Accelerator Module (EAM)", liquid cooled, four per compute tray, 72 per Helios rack. It is not OAM.
- FP64 is 5 TFLOPS, vector and matrix, as written in both the data sheet and the product page. This is a large drop from MI355X (78.6). AMD positions the MI430X as the FP64 part.
- FP8 dense (20133 TFLOPS) is four times FP16 dense (5033), and no FP8 sparsity figure is published. Both points are as written.
- INT8 unit: the data sheet column header says "TFLOPS" for every row, including MATRIX INT8. The product page says "5 POPs". The record uses TOPS.
- TF32 is TBD. AMD does not list it and does not say whether CDNA 5 supports it.
- The bus width is TBD. AMD gives "Stacks of Memory 12" but no interface width.
- maxPowerW is TBD. Neither the data sheet nor the product page lists power.
- Infinity Fabric links are TBD. Scale-up uses UALoE, "3.6 TB/s" bidirectional. Scale-out uses UALink, "600 GB/s" bidirectional.
- PCIe is TBD. The CPU to GPU link is "256 GB/s" over Infinity Fabric to the EPYC "Venice" CPU, and no PCIe generation is named.
- The product page lists "L2 Cache 192 MB" and does not list an Infinity Cache row.

### Conflicts between AMD sources (summary)

| Part | Field | Source A | Source B |
|---|---|---|---|
| MI300X | Infinity Fabric links | data sheet: 7x 128 GB/s | product page: 8 |
| MI325X | Infinity Fabric links | data sheet: 7x 128 GB/s | product page: 8 |
| MI300A | Infinity Fabric links | data sheet: 4 x16 + 4 x16 assignable | product page: 8 |
| MI300X, MI325X | Power label | data sheet: Maximum TBP | product page: Typical Board Power ... Peak |
| MI300X, MI300A, MI325X | FP8 encoding | CDNA 3 white paper: OCP FP8 variants | ROCm docs: CDNA3 natively FNUZ |
| MI350X, MI355X | Per-GPU link bandwidth | tables: 153.6 GB/s per link | data sheet prose: 160 GB/s bidirectional |
| MI350X, MI355X | Per-link bandwidth rounding | data sheet: 153.6 GB/s | product page: 153 GB/s |
| MI350X | Cooling | product page: Passive OAM | CDNA 4 white paper: Passive/Liquid |
| MI355X | Cooling | product page: Passive & Active | CDNA 4 white paper: Passive/Liquid |
| MI355X | MXFP6 FLOPS/clock/CU | white paper: 16834 | arithmetic of the same table: 16384 |
| MI350X, MI355X, MI350P | TF32 | CDNA 4 white paper: removed from hardware, emulated with BF16 | ROCm matrix core table: CDNA4 tensorfloat32 supported (includes emulation) |
| MI325X | Document title | printed: MI325X | PDF metadata: MI300X |
| MI455X | INT8 unit | data sheet header: TFLOPS | product page: POPs |

### Every TBD

| Record | Field | Reason |
|---|---|---|
| mi350p-pcie-144gb | interconnect.gpuLink | no GPU-to-GPU fabric bandwidth listed |
| mi350p-pcie-144gb | interconnect.infinityFabricLinks | no Infinity Fabric link count listed |
| mi455x-eam-432gb | memory.busWidth | only "Stacks of Memory 12", no interface width |
| mi455x-eam-432gb | compute.tf32Tensor | no TF32 figure or support statement |
| mi455x-eam-432gb | interconnect.infinityFabricLinks | scale-up is UALoE; no Infinity Fabric link count |
| mi455x-eam-432gb | interconnect.pcie | CPU to GPU is 256 GB/s Infinity Fabric; no PCIe generation named |
| mi455x-eam-432gb | maxPowerW | no power figure published |

Not-supported fields (not TBD): fp6Tensor and fp4Tensor on MI300X, MI300A and MI325X; tf32Tensor on MI350X, MI355X and MI350P.

## NVIDIA data center: A series, V100, T4, L4, L40, L40S

Source prefix `dc-`. Segment `datacenter`. Retrieved 2026-10-18.

20 records: A2, A10, A16, A30, A40, A100 (40 GB PCIe, 80 GB PCIe, 40 GB SXM4, 80 GB SXM4), V100 (PCIe 16 GB, PCIe 32 GB, SXM2 16 GB, SXM2 32 GB, SXM3 32 GB, FHHL), V100S PCIe 32 GB, T4, L4, L40, L40S.

Field counts (every cited object, including name, form factor, architecture and derived per-direction link values): 267 sourced, 35 TBD, 102 not-supported.

### Conventions used in this slice

- Every citation is an NVIDIA document: datasheet, product brief, product page, architecture whitepaper, NVIDIA docs page or NVIDIA technical blog. No third-party value is cited.
- Quotes come from `pdftotext` or the HTML text stripper. Trademark symbols (registered, TM) that extract as replacement characters are dropped. Superscript footnote markers are dropped or written as `(1)`; the footnote text is given in the field note.
- Where a datasheet prints several product columns on one row, the quote keeps the row in column order and the note names the column used.
- NVIDIA sometimes writes `TF` (A2, A30, A10 datasheets) or `teraFLOPS`; the unit is stored as `TFLOPS` and the quote keeps NVIDIA's text.
- `memory.reported` (driver-reported MiB) is omitted in every record. No NVIDIA document or vLLM / PyTorch issue was checked and cited for these cards in this pass. The GPUDirect Storage guide shows `nvidia-smi` output for V100 SXM3 but only names and PCI IDs, no memory.
- Dense tensor values: every datasheet in this slice except L4 prints dense and sparse together (`dense | sparse*`), so dense values are taken directly. For L4, the Ada whitepaper V2.02 prints dense values directly, so no sparse/2 derivation was needed. No record uses `derivedFromSparse`.
- Derived link values: only `bidirectional / 2`, and only where NVIDIA writes "bidirectional" or "Bi-Directional": A40, V100 SXM2 (both), V100 SXM3.

### Per GPU

#### A2 (`a2-pcie-16gb`)
- TDP is a configurable range: datasheet `40-60W (Configurable)`; stored 60. The product page writes the range with an en dash character; the datasheet uses a hyphen.
- TBD: `fp64` (no NVIDIA figure; GA102 whitepaper gives a 1/64 ratio for GA10x and nothing per card).
- `fp64Tensor` not-supported is cited to the GA102 whitepaper statement on GA10x GPUs. A2 uses a smaller GA10x die; NVIDIA's A2 documents do not name the die. The GA10x statement is family-wide.
- NVLink not-supported is inferred from the interconnect row, which lists only `PCIe Gen4 x8`. NVIDIA does not write "no NVLink" for A2.

#### A10 (`a10-pcie-24gb`)
- Conflict, outside schema fields: datasheet (Mar21) `Encode / Decode 1 encoder 1 decoder (+AV1 decode)`; product page `1 encoder 2 decoder (+AV1 decode)`.
- TBD: `fp64`.
- NVLink not-supported inferred from `Interconnect PCIe Gen4: 64 GB/s`.

#### A16 (`a16-pcie-4x16gb`)
- Quad-GPU board. NVIDIA writes per-GPU values with `4x`. The record stores per-GPU memory, bandwidth, bus width and compute; `maxPowerW` 250 W is the whole board.
- Capacity: datasheet `4x 16 GB GDDR6`; product brief `64 GB (16 GB per GPU)`; product page `4x 16GB GDDR6 with error-correcting code (ECC)`. Consistent.
- Date ambiguity: datasheet page header `Feb22`, footer `OCT21`.
- TBD: `fp64`, `bf16Tensor` (the A16 datasheet lists FP32, TF32, FP16 and INT8 only).

#### A30 (`a30-pcie-24gb`)
- Date ambiguity: datasheet footer `MAR22`, one page header `APR21`.
- NVLink 200 GB/s is not labeled bidirectional by NVIDIA. The product brief gives `Data rate per NVIDIA A30 NVLink lane (each direction) 50 Gbps` and `Total Maximum NVLink Bandwidth 200 GB/s`. No per-direction value is stored because the rules allow `/2` only when NVIDIA writes "bidirectional".
- No TBD fields.

#### A40 (`a40-pcie-48gb`)
- Unit conflict: product brief PB-09976-001_v08 writes `Memory size 48 GiB` and `Peak memory bandwidth Up to 696 GiB/s`; datasheet and product page write `48 GB` and `696 GB/s`. The datasheet is cited.
- FP16 Tensor is stated `with FP16 Accumulate`; BF16 is stated `with FP32 Accumulate`. Both 149.7 dense.
- NVLink: datasheet and product page `NVIDIA NVLink 112.5 GB/s (bidirectional)`; product brief Table 7 `Total maximum NVLink bandwidth (bi-directional) 112.5 GB/s`. Per direction 56.25 derived. Generation "NVLink 3" from the GA102 whitepaper.
- TBD: `fp64`.

#### A100 (four records)
- The Jun21 datasheet (`nvidia-a100-datasheet-us-nvidia-1758950-r4`) is the revision that lists all four variants. The newer May22 datasheet (`2188504`) lists only the 80GB PCIe and 80GB SXM columns, with identical numbers; the 80GB records cite it as the newest.
- Bandwidth revisions:
  - A100 40GB (PCIe and SXM): the Jun20 launch datasheet writes `Memory Bandwidth 1.6 TB/sec`; the Jun21 datasheet and the Ampere whitepaper write `1,555GB/s` / `1555 GB/sec`; the PCIe 40GB product brief writes `Up to 1555 GB/s`. 1,555 is stored.
  - A100 80GB PCIe: Jun21 and May22 datasheets and the current product page all write `1,935GB/s`. The product brief PB-10577-001_v03 writes `Up to 1.94 TB/s` (rounded). No NVIDIA source was found that lists 1,555 GB/s for the 80GB PCIe card; 1,555 GB/s is the 40GB figure.
  - A100 80GB SXM: `2,039GB/s` in both datasheets and the product page.
- Power: 40GB PCIe 250 W, 80GB PCIe 300 W, SXM 400 W. The 80GB SXM footnote: `400W TDP for standard configuration. HGX A100-80GB CTS (Custom Thermal Solution) SKU can support TDPs up to 500W`. Stored 400.
- NVLink 600 GB/s is not labeled bidirectional in these datasheets. The Ampere whitepaper says each link gives `25 GB/second bandwidth in each direction` over twelve links for `600 GB/sec total bandwidth`. Per the rules, no per-direction value is stored.
- The 80GB PCIe product brief at the URL ending `PB-10577-001_v02.pdf` contains revision `_v03` (March 2022).
- Form factor: datasheet columns say `PCIe` and `SXM`; the table header says `SXM4 AND PCIE FORM FACTORS`. The 80GB PCIe card ships `dual-slot air cooled or single-slot liquid cooled`; one record covers both cooling options.
- TBD: `a100-sxm4-80gb` `busWidth`. The 5120-bit figure is stated for the A100 SXM4 40GB (whitepaper Table 1) and for both PCIe cards (product briefs), not for the 80GB SXM board.

#### V100 (six records) and V100S
- Main datasheet: `volta-v100-datasheet-update-us-1165301-r5` (Jan20) with columns V100 PCIe, V100 SXM2, V100S PCIe. An identical Dec19 copy exists at `tesla-volta-v100-datasheet.pdf`; the Mar18 `tesla-volta-v100-datasheet-letter-fnl-web.pdf` covers only Tesla V100 PCIe and SXM2. Same values.
- Boost: NVIDIA's figures are peak rates "with NVIDIA GPU Boost" (product page header). The PCIe card (7 / 14 / 112 TFLOPS) runs at a lower power limit than SXM2 (7.8 / 15.7 / 125). V100S PCIe (8.2 / 16.4 / 130) has higher clocks and 1,134 GB/s memory. NVIDIA publishes no clock-for-clock breakdown in these sources, and no value was computed.
- `fp16Tensor` is NVIDIA's single "Tensor Performance" figure (product page: "Deep Learning"). The Ampere whitepaper Table 1 shows 125 for V100 FP16 Tensor with both FP16 and FP32 accumulate.
- 16 GB and 32 GB variants of PCIe and SXM2 share every published value except capacity (`GPU Memory 32 GB /16 GB HBM2`).
- Product page conflict: the memory row on the V100 page has a merged cell `32/16 GB HBM2, 900 GB/s`, a V100S cell `32 GB HBM2, 1134 GB/s`, and an extra cell `16 GB HBM2, 900 GB/s` in the column class used for "V100 for PCIe". The power row shows only `300 WATTS` and `250 WATTS`. The datasheet is unambiguous and is cited.
- Product page URL: the canonical `https://www.nvidia.com/en-us/data-center/v100/` redirects to the data center home page when fetched; `https://www.nvidia.com/en-us/data-center/v100./` serves the page.
- NVLink (SXM2): product page `Bi-Directional NVLink 300 GB/s`, per direction 150 derived. The Volta whitepaper agrees: six links, `Each link now provides 25 Gigabytes/second in each direction`.
- Names come from the NVIDIA vGPU 13 user guide supported-GPU list: `Tesla V100 SXM2`, `Tesla V100 SXM2 32GB`, `Tesla V100 PCIe`, `Tesla V100 PCIe 32GB`, `Tesla V100S PCIe 32GB`, `Tesla V100 FHHL`.
- Bus width: the Ampere whitepaper Table 1 states `4096-bit HBM2` for the Tesla V100 column (SXM2, 16 or 32 GB), so the SXM2 records carry 4096. The Volta whitepaper states `Eight 512-bit memory controllers (4096 bits total)` for the GV100 chip only. TBD for PCIe 16/32 GB, V100S, SXM3 and FHHL.
- TBD per record: `v100-pcie-16gb` busWidth; `v100-pcie-32gb` busWidth; `v100s-pcie-32gb` busWidth.

##### V100 SXM3 32 GB (`v100-sxm3-32gb`)
- NVIDIA publishes no SXM3 datasheet. Existence and name come from NVIDIA docs: the GPUDirect Storage guide prints `nvidia-smi` and `lspci` output from a DGX-2 (`Tesla V100-SXM3-32GB`, `GV100GL [Tesla V100 SXM3 32GB]`). The NVSwitch blog and the DGX-2 datasheet describe 16 `Tesla V100 32 GB` GPUs in DGX-2.
- The NVSwitch blog page carries an AI-generated summary at its top; quotes are taken from the article body only.
- The DGX-2 datasheet gives system figures only (`Performance 2 petaFLOPS`, `GPU Memory 512GB total`, `Maximum Power Usage 10kW`). Dividing system figures by 16 is not allowed.
- TBD (7): bandwidth, busWidth, fp64, fp32, fp16Tensor, pcie, maxPowerW. Third-party sources list 350 W for this module; not citable.

##### V100 FHHL (`v100-fhhl`)
- NVIDIA documents `Tesla V100 FHHL` by name in the vGPU 13 user guide (supported GPUs, `Physical GPUs per board: 1`, vGPU profiles up to `V100L-16Q` with a 16384 MB frame buffer). No NVIDIA datasheet or product brief was found.
- The 16384 MB vGPU frame buffer is a vGPU profile size, not a board capacity statement, so capacity is TBD.
- TBD (10): capacity, type, bandwidth, busWidth, fp64, fp32, fp16Tensor, gpuLink, pcie, maxPowerW. Third-party listings disagree on power (150 W vs 250 W).

#### T4 (`t4-pcie-16gb`)
- Bandwidth conflict: datasheet (Mar19) `300 GB/sec`; product brief PB-09256-001_v05 (April 2020) `Up to 320 GBytes/s`; product page `320+ GB/s`; Ada whitepaper Table 5 `320 GB/s`. Stored 320 from the newest engineering document.
- Power: 70 W everywhere (brief `70 W maximum power limit` and `70 W (default)`; page `70 watts`; datasheet text `70-watt (W) design`; Ada whitepaper `70 Watts`). No conflict. The board power is not configurable in the brief.
- Tensor figures are dense: Turing has no structured sparsity. FP16 `Mixed-Precision (FP16/FP32) 65 TFLOPS`. INT8 is printed as `INT8 130 TOPS` without the word Tensor; the Ada whitepaper lists it on its `INT8 Tensor Core Performance` row.
- PCIe: datasheet `x16 PCIe Gen3`; brief `NVIDIA supports x8 and x16 PCI Express for the T4`.
- The datasheet viewer link on the product page (`resources.nvidia.com/c/t4-tensor-core-data-sheet`) redirects to the NVIDIA home page; the PDF was found at a nvidia.com content path.
- TBD: `fp64` (Turing whitepaper gives a 1/32 ratio for TU102 only).

#### L4 (`l4-pcie-24gb`)
- Datasheet (AUG24, 3408215) and product page print sparse values only, with `*Shown with sparsity. Specifications 1/2 lower without sparsity.` The Ada whitepaper V2.02 Appendix D prints dense and sparse together, and its dense values are stored.
- Conflict from rounding: halving the datasheet gives FP8 242.5 TFLOPS and INT8 242.5 TOPS; the whitepaper prints 242 and 242. TF32 (60), BF16 (121) and FP16 (121) agree.
- Datasheet text extraction reads `Partner and NVIDIA-Certified Systems with 18 GPUs`; the product page reads `with 1-8 GPUs` (written there with an en dash). Extraction artifact, not a conflict.
- Power: datasheet `72W`; brief `72 W default`, `72 W maximum`, `40 W minimum`.
- TBD: `fp64`, `fp64Tensor`.

#### L40 (`l40-pcie-48gb`)
- Datasheet (Jan23, 2436245) is marked `Preliminary specifications, subject to change.` A Portuguese edition dated June 2023 (same code 2436245) shows the same values. No later English revision was found.
- Layout trap: in layout mode the datasheet value column shifts one row against the labels. Raw-mode extraction gives the correct pairing: RT 209, FP32 90.5, TF32 90.5 | 181, BF16 181.05 | 362.1, FP16 181.05 | 362.1, FP8 362 | 724, INT8 362 | 724, INT4 724 | 1448. The Ada whitepaper Appendix C confirms (rounded to 181 | 362).
- Product page has no compute rows. It writes `48 GB GDDR6 with ECC` with a space; formatting only.
- TBD: `busWidth`, `fp64`, `fp64Tensor`.

#### L40S (`l40s-pcie-48gb`)
- Citation is the nvidia.com product page specification table. The datasheet viewer `https://resources.nvidia.com/en-us-l40s/l40s-datasheet-28413` (and the related `nvidia-l40s-product` and `proviz-partner-l40s` viewers) answer 302 to the NVIDIA home page on 2026-10-18. A Cisco-hosted copy of the datasheet appears in search results; it is third-party hosting, could not be resolved from this machine, and is not cited.
- FP64: NVIDIA's L40S specification table has no FP64 or FP64 Tensor row. The Ada whitepaper states the AD102 FP64 rate is 1/64 of FP32, but computing a value is not allowed. TBD.
- Page anomaly: the INT8 and INT4 rows both read `733 I 1,466*`. INT4 is normally twice INT8 on Ada (L40: 362 vs 724). INT8 733 is stored; INT4 is outside the schema.
- TBD: `busWidth`, `fp64`, `fp64Tensor`.

#### Why L40 and L40S are separate records
- The Ada whitepaper names AD102 as the L40 die (`GPU Code Name ... AD102`). NVIDIA's L40S page does not name the die, but lists the same 18,176 CUDA cores, 142 RT cores, 568 Tensor cores, 48GB GDDR6 at 864GB/s, the same 4.4 x 10.5 inch dual-slot board, PCIe Gen4 x16 and no NVLink.
- The products differ in published values: max power 300 W vs 350 W; FP32 90.5 vs 91.6; TF32 90.5 vs 183; BF16 and FP16 181.05 vs 362.05; FP8 and INT8 362 vs 733 (all dense). One record per product keeps each value tied to the right SKU.

### Not-supported fields: basis

- FP6 and FP4: no source cited. These formats first appear in Blackwell documentation; no Volta, Turing, Ampere or Ada document lists them.
- FP8 on Ampere, Turing and Volta: Ada whitepaper (`Core introduces support for a new FP8 tensor format`); for A40 and T4 the Ada whitepaper tables print NA directly.
- TF32, BF16, INT8 Tensor and FP64 Tensor on Volta: Ampere whitepaper Table 1, Tesla V100 column, prints NA.
- FP64 Tensor on GA10x (A2, A10, A16, A40): GA102 whitepaper `GA10x GPUs do not include Tensor Core acceleration for double-precision (FP64) operations`.
- FP64 Tensor on T4: cited to the Ampere whitepaper's introduction of `IEEE-compliant FP64 Tensor Core instructions` with A100. This is the weakest not-supported citation in the slice; NVIDIA's T4 documents simply have no FP64 Tensor row.
- NVLink not-supported on A2, A10, A16, T4, L4, V100 PCIe and V100S PCIe is inferred from interconnect rows that list PCIe only. Only the L40 and L40S documents state `NVLink Support No` explicitly.
- FP64 Tensor on Ada (L4, L40, L40S) is TBD, not not-supported: the Ada whitepaper says the FP64 cores exist so `FP64 Tensor Core code` runs correctly, which is not a throughput statement either way.

### Complete TBD list (35)

| Record | TBD fields |
|---|---|
| a2-pcie-16gb | fp64 |
| a10-pcie-24gb | fp64 |
| a16-pcie-4x16gb | fp64, bf16Tensor |
| a40-pcie-48gb | fp64 |
| a100-sxm4-80gb | busWidth |
| v100-pcie-16gb | busWidth |
| v100-pcie-32gb | busWidth |
| v100s-pcie-32gb | busWidth |
| v100-sxm3-32gb | bandwidth, busWidth, fp64, fp32, fp16Tensor, pcie, maxPowerW |
| v100-fhhl | capacity, type, bandwidth, busWidth, fp64, fp32, fp16Tensor, gpuLink, pcie, maxPowerW |
| t4-pcie-16gb | fp64 |
| l4-pcie-24gb | fp64, fp64Tensor |
| l40-pcie-48gb | busWidth, fp64, fp64Tensor |
| l40s-pcie-48gb | busWidth, fp64, fp64Tensor |

### Unused sources in the JSON

`dc-a10-page`, `dc-a2-page`, `dc-a40-page`, `dc-l40-page` and `dc-dgx2-ds` are listed in `sources` because the conflicts above rest on them; no field cites them directly.

## NVIDIA workstation RTX: A series, Ada Generation, RTX PRO Blackwell

Source prefix `ws-`. Retrieved 2026-10-18. 28 records (26 segment `workstation`, 2 segment `datacenter`), 53 sources, all NVIDIA and all tier `primary`.

### Conventions used in this slice

- Quotes are verbatim from the NVIDIA text, with superscript footnote markers removed. Example: the PDF text "PCIe 4.0 x85" is the value "PCIe 4.0 x8" followed by footnote 5, so the quote is "PCIe 4.0 x8". The same applies to "x 84", "x 83", "x81", "TFLOPS2", and similar.
- Whitepaper table quotes drop the row-label footnote digit (for example "Peak TF32 Tensor TFLOPS1" is quoted as "Peak TF32 Tensor TFLOPS") and the footnote digit glued to the sparse value ("154.8/309.62" is "154.8/309.6" plus footnote 2).
- Sparse-to-dense derivation (`value = sparse / 2`) is used only where the cited NVIDIA source states that the figure uses sparsity. Each such value carries `derivedFromSparse`, `sparseValue`, `footnoteQuote` and `formula`.
- Where a datasheet gives an unlabeled "Tensor performance" figure with a sparsity footnote but no precision, the figure is not assigned to any precision field. The value appears in the TBD reason.
- FP4 AI TOPS on Blackwell workstation cards keep the unit as written ("TOPS"), although FP4 is a floating-point format.
- `gpuLink` appears only when NVIDIA states NVLink bandwidth or states NVLink is absent ("NVIDIA NVLink No", "NVIDIA NVLink Not supported"). Cards whose NVIDIA sources say nothing about NVLink have no `gpuLink` key.
- `not-supported` without a source is used for Tensor precisions the architecture lacks: FP8, FP6, FP4 on Ampere; FP6, FP4 on Ada. The A6000 FP8 entry cites the Ada professional whitepaper table, which prints "N/A" for RTX A6000.
- FP64 and FP64 Tensor are TBD on every record. No NVIDIA workstation datasheet, product page, or the two professional architecture tables (GA102 Table 3, Ada professional Table 2) prints an FP64 row.
- Product pages listed in `sources` but not cited in any field (`ws-a400-page`, `ws-a1000-page`, `ws-a2000-page`, `ws-a6000-page`, `ws-6000-ada-page`, `ws-pro2000-page`, `ws-pro4000-page`, `ws-pro4500-page`, `ws-pro6000maxq-page`, `ws-pro6000we-page`) were read to check for conflicts with the datasheets. They are kept so the conflicts below have a source id.
- Datasheet revision choice: the newest NVIDIA-hosted revision was used. Many Ampere and Ada datasheets on nvidia.com were re-exported on 2026-04-24 (PDF metadata) but keep their original printed date codes (for example MAY22, OCT23); both are recorded in `documentDate`.

### Per GPU

#### rtx-a400-4gb (NVIDIA RTX A400)
- Product page RT Core figure is 5.3 TFLOPS; datasheet says 5.4 TFLOPS. RT Core is not a schema field.
- FP16 Tensor and INT8 derived from sparse figures; the INT8 footnote in the source misspells INT8 as "ITN8".
- ECC: not stated in the datasheet or product page.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor.
- FP16 Tensor accumulate precision not stated.

#### rtx-a1000-8gb (NVIDIA RTX A1000)
- Datasheet misspells the bus as "PCle 4.0 x8"; quoted verbatim.
- ECC: not stated.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor.

#### rtx-a2000-6gb and rtx-a2000-12gb (NVIDIA RTX A2000, NVIDIA RTX A2000 12GB)
- One datasheet covers both cards. Every row except GPU memory is shared (192-bit, 288 GB/s, ECC Yes, 8.0 TFLOPS, 70 W, PCIe 4.0 x16).
- The product page links `nvidia-rtx-a2000-12gb-datasheet.pdf` (PDF metadata 2026-04-24, printed AUG21 and MAY22). An older copy at `/content/dam/en-zz/Solutions/design-visualization/rtx-a2000/nvidia-rtx-a2000-datasheet-1987439-r5.pdf` (PDF metadata 2022-05-26) has the same specifications.
- Ambiguity: "Tensor performance 63.9 TFLOPS" with footnote "Effective teraFLOPS (TFLOPS) using the new sparsity feature." names no precision. Not stored.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, int8Tensor.

#### rtx-a4000-16gb (NVIDIA RTX A4000)
- The current datasheet is a scanned image with an OCR text layer that misreads values (for example "4'8GB/s", "19,2 TFLOPS"). All quotes were transcribed from the page rendered at 150 dpi.
- Ambiguity: "Tensor performance 153.4 TFLOPS" (sparse, precision not named). Not stored.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, int8Tensor.

#### rtx-a4500-20gb (NVIDIA RTX A4500)
- NVLink conflict: product page "up to 112 gigabytes per second (GB/s)"; datasheet "112.5 GB/s (bidirectional)". Datasheet used; per-direction 56.25 GB/s derived as 112.5 / 2.
- Ambiguity: "Tensor performance 189.2 TFLOPS" (sparse, precision not named). Not stored.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, int8Tensor.

#### rtx-a5000-24gb (NVIDIA RTX A5000)
- Same NVLink conflict as the A4500 (page 112 GB/s, datasheet 112.5 GB/s bidirectional).
- The A5000 datasheet text layer also carries stray A4000 and A2000 footer lines ("NVIDIA RTX A4000 | DATASHEET | MAY22"); they are layout leftovers and do not change the A5000 table.
- Ambiguity: "Tensor performance 222.2 TFLOPS" (sparse, precision not named). Not stored.
- NVLink generation name ("third generation") is from the A4500 and A6000 product pages; the A5000 sources say only "NVIDIA NVLink".
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, int8Tensor.

#### rtx-a5500-24gb (NVIDIA RTX A5500)
- Same NVLink conflict (page 112 GB/s, datasheet 112.5 GB/s bidirectional).
- Ambiguity: "Tensor performance 272.8 TFLOPS" (sparse, precision not named). Not stored.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, int8Tensor.

#### rtx-a6000-48gb (NVIDIA RTX A6000)
- TF32, BF16, FP16 and INT8 dense values come directly from the GA102 whitepaper v2.1 Table 3, which prints dense/sparse pairs. No derivation.
- Rounding conflict: datasheet "Tensor performance 309.7 TFLOPS" (sparse) vs whitepaper FP16 sparse 309.6.
- Capacity: datasheet "48GB"; whitepaper "49152 MB".
- Same NVLink page vs datasheet conflict (112 vs 112.5 GB/s).
- TBD: fp64, fp64Tensor.

#### rtx-2000-ada-16gb (NVIDIA RTX 2000 Ada Generation)
- The product page "Data Sheet" link (resources.nvidia.com/.../proviz-rtx-2000-ada) now redirects to the NVIDIA home page. An Internet Archive capture of that viewer gave the NVIDIA DAM URL `nvdam.widen.net/.../proviz-rtx-2000-ada-datasheet-nvidia-us-2999417-r4-web`, which now returns 404. The PDF was read from the archive capture (20250409161943) of the NVIDIA DAM file URL. The citation keeps the NVIDIA URL. The product page independently confirms 16 GB GDDR6 with ECC, 70 W, PCIe Gen 4 x8, 2.7 x 6.6 in dual slot, FP32 12.0 TFLOPS and Tensor 191.9 TFLOPS with "Effective FP8 teraFLOPS (TFLOPS) using the sparsity feature."
- Bandwidth and bus width (224 GB/s, 128-bit) rest on the archived datasheet only. NVIDIA's embedded page lists an "NVIDIA RTX 2000 Ada Generation" at 256 GB/sec; that is the embedded MXM module, a different SKU, and is excluded (see below). A web search summary also pointed to 256 GB/s on NVIDIA's laptop compare page; that is the laptop GPU.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, int8Tensor.

#### rtx-2000e-ada-16gb (NVIDIA RTX 2000E Ada Generation)
- Documented by an NVIDIA datasheet (4328932, Oct25) in the resources.nvidia.com datasheet collection. No nvidia.com product page was found.
- NVIDIA calls it "purpose-built for demanding embedded and edge computing applications", but it is a low-profile single-slot PCIe add-in card, so it is kept as segment `workstation`. Review if the dataset wants it moved.
- FP8 dense 71 TFLOPS derived from "142 AI TOPS|142 TFLOPS" with footnote "Theoretical FP8 TOPS and TFLOPS using the sparsity feature."
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, int8Tensor.

#### rtx-4000-sff-ada-20gb (NVIDIA RTX 4000 SFF Ada Generation)
- Product page rounds the Tensor figure to "307 AI TOPS" (footnote "Theoretical FP8 TOPS using sparsity."); datasheet gives 306.8 TFLOPS. Datasheet used.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, int8Tensor.

#### rtx-4000-ada-20gb (NVIDIA RTX 4000 Ada Generation)
- CONFLICT: product page highlight "Tensor Performance 427.6 TFLOPS"; datasheet (2895141, SEP23) "Tensor Performance 327.6 TFLOPS". The datasheet value was used (dense FP8 163.8). The page figure is likely a typo, but that is an inference.
- Product page FP32 26.7 and RT 61.8 agree with the datasheet.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, int8Tensor.

#### rtx-4500-ada-24gb (NVIDIA RTX 4500 Ada Generation)
- Page and datasheet agree (634.0 TFLOPS Tensor, 39.6 TFLOPS FP32, 210 W).
- The product literature page links the 4500 Ada datasheet through a resources.nvidia.com slug named "nvidia-rtx-a4500-dat-1"; the direct nvidia.com PDF linked from the product page was used instead.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, int8Tensor.

#### rtx-5000-ada-32gb (NVIDIA RTX 5000 Ada Generation)
- Datasheet read through the resources.nvidia.com viewer; the embedded PDF is served from `cdn.pathfactory.com` (NVIDIA's content host for resources.nvidia.com). The citation keeps the resources.nvidia.com URL.
- Product page highlight "1,044.4 TFLOPS" carries only the boost-clock footnote; the datasheet footnote "Effective FP8 teraFLOPS (TFLOPS) using sparsity." was used for the derivation.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, int8Tensor.

#### rtx-5880-ada-48gb (NVIDIA RTX 5880 Ada Generation)
- Only the product page is citable. Both datasheet links (resources.nvidia.com/.../proviz-rtx-5880-ada-1 and .../proviz-rtx-5880-ada-datasheet) redirect away. The NVIDIA DAM file (`nvdam.widen.net/.../proviz-rtx-5880-ada-datasheet-us-3056119`) returns 404 and its archive captures hold only signed-CDN redirects, not the PDF.
- Not cited (primary-only rule): a copy of an NVIDIA RTX 5880 Ada datasheet hosted by HP (`valuehub.hp.com/static/nvidia/docs/NVIDIA%20RTX%205880%20Ada%20Generation%20Datasheet.pdf`, printed doc code 3156635, Feb24) lists "Memory interface 384-bit", "Memory bandwidth 960 GB/s", "Error correcting code (ECC) Yes", "Tensor performance 1108.4 TFLOPS" with footnote "Effective FP8 teraFLOPS (TFLOPS) using sparsity.", "Total board power: 285 W", and "NVIDIA NVLink No". If the dataset accepts an OEM-hosted copy of an NVIDIA datasheet, these would fill busWidth 384, bandwidth 960 GB/s and fp8Tensor 554.2 (1108.4 / 2). The doc code differs from the NVIDIA DAM filename (3056119), so it may be a later revision.
- Product page Tensor figure "1108.4 TFLOPS" has no precision or sparsity footnote on the page, so it was not stored.
- TBD: memory.bandwidth, memory.busWidth, fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, fp8Tensor, int8Tensor.
- NVLink: not stated on any citable NVIDIA source; no `gpuLink` key.

#### rtx-6000-ada-48gb (NVIDIA RTX 6000 Ada Generation)
- TF32, BF16, FP16, FP8 and INT8 dense values come directly from the Ada professional whitepaper V1.1 Table 2 (dense/sparse pairs). The datasheet "Tensor performance 1457.0 TFLOPS" (FP8, sparse) agrees: 1457.0 / 2 = 728.5.
- Product page writes the Tensor highlight as "1457 AI TOPS" with "Theoretical FP8 TOPS using the sparsity feature."
- Datasheet date: Feb23 (2647623) is the newest copy found; no 2026 re-export of the RTX 6000 Ada datasheet exists at the nvidia.com path pattern used for the other Ada cards.
- TBD: fp64, fp64Tensor.

#### rtx-pro-2000-blackwell-16gb (NVIDIA RTX PRO 2000 Blackwell)
- Datasheet 5322351 (Jun26). Product page agrees on 545 AI TOPS, 16 GB GDDR7 ECC, 288 GB/s, 70 W.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, fp8Tensor, fp6Tensor, int8Tensor.

#### rtx-pro-4000-sff-blackwell-24gb (NVIDIA RTX PRO 4000 Blackwell SFF Edition)
- Footnote defect in datasheet 5322500: "770 AI TOPS" carries markers 1 and 2, but the datasheet's footnotes 1 and 2 are "Uses full-length PCIe interface." and the Khronos note. There is no sparsity footnote in this datasheet. The FP4 value is therefore cited to the product page, which shows "770 TOPS" with "2. Theoretical FP4 TOPS using sparsity."
- Form factor wording: datasheet "2.7" x 6.6" L, dual slot, half height"; page "2.7” H x 6.6” L, dual slot". Display connectors: datasheet "4x Mini DisplayPort 2.1b"; page quick specs "4x DisplayPort 2.1b".
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, fp8Tensor, fp6Tensor, int8Tensor.

#### rtx-pro-4000-blackwell-24gb (NVIDIA RTX PRO 4000 Blackwell)
- CONFLICT: datasheet 5323450 (Jun26) vs product page highlights. FP32 37 vs 40 TFLOPS; RT Core 112 vs 122 TFLOPS; AI TOPS 1,178 vs 1290. Datasheet used (newest dated NVIDIA document). The page may carry launch figures.
- Datasheet misspells "Memory andwidth"; quoted verbatim.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, fp8Tensor, fp6Tensor, int8Tensor.

#### rtx-pro-4500-blackwell-we-32gb (NVIDIA RTX PRO 4500 Blackwell Workstation Edition)
- Datasheet 5108623 (Apr26) linked from the product page; the resources.nvidia.com copy is the same file date. The product literature page still links an older GTC25 datasheet (3662540); not used.
- Product page has no performance highlights.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, fp8Tensor, fp6Tensor, int8Tensor.

#### rtx-pro-5000-blackwell-48gb and rtx-pro-5000-blackwell-72gb (NVIDIA RTX PRO 5000 Blackwell, NVIDIA RTX PRO 5000 72GB Blackwell)
- One datasheet (5349550, Jul26) covers both; only the GPU memory and MIG rows differ. Bandwidth (1,344 GB/s), bus (384-bit), FP32 (65 TFLOPS), AI TOPS (2,064) and power (300 W) are single shared rows, so both records carry the same values. The product page also shows one shared column.
- The product literature page still links an older GTC25 datasheet (3658700); not used.
- TBD (each record): fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, fp8Tensor, fp6Tensor, int8Tensor.

#### rtx-pro-5500-blackwell-we-84gb (NVIDIA RTX PRO 5500 Blackwell Workstation Edition)
- Not in the requested list; found on NVIDIA's RTX PRO desktop GPU index and its own product page. Included as a documented variant.
- The page marks its table "*Preliminary product specifications, subject to change." and links no datasheet.
- Designed "for rack-mounted workstation deployment"; air-cooled card, with a liquid-cooled build "available in the RXM form factor". The RXM build has no separate specification and is not a separate record.
- Bandwidth unit kept as written: "1398 GB/sec".
- TBD: memory.busWidth, fp64, fp64Tensor, fp32, tf32Tensor, bf16Tensor, fp16Tensor, fp8Tensor, fp6Tensor, fp4Tensor, int8Tensor.

#### rtx-pro-6000-blackwell-max-q-96gb (NVIDIA RTX PRO 6000 Blackwell Max-Q Workstation Edition)
- Used datasheet 5349650 (printed JUN26, PDF metadata 2026-07-20) from the product page. The resources.nvidia.com viewer serves an April 2025 revision; the product literature page links an older one (3519233). Not used.
- Product page agrees: 3511 AI TOPS, 110 TFLOPS FP32, 333 TFLOPS RT, 1792 GB/sec, 300 W.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, fp8Tensor, fp6Tensor, int8Tensor.

#### rtx-pro-6000-blackwell-we-96gb (NVIDIA RTX PRO 6000 Blackwell Workstation Edition)
- CONFLICT (minor): datasheet 5349469 (Jun26) FP32 126 TFLOPS, RT 382 TFLOPS; product page 125 and 380. Datasheet used. AI TOPS 4000 agrees.
- Datasheet filename contains 3519208; printed doc code is 5349469. Both recorded (URL and version).
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, fp8Tensor, fp6Tensor, int8Tensor.

#### rtx-pro-6000-blackwell-se-96gb (NVIDIA RTX PRO 6000 Blackwell Server Edition), segment datacenter
- Precision table on the product page: "FP4 Tensor Core 4 PFLOPS", "FP8 Tensor Core 2 PFLOPS", "FP16 | BF16 Tensor Core 1 PFLOP", "TF32 Tensor Core 234 TFLOPS". The datasheet (4682150, Dec25) gives "Peak FP4 AI PFLOPS 4 PFLOPS". Neither source, nor the product brief SP-12355-001_v02, says whether these are dense or sparse.
- Why not stored: the Workstation Edition (same 96 GB GB202-class card, same 600 W) datasheet labels its matching "4000 AI TOPS" as "Effective FP4 TOPS with sparsity." Treating 4 PFLOPS as dense would likely double the true dense rate. Also, TF32 234 TFLOPS is about one quarter of FP16 (1 PFLOP), while the RTX PRO 4500 Server Edition table has TF32 at exactly half of FP16 (203 vs 406). That inconsistency suggests the 6000 Server Edition rows do not share one convention. All five precision fields are TBD; the published figures are kept in the TBD reasons.
- Power: datasheet "Up to 600W (Configurable)"; product brief gives 600 W max in the 600 W cable mode, 450 W max in the 450 W mode, 300 W minimum.
- Form factor: datasheet air-cooled "4.4" (H) x 10.5" (L), dual slot", passive. Product page also lists "Liquid: Single-Slot, FHXL". No separate specification for the liquid build, so no separate record.
- PCIe: datasheet "PCI Express 5.0 x16"; product brief "PCI Express Gen5 x16; Gen5 x8".
- Memory bandwidth: 1597 GB/s (datasheet), "1,597 GB/s" (brief), rounded "1.6 TB/s" in datasheet prose. Workstation Edition has 1792 GB/s; the Server Edition memory clock is lower (brief: "Memory clock 12,481 MHz").
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, fp8Tensor, fp6Tensor, fp4Tensor, int8Tensor.

#### rtx-pro-4500-blackwell-se-32gb (NVIDIA RTX PRO 4500 Blackwell Server Edition), segment datacenter
- Not in the requested list; has its own nvidia.com data center page, datasheet (5192801, Apr26) and product brief (PB-12790-001_02, April 2026). Included as a documented variant.
- Precision table (datasheet and page): FP4 1.6 PFLOPS, FP8 811 TFLOPS, FP16|BF16 406 TFLOPS, TF32 203 TFLOPS. No dense or sparse label anywhere. The Workstation Edition datasheet labels its 1,617 AI TOPS as sparse, which matches the 1.6 PFLOPS FP4 row, so these rows are likely sparse. Not stored; all TBD with the published figures in the reasons.
- TBD: fp64, fp64Tensor, tf32Tensor, bf16Tensor, fp16Tensor, fp8Tensor, fp6Tensor, fp4Tensor, int8Tensor.

### Conflicts between NVIDIA pages (summary)

| Record | Field | Source A | Source B | Used |
|---|---|---|---|---|
| rtx-a400-4gb | RT Core TFLOPS (not a schema field) | page 5.3 | datasheet 5.4 | n/a |
| rtx-a4500, a5000, a5500, a6000 | NVLink bandwidth | page "up to 112 GB/s" | datasheet "112.5 GB/s (bidirectional)" | datasheet |
| rtx-a6000-48gb | FP16 Tensor sparse | datasheet 309.7 | GA102 whitepaper 309.6 | whitepaper dense 154.8 |
| rtx-4000-ada-20gb | Tensor (FP8, sparse) | page 427.6 | datasheet 327.6 | datasheet |
| rtx-pro-4000-blackwell-24gb | FP32 / RT / AI TOPS | page 40 / 122 / 1290 | datasheet 37 / 112 / 1,178 | datasheet |
| rtx-pro-6000-blackwell-we-96gb | FP32 / RT | page 125 / 380 | datasheet 126 / 382 | datasheet |
| rtx-pro-4000-sff-blackwell-24gb | sparsity footnote | datasheet markers point to unrelated notes | page states FP4 with sparsity | page |
| rtx-pro-6000 SE vs WE | FP4 label | SE: 4 PFLOPS, no label | WE: 4000 AI TOPS, sparse | SE left TBD |

### Retrieval notes

- nvidia.com/en-us/design-visualization/<slug>/ pages now redirect to nvidia.com/en-us/products/workstations/<slug>/ (Ampere and Ada) or .../professional-desktop-gpus/<slug>/ (RTX PRO). The redirect targets are cited.
- The Ada Lovelace GeForce whitepaper (V2.02) and the RTX Blackwell GeForce whitepaper contain no workstation card tables; the Ada professional whitepaper V1.1 covers only the RTX 6000 Ada Generation, and the GA102 whitepaper V2.1 covers only the RTX A6000.

## NVIDIA GeForce RTX 30, 40 and 50 Series (desktop and laptop)

Records: 54 (32 desktop, 22 laptop). Cited fields: 561 sourced, 390 TBD, 136 not-supported (with source). Retrieved 2026-10-18.

### Source policy

- Quote notation: " | " joins a table column header, a row label and the cell text ("column | row | cell"). A line break inside one table cell is written as " / ". Superscript footnote digits in whitepaper cells are dropped (pdftotext glues them to the number, for example "59.5/1192" for "59.5/119" plus footnote 2). Quotes are otherwise verbatim from the curl'd page text or `pdftotext -raw` output.
- Product pages (Founders Edition or reference specs) supply name, memory size and type, bus width, power, PCIe generation, NVLink presence and architecture for every desktop card.
- Compute and bandwidth come from NVIDIA architecture whitepapers. Each whitepaper cell holds "dense/sparse" with the footnote "Effective TOPS / TFLOPS using the (new) Sparsity Feature". The dense figure is stored directly, so no record uses a sparse / 2 derivation.
- Whitepaper precedence: for an Ampere card that the Ampere GA102 whitepaper covers (RTX 3090, 3080 10 GB, 3070), that document wins over the RTX Blackwell whitepaper, which repeats these cards and has a demonstrable copy error on the RTX 3080 (see Main conflicts). For RTX 3090 Ti and RTX 3080 Ti the Ada whitepaper is the only table. For RTX 3070 Ti, RTX 4070 Ti and RTX 4070 the RTX Blackwell whitepaper is the only table. For RTX 4090 and 4080 the Ada and RTX Blackwell whitepapers agree.
- GeForce Tensor Cores run FP16 and FP8 at half rate with FP32 accumulate. Following the schema, fp16Tensor and fp8Tensor hold the FP32-accumulate figures, and fp16TensorFp16Acc and fp8TensorFp16Acc hold the FP16-accumulate figures.
- AI TOPS: no NVIDIA product or laptop page states the precision or sparsity of its AI TOPS figure, so no AI TOPS value is stored in a compute field. Each value is kept in the record notes. The RTX Blackwell whitepaper row "Peak FP4 Tensor TFLOPS with FP32 Accumulate (FP4 AI TOPS)" confirms that, for the RTX 5090, 5080, 5070 Ti and 5070, the page AI TOPS equals the sparse FP4 figure. For Ada desktop cards in a whitepaper, the page AI TOPS equals the sparse FP8 (FP16 accumulate) and INT8 figure. For SKUs outside the whitepapers, fp4Tensor (Blackwell) and fp8Tensor (Ada) are TBD, never halved from AI TOPS.
- Ada and Blackwell pages list "Shader Cores" TFLOPS (for example 83 TFLOPS on the RTX 4090). The page does not name the precision, so fp32 takes the whitepaper "Peak FP32 TFLOPS (non-Tensor)" value where one exists and is TBD otherwise. The shader figure is kept in notes.
- PCIe: NVIDIA pages give the generation ("PCI Express Gen 4 | Yes") but no lane count, so no lane count is recorded. Some cards (for example the RTX 4060 family and RTX 5060 family) are widely reported as x8 cards; no NVIDIA page checked states this, so it is not in the data.
- Laptop power: NVIDIA publishes "GPU Subsystem Power (W)" as a range, not a TGP. maxPowerW holds the maximum and quotes the range. Laptop boost clocks are ranges and are kept in notes.
- Laptop compute: NVIDIA publishes no dense tensor, FP32 or bandwidth figures for 30 and 40 Series laptop GPUs. Only the 50 Series laptop page gives bandwidth.
- FP8, FP6 and FP4 on older architectures are marked not-supported with an NVIDIA source: the Ada whitepaper introduces the FP8 tensor format with the fourth-generation Tensor Core, and the RTX Blackwell whitepaper says "RTX Blackwell adds new support for FP4 and FP6 Tensor Core operations". Where a whitepaper table prints "N/A" for the card, that cell is the quote instead.
- FP64 and FP64 Tensor are TBD everywhere. The RTX Blackwell whitepaper states only a ratio ("The FP64 TFLOP rate is 1/64th the TFLOP rate of FP32 operations"), and computing from it is not allowed.

### Revisions used

- NVIDIA Ampere GA102 GPU Architecture whitepaper V2.1, PDF ModDate 2021-12-10 (V2.0 of 2021-01-06 was also downloaded; V2.1 is newer). Tables 2, 9 and 10.
- NVIDIA Ada GPU Architecture whitepaper V2.02, PDF ModDate 2023-11-03. Tables 2 and 3. Footnote 4 says V2.02 corrected the FP8 FP32-accumulate figures.
- NVIDIA RTX Blackwell GPU Architecture whitepaper V1.1, PDF ModDate 2025-05-13. Tables 3 to 6.
- NVIDIA product pages, desktop compare page, laptop compare pages and the 50 Series laptop page: live pages fetched 2026-10-18. They show no publication date; the copyright year in each spec block is recorded in the source entry.
- NVIDIA press release "GeForce RTX 40 SUPER Series", January 8, 2024 (RTX 4070 Ti SUPER bandwidth only).

### Main conflicts

- RTX 3080 10 GB FP32: RTX Blackwell whitepaper Table 4 gives 34.1 TFLOPS (and 34.1 FP16 and BF16 non-Tensor, INT32 17), which are RTX 3080 Ti values. Ampere GA102 whitepaper Table 2 gives 29.8. The record uses 29.8.
- RTX 3090 and RTX 3070 tensor figures: the RTX Blackwell whitepaper rounds differently from the Ampere whitepaper (142.3 vs 142, 71.2 vs 71, 284.7 vs 284; RTX 3070 INT8 162.5 vs 162.6). The Ampere whitepaper values are kept.
- RTX 3090 Ti NVLink: the task brief says only the RTX 3090 has NVLink. The NVIDIA product page and compare page list "NVIDIA NVLink (SLI-Ready) | Yes" for both the RTX 3090 Ti and the RTX 3090. The 3090 Ti record shows NVLink as present with bandwidth TBD.
- RTX 4060 Ti TGP "165 or 160" is not labeled by memory size; assigned by parallel order (16 GB: 165 W, 8 GB: 160 W).
- Boost clocks differ slightly between pages and whitepapers (for example RTX 3070 1.73 GHz vs 1725 MHz, RTX 4080 2.51 GHz vs 2505 MHz). Rounding only; the schema stores no clock field.

### Per GPU

#### rtx-3090-ti-24gb (GeForce RTX 3090 Ti, geforce-desktop)
- CUDA Cores 10752, boost 1.86 GHz (product page). Compute and bandwidth come from the Ada whitepaper comparison table, the only NVIDIA table that covers this card. NVLink is present per the product page; bandwidth TBD.
- The task brief says only the RTX 3090 has NVLink. The NVIDIA product page and the 30 Series compare table both list "NVIDIA NVLink (SLI-Ready) | Yes" for the RTX 3090 Ti as well. Recorded as present, bandwidth TBD.
- TBD fields (3):
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - interconnect.gpuLink: The NVIDIA product page lists "NVIDIA NVLink (SLI-Ready) | Yes" for the RTX 3090 Ti, but no NVIDIA document gives its NVLink bandwidth; the GA102 whitepaper link figures name only the RTX 3090, A40 and RTX A6000

#### rtx-3090-24gb (GeForce RTX 3090, geforce-desktop)
- CUDA Cores 10496, boost 1.70 GHz (page), 1695 MHz (whitepaper). Compute from the Ampere GA102 whitepaper; the RTX Blackwell whitepaper repeats the card with slightly different rounding.
- RTX Blackwell whitepaper Table 3 gives 142.3/284.6 (FP16, FP16 accumulate), 71.2/142.4 (FP16 and BF16, FP32 accumulate), 35.6/71.2 (TF32) and 284.7/569.4 (INT8). The Ampere GA102 whitepaper gives 142/284, 71/142, 35.6/71 and 284/568. These are the same figures at different rounding. The record keeps the Ampere whitepaper values (see Source policy).
- TBD fields (2):
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU

#### rtx-3080-ti-12gb (GeForce RTX 3080 Ti, geforce-desktop)
- CUDA Cores 10240, boost 1.67 GHz (page), 1665 MHz (Ada whitepaper). Compute and bandwidth come from the Ada whitepaper comparison table, the only NVIDIA table that covers this card.
- TBD fields (2):
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU

#### rtx-3080-12gb (GeForce RTX 3080, geforce-desktop)
- 12 GB variant of the RTX 3080 column (paired values: CUDA Cores 8960 / 8704, Base Clock 1.26 / 1.44 GHz; Boost Clock 1.71 GHz for both). No NVIDIA whitepaper covers the 12 GB variant, so all compute fields are TBD.
- The page lists both variants in one column with slash-paired values. The pairing order (12 GB first) is confirmed by the 10 GB card's whitepaper values (320-bit, 8704 CUDA Cores, 320 W).
- TBD fields (8):
  - memory.bandwidth: No NVIDIA product page, compare page, press release or whitepaper table found that publishes memory bandwidth for this SKU; computing it from a data rate is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-3080-10gb (GeForce RTX 3080, geforce-desktop)
- 10 GB variant of the RTX 3080 column. CUDA Cores 8704, boost 1.71 GHz. Compute from the Ampere GA102 whitepaper. The RTX Blackwell whitepaper lists FP32 34.1 TFLOPS for this card, which conflicts (see notes file).
- CONFLICT: RTX Blackwell whitepaper V1.1 Table 4 lists the RTX 3080 (10 GB, 8704 CUDA Cores, 1710 MHz) with Peak FP32 34.1, FP16 and BF16 non-Tensor 34.1, and INT32 17. Those are the RTX 3080 Ti figures in the Ada whitepaper. The Ampere GA102 whitepaper Table 2 gives FP32 29.8 for the RTX 3080, and the record uses 29.8. The Blackwell table's Tensor rows for the RTX 3080 (119.1/238.2, 59.5/119, 29.8/59.6, 238.1/476.2) agree with the Ampere whitepaper, so only its non-Tensor rows appear to come from the wrong card.
- TBD fields (2):
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU

#### rtx-3070-ti-8gb (GeForce RTX 3070 Ti, geforce-desktop)
- CUDA Cores 6144, boost 1.77 GHz. Compute and bandwidth come from the RTX Blackwell whitepaper comparison table, the only NVIDIA table that covers this card. The RTX 3070 page footnote describes a reference design, not a Founders Edition.
- TBD fields (2):
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU

#### rtx-3070-8gb (GeForce RTX 3070, geforce-desktop)
- CUDA Cores 5888, boost 1.73 GHz (page), 1725 MHz (whitepaper). Compute from the Ampere GA102 whitepaper Appendix A (GA104).
- RTX Blackwell whitepaper Table 6 gives INT8 162.5/325 and FP16 (FP32 accumulate) 40.6/81.2 for the RTX 3070; the Ampere whitepaper gives 162.6/325.2 and 40.6/81.3. Rounding difference only; the Ampere whitepaper values are kept.
- TBD fields (2):
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU

#### rtx-3060-ti-8gb-gddr6 (GeForce RTX 3060 Ti, geforce-desktop)
- GDDR6 variant of the RTX 3060 Ti column (memory "8 GB GDDR6 / 8 GB GDDR6X"; one CUDA count 4864, one boost clock 1.67 GHz and one power figure for both). No NVIDIA whitepaper covers the RTX 3060 Ti.
- TBD fields (8):
  - memory.bandwidth: No NVIDIA product page, compare page, press release or whitepaper table found that publishes memory bandwidth for this SKU; computing it from a data rate is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-3060-ti-8gb-gddr6x (GeForce RTX 3060 Ti, geforce-desktop)
- GDDR6X variant of the RTX 3060 Ti column. NVIDIA publishes no separate bandwidth, clock or power for it.
- Kept as its own record because NVIDIA lists GDDR6X as a second memory configuration. NVIDIA publishes no bandwidth for either variant, so the record carries no bandwidth difference.
- TBD fields (8):
  - memory.bandwidth: No NVIDIA product page, compare page, press release or whitepaper table found that publishes memory bandwidth for this SKU; computing it from a data rate is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-3060-12gb (GeForce RTX 3060, geforce-desktop)
- 12 GB variant of the RTX 3060 column (CUDA Cores 3584 and boost 1.78 GHz for both). Bus width paired by slash order: 192-bit with 12 GB.
- TBD fields (8):
  - memory.bandwidth: No NVIDIA product page, compare page, press release or whitepaper table found that publishes memory bandwidth for this SKU; computing it from a data rate is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-3060-8gb (GeForce RTX 3060, geforce-desktop)
- 8 GB variant of the RTX 3060 column. Bus width paired by slash order: 128-bit with 8 GB.
- The bus width mapping relies on slash-pair order ("12 GB GDDR6 / 8 GB GDDR6" with "192-bit / 128-bit"). A whitepaper confirms the same convention on the RTX 3080 column; no second NVIDIA source confirms it here.
- TBD fields (8):
  - memory.bandwidth: No NVIDIA product page, compare page, press release or whitepaper table found that publishes memory bandwidth for this SKU; computing it from a data rate is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-3050-8gb (GeForce RTX 3050 (8 GB), geforce-desktop)
- CUDA Cores 2560, boost 1.78 GHz. Footnote 1 on this column: "GeForce RTX 3050 (OEM) has 2304 CUDA Cores, a Base Clock of 1.51 GHz, and a Boost Clock of 1.76 GHz" (the OEM variant is excluded).
- TBD fields (8):
  - memory.bandwidth: No NVIDIA product page, compare page, press release or whitepaper table found that publishes memory bandwidth for this SKU; computing it from a data rate is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-3050-6gb (GeForce RTX 3050 (6 GB), geforce-desktop)
- CUDA Cores 2304, boost 1.47 GHz, no supplementary power connector. Included because NVIDIA lists it as its own column on the product page and the compare page.
- The task brief names the RTX 3050 6 GB as a possible exclusion. Decision: included, because NVIDIA lists it as a retail desktop card with its own full spec column on the RTX 3050 page and the compare page.
- TBD fields (8):
  - memory.bandwidth: No NVIDIA product page, compare page, press release or whitepaper table found that publishes memory bandwidth for this SKU; computing it from a data rate is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-4090-24gb (GeForce RTX 4090, geforce-desktop)
- CUDA Cores 16384, boost 2.52 GHz. Product page: Shader Cores 83 TFLOPS and Tensor Cores 1321 AI TOPS (the page states no precision or sparsity; the Ada whitepaper gives 1321.2 as the sparse FP8 and INT8 figure). Compute from the Ada whitepaper V2.02; the RTX Blackwell whitepaper Table 3 repeats the same values.
- TBD fields (2):
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU

#### rtx-4080-super-16gb (GeForce RTX 4080 SUPER, geforce-desktop)
- CUDA Cores 10240, boost 2.55 GHz. Product page: Shader Cores 52 TFLOPS, 836 AI TOPS (no precision or sparsity stated). No whitepaper table covers the SUPER cards.
- TBD fields (9):
  - memory.bandwidth: No NVIDIA page or whitepaper gives the RTX 4080 SUPER memory bandwidth. The NVIDIA launch article states only the data rate ("GDDR6X video memory (VRAM) running at 23 Gbps"); computing bandwidth from it is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.fp8Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-4080-16gb (GeForce RTX 4080, geforce-desktop)
- The Ada whitepaper names this card "RTX 4080 16 GB". CUDA Cores 9728, boost 2.51 GHz (page), 2505 MHz (whitepaper). Product page: Shader Cores 49 TFLOPS, 780 AI TOPS (no precision or sparsity stated).
- TBD fields (2):
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU

#### rtx-4070-ti-super-16gb (GeForce RTX 4070 Ti SUPER, geforce-desktop)
- CUDA Cores 8448, boost 2.61 GHz. Product page: Shader Cores 44 TFLOPS, 706 AI TOPS (no precision or sparsity stated).
- TBD fields (8):
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.fp8Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-4070-ti-12gb (GeForce RTX 4070 Ti, geforce-desktop)
- CUDA Cores 7680, boost 2.61 GHz. Product page: Shader Cores 40 TFLOPS, 641 AI TOPS (no precision or sparsity stated; it matches the whitepaper's sparse FP8 and INT8 figure 641.4). Compute from the RTX Blackwell whitepaper comparison table.
- TBD fields (2):
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU

#### rtx-4070-super-12gb (GeForce RTX 4070 SUPER, geforce-desktop)
- CUDA Cores 7168, boost 2.48 GHz. Product page: Shader Cores 36 TFLOPS, 568 AI TOPS (no precision or sparsity stated).
- TBD fields (9):
  - memory.bandwidth: No NVIDIA product page, compare page, press release or whitepaper table found that publishes memory bandwidth for this SKU; computing it from a data rate is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.fp8Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-4070-12gb-gddr6x (GeForce RTX 4070, geforce-desktop)
- GDDR6X variant (the launch card). CUDA Cores 5888, boost 2.48 GHz (page), 2475 MHz (whitepaper). Product page: Shader Cores 29 TFLOPS, 466 AI TOPS (no precision or sparsity stated).
- TBD fields (2):
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU

#### rtx-4070-12gb-gddr6 (GeForce RTX 4070, geforce-desktop)
- GDDR6 variant of the RTX 4070 column. NVIDIA lists it only as a second memory configuration. Compute is TBD because the whitepaper figures belong to the GDDR6X card and NVIDIA does not say they apply to this variant.
- The task brief names the RTX 4070 GDDR6 variant as a possible exclusion. Decision: included as its own record, because the current NVIDIA product page and compare page list "12 GB GDDR6 / 12 GB GDDR6X" for the RTX 4070. Only memory, bus width, TGP and PCIe are sourced.
- TBD fields (9):
  - memory.bandwidth: No NVIDIA product page, compare page, press release or whitepaper table found that publishes memory bandwidth for this SKU; computing it from a data rate is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.fp8Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-4060-ti-16gb (GeForce RTX 4060 Ti, geforce-desktop)
- CUDA Cores 4352, boost 2.54 GHz. Product page: Shader Cores 22 TFLOPS, 353 AI TOPS (no precision or sparsity stated; one value for both memory sizes).
- TGP is written "165 or 160" against memory "16 GB GDDR6 or 8 GB GDDR6". The record assigns 165 W to 16 GB and 160 W to 8 GB by parallel order. No NVIDIA page was found that labels the pairing.
- The NVIDIA VRAM article (May 18, 2023) mentions "an Ada GPU with 288 GB/sec of peak memory bandwidth" in a 128-bit scenario beside the RTX 4060 Ti discussion, but does not tie the figure to a named SKU. Not used; bandwidth TBD.
- TBD fields (9):
  - memory.bandwidth: No NVIDIA product page, compare page, press release or whitepaper table found that publishes memory bandwidth for this SKU; computing it from a data rate is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.fp8Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-4060-ti-8gb (GeForce RTX 4060 Ti, geforce-desktop)
- 8 GB variant of the RTX 4060 Ti column. Same CUDA count, clocks and AI TOPS as the 16 GB variant per the page.
- TGP 160 W assigned by parallel order; see rtx-4060-ti-16gb.
- TBD fields (9):
  - memory.bandwidth: No NVIDIA product page, compare page, press release or whitepaper table found that publishes memory bandwidth for this SKU; computing it from a data rate is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.fp8Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-4060-8gb (GeForce RTX 4060, geforce-desktop)
- CUDA Cores 3072, boost 2.46 GHz. Product page: Shader Cores 15 TFLOPS, 242 AI TOPS (no precision or sparsity stated).
- TBD fields (9):
  - memory.bandwidth: No NVIDIA product page, compare page, press release or whitepaper table found that publishes memory bandwidth for this SKU; computing it from a data rate is not allowed
  - compute.fp64: No NVIDIA GeForce page or whitepaper table gives an FP64 figure for this GPU
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.fp8Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-5090-32gb (GeForce RTX 5090, geforce-desktop)
- CUDA Cores 21760, boost 2.41 GHz (page), 2407 MHz (whitepaper). The product page figure of 3352 AI TOPS equals the whitepaper's sparse FP4 figure (1676 dense). Whitepaper PCI Express Interface: Gen 5.
- TBD fields (3):
  - compute.fp64: The RTX Blackwell whitepaper states only a ratio ("The FP64 TFLOP rate is 1/64th the TFLOP rate of FP32 operations") and no FP64 figure for any SKU; computing one is not allowed
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp6Tensor: NVIDIA states that RTX Blackwell supports FP6 Tensor Core operations but publishes no FP6 throughput for any GeForce SKU

#### rtx-5080-16gb (GeForce RTX 5080, geforce-desktop)
- CUDA Cores 10752, boost 2.62 GHz. The product page figure of 1801 AI TOPS equals the whitepaper's sparse FP4 figure.
- TBD fields (3):
  - compute.fp64: The RTX Blackwell whitepaper states only a ratio ("The FP64 TFLOP rate is 1/64th the TFLOP rate of FP32 operations") and no FP64 figure for any SKU; computing one is not allowed
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp6Tensor: NVIDIA states that RTX Blackwell supports FP6 Tensor Core operations but publishes no FP6 throughput for any GeForce SKU

#### rtx-5070-ti-16gb (GeForce RTX 5070 Ti, geforce-desktop)
- CUDA Cores 8960, boost 2.45 GHz. The product page figure of 1406 AI TOPS equals the whitepaper's sparse FP4 figure.
- TBD fields (3):
  - compute.fp64: The RTX Blackwell whitepaper states only a ratio ("The FP64 TFLOP rate is 1/64th the TFLOP rate of FP32 operations") and no FP64 figure for any SKU; computing one is not allowed
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp6Tensor: NVIDIA states that RTX Blackwell supports FP6 Tensor Core operations but publishes no FP6 throughput for any GeForce SKU

#### rtx-5070-12gb (GeForce RTX 5070, geforce-desktop)
- CUDA Cores 6144, boost 2.51 GHz. Product page 988 AI TOPS; whitepaper sparse FP4 987.8.
- TBD fields (3):
  - compute.fp64: The RTX Blackwell whitepaper states only a ratio ("The FP64 TFLOP rate is 1/64th the TFLOP rate of FP32 operations") and no FP64 figure for any SKU; computing one is not allowed
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp6Tensor: NVIDIA states that RTX Blackwell supports FP6 Tensor Core operations but publishes no FP6 throughput for any GeForce SKU

#### rtx-5060-ti-16gb (GeForce RTX 5060 Ti, geforce-desktop)
- 16 GB variant. CUDA Cores 4608, boost 2.57 GHz. Product page: Tensor Cores (AI) 759 AI TOPS. The page names no precision or sparsity, so the figure is not stored in a compute field; the RTX Blackwell whitepaper labels "FP4 AI TOPS" as the sparse FP4 figure for the SKUs it covers. No whitepaper table covers the RTX 5060 Ti.
- TBD fields (10):
  - compute.fp64: The RTX Blackwell whitepaper states only a ratio ("The FP64 TFLOP rate is 1/64th the TFLOP rate of FP32 operations") and no FP64 figure for any SKU; computing one is not allowed
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.fp8Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.fp6Tensor: NVIDIA states that RTX Blackwell supports FP6 Tensor Core operations but publishes no FP6 throughput for any GeForce SKU
  - compute.fp4Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-5060-ti-8gb (GeForce RTX 5060 Ti, geforce-desktop)
- 8 GB variant. CUDA Cores 4608, boost 2.57 GHz. Product page: Tensor Cores (AI) 759 AI TOPS. The page names no precision or sparsity, so the figure is not stored in a compute field; the RTX Blackwell whitepaper labels "FP4 AI TOPS" as the sparse FP4 figure for the SKUs it covers. No whitepaper table covers the RTX 5060 Ti.
- TBD fields (10):
  - compute.fp64: The RTX Blackwell whitepaper states only a ratio ("The FP64 TFLOP rate is 1/64th the TFLOP rate of FP32 operations") and no FP64 figure for any SKU; computing one is not allowed
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.fp8Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.fp6Tensor: NVIDIA states that RTX Blackwell supports FP6 Tensor Core operations but publishes no FP6 throughput for any GeForce SKU
  - compute.fp4Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-5060-8gb (GeForce RTX 5060, geforce-desktop)
- CUDA Cores 3840, boost 2.50 GHz. Product page: Tensor Cores (AI) 614 AI TOPS. The page names no precision or sparsity, so the figure is not stored in a compute field; the RTX Blackwell whitepaper labels "FP4 AI TOPS" as the sparse FP4 figure for the SKUs it covers. No whitepaper table covers the RTX 5060.
- TBD fields (10):
  - compute.fp64: The RTX Blackwell whitepaper states only a ratio ("The FP64 TFLOP rate is 1/64th the TFLOP rate of FP32 operations") and no FP64 figure for any SKU; computing one is not allowed
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.fp8Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.fp6Tensor: NVIDIA states that RTX Blackwell supports FP6 Tensor Core operations but publishes no FP6 throughput for any GeForce SKU
  - compute.fp4Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-5050-8gb (GeForce RTX 5050, geforce-desktop)
- CUDA Cores 2560, boost 2.57 GHz. Uses GDDR6, not GDDR7. Product page: Tensor Cores (AI) 421 AI TOPS. The page names no precision or sparsity, so the figure is not stored in a compute field; the RTX Blackwell whitepaper labels "FP4 AI TOPS" as the sparse FP4 figure for the SKUs it covers. No whitepaper table covers the RTX 5050.
- TBD fields (10):
  - compute.fp64: The RTX Blackwell whitepaper states only a ratio ("The FP64 TFLOP rate is 1/64th the TFLOP rate of FP32 operations") and no FP64 figure for any SKU; computing one is not allowed
  - compute.fp64Tensor: No NVIDIA GeForce page or whitepaper table gives an FP64 Tensor figure for this GPU
  - compute.fp32: No NVIDIA whitepaper table covers this SKU; the product page gives no FP32 figure (Ada and Blackwell pages list "Shader Cores" TFLOPS without naming the precision; that number is kept in notes)
  - compute.tf32Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no TF32 figure
  - compute.bf16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no BF16 figure
  - compute.fp16Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no dense FP16 Tensor figure
  - compute.fp8Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.fp6Tensor: NVIDIA states that RTX Blackwell supports FP6 Tensor Core operations but publishes no FP6 throughput for any GeForce SKU
  - compute.fp4Tensor: No NVIDIA whitepaper table covers this SKU; the product page AI TOPS figure names no precision or sparsity
  - compute.int8Tensor: No NVIDIA whitepaper table covers this SKU and the product page gives no INT8 figure

#### rtx-5090-laptop-24gb (GeForce RTX 5090 Laptop GPU, geforce-laptop)
- CUDA Cores 10496; Boost Clock 1597 to 2160 MHz. AI TOPS 1824 (no precision or sparsity stated, so not stored in a compute field). CUDA Capability 12.8 per the compare page.
- TBD fields (10):
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp6Tensor: NVIDIA publishes no dense FP6 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp4Tensor: NVIDIA publishes no dense FP4 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-5080-laptop-16gb (GeForce RTX 5080 Laptop GPU, geforce-laptop)
- CUDA Cores 7680; Boost Clock 1500 to 2287 MHz. AI TOPS 1334 (no precision or sparsity stated, so not stored in a compute field). CUDA Capability 12.8 per the compare page.
- TBD fields (10):
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp6Tensor: NVIDIA publishes no dense FP6 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp4Tensor: NVIDIA publishes no dense FP4 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-5070-ti-laptop-12gb (GeForce RTX 5070 Ti Laptop GPU, geforce-laptop)
- CUDA Cores 5888; Boost Clock 1447 to 2220 MHz. AI TOPS 992 (no precision or sparsity stated, so not stored in a compute field). CUDA Capability 12.8 per the compare page.
- TBD fields (10):
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp6Tensor: NVIDIA publishes no dense FP6 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp4Tensor: NVIDIA publishes no dense FP4 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-5070-laptop-12gb (GeForce RTX 5070 Laptop GPU, geforce-laptop)
- 12 GB configuration of the RTX 5070 Laptop GPU column (the cell lists "12 GB GDDR7" and "8 GB GDDR7" on two lines; the quote joins them with " / "). CUDA Cores 4608; Boost Clock 1425 to 2347 MHz. AI TOPS 798 (no precision or sparsity stated, so not stored in a compute field). CUDA Capability 12.8 per the compare page.
- The RTX 5070 Laptop GPU cell lists "12 GB GDDR7" and "8 GB GDDR7" on one 128-bit interface. It is split into two records under the memory-variant rule. NVIDIA gives one bandwidth (384 GB/s), one power range and one AI TOPS figure for the column.
- TBD fields (10):
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp6Tensor: NVIDIA publishes no dense FP6 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp4Tensor: NVIDIA publishes no dense FP4 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-5070-laptop-8gb (GeForce RTX 5070 Laptop GPU, geforce-laptop)
- 8 GB configuration of the RTX 5070 Laptop GPU column (the cell lists "12 GB GDDR7" and "8 GB GDDR7" on two lines; the quote joins them with " / "). CUDA Cores 4608; Boost Clock 1425 to 2347 MHz. AI TOPS 798 (no precision or sparsity stated, so not stored in a compute field). CUDA Capability 12.8 per the compare page.
- The RTX 5070 Laptop GPU cell lists "12 GB GDDR7" and "8 GB GDDR7" on one 128-bit interface. It is split into two records under the memory-variant rule. NVIDIA gives one bandwidth (384 GB/s), one power range and one AI TOPS figure for the column.
- TBD fields (10):
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp6Tensor: NVIDIA publishes no dense FP6 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp4Tensor: NVIDIA publishes no dense FP4 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-5060-laptop-8gb (GeForce RTX 5060 Laptop GPU, geforce-laptop)
- CUDA Cores 3328; Boost Clock 1455 to 2497 MHz. AI TOPS 572 (no precision or sparsity stated, so not stored in a compute field). CUDA Capability 12.8 per the compare page.
- TBD fields (10):
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp6Tensor: NVIDIA publishes no dense FP6 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp4Tensor: NVIDIA publishes no dense FP4 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-5050-laptop-8gb (GeForce RTX 5050 Laptop GPU, geforce-laptop)
- CUDA Cores 2560; Boost Clock 1500 to 2662 MHz. AI TOPS 440 (no precision or sparsity stated, so not stored in a compute field). CUDA Capability 12.8 per the compare page.
- TBD fields (10):
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp6Tensor: NVIDIA publishes no dense FP6 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp4Tensor: NVIDIA publishes no dense FP4 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-4090-laptop-16gb (GeForce RTX 4090 Laptop GPU, geforce-laptop)
- CUDA Cores 9728; Boost Clock 1455 to 2040 MHz. AI TOPS 686 (no precision or sparsity stated, so not stored in a compute field). CUDA Capability 8.9.
- TBD fields (9):
  - memory.bandwidth: The NVIDIA laptop compare page and the 40 Series laptop page have no Memory Bandwidth row for 40 Series laptop GPUs
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-4080-laptop-12gb (GeForce RTX 4080 Laptop GPU, geforce-laptop)
- CUDA Cores 7424; Boost Clock 1350 to 2280 MHz. AI TOPS 542 (no precision or sparsity stated, so not stored in a compute field). CUDA Capability 8.9.
- TBD fields (9):
  - memory.bandwidth: The NVIDIA laptop compare page and the 40 Series laptop page have no Memory Bandwidth row for 40 Series laptop GPUs
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-4070-laptop-8gb (GeForce RTX 4070 Laptop GPU, geforce-laptop)
- CUDA Cores 4608; Boost Clock 1230 to 2175 MHz. AI TOPS 321 (no precision or sparsity stated, so not stored in a compute field). CUDA Capability 8.9.
- TBD fields (9):
  - memory.bandwidth: The NVIDIA laptop compare page and the 40 Series laptop page have no Memory Bandwidth row for 40 Series laptop GPUs
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-4060-laptop-8gb (GeForce RTX 4060 Laptop GPU, geforce-laptop)
- CUDA Cores 3072; Boost Clock 1470 to 2370 MHz. AI TOPS 233 (no precision or sparsity stated, so not stored in a compute field). CUDA Capability 8.9.
- TBD fields (9):
  - memory.bandwidth: The NVIDIA laptop compare page and the 40 Series laptop page have no Memory Bandwidth row for 40 Series laptop GPUs
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-4050-laptop-6gb (GeForce RTX 4050 Laptop GPU, geforce-laptop)
- CUDA Cores 2560; Boost Clock 1605 to 2370 MHz. AI TOPS 194 (no precision or sparsity stated, so not stored in a compute field). CUDA Capability 8.9.
- TBD fields (9):
  - memory.bandwidth: The NVIDIA laptop compare page and the 40 Series laptop page have no Memory Bandwidth row for 40 Series laptop GPUs
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-3080-ti-laptop-16gb (GeForce RTX 3080 Ti Laptop GPU, geforce-laptop)
- CUDA Cores 7424; Boost Clock 1125 to 1590 MHz. CUDA Capability 8.6.
- TBD fields (8):
  - memory.bandwidth: The NVIDIA 30 Series laptop compare page has no Memory Bandwidth row
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-3080-laptop-16gb (GeForce RTX 3080 Laptop GPU, geforce-laptop)
- 16 GB configuration of a column that lists two memory sizes on two lines (the quote joins them with " / "). CUDA Cores 6144; Boost Clock 1245 to 1710 MHz. CUDA Capability 8.6.
- The RTX 3080 Laptop GPU column lists "16 GB GDDR6" and "8 GB GDDR6" on one 256-bit interface with one power range. Split into two records under the memory-variant rule.
- TBD fields (8):
  - memory.bandwidth: The NVIDIA 30 Series laptop compare page has no Memory Bandwidth row
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-3080-laptop-8gb (GeForce RTX 3080 Laptop GPU, geforce-laptop)
- 8 GB configuration of a column that lists two memory sizes on two lines (the quote joins them with " / "). CUDA Cores 6144; Boost Clock 1245 to 1710 MHz. CUDA Capability 8.6.
- TBD fields (8):
  - memory.bandwidth: The NVIDIA 30 Series laptop compare page has no Memory Bandwidth row
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-3070-ti-laptop-8gb (GeForce RTX 3070 Ti Laptop GPU, geforce-laptop)
- CUDA Cores 5888; Boost Clock 1035 to 1485 MHz. CUDA Capability 8.6.
- TBD fields (8):
  - memory.bandwidth: The NVIDIA 30 Series laptop compare page has no Memory Bandwidth row
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-3070-laptop-8gb (GeForce RTX 3070 Laptop GPU, geforce-laptop)
- CUDA Cores 5120; Boost Clock 1290 to 1620 MHz. CUDA Capability 8.6.
- TBD fields (8):
  - memory.bandwidth: The NVIDIA 30 Series laptop compare page has no Memory Bandwidth row
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-3060-laptop-6gb (GeForce RTX 3060 Laptop GPU, geforce-laptop)
- CUDA Cores 3840; Boost Clock 1283 to 1703 MHz. CUDA Capability 8.6.
- TBD fields (8):
  - memory.bandwidth: The NVIDIA 30 Series laptop compare page has no Memory Bandwidth row
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-3050-ti-laptop-4gb (GeForce RTX 3050 Ti Laptop GPU, geforce-laptop)
- CUDA Cores 2560; Boost Clock 1035 to 1695 MHz. CUDA Capability 8.6.
- TBD fields (8):
  - memory.bandwidth: The NVIDIA 30 Series laptop compare page has no Memory Bandwidth row
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-3050-laptop-6gb (GeForce RTX 3050 Laptop GPU, geforce-laptop)
- 6 GB configuration of a column that lists two memory sizes on two lines (the quote joins them with " / "). CUDA Cores 2048 to 2560; Boost Clock 990 to 1740 MHz. CUDA Capability 8.6.
- The RTX 3050 Laptop GPU column lists CUDA Cores "2048 - 2560", memory "6 GB GDDR6" and "4 GB GDDR6", and interface "64 - 128-bit" without mapping one to another. It is split into 6 GB and 4 GB records; bus width is TBD on both, and the CUDA count and clocks stay as the full published ranges in notes.
- TBD fields (9):
  - memory.bandwidth: The NVIDIA 30 Series laptop compare page has no Memory Bandwidth row
  - memory.busWidth: NVIDIA lists "Memory Interface Width | 64 - 128-bit" for the RTX 3050 Laptop GPU column and does not map the range to the 6 GB or 4 GB configuration
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-3050-laptop-4gb (GeForce RTX 3050 Laptop GPU, geforce-laptop)
- 4 GB configuration of a column that lists two memory sizes on two lines (the quote joins them with " / "). CUDA Cores 2048 to 2560; Boost Clock 990 to 1740 MHz. CUDA Capability 8.6.
- TBD fields (9):
  - memory.bandwidth: The NVIDIA 30 Series laptop compare page has no Memory Bandwidth row
  - memory.busWidth: NVIDIA lists "Memory Interface Width | 64 - 128-bit" for the RTX 3050 Laptop GPU column and does not map the range to the 6 GB or 4 GB configuration
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only

#### rtx-3050-a-laptop-4gb (GeForce RTX 3050 A Laptop GPU, geforce-laptop)
- Listed only as footnote 3 on the India-locale (en-in) 30 Series laptop compare page; the en-us page omits it. Ada Lovelace silicon sold under a 30 Series name. CUDA Cores 1792, CUDA Capability 8.9.
- Found only on https://www.nvidia.com/en-in/geforce/laptops/compare/30-series/ (footnote 3). Included as an RTX 30 Series laptop GPU that NVIDIA documents, despite the regional listing. The footnote gives Ada Lovelace; the table's RTX 3050 column gives Ampere. They are different GPUs, so this is not a conflict.
- TBD fields (10):
  - memory.bandwidth: NVIDIA publishes no memory bandwidth for the RTX 3050 A Laptop GPU
  - compute.fp64: NVIDIA publishes no dense FP64 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp64Tensor: NVIDIA publishes no dense FP64 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp32: NVIDIA publishes no dense FP32 figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.tf32Tensor: NVIDIA publishes no dense TF32 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.bf16Tensor: NVIDIA publishes no dense BF16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp16Tensor: NVIDIA publishes no dense FP16 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.fp8Tensor: NVIDIA publishes no dense FP8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - compute.int8Tensor: NVIDIA publishes no dense INT8 Tensor figure for laptop GPUs; its laptop pages list AI TOPS (no precision or sparsity stated), CUDA cores, clocks, memory and power only
  - interconnect.pcie: Footnote 3 does not state the PCIe generation for the RTX 3050 A Laptop GPU; the Gen 4 row belongs to the RTX 3050 Laptop GPU column

## Variants found and excluded

### NVIDIA Hopper and Blackwell data center GPUs

| Candidate | Decision | Reason and source |
|---|---|---|
| H100 on GH200 (96 GB) | Excluded | MIG guide row "H100 on GH200 \| Hopper \| GH100 \| 9.0 \| 96GB". It is part of the GH200 Grace Hopper Superchip, which is a separate product outside the requested list. The GH200 product page has no specification table. Add GH200 as its own family if needed. |
| H100 64 GB SXM | Excluded | No NVIDIA source found. The MIG guide lists H100-SXM5 only at 80GB and 94GB. |
| H100 PCIe 94 GB | Covered as h100-nvl-94gb | MIG guide row "H100-PCIE ... 94GB". The H100 NVL is the 94 GB PCIe card. |
| H800 | Excluded | Export-control derivative. It is not in the MIG guide supported-products table and has no NVIDIA datasheet among the current data center pages. |
| H20 | Excluded | The MIG guide lists "H20 \| Hopper \| GH100 \| 9.0 \| 96GB" as its own product, not as an H100 variant. A GitHub sample (sglang issue 43085) shows an "NVIDIA H20-3e" with 143771 MiB. No public NVIDIA datasheet exists. |
| HGX B100 / B100 | Excluded | Not in the current Blackwell datasheet (2025-10-28), the HGX page, or the MIG guide. |
| DGX B200 | Merged into b200-sxm-180gb | Same 8x Blackwell SXM baseboard. Its system totals (1,440 GB, 64 TB/s) are in the notes. |
| DGX B300 | Merged into b300-sxm-270gb | Same 8x Blackwell Ultra SXM baseboard (2.1 TB, 62 TB/s). |
| DGX GB200 / DGX GB300 | Merged into the NVL72 records | Same racks. |
| GH200 NVL2 / NVL4 | Excluded | The NVIDIA line card (August 2025) lists "GH200 NVL2 / NVL4". These are Grace Hopper products outside the requested list. |
| HGX Rubin NVL8 / Vera Rubin NVL72 | Excluded | The Rubin generation is outside the requested list. The HGX page has a Rubin table (per GPU: 288 GB HBM4, 22 TB/s). |

### AMD Instinct

| Variant | Decision | Reason | Source |
|---|---|---|---|
| MI308X / MI308 (China) | Excluded | No AMD product page or data sheet. `amd.com/en/products/accelerators/instinct/mi300/mi308x.html` returns 404. Only news reports describe it, as an export-limited MI300X derivative with unpublished specifications. | amd-news-register-mi308 (secondary); 404 checked on 2026-10-18 |
| MI309, MI388X | Excluded | Named only in news reports about export licenses. No AMD spec page or data sheet was found. | web search, 2026-10-18 (no AMD source) |
| MI430X | Excluded | The AMD page has no spec table and no data sheet. It says "The AMD Instinct MI430X GPUs are expected to be available in 2027." Its FP64 claims are "engineering projections". | amd-mi430x-page |
| Helios rack (72x MI455X) | Excluded as a record | A rack-scale reference design, not a GPU. Its figures are rack totals. MI455X is recorded per GPU. | amd-mi400-series-page |
| MI300X Platform | Not a separate record | 8x MI300X on UBB 2.0. Its figures are 8-GPU totals (1.5 TB HBM3). The per-GPU record cites its per-GPU P2P bandwidth only. | amd-mi300x-platform-page, amd-mi300x-platform-ds |
| MI325X Platform | Not a separate record | 8x MI325X, 2.048 TB HBM3E. Its figures are 8-GPU totals. | amd-mi325x-platform-page |
| MI350X Platform | Not a separate record | 8x MI350X, 2.3 TB HBM3E. Its figures are 8-GPU totals. | amd-mi350x-platform-ds |
| MI355X Platform | Not a separate record | 8x MI355X, direct liquid cooled, with an air-cooled option. Its figures are 8-GPU totals. The brochure gives "1400W per module". | amd-mi355x-platform-ds |
| MI355X air-cooled | Not a separate record | The platform brochure mentions an air-cooled option but gives no separate TBP or specs. | amd-mi355x-platform-ds |
| MI350P | Included | AMD documents it publicly with a spec page and a product brochure. | amd-mi350p-page, amd-mi350p-brochure |
| MI455X | Included (flagged) | AMD data sheet LE-93204-00 07/26 and a launch date of 7/23/2026. Volume shipment is not confirmed. | amd-mi455x-page, amd-mi455x-ds |
| MI250X, MI250, MI210, MI100 (CDNA 2 and earlier) | Out of scope | The brief covers MI300 and later. They appear in AMD footnotes only as comparison baselines. | amd-cdna3-wp |

### NVIDIA data center: A series, V100, T4, L4, L40, L40S

| Variant | Decision | Reason and source |
|---|---|---|
| A800 (data center PCIe and SXM, China market) | Excluded | `https://www.nvidia.com/en-us/data-center/a800/` returns 404. The only NVIDIA A800 product page is the `A800 40GB Active Graphics Card` under workstations (`https://www.nvidia.com/en-us/products/workstations/a800/`). NVIDIA does not document A800 as an A100 variant in any source found. The workstation card belongs in the workstation slice. |
| L20 | Excluded | No NVIDIA product page (`/en-us/data-center/l20/`, `/en-us/data-center/products/l20/`, `nvidia.cn/data-center/l20/` all 404) and no NVIDIA datasheet found. China-market part. |
| L2 | Excluded | No NVIDIA product page (`/en-us/data-center/l2/` 404) and no NVIDIA datasheet found. China-market part. |
| Tesla V100 32GB-H (`V100-SXM3-32GB-H`, DGX-2H) | Excluded | Named only in the 418.40.04 driver release notes (`Added support for NVIDIA Tesla V100 32GB-H (V100-SXM3-32GB-H).`). No NVIDIA specification. Can be added as an all-TBD record if wanted. |
| A2 "16GB variants" | No extra record | NVIDIA documents one A2 configuration (16 GB GDDR6, PG179 SKU 220). The brief notes the A2 is `uniquely identified by its complete four part ID`, but no second NVIDIA-documented A2 SKU was found. |
| A100 80GB PCIe liquid-cooled single-slot | Folded into `a100-pcie-80gb` | Same datasheet column: `dual-slot air cooled or single-slot liquid cooled`. No separate figures. |
| A100 80GB SXM CTS (500 W) | Folded into `a100-sxm4-80gb` | Footnote to the 400 W TDP; no other figure changes. |
| V100 SXM3 32 GB | Included (`v100-sxm3-32gb`) | Documented by name in NVIDIA docs; mostly TBD. |
| V100 FHHL | Included (`v100-fhhl`) | Documented by name in the vGPU 13 user guide; all numeric fields TBD. |
| HGX A100, DGX A100, DGX-2, HGX-2 | Excluded | Systems, not GPU products. |
| A10G and other cloud-specific parts | Not investigated | Outside the requested scope; no NVIDIA datasheet was searched. |

### NVIDIA workstation RTX: A series, Ada Generation, RTX PRO Blackwell

| Variant | Evidence | Decision |
|---|---|---|
| RTX PRO Blackwell laptop GPUs, RTX Ada Generation laptop GPUs, RTX A-series laptop GPUs (for example RTX 2000 Ada Laptop, RTX A1000 / A2000 8GB Laptop) | NVIDIA laptop pages and the 2023 professional line card (`rtx-6000-l40-linecard-nvidia-us-2653097-r7-web.pdf`) list them | Excluded: workstation laptop GPUs are out of scope. |
| Embedded MXM modules: RTX PRO 5000 / 4000 / 2000 / 500 Blackwell (embedded), RTX 5000 / 3500 / 2000 Ada Generation (embedded), Ampere embedded modules | nvidia.com/en-us/products/workstations/rtx-embedded/ tables (for example "NVIDIA RTX 2000 Ada Generation" at "256 GB/sec") | Excluded: embedded modules, not workstation add-in boards, and not in the requested list. Their specs differ from the same-named desktop cards. |
| NVIDIA A800 40GB Active | nvidia.com/en-us/products/workstations/a800/ ("A800 40GB Active Graphics Card") | Excluded: exists as an Ampere workstation card but is not RTX-branded and not in the requested list. Specs not collected. Recommend a decision on whether a later slice covers it. |
| RTX PRO 6000 Blackwell Server Edition, liquid-cooled single-slot FHXL build | Product page quick specs "Liquid: Single-Slot, FHXL" | Folded into rtx-pro-6000-blackwell-se-96gb; NVIDIA publishes no separate specification. |
| RTX PRO 5500 Blackwell, liquid-cooled RXM build | Product page "Liquid-cooled solution is available in the RXM form factor." | Folded into rtx-pro-5500-blackwell-we-84gb; no separate specification. |
| RTX PRO Server (8x RTX PRO 6000 Server Edition system) | nvidia.com/en-us/data-center/products/rtx-pro-server/ | Excluded: a system, not a GPU. |
| RTX A400 / A1000 | Both have nvidia.com product pages and datasheets | Included (rtx-a400-4gb, rtx-a1000-8gb), as the request allowed when documented. |
| RTX 2000E Ada Generation | NVIDIA datasheet 4328932 in the resources.nvidia.com datasheet collection | Included (rtx-2000e-ada-16gb); no product page found. |
| RTX 5880 Ada Generation | nvidia.com product page | Included (rtx-5880-ada-48gb) with several TBDs. |
| RTX PRO 2000 Blackwell, RTX PRO 5000 72GB Blackwell | Product pages and datasheets | Included. |
| RTX PRO 5500 Blackwell Workstation Edition | Product page (preliminary specs) | Included although not requested. |
| RTX PRO 4500 Blackwell Server Edition | Data center product page, datasheet, product brief | Included although not requested; segment datacenter. |

### NVIDIA GeForce RTX 30, 40 and 50 Series (desktop and laptop)

- GeForce RTX 3050 (OEM), 8 GB, 2304 CUDA Cores. Source: footnote 1 on https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3050/ ("GeForce RTX 3050 (OEM) has 2304 CUDA Cores, a Base Clock of 1.51 GHz, and a Boost Clock of 1.76 GHz"). Decision: excluded as an OEM-only SKU; NVIDIA gives only its cores and clocks.
- GeForce RTX 4090 D. Source: https://www.nvidia.cn/geforce/graphics-cards/40-series/rtx-4090-d/ (China site only; no en-us page). Decision: excluded as a China-only SKU.
- GeForce RTX 5090 D and RTX 5090 D v2. Source: https://www.nvidia.cn/geforce/graphics-cards/50-series/rtx-5090-d/ redirects to https://www.nvidia.cn/geforce/graphics-cards/50-series/rtx-5090-d-v2/ (China site only). Decision: excluded as China-only SKUs.
- GeForce RTX 4080 12 GB. Not listed on any current NVIDIA page checked; the Ada whitepaper V2.02 names the 4080 column "RTX 4080 16 GB" and has no 12 GB table. The card was withdrawn before launch and shipped as the RTX 4070 Ti (this history is not stated on the pages checked). Decision: excluded; the RTX 4070 Ti record covers the shipped product.
- Max-Q and Max-P laptop naming (RTX 30 Series laptops). The current NVIDIA laptop pages list one column per laptop GPU with a GPU Subsystem Power range and no separate Max-Q SKUs (source: https://www.nvidia.com/en-us/geforce/laptops/compare/30-series/). Decision: no Max-Q records; the power range in each laptop record spans the low-power and high-power designs.
- GeForce RTX 50 Series SUPER cards. None is listed on https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/ or the compare page as of 2026-10-18. Decision: nothing to record.
- GeForce RTX 2050 (laptop). Outside scope by name (20 Series), although NVIDIA builds it on Ampere. Decision: excluded.
- Included after review, not excluded: GeForce RTX 3050 (6 GB) desktop, GeForce RTX 3060 8 GB, GeForce RTX 3060 Ti GDDR6X, GeForce RTX 3080 12 GB, GeForce RTX 4070 GDDR6, GeForce RTX 3080 Laptop GPU 8 GB, GeForce RTX 3050 Laptop GPU 6 GB and 4 GB, GeForce RTX 5070 Laptop GPU 12 GB and 8 GB, and GeForce RTX 3050 A Laptop GPU (en-in page only). Each appears on a current NVIDIA page; the reasons are in the per-GPU sections.

## Sources that back a decision, not a value

These sources are in `data/gpus.json` because a conflict or an exclusion above rests on them. No field cites them directly.

| Source id | What it backs |
|---|---|
| `nv-hgx-hopper-ds` | The "19GB/s / 38GB/s" aggregate bandwidth misprints, not used (H200 section). |
| `nv-gb200-page` | The 13.4 TB rack HBM total against 13.5 TB in the datasheet (GB200 section). |
| `nv-dgx-b200-ds` | The DGX B200 totals, 1,440 GB and 64 TB/s, that give 8 TB/s per GPU against 7.7 TB/s (B200 section), and the DGX B200 merge. |
| `nv-dgx-b300-ds` | The DGX B300 totals, 2.1 TB and 62 TB/s, and the DGX B300 merge. |
| `nv-dgx-gb200-ds` | The 13.4 TB total and the bidirectional 1.8 TB/s NVLink (GB200 section), and the DGX GB200 merge. |
| `amd-mi350-series-page` | The partner quotes on MI350P support (MI350P section). |
| `dc-ga102-wp` | The GA102 whitepaper V2.0, the earlier revision of the V2.1 document cited for values. |
| `dc-a16-page` | The A16 product page, checked against the A16 datasheet the record cites. |
