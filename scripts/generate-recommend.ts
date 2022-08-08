import { parse } from "https://deno.land/std/encoding/jsonc.ts";
import * as bufio from "https://deno.land/std/io/bufio.ts";
import * as path from "https://deno.land/std/path/mod.ts";

const tsconfigStorage = await Deno.makeTempDir({ prefix: "tsconfig" });

// Generate a tsconfig
const p = await Deno.run({ cmd: ["npx", "-p", "typescript", "tsc", "--init"], stdout: "piped", cwd: tsconfigStorage });
for await (const line of bufio.readLines(p.stdout!)) {
  console.warn(line);
}

let packageText = await Deno.readTextFile(path.join(tsconfigStorage, "tsconfig.json"));
// This will strip comments
const parsed = parse(packageText) as any;

parsed["$schema"] = "https://json.schemastore.org/tsconfig";
parsed.display = "Recommended";
parsed.compilerOptions.target = "ES2015";

const result = JSON.stringify(parsed, null, "  ");

const npmResponse = await fetch(`https://unpkg.com/@tsconfig/svelte/tsconfig.json`);
const npmPackage = await npmResponse.text();

if (npmPackage !== result) {
  Deno.writeTextFile("bases/recommended.json", result);
}
