// Fails if package.json and app.json versions differ.
const pkg = require("../package.json");
const app = require("../app.json");

if (pkg.version !== app.expo.version) {
  console.error(
    `Version mismatch: package.json is ${pkg.version}, app.json is ${app.expo.version}`,
  );
  process.exit(1);
}
