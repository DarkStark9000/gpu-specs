// The fields every GPU record carries, the one unit each number uses, and the CSV column it becomes.

export const SEGMENTS = ["datacenter", "workstation", "geforce-desktop", "geforce-laptop"];
export const VENDORS = ["NVIDIA", "AMD"];
export const TIERS = ["primary", "secondary"];

/** [path, unit or null for text, CSV column] */
export const FIELDS = [
  ["name", null, "name"],
  ["architecture", null, "architecture"],
  ["formFactor", null, "form_factor"],
  ["memory.capacity", "GB", "memory_gb"],
  ["memory.type", null, "memory_type"],
  ["memory.bandwidth", "GB/s", "memory_bandwidth_gbps"],
  ["memory.busWidth", "bits", "memory_bus_bits"],
  ["memory.reported", "MiB", "memory_reported_mib"],
  ["compute.fp64", "TFLOPS", "fp64_tflops"],
  ["compute.fp64Tensor", "TFLOPS", "fp64_tensor_tflops"],
  ["compute.fp32", "TFLOPS", "fp32_tflops"],
  ["compute.tf32Tensor", "TFLOPS", "tf32_tensor_tflops"],
  ["compute.bf16Tensor", "TFLOPS", "bf16_tensor_tflops"],
  ["compute.fp16Tensor", "TFLOPS", "fp16_tensor_tflops"],
  ["compute.fp16TensorFp16Acc", "TFLOPS", "fp16_tensor_fp16_acc_tflops"],
  ["compute.fp8Tensor", "TFLOPS", "fp8_tensor_tflops"],
  ["compute.fp8TensorFp16Acc", "TFLOPS", "fp8_tensor_fp16_acc_tflops"],
  ["compute.fp6Tensor", "TFLOPS", "fp6_tensor_tflops"],
  ["compute.fp4Tensor", "TFLOPS", "fp4_tensor_tflops"],
  ["compute.int8Tensor", "TOPS", "int8_tensor_tops"],
  ["interconnect.gpuLink", "GB/s", "gpu_link_gbps"],
  ["interconnect.gpuLinkPerDirection", "GB/s", "gpu_link_per_direction_gbps"],
  ["interconnect.infinityFabricLinks", "links", "infinity_fabric_links"],
  ["interconnect.pcie", null, "pcie"],
  ["maxPowerW", "W", "max_power_w"],
];

/** Fields every record must have; the others appear only where they apply. */
export const REQUIRED = new Set([
  "name",
  "architecture",
  "formFactor",
  "memory.capacity",
  "memory.type",
  "memory.bandwidth",
  "memory.busWidth",
  "compute.fp64",
  "compute.fp32",
  "compute.bf16Tensor",
  "compute.fp16Tensor",
  "compute.fp8Tensor",
  "compute.fp4Tensor",
  "compute.int8Tensor",
  "interconnect.pcie",
  "maxPowerW",
]);

export function at(record, path) {
  return path.split(".").reduce((node, key) => node?.[key], record);
}
