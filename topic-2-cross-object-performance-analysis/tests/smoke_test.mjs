/**
 * Automated Render & Empirical Cohort Smoke Test (`tests/smoke_test.mjs`)
 */

import assert from "node:assert/strict";
import { DEMO_LOGS } from "../frontend/src/data/demoPayloads.js?v=10";
import {
  computeEmpiricalCohort,
  evaluateEmpiricalWhatIf
} from "../frontend/src/data/empiricalCohortData.js?v=10";
import { renderCapacityView } from "../frontend/src/views/capacityView.js?v=10";
import { renderComparisonView } from "../frontend/src/views/comparisonView.js?v=10";
import { renderDelayView } from "../frontend/src/views/delayView.js?v=10";
import { renderFlowMapView } from "../frontend/src/views/flowMapView.js?v=10";
import { renderOverviewView } from "../frontend/src/views/overviewView.js?v=10";
import { renderStarterView } from "../frontend/src/views/starterView.js?v=10";
import { renderTimelineView } from "../frontend/src/views/timelineView.js?v=10";

const starterHtml = renderStarterView();
assert.ok(starterHtml.includes("Intersect"), "Starter view should render brand name");

for (const logId of ["order-management", "ocel2-p2p"]) {
  const log = DEMO_LOGS[logId];

  // Verify empirical cohorts are strictly non-increasing as threshold rises
  const c15 = computeEmpiricalCohort(logId, 1.5, log.comparison.baseStalledEur, log.defaultSlaDays);
  const c30 = computeEmpiricalCohort(logId, 3.0, log.comparison.baseStalledEur, log.defaultSlaDays);
  const c75 = computeEmpiricalCohort(logId, 7.5, log.comparison.baseStalledEur, log.defaultSlaDays);
  assert.ok(
    c15.delayedCount > c30.delayedCount && c30.delayedCount > c75.delayedCount,
    `Empirical delayed counts for ${logId} must decrease monotonically with threshold`
  );

  // Verify What-If simulator recovers cases monotonically with reduction %
  const w20 = evaluateEmpiricalWhatIf(logId, 3.0, 20, 0.74);
  const w60 = evaluateEmpiricalWhatIf(logId, 3.0, 60, 0.74);
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
      assert.ok(cmpHtml.length > 200, "Compare Cases rendered");
      assert.ok(tlHtml.length > 200, "Case Timeline rendered");
      assert.ok(
        !tlHtml.includes("On-Time (&le; 3.0d threshold) · 4.6 days"),
        "No contradictory On-Time badge on Timeline"
      );
    }
  }
}

console.log("ALL_SMOKE_TESTS_PASSED_OK");
