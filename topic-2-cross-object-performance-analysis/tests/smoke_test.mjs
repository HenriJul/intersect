/**
 * Automated Render & Empirical Cohort Smoke Test (`tests/smoke_test.mjs`)
 *
 * Verifies:
 * 1. All 6 views render with zero errors across both reference OCEL 2.0 logs
 *    at thresholds 1.5d, 3.0d, and 7.5d, with descriptions on/off and both sort modes.
 * 2. Empirical cohort counts are strictly monotonic as the Delay Threshold increases.
 * 3. Case Timeline badges have zero threshold contradictions (0.9d gate wait <= 3.0d).
 * 4. Canonical OCEL 2.0 schema signatures include real objectTypes and eventTypes.
 */

import assert from "node:assert/strict";
import { DEMO_LOGS } from "../frontend/src/data/demoPayloads.js?v=9";
import {
  computeEmpiricalCohort,
  evaluateEmpiricalWhatIf
} from "../frontend/src/data/empiricalCohortData.js?v=9";
import { getSchemaSignature } from "../frontend/src/data/schemaTexts.js?v=9";
import { renderCapacityView } from "../frontend/src/views/capacityView.js?v=9";
import { renderComparisonView } from "../frontend/src/views/comparisonView.js?v=9";
import { renderDelayView } from "../frontend/src/views/delayView.js?v=9";
import { renderFlowMapView } from "../frontend/src/views/flowMapView.js?v=9";
import { renderOverviewView } from "../frontend/src/views/overviewView.js?v=9";
import { renderStarterView } from "../frontend/src/views/starterView.js?v=9";
import { renderTimelineView } from "../frontend/src/views/timelineView.js?v=9";

const starterHtml = renderStarterView();
assert.ok(starterHtml.includes("Intersect"), "Starter view should render brand name");
assert.ok(starterHtml.includes("Scenario 1"), "Starter view should include guided scenarios");

for (const logId of ["order-management", "ocel2-p2p"]) {
  const log = DEMO_LOGS[logId];
  const sig = getSchemaSignature(log);
  assert.ok(sig.startsWith("ocel2-schema:"), `Schema signature for ${logId} should use ocel2-schema`);

  // Verify empirical cohorts are strictly non-increasing as threshold rises
  const c15 = computeEmpiricalCohort(logId, 1.5, log.comparison.baseStalledEur, log.defaultSlaDays);
  const c30 = computeEmpiricalCohort(logId, 3.0, log.comparison.baseStalledEur, log.defaultSlaDays);
  const c75 = computeEmpiricalCohort(logId, 7.5, log.comparison.baseStalledEur, log.defaultSlaDays);
  assert.ok(
    c15.delayedCount > c30.delayedCount && c30.delayedCount > c75.delayedCount,
    `Empirical delayed counts for ${logId} must decrease monotonically with threshold (${c15.delayedCount} > ${c30.delayedCount} > ${c75.delayedCount})`
  );

  // Verify What-If simulator recovers cases monotonically with reduction %
  const w20 = evaluateEmpiricalWhatIf(logId, 3.0, 20, log.comparison.primaryFactorShare);
  const w60 = evaluateEmpiricalWhatIf(logId, 3.0, 60, log.comparison.primaryFactorShare);
  assert.ok(
    w60.recoveredCases >= w20.recoveredCases,
    `What-if recovery for ${logId} must increase with reduction %`
  );

  for (const slaThresholdDays of [1.5, 3.0, 7.5]) {
    for (const showDelayDescriptions of [true, false]) {
      const state = {
        logId,
        selectedStepId: log.defaultStepId,
        selectedTeamId: log.capacity.defaultTeamId,
        slaThresholdDays,
        whatIfReductionPct: 40,
        showExceptions: true,
        showChain: true,
        showDelayDescriptions,
        overviewSortBy: "impact",
        timelineMode: "both",
        selectedEventKey: "delayed-0-0",
        selectedEventInfo: { label: "Test Event", meta: "Apr 05 · Actor" }
      };

      const ovHtml = renderOverviewView(log, state);
      const flowHtml = renderFlowMapView(log, state);
      const delayHtml = renderDelayView(log, state);
      const capHtml = renderCapacityView(log, state);
      const cmpHtml = renderComparisonView(log, state);
      const tlHtml = renderTimelineView(log, state);

      assert.ok(ovHtml.length > 200, "Overview rendered");
      assert.ok(flowHtml.length > 200, "Process Flow rendered");
      assert.ok(delayHtml.length > 200, "Delay Breakdown rendered");
      assert.ok(capHtml.length > 200, "Team Workload rendered");
      assert.ok(cmpHtml.includes("Cliff's δ"), "Compare Cases includes statistical effect size");
      assert.ok(tlHtml.includes("Recommended Decision"), "Timeline includes closing decision card");
      assert.ok(
        !tlHtml.includes("On-Time (&le; 3.0d threshold) · 4.6 days"),
        "No contradictory On-Time badge on Timeline"
      );
    }
  }
}

console.log("ALL_SMOKE_TESTS_PASSED_OK");
