#!/bin/bash
set -euo pipefail
task_root="$(cd "$(dirname "$0")/.." && pwd)"
if ! command -v cmake >/dev/null || ! command -v brew >/dev/null; then
  echo "Install Xcode command-line tools and Homebrew, then: brew install cmake sdl2 python" >&2
  exit 1
fi
task_sdl_prefix="$(brew --prefix sdl2)"
task_data_args=()
if [[ -f "$task_root/data/original/LEVEL1.CA2" ]]; then
  task_data_args+=("-DCATACOMB_TEST_DATA=$task_root/data/original")
fi
cmake -S "$task_root" -B "$task_root/build" \
  -DCMAKE_BUILD_TYPE=Debug -DSDL2_DIR="$task_sdl_prefix/lib/cmake/SDL2" \
  -DPython3_EXECUTABLE="$(command -v python3)" "${task_data_args[@]}"
cmake --build "$task_root/build" --parallel
ctest --test-dir "$task_root/build" --output-on-failure
