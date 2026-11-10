/**
 * Schema-Matched Explanations Manager (`frontend/src/data/schemaTexts.js`)
 *
 * Centralizes all process-specific textual labels, titles, and plain-language explanations
 * across all 6 pages of Intersect (Overview, Process Flow, Delay Breakdown, Team Workload,
 * Compare Cases, and Case Timeline).
 *
 * - Matches event logs by their structural OCEL 2.0 Schema Signature
 *   (the combination of tracked object types and shared event types).
 * - Defines the default explanations for the example schemas (Order Management & Procure-to-Pay)
 *   and auto-generates sensible plain-language fallbacks for any unseen OCEL schema.
 * - Keeps custom edits in an in-memory session store so any log sharing the same schema
 *   inherits customized explanations across all 6 pages during the active session, while
 *   reloading the page cleanly reapplies the default descriptions for the two example logs.
 */

const LEGACY_STORAGE_KEYS = ["intersect-schema-texts-v1", "intersect-schema-texts-v2"];
let sessionSchemaProfiles = {};

// Clear any previously cached localStorage overrides so page reloads always start on defaults
try {
  if (typeof window !== "undefined" && window.localStorage) {
    for (const key of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
  }
} catch {
  // Ignore storage restrictions
}

export const EDITOR_TABS = [
  { id: "flow", label: "Overview & Flow" },
  { id: "steps", label: "Step Explanations" },
  { id: "teams", label: "Team Workload" },
  { id: "compare", label: "Compare & Timeline" }
];

export function pageToEditorTab(activePage) {
  if (activePage === "overview" || activePage === "flow") return "flow";
  if (activePage === "delays") return "steps";
  if (activePage === "teams") return "teams";
  if (activePage === "compare" || activePage === "timeline") return "compare";
  return "steps";
}

export function getSchemaSignature(log) {
  if (!log) return "unknown-schema";
  const objTypes = (log.tracks || [])
    .map((t) => t.id)
    .slice()
    .sort()
    .join("+");
  const stepTypes = Object.keys(log.steps || {})
    .slice()
    .sort()
    .join("+");
  return `ocel-schema:${objTypes}::${stepTypes}`;
}

/**
 * Default Schema-Matched Explanations for the two example OCEL schemas.
 * Zero process-specific text is hardcoded in the views or structural payload file;
 * all human-readable labels and explanations originate here (or from user overrides).
 */
export const DEFAULT_SCHEMA_PROFILES = {
  "ocel-schema:employees+items+orders+packages::confirm-order+create-package+package-delivered+pay-order": {
    processTitle: "Order Management",
    delayedUnitLabel: "delayed packages",
    kpiLabels: ["Tracked Objects", "Slowest Shared Step", "Delayed Order Value"],
    kpiSubs: [
      "6 object types · 21,008 events",
      "3.8 days avg wait",
      "468 delayed packages"
    ],
    tracks: {
      orders: { label: "Orders", sub: "2,000 orders" },
      items: { label: "Items", sub: "7,659 items" },
      employees: { label: "Staff", sub: "18 employees" },
      packages: { label: "Packages", sub: "1,128 packages" }
    },
    singleSteps: {
      "place-order": "Place Order",
      "pick-item": "Pick Item",
      "send-package": "Send Package"
    },
    exceptionLoops: {
      "oos-loop": "Out of Stock → Reorder",
      "reminder-loop": "Payment Reminder",
      "failed-deliv-loop": "Failed Delivery"
    },
    steps: {
      "create-package": {
        name: "Create Package",
        volume: "1,106 packages",
        mainDelaySource: "Out-of-Stock Items (74%)",
        primaryCauseTag: "Waiting for Items (78%)",
        summaryText:
          "Packing cannot start until every item belonging to the shipment has arrived at the packing station and a warehouse employee is available. Most of the 3.8-day delay happens because already-picked items sit waiting on the shelf while out-of-stock items from the same order are reordered.",
        allItemsDesc:
          "Picked items sitting at the packing station waiting for the last missing item of the same package.",
        otherObjectsDesc:
          "Items from separate customer orders being grouped together into one combined delivery box.",
        teamDesc:
          "All items for the package are physically ready, but waiting for a free warehouse packer.",
        delaySourceLabels: [
          "Items (Out of stock & reorder)",
          "Orders (Multi-order merge)",
          "Warehousing Team Queue"
        ],
        delaySourceDescs: [
          "When even a single item in an order is out of stock, every other item for that box is held back until supplier restocking completes.",
          "Combining items from multiple orders into one shipment forces earlier orders to wait for later ones to be picked.",
          "During peak reorder waves, all 7 warehouse employees are busy picking and restocking, leaving ready boxes waiting to be packed."
        ],
        chainStages: ["Upstream Cause", "Bottleneck Step", "Downstream Effect"],
        chainNames: ["Item Out of Stock", "Create Package", "Payment Reminders"],
        chainMetrics: [
          "1,544 items · +4.1d reorder",
          "+3.8d avg wait · 6.8 items/box",
          "566 reminders · 2.1× rate"
        ],
        chainDescs: [
          "1,544 ordered items are out of stock and must be reordered from suppliers before picking can finish.",
          "Because each package bundles ~6.8 items, one missing item blocks 5–6 already-picked items from being packed.",
          "Customers withhold payment while waiting for delayed shipments, more than doubling late-payment reminders."
        ]
      },
      "pay-order": {
        name: "Pay Order",
        volume: "2,000 orders",
        mainDelaySource: "Late Delivery (68%)",
        primaryCauseTag: "Waiting for Delivery (71%)",
        summaryText:
          "Customer orders are only paid once all items from the order have been packed, shipped, and received by the customer. When warehouse backlogs or split packages delay delivery, invoice settlement stalls for an average of 6.1 days.",
        allItemsDesc:
          "Orders split across multiple packages waiting for the final parcel of the order to arrive.",
        otherObjectsDesc:
          "Order invoice waiting while packages are still delayed in warehouse packing or transit.",
        teamDesc:
          "Processing time after delivery, including automated payment reminders and billing follow-up.",
        delaySourceLabels: [
          "Items & Packages in Transit",
          "Customer Post-Reminder Delay",
          "Order Confirmation Lag"
        ],
        delaySourceDescs: [
          "Customers wait until every package belonging to their order has been delivered before settling the invoice.",
          "Orders that experienced shipping delays require 1–3 payment reminders before the customer transfers funds.",
          "Initial sales review delays push out the entire fulfillment and billing schedule from day one."
        ],
        chainStages: ["Upstream Cause", "Bottleneck Step", "Downstream Effect"],
        chainNames: ["Late Package Creation", "Pay Order", "Open Receivables"],
        chainMetrics: [
          "468 delayed boxes",
          "+6.1d settlement lag",
          "€428,900 · 566 reminders"
        ],
        chainDescs: [
          "Out-of-stock items delay package assembly in the warehouse for 468 shipments.",
          "Orders remain unpaid while customers wait for complete delivery of all ordered items.",
          "€428,900 in revenue is tied up in overdue receivables requiring manual dunning reminders."
        ]
      },
      "package-delivered": {
        name: "Package Delivered",
        volume: "1,128 packages",
        mainDelaySource: "Shipment Team Busy (63%)",
        primaryCauseTag: "Team Queue (90%)",
        summaryText:
          "Once packages are sealed, they must be dispatched and delivered by the 6-person Shipment team. Because the warehouse releases packed boxes in large waves after restocking arrives, the shipment team becomes overloaded and packages queue up waiting for a driver.",
        allItemsDesc:
          "All items are already sealed inside the package before dispatch begins.",
        otherObjectsDesc:
          "Packages waiting briefly at the loading dock to be grouped onto the same delivery route.",
        teamDesc:
          "Sealed packages waiting in dispatch because all 6 shipment employees are out on routes or handling retries.",
        delaySourceLabels: [
          "Shipment Team Queue (6 staff)",
          "Failed Delivery Retries",
          "Dispatch Handover"
        ],
        delaySourceDescs: [
          "All 6 shipment staff are occupied with ongoing deliveries when large batches of packed boxes arrive at once.",
          "311 delivery attempts fail on the first try and must be re-queued for a repeat trip the next day.",
          "Routine handover time between warehouse packing completion and van loading."
        ],
        chainStages: ["Upstream Cause", "Bottleneck Step", "Downstream Effect"],
        chainNames: ["Bulk Packing Waves", "Package Delivered", "Failed Deliveries"],
        chainMetrics: ["Clustered releases", "90% team queue", "311 retry attempts"],
        chainDescs: [
          "Replenished stock arrives in batches, causing the warehouse to finish many delayed boxes at the same time.",
          "The 6 shipment employees cannot absorb the sudden wave of boxes, creating a 17-hour dispatch backlog.",
          "Late and rescheduled delivery windows lead to 311 missed customer handovers and repeat trips."
        ]
      },
      "confirm-order": {
        name: "Confirm Order",
        volume: "2,000 orders",
        mainDelaySource: "Sales Team Queue (81%)",
        primaryCauseTag: "Team Queue (81%)",
        summaryText:
          "Every incoming customer order must be reviewed and confirmed by a Sales representative before the warehouse is allowed to start picking items. Most of the 0.7-day wait comes from orders queuing for one of the 5 Sales employees during high-volume mornings.",
        allItemsDesc:
          "All requested line items are submitted together when the customer places the order.",
        otherObjectsDesc:
          "Catalog price and availability verification across the requested product items.",
        teamDesc:
          "Submitted orders waiting in the inbox for one of the 5 Sales representatives to review and approve.",
        delaySourceLabels: ["Sales Review Queue (5 staff)", "Item Price Check"],
        delaySourceDescs: [
          "The 5-person Sales team also handles customer inquiries and payment reminders, slowing down new order sign-offs.",
          "Orders with many distinct items require manual stock and pricing checks before confirmation."
        ],
        chainStages: ["Upstream Cause", "Bottleneck Step", "Downstream Effect"],
        chainNames: ["Place Order", "Confirm Order", "Warehouse Picking"],
        chainMetrics: ["2,000 B2B orders", "0.7d avg wait", "7,659 items released"],
        chainDescs: [
          "Customer orders arrive in morning peaks and enter the shared Sales review queue.",
          "Orders wait an average of 16.8 hours for a Sales representative to confirm them.",
          "Warehouse picking for all 7,659 items is held back until order confirmation is completed."
        ]
      }
    },
    teams: {
      warehousing: {
        name: "Warehousing",
        members: "7 employees",
        avgQueue: "19.9h avg queue",
        peakLoad: "89% peak load",
        peakSummary: "Nov '23 Peak · 96 waiting packages (+41% reorder spike)",
        splitLabels: ["Pick Item", "Reorders", "Packing"]
      },
      shipment: {
        name: "Shipment",
        members: "6 employees",
        avgQueue: "16.6h avg queue",
        peakLoad: "78% peak load",
        peakSummary: "Nov '23 Peak · 57 packages queued in dispatch",
        splitLabels: ["Send Package", "Delivered", "Retries"]
      },
      sales: {
        name: "Sales",
        members: "5 employees",
        avgQueue: "13.7h avg queue",
        peakLoad: "51% peak load",
        peakSummary: "Nov '23 Peak · 16 unconfirmed orders (balanced)",
        splitLabels: ["Confirm Order"]
      }
    },
    comparison: {
      delayTargetLabel: "Out-of-Stock Item Delay",
      rippleUnit: "payment reminders",
      factorTitles: [
        "Has Out-of-Stock Item",
        "6+ Items in Package",
        "Warehouse Load Above 80%"
      ],
      factorCases: ["492 packages", "384 packages", "276 packages"]
    },
    timeline: {
      delayedCase: {
        caseId: "Package p-660016",
        meta: "Danube Pharmaceuticals BV · Orders o-990007 & o-990023 · €1,014.99",
        waitSummary: "19.0 days total · missing items reordered",
        laneLabels: [
          "Order o-990007",
          "Item i-880036",
          "Order o-990023",
          "Item i-880107",
          "Item i-880105",
          "Package p-660016"
        ],
        laneSubs: [
          "Order",
          "Out of stock",
          "Order",
          "Waited 10.0d",
          "Out of stock",
          "Package"
        ]
      },
      healthyCase: {
        caseId: "Package p-660007",
        meta: "AlpenTech Innovations AG · Order o-990011 · €778.98",
        waitSummary: "4.6 days total · all items in stock",
        laneLabels: [
          "Order o-990011",
          "Item i-880054",
          "Item i-880053",
          "Item i-880052",
          "Package p-660007"
        ],
        laneSubs: ["Order", "In stock", "In stock", "In stock", "Package"]
      }
    }
  },

  "ocel-schema:fin+gr+po+pr::approve-po+create-gr+execute-payment+two-way-match": {
    processTitle: "Procure-to-Pay",
    delayedUnitLabel: "delayed payments",
    kpiLabels: ["Tracked Objects", "Slowest Shared Step", "Delayed Invoice Value"],
    kpiSubs: [
      "7 object types · 14,671 events",
      "5.3 days avg wait",
      "512 delayed payments"
    ],
    tracks: {
      pr: { label: "Requisitions", sub: "729 PRs · 2,296 materials" },
      po: { label: "Purchase Orders", sub: "927 RFQs · 1,598 POs" },
      gr: { label: "Goods Receipts", sub: "4,042 receipts" },
      fin: { label: "Invoices & Pay", sub: "1,941 invoices · 1,166 paid" }
    },
    singleSteps: {
      "create-pr": "Create PR",
      "approve-pr": "Approve PR",
      "create-rfq": "Create RFQ",
      "create-po": "Create PO",
      "create-inv": "Create Invoice"
    },
    exceptionLoops: {
      "delegate-pr": "Delegate Approval",
      "split-gr-loop": "Partial Deliveries"
    },
    steps: {
      "execute-payment": {
        name: "Execute Payment",
        volume: "1,166 payments",
        mainDelaySource: "Partial Goods Receipts (61%)",
        primaryCauseTag: "Split Deliveries & Finance Queue",
        summaryText:
          "Supplier invoices can only be paid once the purchase order, all physical goods receipts, and the two-way invoice match are complete. Payments wait 5.3 days on average because suppliers ship orders in multiple partial deliveries and the Finance team is tied up matching earlier partial receipts.",
        allItemsDesc:
          "Invoices waiting for the final partial goods receipt of a split supplier delivery to arrive.",
        otherObjectsDesc:
          "Waiting for warehouse goods receipts and purchase order quantities to be verified against the invoice.",
        teamDesc:
          "Verified invoices sitting in the Finance queue waiting for the next scheduled payment run.",
        delaySourceLabels: [
          "Goods Receipts & Final Match",
          "Finance Payment Batch Queue",
          "Purchase Order Alignment"
        ],
        delaySourceDescs: [
          "Suppliers split a single purchase order into 2–3 partial deliveries, blocking final invoice clearance until the last shipment is logged.",
          "The Finance team processes invoice intake, two-way matches, and payment runs with the same staff, creating a 2.8-day payment backlog.",
          "Quantity or price differences between the original purchase order and supplier delivery require manual clarification."
        ],
        chainStages: ["Upstream Cause", "Midstream Ripple", "Bottleneck Step"],
        chainNames: [
          "Delegated PR & Late PO",
          "Partial Goods Receipts",
          "Execute Payment"
        ],
        chainMetrics: [
          "122 delegations · +3.6d",
          "4,042 receipts (2.5 / PO)",
          "+5.3d wait · €1.42M delayed"
        ],
        chainDescs: [
          "Purchase requisitions are passed between approvers, delaying purchase order release to the supplier.",
          "With less lead time, suppliers ship whatever stock they have first, creating 2.5 separate goods receipts per order.",
          "Each partial delivery triggers extra matching work for Finance and holds back €1.42M in supplier payments."
        ]
      },
      "approve-po": {
        name: "Approve Purchase Order",
        volume: "1,598 POs",
        mainDelaySource: "Order Manager Queue (72%)",
        primaryCauseTag: "Approver Queue (72%)",
        summaryText:
          "Before an order can be sent to a vendor, an Order Manager must review the quotation and sign off on the purchase order. Most of the 3.6-day wait occurs when approvals are delegated between managers or wait in the approver inbox.",
        allItemsDesc:
          "All requested line items are already listed on the draft purchase order.",
        otherObjectsDesc:
          "Waiting for vendor quotation details and requisition sign-off documents to be attached.",
        teamDesc:
          "Draft purchase orders waiting in the Order Manager inbox for formal review and signature.",
        delaySourceLabels: [
          "Order Manager Approval Queue",
          "Quotation Comparison Wait"
        ],
        delaySourceDescs: [
          "Purchase orders wait an average of 2.6 days for an Order Manager to review and sign off.",
          "Procurement staff must align supplier quotation terms with the internal requisition before approval."
        ],
        chainStages: ["Upstream Cause", "Bottleneck Step", "Downstream Effect"],
        chainNames: [
          "Delegate PR Approval",
          "Approve Purchase Order",
          "Split Vendor Shipments"
        ],
        chainMetrics: [
          "122 delegated PRs",
          "+2.6d approver queue",
          "1.8× partial deliveries"
        ],
        chainDescs: [
          "122 purchase requisitions are forwarded to a second manager when the primary approver is unavailable.",
          "Purchase orders pile up in the approval queue for 3.6 days total before reaching the vendor.",
          "Late purchase orders leave vendors with shorter delivery windows, nearly doubling partial shipments."
        ]
      },
      "two-way-match": {
        name: "Perform Two-Way Match",
        volume: "1,941 matches",
        mainDelaySource: "Missing Goods Receipt (58%)",
        primaryCauseTag: "Waiting for Goods Receipt (82%)",
        summaryText:
          "Before Finance can release an invoice for payment, they must match the vendor's invoice against the warehouse's goods receipt. In 58% of delayed cases, the digital invoice arrives first while the physical delivery is still waiting at the warehouse dock to be logged.",
        allItemsDesc:
          "Invoices waiting for additional partial delivery lines from the same purchase order.",
        otherObjectsDesc:
          "Invoice received by Finance, waiting for the warehouse to post the matching goods receipt.",
        teamDesc:
          "Both documents are present and waiting for a Finance clerk to complete the verification.",
        delaySourceLabels: [
          "Goods Receipt Posted After Invoice",
          "Invoice Arriving After Receipt",
          "Finance Match Queue"
        ],
        delaySourceDescs: [
          "Vendors email invoices immediately upon dispatch, so the invoice sits waiting until the warehouse receives and logs the delivery.",
          "Goods are already in the warehouse, waiting for the supplier's billing department to send the invoice.",
          "Time spent in the Finance queue when clerks are busy resolving quantity discrepancies."
        ],
        chainStages: ["Upstream Cause", "Bottleneck Step", "Downstream Effect"],
        chainNames: [
          "Warehouse Dock-to-Post Lag",
          "Perform Two-Way Match",
          "Execute Payment"
        ],
        chainMetrics: [
          "+1.5d unposted GR",
          "1,941 matches held",
          "Missed weekly payment run"
        ],
        chainDescs: [
          "Delivered pallets take 1.5 days at the warehouse dock before being recorded in the system.",
          "Finance cannot verify 1,941 invoices until the corresponding goods receipt appears.",
          "Invoices that miss the weekly cutoff wait several extra days for the next payment batch."
        ]
      },
      "create-gr": {
        name: "Create Goods Receipt",
        volume: "1,598 POs",
        mainDelaySource: "Split Shipments (64%)",
        primaryCauseTag: "Partial Shipments (58%)",
        summaryText:
          "Each time a supplier truck arrives, warehouse staff inspect the delivery and log a goods receipt against the purchase order. Because suppliers frequently split one purchase order into 2–3 partial deliveries, receiving takes 2.8 days on average across all shipments.",
        allItemsDesc:
          "Time gap between the first partial truck delivery and the final remaining items of the purchase order.",
        otherObjectsDesc:
          "Cross-checking delivered quantities against the open purchase order paperwork.",
        teamDesc:
          "Unloaded pallets waiting at the receiving dock for warehouse staff to count and book them.",
        delaySourceLabels: [
          "Partial Supplier Shipments",
          "Warehouse Receiving Queue"
        ],
        delaySourceDescs: [
          "Suppliers deliver orders in multiple partial shipments days apart instead of a single complete drop-off.",
          "Receiving staff must inspect, count, and book 2.5× as many individual deliveries per purchase order."
        ],
        chainStages: ["Upstream Cause", "Bottleneck Step", "Downstream Effect"],
        chainNames: [
          "Compressed Vendor Lead Time",
          "Create Goods Receipt",
          "Two-Way Match"
        ],
        chainMetrics: [
          "Late PO sign-off",
          "2.53 receipts per PO",
          "Repeated invoice matching"
        ],
        chainDescs: [
          "Delayed purchase order approvals leave suppliers with less time to assemble complete shipments.",
          "Warehouse staff must log 4,042 separate goods receipts across 1,598 purchase orders.",
          "Every partial receipt forces Finance to re-check invoice lines before payment can be approved."
        ]
      }
    },
    teams: {
      finance: {
        name: "Finance Department",
        members: "5,048 events",
        avgQueue: "67.6h payment queue",
        peakLoad: "93% peak load",
        peakSummary: "Q1 '24 Peak · 124 waiting payments (€1.42M)",
        splitLabels: ["Create Invoice", "Two-Way Match", "Payment"]
      },
      "warehouse-p2p": {
        name: "Warehouse Department",
        members: "4,042 receipts",
        avgQueue: "28.5h posting lag",
        peakLoad: "88% peak load",
        peakSummary: "Q1 '24 Peak · 91 unposted receipts at Plant 4000",
        splitLabels: ["Initial Receipt", "Partial Follow-ups"]
      },
      "order-mgr": {
        name: "Procurement Approvers",
        members: "2,205 approvals",
        avgQueue: "63.1h PO queue",
        peakLoad: "82% peak load",
        peakSummary: "Q1 '24 Peak · 74 POs awaiting sign-off",
        splitLabels: ["Approve PO", "Approve PR"]
      }
    },
    comparison: {
      delayTargetLabel: "Partial Delivery & Match Delay",
      rippleUnit: "extra invoice matches",
      factorTitles: [
        "3+ Partial Goods Receipts on PO",
        "Delegated Requisition Approval",
        "Plant 4000 / Group 005 Vendors"
      ],
      factorCases: ["438 payments", "122 requisitions", "289 POs"]
    },
    timeline: {
      delayedCase: {
        caseId: "Payment payment:807",
        meta: "Chainring Champions Inc · PO purchase_order:1384 · €96,750",
        waitSummary: "14.1 days total · waiting on second delivery",
        laneLabels: [
          "PO :1384",
          "Receipt :1670",
          "Receipt :1669",
          "Invoice :1679",
          "Payment :807"
        ],
        laneSubs: [
          "Purchase Order",
          "Waited 13.2d",
          "Late Lot #2",
          "Invoice",
          "€96,750"
        ]
      },
      healthyCase: {
        caseId: "Payment payment:6",
        meta: "Quality Helmets Co · PO purchase_order:17 · €53,700",
        waitSummary: "3.5 hours alignment · single full delivery",
        laneLabels: ["PO :17", "Receipt :21", "Invoice :13", "Payment :6"],
        laneSubs: ["Purchase Order", "Full delivery", "Invoice", "€53,700"]
      }
    }
  }
};

function loadAllSavedSchemaProfiles() {
  return sessionSchemaProfiles;
}

function writeAllSavedSchemaProfiles(profiles) {
  sessionSchemaProfiles = { ...profiles };
}

function humanizeId(id) {
  return String(id || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getSchemaProfile(rawLog) {
  const sig = getSchemaSignature(rawLog);
  const defaults = DEFAULT_SCHEMA_PROFILES[sig] || {};
  const savedAll = loadAllSavedSchemaProfiles();
  const custom = savedAll[sig] || null;
  return { sig, defaults, custom, isCustomized: Boolean(custom) };
}

export function getSchemaReadableSummary(log) {
  if (!log) return "";
  const objNames = (log.tracks || []).map((t) => t.label || humanizeId(t.id)).join(", ");
  const stepCount = Object.keys(log.steps || {}).length;
  return `Object types: ${objNames} · ${stepCount} shared steps`;
}

/**
 * Resolves a structural OCEL log (`rawLog`) with all process-specific labels,
 * titles, and explanations from the Schema Explanations store (default profile + user overrides).
 */
export function getResolvedLog(rawLog) {
  if (!rawLog) return null;
  const { sig, defaults, custom, isCustomized } = getSchemaProfile(rawLog);

  const pick = (customVal, defaultVal, fallbackVal) => {
    if (typeof customVal === "string" && customVal.trim().length > 0) return customVal.trim();
    if (typeof defaultVal === "string" && defaultVal.trim().length > 0) return defaultVal;
    return fallbackVal;
  };

  const processTitle = pick(
    custom && custom.processTitle,
    defaults.processTitle,
    humanizeId(rawLog.logId)
  );
  const delayedUnitLabel = pick(
    custom && custom.delayedUnitLabel,
    defaults.delayedUnitLabel,
    "delayed cases"
  );

  // Resolve tracks
  const tracks = (rawLog.tracks || []).map((t) => {
    const defT = (defaults.tracks && defaults.tracks[t.id]) || {};
    const cusT = (custom && custom.tracks && custom.tracks[t.id]) || {};
    return {
      ...t,
      label: pick(cusT.label, defT.label, humanizeId(t.id)),
      sub: pick(cusT.sub, defT.sub, `${t.count || ""}`)
    };
  });

  // Resolve steps first so sharedSteps and overview KPIs can reference step names
  const steps = {};
  for (const [stepId, rawStep] of Object.entries(rawLog.steps || {})) {
    const defS = (defaults.steps && defaults.steps[stepId]) || {};
    const cusS = (custom && custom.steps && custom.steps[stepId]) || {};
    const bd = rawStep.breakdown || {};

    const delaySources = (rawStep.delaySources || []).map((src, idx) => ({
      ...src,
      label: pick(
        cusS.delaySourceLabels && cusS.delaySourceLabels[idx],
        defS.delaySourceLabels && defS.delaySourceLabels[idx],
        `Source ${idx + 1}`
      ),
      desc: pick(
        cusS.delaySourceDescs && cusS.delaySourceDescs[idx],
        defS.delaySourceDescs && defS.delaySourceDescs[idx],
        ""
      )
    }));

    const chain = (rawStep.chain || []).map((c, idx) => ({
      ...c,
      stage: pick(
        cusS.chainStages && cusS.chainStages[idx],
        defS.chainStages && defS.chainStages[idx],
        idx === 0 ? "Upstream Cause" : idx === 1 ? "Bottleneck Step" : "Downstream Effect"
      ),
      name: pick(
        cusS.chainNames && cusS.chainNames[idx],
        defS.chainNames && defS.chainNames[idx],
        humanizeId(stepId)
      ),
      metric: pick(
        cusS.chainMetrics && cusS.chainMetrics[idx],
        defS.chainMetrics && defS.chainMetrics[idx],
        c.metric || ""
      ),
      desc: pick(
        cusS.chainDescs && cusS.chainDescs[idx],
        defS.chainDescs && defS.chainDescs[idx],
        ""
      )
    }));

    steps[stepId] = {
      ...rawStep,
      name: pick(cusS.name, defS.name, humanizeId(stepId)),
      volume: pick(cusS.volume, defS.volume, rawStep.volume || ""),
      mainDelaySource: pick(cusS.mainDelaySource, defS.mainDelaySource, ""),
      primaryCauseTag: pick(cusS.primaryCauseTag, defS.primaryCauseTag, ""),
      summaryText: pick(cusS.summaryText, defS.summaryText, ""),
      breakdown: {
        ...bd,
        allItemsDesc: pick(cusS.allItemsDesc, defS.allItemsDesc, ""),
        otherObjectsDesc: pick(cusS.otherObjectsDesc, defS.otherObjectsDesc, ""),
        teamDesc: pick(cusS.teamDesc, defS.teamDesc, "")
      },
      delaySources,
      chain
    };
  }

  // Resolve flowGraph labels
  const singleSteps = ((rawLog.flowGraph && rawLog.flowGraph.singleSteps) || []).map((s) => ({
    ...s,
    label: pick(
      custom && custom.singleSteps && custom.singleSteps[s.id],
      defaults.singleSteps && defaults.singleSteps[s.id],
      humanizeId(s.id)
    )
  }));

  const exceptionLoops = ((rawLog.flowGraph && rawLog.flowGraph.exceptionLoops) || []).map(
    (ex) => ({
      ...ex,
      label: pick(
        custom && custom.exceptionLoops && custom.exceptionLoops[ex.id],
        defaults.exceptionLoops && defaults.exceptionLoops[ex.id],
        humanizeId(ex.id)
      )
    })
  );

  const sharedSteps = ((rawLog.flowGraph && rawLog.flowGraph.sharedSteps) || []).map((g) => ({
    ...g,
    label: steps[g.id] ? steps[g.id].name : humanizeId(g.id)
  }));

  // Resolve Overview KPIs
  const defaultStep = steps[rawLog.defaultStepId] || Object.values(steps)[0] || { name: "—" };
  const overviewKpis = (rawLog.overviewKpis || []).map((k, idx) => ({
    ...k,
    label: pick(
      custom && custom.kpiLabels && custom.kpiLabels[idx],
      defaults.kpiLabels && defaults.kpiLabels[idx],
      `Metric ${idx + 1}`
    ),
    value: idx === 1 ? defaultStep.name : k.value,
    sub: pick(
      custom && custom.kpiSubs && custom.kpiSubs[idx],
      defaults.kpiSubs && defaults.kpiSubs[idx],
      k.sub || ""
    )
  }));

  // Resolve Team Workload
  const teams = ((rawLog.capacity && rawLog.capacity.teams) || []).map((t) => {
    const defTeam = (defaults.teams && defaults.teams[t.id]) || {};
    const cusTeam = (custom && custom.teams && custom.teams[t.id]) || {};
    return {
      ...t,
      name: pick(cusTeam.name, defTeam.name, humanizeId(t.id)),
      members: pick(cusTeam.members, defTeam.members, t.members || ""),
      avgQueue: pick(cusTeam.avgQueue, defTeam.avgQueue, t.avgQueue || ""),
      peakLoad: pick(cusTeam.peakLoad, defTeam.peakLoad, t.peakLoad || ""),
      peakSummary: pick(cusTeam.peakSummary, defTeam.peakSummary, ""),
      splits: (t.splits || []).map((sp, idx) => ({
        ...sp,
        label: pick(
          cusTeam.splitLabels && cusTeam.splitLabels[idx],
          defTeam.splitLabels && defTeam.splitLabels[idx],
          `Activity ${idx + 1}`
        )
      }))
    };
  });

  // Resolve Compare Cases
  const defComp = defaults.comparison || {};
  const cusComp = (custom && custom.comparison) || {};
  const comparison = {
    ...rawLog.comparison,
    delayTargetLabel: pick(cusComp.delayTargetLabel, defComp.delayTargetLabel, "Primary Delay"),
    rippleUnit: pick(cusComp.rippleUnit, defComp.rippleUnit, "downstream events"),
    factors: ((rawLog.comparison && rawLog.comparison.factors) || []).map((f, idx) => ({
      ...f,
      title: pick(
        cusComp.factorTitles && cusComp.factorTitles[idx],
        defComp.factorTitles && defComp.factorTitles[idx],
        `Factor ${idx + 1}`
      ),
      cases: pick(
        cusComp.factorCases && cusComp.factorCases[idx],
        defComp.factorCases && defComp.factorCases[idx],
        f.cases || ""
      )
    }))
  };

  // Resolve Case Timeline
  const resolveTimelineCase = (rawCase, key) => {
    const defC = (defaults.timeline && defaults.timeline[key]) || {};
    const cusC = (custom && custom.timeline && custom.timeline[key]) || {};
    return {
      ...rawCase,
      caseId: pick(cusC.caseId, defC.caseId, rawCase.caseId || key),
      meta: pick(cusC.meta, defC.meta, ""),
      waitSummary: pick(cusC.waitSummary, defC.waitSummary, ""),
      lanes: (rawCase.lanes || []).map((ln, idx) => ({
        ...ln,
        objectLabel: pick(
          cusC.laneLabels && cusC.laneLabels[idx],
          defC.laneLabels && defC.laneLabels[idx],
          ln.objectLabel || `Object ${idx + 1}`
        ),
        subLabel: pick(
          cusC.laneSubs && cusC.laneSubs[idx],
          defC.laneSubs && defC.laneSubs[idx],
          ln.subLabel || ""
        )
      }))
    };
  };

  const timeline = {
    delayedCase: resolveTimelineCase(rawLog.timeline.delayedCase, "delayedCase"),
    healthyCase: resolveTimelineCase(rawLog.timeline.healthyCase, "healthyCase")
  };

  const resolvedLog = {
    ...rawLog,
    title: processTitle,
    delayedUnitLabel,
    isSchemaCustomized: isCustomized,
    schemaSignature: sig,
    overviewKpis,
    tracks,
    flowGraph: {
      singleSteps,
      exceptionLoops,
      sharedSteps
    },
    steps,
    capacity: {
      ...rawLog.capacity,
      teams
    },
    comparison,
    timeline
  };

  resolvedLog.schemaSummary = getSchemaReadableSummary(resolvedLog);
  return resolvedLog;
}

/**
 * Compatibility helper for Delay Breakdown view.
 */
export function getResolvedStepTexts(log, stepId) {
  const resolvedLog = log.steps && log.steps[stepId] && log.steps[stepId].summaryText
    ? log
    : getResolvedLog(log);
  const step = resolvedLog.steps[stepId] || resolvedLog.steps[resolvedLog.defaultStepId];
  const bd = step.breakdown;

  return {
    isCustomized: Boolean(resolvedLog.isSchemaCustomized),
    schemaSignature: resolvedLog.schemaSignature || getSchemaSignature(resolvedLog),
    schemaSummary: resolvedLog.schemaSummary || getSchemaReadableSummary(resolvedLog),
    summaryText: step.summaryText,
    allItemsDesc: bd.allItemsDesc,
    otherObjectsDesc: bd.otherObjectsDesc,
    teamDesc: bd.teamDesc,
    delaySourceDescs: step.delaySources.map((src) => src.desc),
    chainDescs: step.chain.map((c) => c.desc)
  };
}

export function saveFullSchemaExplanations(rawLog, stepId, updates) {
  const sig = getSchemaSignature(rawLog);
  const allProfiles = loadAllSavedSchemaProfiles();
  const existing = allProfiles[sig] || {
    tracks: {},
    singleSteps: {},
    exceptionLoops: {},
    steps: {},
    teams: {},
    comparison: {},
    timeline: {}
  };

  if (updates.processTitle !== undefined) existing.processTitle = updates.processTitle;
  if (updates.delayedUnitLabel !== undefined) existing.delayedUnitLabel = updates.delayedUnitLabel;
  if (Array.isArray(updates.kpiLabels)) existing.kpiLabels = updates.kpiLabels;

  if (updates.tracks) {
    existing.tracks = { ...(existing.tracks || {}), ...updates.tracks };
  }
  if (updates.singleSteps) {
    existing.singleSteps = { ...(existing.singleSteps || {}), ...updates.singleSteps };
  }
  if (updates.exceptionLoops) {
    existing.exceptionLoops = { ...(existing.exceptionLoops || {}), ...updates.exceptionLoops };
  }

  if (stepId && updates.step) {
    existing.steps = existing.steps || {};
    existing.steps[stepId] = {
      ...(existing.steps[stepId] || {}),
      ...updates.step
    };
  }

  if (updates.teams) {
    existing.teams = { ...(existing.teams || {}), ...updates.teams };
  }

  if (updates.comparison) {
    existing.comparison = { ...(existing.comparison || {}), ...updates.comparison };
  }

  if (updates.timeline) {
    existing.timeline = { ...(existing.timeline || {}), ...updates.timeline };
  }

  allProfiles[sig] = existing;
  writeAllSavedSchemaProfiles(allProfiles);
}

export function resetAllSchemaExplanations(rawLog) {
  const sig = getSchemaSignature(rawLog);
  const allProfiles = loadAllSavedSchemaProfiles();
  if (allProfiles[sig]) {
    delete allProfiles[sig];
    writeAllSavedSchemaProfiles(allProfiles);
  }
}

// Keep backward-compatible aliases
export const saveStepSchemaTexts = saveFullSchemaExplanations;
export const resetStepSchemaTexts = resetAllSchemaExplanations;

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderSchemaTextEditorModal(rawLog, state, isOpen) {
  if (!isOpen || !rawLog) return "";

  const log = getResolvedLog(rawLog);
  const step = log.steps[state.selectedStepId] || log.steps[log.defaultStepId];
  const allSteps = Object.values(log.steps);
  const activeTab = state.schemaEditorTab || pageToEditorTab(state.activePage);

  return `
    <div class="modal-overlay" data-action="close-modal-backdrop">
      <div class="modal-box modal-box-wide" role="dialog" aria-modal="true" aria-labelledby="schema-editor-title">
        <div class="schema-modal-header">
          <div>
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted);">
                Schema-Matched Process Explanations
              </span>
              <span class="badge ${log.isSchemaCustomized ? "badge-amber" : "badge-neutral"}">
                ${log.isSchemaCustomized ? "Customized for Schema" : "Default Schema Text"}
              </span>
            </div>
            <h2 id="schema-editor-title" style="margin:4px 0 0; font-size:19px; font-weight:700; letter-spacing:-0.02em;">
              Edit Explanations — ${escapeHtml(log.title)}
            </h2>
            <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">
              Applies across all 6 pages for logs matching <strong>${escapeHtml(log.schemaSummary)}</strong>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn btn-sm" data-action="close-modal" aria-label="Close editor">Close</button>
          </div>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid var(--border-soft); flex-wrap:wrap;">
          <div style="display:inline-flex; gap:6px; flex-wrap:wrap;" role="tablist" aria-label="Explanation Sections">
            ${EDITOR_TABS.map(
              (t) => `
              <button type="button"
                      class="btn btn-sm ${activeTab === t.id ? "btn-dark" : ""}"
                      data-action="set-schema-editor-tab"
                      data-tab="${t.id}">
                ${escapeHtml(t.label)}
              </button>
            `
            ).join("")}
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <label for="schema-modal-step-select" style="font-size:12px; color:var(--text-muted); font-weight:500;">Shared Step:</label>
            <select id="schema-modal-step-select" class="select-input" data-action="select-step-in-editor">
              ${allSteps
                .map(
                  (s) =>
                    `<option value="${s.id}" ${s.id === step.id ? "selected" : ""}>${escapeHtml(s.name)}</option>`
                )
                .join("")}
            </select>
          </div>
        </div>

        <form id="schema-text-editor-form" class="schema-editor-body" onsubmit="return false;">
          <!-- TAB 1: OVERVIEW & FLOW -->
          <div data-editor-panel="flow" style="display:${activeTab === "flow" ? "flex" : "none"}; flex-direction:column; gap:14px;">
            <div class="schema-editor-section">
              <div class="schema-section-heading">Process &amp; Overview Labels</div>
              <div class="schema-grid-2">
                <div>
                  <label class="schema-field-label" for="field-process-title">Process Title</label>
                  <input id="field-process-title" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(log.title)}" />
                </div>
                <div>
                  <label class="schema-field-label" for="field-delayed-unit">Delayed Unit Label (Overview KPI)</label>
                  <input id="field-delayed-unit" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(log.delayedUnitLabel)}" />
                </div>
              </div>
              <div class="schema-grid-3" style="margin-top:10px;">
                ${log.overviewKpis
                  .map(
                    (k, idx) => `
                    <div>
                      <label class="schema-field-label" for="field-kpi-label-${idx}">KPI Card ${idx + 1} Label</label>
                      <input id="field-kpi-label-${idx}" data-kpi-idx="${idx}" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(k.label)}" />
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </div>

            <div class="schema-editor-section">
              <div class="schema-section-heading">Object Lanes (Process Flow Tracks)</div>
              <div class="schema-grid-2">
                ${log.tracks
                  .map(
                    (t) => `
                    <div style="display:flex; gap:8px;">
                      <div style="flex:1;">
                        <label class="schema-field-label">Lane Name (${escapeHtml(t.id)})</label>
                        <input data-track-label-id="${escapeHtml(t.id)}" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(t.label)}" />
                      </div>
                      <div style="flex:1;">
                        <label class="schema-field-label">Subtitle</label>
                        <input data-track-sub-id="${escapeHtml(t.id)}" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(t.sub)}" />
                      </div>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </div>

            <div class="schema-grid-2">
              <div class="schema-editor-section">
                <div class="schema-section-heading">Single-Object Steps</div>
                ${log.flowGraph.singleSteps
                  .map(
                    (s, idx) => `
                    <div style="margin-top:${idx === 0 ? "0" : "8px"};">
                      <label class="schema-field-label">${escapeHtml(s.id)}</label>
                      <input data-single-step-id="${escapeHtml(s.id)}" type="text" class="schema-textarea" style="min-height:34px;" value="${escapeHtml(s.label)}" />
                    </div>
                  `
                  )
                  .join("")}
              </div>

              <div class="schema-editor-section">
                <div class="schema-section-heading">Exception Loops (Show Exceptions)</div>
                ${log.flowGraph.exceptionLoops
                  .map(
                    (ex, idx) => `
                    <div style="margin-top:${idx === 0 ? "0" : "8px"};">
                      <label class="schema-field-label">${escapeHtml(ex.id)}</label>
                      <input data-exception-id="${escapeHtml(ex.id)}" type="text" class="schema-textarea" style="min-height:34px;" value="${escapeHtml(ex.label)}" />
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <!-- TAB 2: STEP EXPLANATIONS -->
          <div data-editor-panel="steps" style="display:${activeTab === "steps" ? "flex" : "none"}; flex-direction:column; gap:14px;">
            <div class="schema-editor-section">
              <div class="schema-section-heading">Step Labels (Used on Overview, Process Flow &amp; Delay Breakdown)</div>
              <div class="schema-grid-3">
                <div>
                  <label class="schema-field-label" for="field-step-name">Step Name</label>
                  <input id="field-step-name" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(step.name)}" />
                </div>
                <div>
                  <label class="schema-field-label" for="field-step-main-source">Main Delay Source</label>
                  <input id="field-step-main-source" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(step.mainDelaySource)}" />
                </div>
                <div>
                  <label class="schema-field-label" for="field-step-cause-tag">Primary Cause Badge</label>
                  <input id="field-step-cause-tag" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(step.primaryCauseTag)}" />
                </div>
              </div>
              <div style="margin-top:10px;">
                <label class="schema-field-label" for="field-summary-text">
                  Overall Step Delay Explanation ("Why This Step Is Delayed")
                </label>
                <textarea id="field-summary-text" class="schema-textarea" rows="3">${escapeHtml(step.summaryText)}</textarea>
              </div>
            </div>

            <div class="schema-editor-section">
              <div class="schema-section-heading">Wait-Time Bucket Descriptions</div>
              <div class="schema-grid-3">
                <div>
                  <label class="schema-field-label" for="field-all-items-desc">
                    <span class="dot amber"></span> Waiting for All Items
                  </label>
                  <textarea id="field-all-items-desc" class="schema-textarea" rows="3">${escapeHtml(step.breakdown.allItemsDesc)}</textarea>
                </div>

                <div>
                  <label class="schema-field-label" for="field-other-objects-desc">
                    <span class="dot blue"></span> Waiting for Other Objects
                  </label>
                  <textarea id="field-other-objects-desc" class="schema-textarea" rows="3">${escapeHtml(step.breakdown.otherObjectsDesc)}</textarea>
                </div>

                <div>
                  <label class="schema-field-label" for="field-team-desc">
                    <span class="dot" style="background:var(--purple);"></span> Waiting for Team
                  </label>
                  <textarea id="field-team-desc" class="schema-textarea" rows="3">${escapeHtml(step.breakdown.teamDesc)}</textarea>
                </div>
              </div>
            </div>

            <div class="schema-grid-2">
              <div class="schema-editor-section">
                <div class="schema-section-heading">Slowest Incoming Objects</div>
                ${step.delaySources
                  .map(
                    (src, idx) => `
                    <div style="margin-top:${idx === 0 ? "0" : "10px"};">
                      <label class="schema-field-label">Incoming Source ${idx + 1} Label &amp; Explanation</label>
                      <input data-source-label-idx="${idx}" type="text" class="schema-textarea" style="min-height:34px; margin-bottom:5px;" value="${escapeHtml(src.label)}" />
                      <textarea data-source-idx="${idx}" class="schema-textarea" rows="2">${escapeHtml(src.desc)}</textarea>
                    </div>
                  `
                  )
                  .join("")}
              </div>

              <div class="schema-editor-section">
                <div class="schema-section-heading">Upstream &amp; Downstream Impact Chain</div>
                ${step.chain
                  .map(
                    (c, idx) => `
                    <div style="margin-top:${idx === 0 ? "0" : "10px"};">
                      <label class="schema-field-label">${escapeHtml(c.stage)}</label>
                      <input data-chain-name-idx="${idx}" type="text" class="schema-textarea" style="min-height:34px; margin-bottom:5px;" value="${escapeHtml(c.name)}" />
                      <textarea data-chain-idx="${idx}" class="schema-textarea" rows="2">${escapeHtml(c.desc)}</textarea>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <!-- TAB 3: TEAM WORKLOAD -->
          <div data-editor-panel="teams" style="display:${activeTab === "teams" ? "flex" : "none"}; flex-direction:column; gap:14px;">
            ${log.capacity.teams
              .map(
                (t) => `
                <div class="schema-editor-section">
                  <div class="schema-section-heading">Team: ${escapeHtml(t.name)}</div>
                  <div class="schema-grid-2">
                    <div>
                      <label class="schema-field-label">Team Display Name</label>
                      <input data-team-name-id="${escapeHtml(t.id)}" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(t.name)}" />
                    </div>
                    <div>
                      <label class="schema-field-label">Peak Backlog Summary Badge</label>
                      <input data-team-peak-id="${escapeHtml(t.id)}" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(t.peakSummary)}" />
                    </div>
                  </div>
                  <div class="schema-grid-3" style="margin-top:8px;">
                    ${t.splits
                      .map(
                        (sp, sIdx) => `
                        <div>
                          <label class="schema-field-label">Split ${sIdx + 1} (${sp.pct}%)</label>
                          <input data-team-split-id="${escapeHtml(t.id)}" data-team-split-idx="${sIdx}" type="text" class="schema-textarea" style="min-height:34px;" value="${escapeHtml(sp.label)}" />
                        </div>
                      `
                      )
                      .join("")}
                  </div>
                </div>
              `
              )
              .join("")}
          </div>

          <!-- TAB 4: COMPARE & TIMELINE -->
          <div data-editor-panel="compare" style="display:${activeTab === "compare" ? "flex" : "none"}; flex-direction:column; gap:14px;">
            <div class="schema-editor-section">
              <div class="schema-section-heading">Compare Cases &amp; Estimate Improvement</div>
              <div class="schema-grid-2">
                <div>
                  <label class="schema-field-label" for="field-cmp-target">Improvement Slider Target Label</label>
                  <input id="field-cmp-target" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(log.comparison.delayTargetLabel)}" />
                </div>
                <div>
                  <label class="schema-field-label" for="field-cmp-ripple">Downstream Ripple Unit</label>
                  <input id="field-cmp-ripple" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(log.comparison.rippleUnit)}" />
                </div>
              </div>
              <div class="schema-grid-3" style="margin-top:10px;">
                ${log.comparison.factors
                  .map(
                    (f, idx) => `
                    <div>
                      <label class="schema-field-label">Delay Factor ${idx + 1} (${escapeHtml(f.multiplier)})</label>
                      <input data-factor-title-idx="${idx}" type="text" class="schema-textarea" style="min-height:36px;" value="${escapeHtml(f.title)}" />
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </div>

            <div class="schema-grid-2">
              <div class="schema-editor-section">
                <div class="schema-section-heading">Case Timeline — Delayed Example</div>
                <label class="schema-field-label" for="field-tl-delayed-id">Case Title</label>
                <input id="field-tl-delayed-id" type="text" class="schema-textarea" style="min-height:34px; margin-bottom:6px;" value="${escapeHtml(log.timeline.delayedCase.caseId)}" />
                <label class="schema-field-label" for="field-tl-delayed-meta">Case Subtitle</label>
                <input id="field-tl-delayed-meta" type="text" class="schema-textarea" style="min-height:34px; margin-bottom:6px;" value="${escapeHtml(log.timeline.delayedCase.meta)}" />
                <label class="schema-field-label" for="field-tl-delayed-wait">Wait Summary Badge</label>
                <input id="field-tl-delayed-wait" type="text" class="schema-textarea" style="min-height:34px;" value="${escapeHtml(log.timeline.delayedCase.waitSummary)}" />
              </div>

              <div class="schema-editor-section">
                <div class="schema-section-heading">Case Timeline — On-Time Example</div>
                <label class="schema-field-label" for="field-tl-healthy-id">Case Title</label>
                <input id="field-tl-healthy-id" type="text" class="schema-textarea" style="min-height:34px; margin-bottom:6px;" value="${escapeHtml(log.timeline.healthyCase.caseId)}" />
                <label class="schema-field-label" for="field-tl-healthy-meta">Case Subtitle</label>
                <input id="field-tl-healthy-meta" type="text" class="schema-textarea" style="min-height:34px; margin-bottom:6px;" value="${escapeHtml(log.timeline.healthyCase.meta)}" />
                <label class="schema-field-label" for="field-tl-healthy-wait">Wait Summary Badge</label>
                <input id="field-tl-healthy-wait" type="text" class="schema-textarea" style="min-height:34px;" value="${escapeHtml(log.timeline.healthyCase.waitSummary)}" />
              </div>
            </div>
          </div>
        </form>

        <div class="schema-modal-footer">
          <button type="button" class="btn btn-sm" data-action="reset-schema-texts">
            Reset Log Schema to Default
          </button>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn" data-action="close-modal">
              Cancel
            </button>
            <button type="button" class="btn btn-dark" data-action="save-schema-texts">
              Save for This Log Type
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
