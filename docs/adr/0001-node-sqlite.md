# Use `node:sqlite` (experimental) instead of `better-sqlite3`

The app uses Node's built-in `node:sqlite` (behind `--experimental-sqlite`) rather than the stable `better-sqlite3` package. This was chosen because `better-sqlite3` is a native addon that frequently fails to build on Windows and requires a matching C++ toolchain. `node:sqlite` ships with the runtime — zero build steps, no platform-specific failures.

The query surface is small (flat SELECT/INSERT with no joins), so the experimental API risk is acceptable. If `node:sqlite` is ever removed or breaks, migration to `better-sqlite3` is straightforward: the schema, queries, and types are nearly identical.
