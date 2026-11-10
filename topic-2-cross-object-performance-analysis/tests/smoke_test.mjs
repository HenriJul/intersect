/**
 * Automated Render, Empirical Cohort & Schema Explanations Smoke Test (`tests/smoke_test.mjs`)
 */

import assert from "node:assert/strict";
import { DEMO_LOGS, RAW_DEMO_LOGS } from "../frontend/src/data/demoPayloads.js?v=12";
import {
  computeEmpiricalCohort,
  evaluateEmpiricalWhatIf
} from "../frontend/src/data/empiricalCohortData.js?v=12";
import {
  getResolvedLog,
  renderSchemaTextEditorModal,
  resetAllSchemaExplanations,
  saveFullSchemaExplanations
} from "../frontend/src/data/schemaTexts.js?v=12";
import { renderCapacityView } from "../frontend/src/views/capacityView.js?v=12";
import { renderComparisonView } from "../frontend/src/views/comparisonView.js?v=12";
import { renderDelayView } from "../frontend/src/views/delayView.js?v=12";
import { renderFlowMapView } from "../frontend/src/views/flowMapView.js?v=12";
import { renderOverviewView } from "../frontend/src/views/overviewView.js?v=12";
import { renderStarterView } from "../frontend/src/views/starterView.js?v=12";
import { renderTimelineView } from "../frontend/src/views/timelineView.js?v=12";

const starterHtml = renderStarterView();
assert.ok(starterHtml.includes("Intersect"), "Starter view should render brand name");
assert.ok(starterHtml.includes("Order Management"), "Starter dropdown resolves process title from schema");

for (const logId of ["order-management", "ocel2-p2p"]) {
  // Verify raw structural payload has no hardcoded summaryText prose
  const rawLog = RAW_DEMO_LOGS[logId];
  const firstRawStep = Object.values(rawLog.steps)[0];
  assert.equal(firstRawStep.summaryText, undefined, "Raw structural payload should not hardcode step prose");

  // Verify resolved log populates all process-specific labels & descriptions from schemaTexts.js
  const log = DEMO_LOGS[logId];
  const resolvedCheck = getResolvedLog(rawLog);
  assert.ok(log.title.length > 3, `Resolved log title populated for ${logId}`);
  assert.equal(resolvedCheck.isSchemaCustomized, false, `Default profile is active on boot for ${logId}`);
  assert.ok(resolvedCheck.steps[log.defaultStepId].summaryText.length > 20, "Resolved step summaryText populated");

  // Verify live session editing works and resetting restores the default schema profile
  saveFullSchemaExplanations(rawLog, log.defaultStepId, {
    processTitle: "Custom Session Title"
  });
  assert.equal(DEMO_LOGS[logId].title, "Custom Session Title", "Live session edit updates resolved log title");
  resetAllSchemaExplanations(rawLog);
  assert.equal(DEMO_LOGS[logId].isSchemaCustomized, false, "Reset restores default schema profile");

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
        activePage: "overview",
        selectedStepId: log.defaultStepId,
        selectedTeamId: log.capacity.defaultTeamId,
        slaThresholdDays,
        whatIfReductionPct: 40,
        showExceptions: true,
        showChain: true,
        showDelayDescriptions,
        timelineMode: "both",
        selectedEventKey: "delayed-0-0",
        selectedEventInfo: { label: "Test Event", meta: "Apr 05 · Actor" },
        schemaEditorTab: "steps"
      };

      const ovHtml = renderOverviewView(log, state);
      const flowHtml = renderFlowMapView(log, state);
      const delayHtml = renderDelayView(log, state);
      const capHtml = renderCapacityView(log, state);
      const cmpHtml = renderComparisonView(log, state);
      const tlHtml = renderTimelineView(log, state);
      const modalHtml = renderSchemaTextEditorModal(rawLog, state, true);

      // Every page should include the Edit Explanations button
      for (const [name, html] of [
        ["Overview", ovHtml],
        ["Process Flow", flowHtml],
        ["Delay Breakdown", delayHtml],
        ["Team Workload", capHtml],
        ["Compare Cases", cmpHtml],
        ["Case Timeline", tlHtml]
      ]) {
        assert.ok(html.includes("Edit Explanations"), `${name} should include Edit Explanations button`);
      }

      assert.ok(modalHtml.includes("Overview &amp; Flow"), "Modal includes Overview & Flow tab");
      assert.ok(modalHtml.includes("Step Explanations"), "Modal includes Step Explanations tab");
      assert.ok(modalHtml.includes("Team Workload"), "Modal includes Team Workload tab");
      assert.ok(modalHtml.includes("Compare &amp; Timeline"), "Modal includes Compare & Timeline tab");
      assert.ok(
        !tlHtml.includes("On-Time (&le; 3.0d threshold) · 4.6 days"),
        "No contradictory On-Time badge on Timeline"
      );
    }
  }
}

console.log("ALL_SMOKE_TESTS_PASSED_OK");
