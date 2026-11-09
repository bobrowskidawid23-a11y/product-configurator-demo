import test from "node:test";
import assert from "node:assert/strict";

import { calculateConfiguration, validateConfiguration } from "../src/configurator-core.js";

test("calculates a drawer configuration with synthetic pricing", () => {
  const result = calculateConfiguration({
    family: "drawer",
    width: 600,
    height: 180,
    finish: "graphite",
    quantity: 2,
  });

  assert.equal(result.valid, true);
  assert.equal(result.netTotal, 532);
  assert.equal(result.grossTotal, 654.36);
  assert.deepEqual(result.parts.map((part) => part.code), ["BODY-600", "FRONT-600", "RUNNER-500"]);
});

test("rejects unsupported dimensions without guessing a price", () => {
  const errors = validateConfiguration({
    family: "lift",
    width: 2600,
    height: 900,
    finish: "white",
    quantity: 1,
  });

  assert.match(errors.join(" "), /szerokość/i);
  assert.throws(() => calculateConfiguration({
    family: "lift",
    width: 2600,
    height: 900,
    finish: "white",
    quantity: 1,
  }), /nieprawidłowa/i);
});

test("calculates countertop area and rounds money deterministically", () => {
  const result = calculateConfiguration({
    family: "countertop",
    width: 1200,
    height: 650,
    finish: "sand",
    quantity: 1,
  });

  assert.equal(result.netTotal, 959.4);
  assert.equal(result.grossTotal, 1180.06);
  assert.equal(result.summary, "Blat 1200 × 650 mm, piaskowy");
});
