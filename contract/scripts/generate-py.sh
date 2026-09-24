#!/usr/bin/env sh
# Generates Pydantic v2 models for the pipeline from the bundled contract schema.
# Creates contract/.venv on first run and reinstalls when requirements-codegen.txt changes.
# Usage: sh scripts/generate-py.sh <bundle-path> <output-path>
set -eu

bundle=$1
out=$2
cd "$(dirname "$0")/.."

python=${PYTHON:-python3}
if [ ! -x .venv/bin/datamodel-codegen ] || ! cmp -s requirements-codegen.txt .venv/requirements-codegen.txt; then
  "$python" -m venv .venv
  .venv/bin/pip install --quiet --disable-pip-version-check -r requirements-codegen.txt
  cp requirements-codegen.txt .venv/requirements-codegen.txt
fi

mkdir -p "$(dirname "$out")"
.venv/bin/datamodel-codegen \
  --input "$bundle" \
  --input-file-type jsonschema \
  --output "$out" \
  --output-model-type pydantic_v2.BaseModel \
  --target-python-version 3.12 \
  --formatters builtin \
  --use-title-as-name \
  --strict-nullable \
  --use-annotated \
  --field-constraints \
  --use-type-alias \
  --use-standard-collections \
  --use-union-operator \
  --enum-field-as-literal all \
  --use-double-quotes \
  --use-schema-description \
  --use-field-description \
  --disable-timestamp \
  --custom-file-header "# GENERATED from contract/schemas. Do not edit; run \`npm run codegen\` in contract/."
