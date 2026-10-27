#!/bin/sh
# Structure checks for the layered architecture (controller -> service -> dao).
cd "$(dirname "$0")/.." || exit 1

fail=0
err() {
  echo "check-structure: $1" >&2
  fail=1
}

# (a) every module directory needs its module file, plus controller/service
for dir in src/modules/*/; do
  name=$(basename "$dir")
  [ -f "$dir$name.module.ts" ] || err "src/modules/$name is missing $name.module.ts"
  if [ "$name" = "integrations" ]; then
    [ -f "$dir$name.controller.ts" ] || err "src/modules/$name is missing $name.controller.ts"
  else
    [ -f "$dir$name.controller.ts" ] || err "src/modules/$name is missing $name.controller.ts"
    [ -f "$dir$name.service.ts" ] || err "src/modules/$name is missing $name.service.ts"
  fi
done

# (b) controllers must not touch dao, entities or typeorm
for f in $(find src -name '*.controller.ts'); do
  if grep -En "from ['\"][^'\"]*(/dao/|/entities/|typeorm)" "$f" >/dev/null; then
    err "$f: controllers must not import from /dao/, /entities/ or typeorm"
  fi
done

# (c) services must stay HTTP-agnostic
for f in $(find src -name '*.service.ts'); do
  if grep -En "from ['\"]express['\"]|@Req\(|@Res\(" "$f" >/dev/null; then
    err "$f: services must not import express or use @Req()/@Res()"
  fi
done

# (d) one class per dto file
for f in $(find src -path '*/dto/*.dto.ts'); do
  n=$(grep -c '^export class' "$f")
  [ "$n" -le 1 ] || err "$f: more than one 'export class' ($n)"
done

# (e) daos must not depend on services or controllers
for f in $(find src -path '*/dao/*.ts'); do
  if grep -En "from ['\"][^'\"]*\.(service|controller)\.js['\"]" "$f" >/dev/null; then
    err "$f: daos must not import .service.js or .controller.js"
  fi
done

[ "$fail" -eq 0 ] || exit 1
echo "check-structure: ok"
