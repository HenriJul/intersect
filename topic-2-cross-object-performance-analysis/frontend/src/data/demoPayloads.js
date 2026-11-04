/**
 * Concise OCEL 2.0 Prototype Data (`order-management.json` & `ocel2-p2p.json`).
 * Zero verbose prose — short scannable labels and authentic metrics only.
 */

export const DEMO_LOGS = {
  "order-management": {
    logId: "order-management",
    title: "Order Management",
    filename: "order-management.json",
    timeSpan: "Apr 2023 – Jun 2024",
    eventCount: 21008,
    objectCount: 10840,
    objectTypeCount: 6,
    defaultStepId: "create-package",
    defaultSlaDays: 3.0,

    overviewKpis: [
      { label: "Tracked Objects", value: "10,840", sub: "6 object types · 21,008 events" },
      { label: "Slowest Shared Step", value: "Create Package", sub: "3.8 days avg wait" },
      { label: "Delayed Order Value", value: "€312,400", sub: "468 delayed packages" }
    ],

    tracks: [
      { id: "orders", label: "Orders", sub: "2,000 orders", color: "#2563eb", y: 78 },
      { id: "items", label: "Items", sub: "7,659 items", color: "#d97706", y: 178 },
      { id: "employees", label: "Staff", sub: "18 employees", color: "#7c3aed", y: 278 },
      { id: "packages", label: "Packages", sub: "1,128 packages", color: "#059669", y: 374 }
    ],

    flowGraph: {
      singleSteps: [
        { id: "place-order", label: "Place Order", count: "2,000", track: "orders", x: 195, y: 78 },
        { id: "pick-item", label: "Pick Item", count: "7,659", track: "items", x: 445, y: 178 },
        { id: "send-package", label: "Send Package", count: "1,128", track: "packages", x: 695, y: 374 }
      ],
      exceptionLoops: [
        { id: "oos-loop", label: "Out of Stock → Reorder", count: "1,544", x: 445, y: 118, color: "#dc2626" },
        { id: "reminder-loop", label: "Payment Reminder", count: "566", x: 750, y: 26, color: "#d97706" },
        { id: "failed-deliv-loop", label: "Failed Delivery", count: "311", x: 815, y: 422, color: "#dc2626" }
      ],
      sharedSteps: [
        {
          id: "confirm-order",
          label: "Confirm Order",
          waitTag: "0.7d",
          x: 315,
          yTop: 60,
          yBottom: 294,
          tracksJoined: ["orders", "items", "employees"],
          slowestTrack: "employees"
        },
        {
          id: "create-package",
          label: "Create Package",
          waitTag: "3.8d wait",
          x: 575,
          yTop: 158,
          yBottom: 392,
          tracksJoined: ["items", "employees", "packages"],
          slowestTrack: "items"
        },
        {
          id: "pay-order",
          label: "Pay Order",
          waitTag: "6.1d delay",
          x: 745,
          yTop: 60,
          yBottom: 196,
          tracksJoined: ["orders", "items"],
          slowestTrack: "items"
        },
        {
          id: "package-delivered",
          label: "Package Delivered",
          waitTag: "0.8d queue",
          x: 820,
          yTop: 260,
          yBottom: 392,
          tracksJoined: ["employees", "packages"],
          slowestTrack: "employees"
        }
      ]
    },

    topBottleneckIds: ["create-package", "pay-order", "package-delivered"],

    steps: {
      "create-package": {
        id: "create-package",
        rank: 1,
        severity: "red",
        name: "Create Package",
        avgWait: "3.8 days",
        affectedValue: "€312,400",
        volume: "1,106 packages",
        mainDelaySource: "Out-of-Stock Items (74%)",
        primaryCauseTag: "Waiting for Items (78%)",
        summaryText:
          "Packing cannot start until every item belonging to the shipment has arrived at the packing station and a warehouse employee is available. Most of the 3.8-day delay happens because already-picked items sit waiting on the shelf while out-of-stock items from the same order are reordered.",
        breakdown: {
          totalDays: 3.8,
          allItemsDays: 2.4,
          allItemsPct: 62,
          allItemsDesc:
            "Picked items sitting at the packing station waiting for the last missing item of the same package.",
          otherObjectsDays: 0.6,
          otherObjectsPct: 16,
          otherObjectsDesc:
            "Items from separate customer orders being grouped together into one combined delivery box.",
          teamDays: 0.8,
          teamPct: 22,
          teamDesc:
            "All items for the package are physically ready, but waiting for a free warehouse packer."
        },
        delaySources: [
          {
            label: "Items (Out of stock & reorder)",
            pct: 74,
            lag: "+70h",
            color: "#d97706",
            desc: "When even a single item in an order is out of stock, every other item for that box is held back until supplier restocking completes."
          },
          {
            label: "Orders (Multi-order merge)",
            pct: 14,
            lag: "+28h",
            color: "#2563eb",
            desc: "Combining items from multiple orders into one shipment forces earlier orders to wait for later ones to be picked."
          },
          {
            label: "Warehousing Team Queue",
            pct: 12,
            lag: "+20h",
            color: "#7c3aed",
            desc: "During peak reorder waves, all 7 warehouse employees are busy picking and restocking, leaving ready boxes waiting to be packed."
          }
        ],
        chain: [
          {
            stage: "Upstream Cause",
            name: "Item Out of Stock",
            metric: "1,544 items · +4.1d reorder",
            desc: "1,544 ordered items are out of stock and must be reordered from suppliers before picking can finish."
          },
          {
            stage: "Bottleneck Step",
            name: "Create Package",
            metric: "+3.8d avg wait · 6.8 items/box",
            desc: "Because each package bundles ~6.8 items, one missing item blocks 5–6 already-picked items from being packed."
          },
          {
            stage: "Downstream Effect",
            name: "Payment Reminders",
            metric: "566 reminders · 2.1× rate",
            desc: "Customers withhold payment while waiting for delayed shipments, more than doubling late-payment reminders."
          }
        ]
      },

      "pay-order": {
        id: "pay-order",
        rank: 2,
        severity: "amber",
        name: "Pay Order",
        avgWait: "6.1 days",
        affectedValue: "€428,900",
        volume: "2,000 orders",
        mainDelaySource: "Late Delivery (68%)",
        primaryCauseTag: "Waiting for Delivery (71%)",
        summaryText:
          "Customer orders are only paid once all items from the order have been packed, shipped, and received by the customer. When warehouse backlogs or split packages delay delivery, invoice settlement stalls for an average of 6.1 days.",
        breakdown: {
          totalDays: 6.1,
          allItemsDays: 1.1,
          allItemsPct: 18,
          allItemsDesc:
            "Orders split across multiple packages waiting for the final parcel of the order to arrive.",
          otherObjectsDays: 3.2,
          otherObjectsPct: 53,
          otherObjectsDesc:
            "Order invoice waiting while packages are still delayed in warehouse packing or transit.",
          teamDays: 1.8,
          teamPct: 29,
          teamDesc:
            "Processing time after delivery, including automated payment reminders and billing follow-up."
        },
        delaySources: [
          {
            label: "Items & Packages in Transit",
            pct: 68,
            lag: "+78h",
            color: "#d97706",
            desc: "Customers wait until every package belonging to their order has been delivered before settling the invoice."
          },
          {
            label: "Customer Post-Reminder Delay",
            pct: 22,
            lag: "+68h",
            color: "#2563eb",
            desc: "Orders that experienced shipping delays require 1–3 payment reminders before the customer transfers funds."
          },
          {
            label: "Order Confirmation Lag",
            pct: 10,
            lag: "+19h",
            color: "#7c3aed",
            desc: "Initial sales review delays push out the entire fulfillment and billing schedule from day one."
          }
        ],
        chain: [
          {
            stage: "Upstream Cause",
            name: "Late Package Creation",
            metric: "468 delayed boxes",
            desc: "Out-of-stock items delay package assembly in the warehouse for 468 shipments."
          },
          {
            stage: "Bottleneck Step",
            name: "Pay Order",
            metric: "+6.1d settlement lag",
            desc: "Orders remain unpaid while customers wait for complete delivery of all ordered items."
          },
          {
            stage: "Downstream Effect",
            name: "Open Receivables",
            metric: "€428,900 · 566 reminders",
            desc: "€428,900 in revenue is tied up in overdue receivables requiring manual dunning reminders."
          }
        ]
      },

      "package-delivered": {
        id: "package-delivered",
        rank: 3,
        severity: "blue",
        name: "Package Delivered",
        avgWait: "0.8 days",
        affectedValue: "311 retries",
        volume: "1,128 packages",
        mainDelaySource: "Shipment Team Busy (63%)",
        primaryCauseTag: "Team Queue (90%)",
        summaryText:
          "Once packages are sealed, they must be dispatched and delivered by the 6-person Shipment team. Because the warehouse releases packed boxes in large waves after restocking arrives, the shipment team becomes overloaded and packages queue up waiting for a driver.",
        breakdown: {
          totalDays: 0.8,
          allItemsDays: 0.0,
          allItemsPct: 0,
          allItemsDesc:
            "All items are already sealed inside the package before dispatch begins.",
          otherObjectsDays: 0.08,
          otherObjectsPct: 10,
          otherObjectsDesc:
            "Packages waiting briefly at the loading dock to be grouped onto the same delivery route.",
          teamDays: 0.72,
          teamPct: 90,
          teamDesc:
            "Sealed packages waiting in dispatch because all 6 shipment employees are out on routes or handling retries."
        },
        delaySources: [
          {
            label: "Shipment Team Queue (6 staff)",
            pct: 63,
            lag: "+17h",
            color: "#7c3aed",
            desc: "All 6 shipment staff are occupied with ongoing deliveries when large batches of packed boxes arrive at once."
          },
          {
            label: "Failed Delivery Retries",
            pct: 27,
            lag: "+24h",
            color: "#dc2626",
            desc: "311 delivery attempts fail on the first try and must be re-queued for a repeat trip the next day."
          },
          {
            label: "Dispatch Handover",
            pct: 10,
            lag: "+3h",
            color: "#059669",
            desc: "Routine handover time between warehouse packing completion and van loading."
          }
        ],
        chain: [
          {
            stage: "Upstream Cause",
            name: "Bulk Packing Waves",
            metric: "Clustered releases",
            desc: "Replenished stock arrives in batches, causing the warehouse to finish many delayed boxes at the same time."
          },
          {
            stage: "Bottleneck Step",
            name: "Package Delivered",
            metric: "90% team queue",
            desc: "The 6 shipment employees cannot absorb the sudden wave of boxes, creating a 17-hour dispatch backlog."
          },
          {
            stage: "Downstream Effect",
            name: "Failed Deliveries",
            metric: "311 retry attempts",
            desc: "Late and rescheduled delivery windows lead to 311 missed customer handovers and repeat trips."
          }
        ]
      },

      "confirm-order": {
        id: "confirm-order",
        rank: 4,
        severity: "blue",
        name: "Confirm Order",
        avgWait: "0.7 days",
        affectedValue: "€118,000",
        volume: "2,000 orders",
        mainDelaySource: "Sales Team Queue (81%)",
        primaryCauseTag: "Team Queue (81%)",
        summaryText:
          "Every incoming customer order must be reviewed and confirmed by a Sales representative before the warehouse is allowed to start picking items. Most of the 0.7-day wait comes from orders queuing for one of the 5 Sales employees during high-volume mornings.",
        breakdown: {
          totalDays: 0.7,
          allItemsDays: 0.0,
          allItemsPct: 0,
          allItemsDesc:
            "All requested line items are submitted together when the customer places the order.",
          otherObjectsDays: 0.13,
          otherObjectsPct: 19,
          otherObjectsDesc:
            "Catalog price and availability verification across the requested product items.",
          teamDays: 0.57,
          teamPct: 81,
          teamDesc:
            "Submitted orders waiting in the inbox for one of the 5 Sales representatives to review and approve."
        },
        delaySources: [
          {
            label: "Sales Review Queue (5 staff)",
            pct: 81,
            lag: "+14h",
            color: "#7c3aed",
            desc: "The 5-person Sales team also handles customer inquiries and payment reminders, slowing down new order sign-offs."
          },
          {
            label: "Item Price Check",
            pct: 19,
            lag: "+3h",
            color: "#2563eb",
            desc: "Orders with many distinct items require manual stock and pricing checks before confirmation."
          }
        ],
        chain: [
          {
            stage: "Upstream Cause",
            name: "Place Order",
            metric: "2,000 B2B orders",
            desc: "Customer orders arrive in morning peaks and enter the shared Sales review queue."
          },
          {
            stage: "Bottleneck Step",
            name: "Confirm Order",
            metric: "0.7d avg wait",
            desc: "Orders wait an average of 16.8 hours for a Sales representative to confirm them."
          },
          {
            stage: "Downstream Effect",
            name: "Warehouse Picking",
            metric: "7,659 items released",
            desc: "Warehouse picking for all 7,659 items is held back until order confirmation is completed."
          }
        ]
      }
    },

    capacity: {
      defaultTeamId: "warehousing",
      teams: [
        {
          id: "warehousing",
          name: "Warehousing",
          members: "7 employees",
          avgQueue: "19.9h avg queue",
          peakLoad: "89% peak load",
          badgeClass: "badge-red",
          splits: [
            { label: "Pick Item", pct: 65, color: "#2563eb" },
            { label: "Reorders", pct: 26, color: "#d97706" },
            { label: "Packing", pct: 9, color: "#059669" }
          ],
          peakSummary: "Nov '23 Peak · 96 waiting packages (+41% reorder spike)",
          timeline: [
            { period: "May '23", load: 62, backlog: 31 },
            { period: "Jul '23", load: 68, backlog: 38 },
            { period: "Sep '23", load: 79, backlog: 54 },
            { period: "Nov '23", load: 94, backlog: 96, peak: true },
            { period: "Jan '24", load: 86, backlog: 78 },
            { period: "Mar '24", load: 74, backlog: 49 },
            { period: "May '24", load: 66, backlog: 35 }
          ]
        },
        {
          id: "shipment",
          name: "Shipment",
          members: "6 employees",
          avgQueue: "16.6h avg queue",
          peakLoad: "78% peak load",
          badgeClass: "badge-amber",
          splits: [
            { label: "Send Package", pct: 44, color: "#2563eb" },
            { label: "Delivered", pct: 44, color: "#059669" },
            { label: "Retries", pct: 12, color: "#dc2626" }
          ],
          peakSummary: "Nov '23 Peak · 57 packages queued in dispatch",
          timeline: [
            { period: "May '23", load: 54, backlog: 18 },
            { period: "Jul '23", load: 58, backlog: 22 },
            { period: "Sep '23", load: 71, backlog: 34 },
            { period: "Nov '23", load: 84, backlog: 57, peak: true },
            { period: "Jan '24", load: 76, backlog: 44 },
            { period: "Mar '24", load: 63, backlog: 26 },
            { period: "May '24", load: 55, backlog: 19 }
          ]
        },
        {
          id: "sales",
          name: "Sales",
          members: "5 employees",
          avgQueue: "13.7h avg queue",
          peakLoad: "51% peak load",
          badgeClass: "badge-green",
          splits: [{ label: "Confirm Order", pct: 100, color: "#7c3aed" }],
          peakSummary: "Nov '23 Peak · 16 unconfirmed orders (balanced)",
          timeline: [
            { period: "May '23", load: 45, backlog: 9 },
            { period: "Jul '23", load: 48, backlog: 11 },
            { period: "Sep '23", load: 52, backlog: 14 },
            { period: "Nov '23", load: 56, backlog: 16, peak: true },
            { period: "Jan '24", load: 50, backlog: 12 },
            { period: "Mar '24", load: 47, backlog: 10 },
            { period: "May '24", load: 44, backlog: 8 }
          ]
        }
      ]
    },

    comparison: {
      totalClusters: 1106,
      baseDelayedAt3d: 468,
      baseStalledEur: 312400,
      baseRippleEvents: 566,
      rippleUnit: "payment reminders",
      delayTargetLabel: "Out-of-Stock Item Delay",
      factors: [
        {
          title: "Has Out-of-Stock Item",
          multiplier: "3.4× slower",
          cases: "492 packages",
          withVal: "5.8 days",
          withPct: 92,
          withoutVal: "1.7 days",
          withoutPct: 27
        },
        {
          title: "6+ Items in Package",
          multiplier: "2.3× slower",
          cases: "384 packages",
          withVal: "4.9 days",
          withPct: 78,
          withoutVal: "2.1 days",
          withoutPct: 33
        },
        {
          title: "Warehouse Load Above 80%",
          multiplier: "1.9× slower",
          cases: "276 packages",
          withVal: "1.5d queue",
          withPct: 60,
          withoutVal: "0.8d queue",
          withoutPct: 31
        }
      ]
    },

    timeline: {
      delayedCase: {
        caseId: "Package p-660016",
        meta: "Danube Pharmaceuticals BV · Orders o-990007 & o-990023 · €1,014.99",
        duration: "19.0 days",
        waitSummary: "10.0 days waiting for missing items",
        syncStartPct: 45,
        syncEndPct: 79,
        queueEndPct: 86,
        lanes: [
          {
            objectLabel: "Order o-990007",
            subLabel: "Order",
            color: "#2563eb",
            events: [
              { x: 6, label: "Place Order", time: "Apr 05, 11:05", actor: "Danube Pharma" },
              { x: 10, label: "Confirm", time: "Apr 05, 16:01", actor: "Istvan Koren" },
              { x: 17, label: "Pay Order", time: "Apr 07, 11:22", actor: "Danube Pharma" }
            ]
          },
          {
            objectLabel: "Item i-880036",
            subLabel: "Out of stock",
            color: "#dc2626",
            events: [
              { x: 7, label: "Out of Stock", time: "Apr 05, 11:24", actor: "Marco Pegoraro" },
              { x: 26, label: "Reorder", time: "Apr 10, 09:14", actor: "Detlef Wetzeler" },
              { x: 61, label: "Pick Item", time: "Apr 18, 09:24", actor: "Nina Graves" }
            ]
          },
          {
            objectLabel: "Order o-990023",
            subLabel: "Order",
            color: "#2563eb",
            events: [
              { x: 35, label: "Place Order", time: "Apr 12, 16:06", actor: "Danube Pharma" },
              { x: 39, label: "Confirm", time: "Apr 13, 09:26", actor: "Christine von Dobbert" },
              { x: 95, label: "Payment Reminder", time: "May 03, 09:26", actor: "Billing" }
            ]
          },
          {
            objectLabel: "Item i-880107",
            subLabel: "Waited 10.0d",
            color: "#059669",
            events: [
              { x: 45, label: "Pick Item", time: "Apr 14, 09:25", actor: "Christopher Schwanen" }
            ]
          },
          {
            objectLabel: "Item i-880105",
            subLabel: "Out of stock",
            color: "#dc2626",
            events: [
              { x: 41, label: "Out of Stock", time: "Apr 13, 16:29", actor: "Christopher Schwanen" },
              { x: 47, label: "Reorder", time: "Apr 14, 17:45", actor: "Christopher Schwanen" },
              { x: 79, label: "Pick Item", time: "Apr 18, 13:59", actor: "Detlef Wetzeler" }
            ]
          },
          {
            objectLabel: "Package p-660016",
            subLabel: "Package",
            color: "#059669",
            events: [
              { x: 86, label: "Create Package", time: "Apr 24, 10:22", actor: "Marco Pegoraro" },
              { x: 89, label: "Send", time: "Apr 24, 10:31", actor: "Detlef Wetzeler" },
              { x: 92, label: "Delivered", time: "Apr 24, 14:56", actor: "Eduardo Goulart Rocha" }
            ]
          }
        ]
      },
      healthyCase: {
        caseId: "Package p-660007",
        meta: "AlpenTech Innovations AG · Order o-990011 · €778.98",
        duration: "4.6 days",
        waitSummary: "0.9 days item alignment · all items in stock",
        syncStartPct: 36,
        syncEndPct: 52,
        queueEndPct: 68,
        lanes: [
          {
            objectLabel: "Order o-990011",
            subLabel: "Order",
            color: "#2563eb",
            events: [
              { x: 10, label: "Place Order", time: "Apr 06, 15:40", actor: "AlpenTech AG" },
              { x: 28, label: "Confirm", time: "Apr 10, 19:55", actor: "Mara Nitschke" },
              { x: 55, label: "Pay Order", time: "Apr 12, 16:44", actor: "AlpenTech AG" }
            ]
          },
          {
            objectLabel: "Item i-880054",
            subLabel: "In stock",
            color: "#059669",
            events: [{ x: 14, label: "Pick Item", time: "Apr 06, 15:57", actor: "Christopher Schwanen" }]
          },
          {
            objectLabel: "Item i-880053",
            subLabel: "In stock",
            color: "#059669",
            events: [{ x: 38, label: "Pick Item", time: "Apr 11, 15:00", actor: "Benedikt Knopp" }]
          },
          {
            objectLabel: "Item i-880052",
            subLabel: "In stock",
            color: "#059669",
            events: [{ x: 52, label: "Pick Item", time: "Apr 12, 14:26", actor: "Christopher Schwanen" }]
          },
          {
            objectLabel: "Package p-660007",
            subLabel: "Package",
            color: "#059669",
            events: [
              { x: 68, label: "Create Package", time: "Apr 17, 07:58", actor: "Nina Graves" },
              { x: 76, label: "Send", time: "Apr 17, 14:21", actor: "Detlef Wetzeler" },
              { x: 88, label: "Delivered", time: "Apr 18, 07:51", actor: "Eduardo Goulart Rocha" }
            ]
          }
        ]
      }
    }
  },

  "ocel2-p2p": {
    logId: "ocel2-p2p",
    title: "Procure-to-Pay",
    filename: "ocel2-p2p.json",
    timeSpan: "Apr 2022 – Oct 2024",
    eventCount: 14671,
    objectCount: 9543,
    objectTypeCount: 7,
    defaultStepId: "execute-payment",
    defaultSlaDays: 4.0,

    overviewKpis: [
      { label: "Tracked Objects", value: "9,543", sub: "7 object types · 14,671 events" },
      { label: "Slowest Shared Step", value: "Execute Payment", sub: "5.3 days avg wait" },
      { label: "Delayed Invoice Value", value: "€1.42M", sub: "512 delayed payments" }
    ],

    tracks: [
      { id: "pr", label: "Requisitions", sub: "729 PRs · 2,296 materials", color: "#4f46e5", y: 78 },
      { id: "po", label: "Purchase Orders", sub: "927 RFQs · 1,598 POs", color: "#2563eb", y: 178 },
      { id: "gr", label: "Goods Receipts", sub: "4,042 receipts", color: "#d97706", y: 278 },
      { id: "fin", label: "Invoices & Pay", sub: "1,941 invoices · 1,166 paid", color: "#059669", y: 374 }
    ],

    flowGraph: {
      singleSteps: [
        { id: "create-pr", label: "Create PR", count: "729", track: "pr", x: 195, y: 78 },
        { id: "approve-pr", label: "Approve PR", count: "607", track: "pr", x: 310, y: 78 },
        { id: "create-rfq", label: "Create RFQ", count: "927", track: "po", x: 400, y: 178 },
        { id: "create-po", label: "Create PO", count: "1,598", track: "po", x: 488, y: 178 },
        { id: "create-inv", label: "Create Invoice", count: "1,941", track: "fin", x: 660, y: 374 }
      ],
      exceptionLoops: [
        { id: "delegate-pr", label: "Delegate Approval", count: "122", x: 255, y: 26, color: "#dc2626" },
        { id: "split-gr-loop", label: "Partial Deliveries", count: "2.5 / PO", x: 660, y: 222, color: "#d97706" }
      ],
      sharedSteps: [
        {
          id: "approve-po",
          label: "Approve PO",
          waitTag: "3.6d wait",
          x: 575,
          yTop: 60,
          yBottom: 196,
          tracksJoined: ["pr", "po"],
          slowestTrack: "po"
        },
        {
          id: "create-gr",
          label: "Create Goods Receipt",
          waitTag: "2.8d span",
          x: 660,
          yTop: 160,
          yBottom: 296,
          tracksJoined: ["po", "gr"],
          slowestTrack: "gr"
        },
        {
          id: "two-way-match",
          label: "Two-Way Match",
          waitTag: "1.9d wait",
          x: 745,
          yTop: 260,
          yBottom: 392,
          tracksJoined: ["gr", "fin"],
          slowestTrack: "gr"
        },
        {
          id: "execute-payment",
          label: "Execute Payment",
          waitTag: "5.3d wait",
          x: 830,
          yTop: 160,
          yBottom: 392,
          tracksJoined: ["po", "gr", "fin"],
          slowestTrack: "gr"
        }
      ]
    },

    topBottleneckIds: ["execute-payment", "approve-po", "two-way-match"],

    steps: {
      "execute-payment": {
        id: "execute-payment",
        rank: 1,
        severity: "red",
        name: "Execute Payment",
        avgWait: "5.3 days",
        affectedValue: "€1.42M",
        volume: "1,166 payments",
        mainDelaySource: "Partial Goods Receipts (61%)",
        primaryCauseTag: "Split Deliveries & Finance Queue",
        summaryText:
          "Supplier invoices can only be paid once the purchase order, all physical goods receipts, and the two-way invoice match are complete. Payments wait 5.3 days on average because suppliers ship orders in multiple partial deliveries and the Finance team is tied up matching earlier partial receipts.",
        breakdown: {
          totalDays: 5.3,
          allItemsDays: 0.85,
          allItemsPct: 16,
          allItemsDesc:
            "Invoices waiting for the final partial goods receipt of a split supplier delivery to arrive.",
          otherObjectsDays: 1.65,
          otherObjectsPct: 31,
          otherObjectsDesc:
            "Waiting for warehouse goods receipts and purchase order quantities to be verified against the invoice.",
          teamDays: 2.8,
          teamPct: 53,
          teamDesc:
            "Verified invoices sitting in the Finance queue waiting for the next scheduled payment run."
        },
        delaySources: [
          {
            label: "Goods Receipts & Final Match",
            pct: 61,
            lag: "+59h",
            color: "#d97706",
            desc: "Suppliers split a single purchase order into 2–3 partial deliveries, blocking final invoice clearance until the last shipment is logged."
          },
          {
            label: "Finance Payment Batch Queue",
            pct: 29,
            lag: "+68h",
            color: "#059669",
            desc: "The Finance team processes invoice intake, two-way matches, and payment runs with the same staff, creating a 2.8-day payment backlog."
          },
          {
            label: "Purchase Order Alignment",
            pct: 10,
            lag: "+21h",
            color: "#2563eb",
            desc: "Quantity or price differences between the original purchase order and supplier delivery require manual clarification."
          }
        ],
        chain: [
          {
            stage: "Upstream Cause",
            name: "Delegated PR & Late PO",
            metric: "122 delegations · +3.6d",
            desc: "Purchase requisitions are passed between approvers, delaying purchase order release to the supplier."
          },
          {
            stage: "Midstream Ripple",
            name: "Partial Goods Receipts",
            metric: "4,042 receipts (2.5 / PO)",
            desc: "With less lead time, suppliers ship whatever stock they have first, creating 2.5 separate goods receipts per order."
          },
          {
            stage: "Bottleneck Step",
            name: "Execute Payment",
            metric: "+5.3d wait · €1.42M delayed",
            desc: "Each partial delivery triggers extra matching work for Finance and holds back €1.42M in supplier payments."
          }
        ]
      },

      "approve-po": {
        id: "approve-po",
        rank: 2,
        severity: "amber",
        name: "Approve Purchase Order",
        avgWait: "3.6 days",
        affectedValue: "€890,000",
        volume: "1,598 POs",
        mainDelaySource: "Order Manager Queue (72%)",
        primaryCauseTag: "Approver Queue (72%)",
        summaryText:
          "Before an order can be sent to a vendor, an Order Manager must review the quotation and sign off on the purchase order. Most of the 3.6-day wait occurs when approvals are delegated between managers or wait in the approver inbox.",
        breakdown: {
          totalDays: 3.6,
          allItemsDays: 0.0,
          allItemsPct: 0,
          allItemsDesc:
            "All requested line items are already listed on the draft purchase order.",
          otherObjectsDays: 1.0,
          otherObjectsPct: 28,
          otherObjectsDesc:
            "Waiting for vendor quotation details and requisition sign-off documents to be attached.",
          teamDays: 2.6,
          teamPct: 72,
          teamDesc:
            "Draft purchase orders waiting in the Order Manager inbox for formal review and signature."
        },
        delaySources: [
          {
            label: "Order Manager Approval Queue",
            pct: 72,
            lag: "+63h",
            color: "#2563eb",
            desc: "Purchase orders wait an average of 2.6 days for an Order Manager to review and sign off."
          },
          {
            label: "Quotation Comparison Wait",
            pct: 28,
            lag: "+24h",
            color: "#4f46e5",
            desc: "Procurement staff must align supplier quotation terms with the internal requisition before approval."
          }
        ],
        chain: [
          {
            stage: "Upstream Cause",
            name: "Delegate PR Approval",
            metric: "122 delegated PRs",
            desc: "122 purchase requisitions are forwarded to a second manager when the primary approver is unavailable."
          },
          {
            stage: "Bottleneck Step",
            name: "Approve Purchase Order",
            metric: "+2.6d approver queue",
            desc: "Purchase orders pile up in the approval queue for 3.6 days total before reaching the vendor."
          },
          {
            stage: "Downstream Effect",
            name: "Split Vendor Shipments",
            metric: "1.8× partial deliveries",
            desc: "Late purchase orders leave vendors with shorter delivery windows, nearly doubling partial shipments."
          }
        ]
      },

      "two-way-match": {
        id: "two-way-match",
        rank: 3,
        severity: "blue",
        name: "Perform Two-Way Match",
        avgWait: "1.9 days",
        affectedValue: "€640,000",
        volume: "1,941 matches",
        mainDelaySource: "Missing Goods Receipt (58%)",
        primaryCauseTag: "Waiting for Goods Receipt (82%)",
        summaryText:
          "Before Finance can release an invoice for payment, they must match the vendor's invoice against the warehouse's goods receipt. In 58% of delayed cases, the digital invoice arrives first while the physical delivery is still waiting at the warehouse dock to be logged.",
        breakdown: {
          totalDays: 1.9,
          allItemsDays: 0.27,
          allItemsPct: 14,
          allItemsDesc:
            "Invoices waiting for additional partial delivery lines from the same purchase order.",
          otherObjectsDays: 1.3,
          otherObjectsPct: 68,
          otherObjectsDesc:
            "Invoice received by Finance, waiting for the warehouse to post the matching goods receipt.",
          teamDays: 0.33,
          teamPct: 18,
          teamDesc:
            "Both documents are present and waiting for a Finance clerk to complete the verification."
        },
        delaySources: [
          {
            label: "Goods Receipt Posted After Invoice",
            pct: 58,
            lag: "+31h",
            color: "#d97706",
            desc: "Vendors email invoices immediately upon dispatch, so the invoice sits waiting until the warehouse receives and logs the delivery."
          },
          {
            label: "Invoice Arriving After Receipt",
            pct: 30,
            lag: "+22h",
            color: "#059669",
            desc: "Goods are already in the warehouse, waiting for the supplier's billing department to send the invoice."
          },
          {
            label: "Finance Match Queue",
            pct: 12,
            lag: "+8h",
            color: "#2563eb",
            desc: "Time spent in the Finance queue when clerks are busy resolving quantity discrepancies."
          }
        ],
        chain: [
          {
            stage: "Upstream Cause",
            name: "Warehouse Dock-to-Post Lag",
            metric: "+1.5d unposted GR",
            desc: "Delivered pallets take 1.5 days at the warehouse dock before being recorded in the system."
          },
          {
            stage: "Bottleneck Step",
            name: "Perform Two-Way Match",
            metric: "1,941 matches held",
            desc: "Finance cannot verify 1,941 invoices until the corresponding goods receipt appears."
          },
          {
            stage: "Downstream Effect",
            name: "Execute Payment",
            metric: "Missed weekly payment run",
            desc: "Invoices that miss the weekly cutoff wait several extra days for the next payment batch."
          }
        ]
      },

      "create-gr": {
        id: "create-gr",
        rank: 4,
        severity: "blue",
        name: "Create Goods Receipt",
        avgWait: "2.8 days",
        affectedValue: "4,042 receipts",
        volume: "1,598 POs",
        mainDelaySource: "Split Shipments (64%)",
        primaryCauseTag: "Partial Shipments (58%)",
        summaryText:
          "Each time a supplier truck arrives, warehouse staff inspect the delivery and log a goods receipt against the purchase order. Because suppliers frequently split one purchase order into 2–3 partial deliveries, receiving takes 2.8 days on average across all shipments.",
        breakdown: {
          totalDays: 2.8,
          allItemsDays: 1.63,
          allItemsPct: 58,
          allItemsDesc:
            "Time gap between the first partial truck delivery and the final remaining items of the purchase order.",
          otherObjectsDays: 0.67,
          otherObjectsPct: 24,
          otherObjectsDesc:
            "Cross-checking delivered quantities against the open purchase order paperwork.",
          teamDays: 0.5,
          teamPct: 18,
          teamDesc:
            "Unloaded pallets waiting at the receiving dock for warehouse staff to count and book them."
        },
        delaySources: [
          {
            label: "Partial Supplier Shipments",
            pct: 64,
            lag: "+40h",
            color: "#d97706",
            desc: "Suppliers deliver orders in multiple partial shipments days apart instead of a single complete drop-off."
          },
          {
            label: "Warehouse Receiving Queue",
            pct: 36,
            lag: "+29h",
            color: "#2563eb",
            desc: "Receiving staff must inspect, count, and book 2.5× as many individual deliveries per purchase order."
          }
        ],
        chain: [
          {
            stage: "Upstream Cause",
            name: "Compressed Vendor Lead Time",
            metric: "Late PO sign-off",
            desc: "Delayed purchase order approvals leave suppliers with less time to assemble complete shipments."
          },
          {
            stage: "Bottleneck Step",
            name: "Create Goods Receipt",
            metric: "2.53 receipts per PO",
            desc: "Warehouse staff must log 4,042 separate goods receipts across 1,598 purchase orders."
          },
          {
            stage: "Downstream Effect",
            name: "Two-Way Match",
            metric: "Repeated invoice matching",
            desc: "Every partial receipt forces Finance to re-check invoice lines before payment can be approved."
          }
        ]
      }
    },

    capacity: {
      defaultTeamId: "finance",
      teams: [
        {
          id: "finance",
          name: "Finance Department",
          members: "5,048 events",
          avgQueue: "67.6h payment queue",
          peakLoad: "93% peak load",
          badgeClass: "badge-red",
          splits: [
            { label: "Create Invoice", pct: 38, color: "#2563eb" },
            { label: "Two-Way Match", pct: 38, color: "#d97706" },
            { label: "Payment", pct: 24, color: "#059669" }
          ],
          peakSummary: "Q1 '24 Peak · 124 waiting payments (€1.42M)",
          timeline: [
            { period: "Q3 '22", load: 58, backlog: 42 },
            { period: "Q1 '23", load: 67, backlog: 56 },
            { period: "Q3 '23", load: 81, backlog: 83 },
            { period: "Q1 '24", load: 93, backlog: 124, peak: true },
            { period: "Q2 '24", load: 85, backlog: 98 },
            { period: "Q3 '24", load: 72, backlog: 64 }
          ]
        },
        {
          id: "warehouse-p2p",
          name: "Warehouse Department",
          members: "4,042 receipts",
          avgQueue: "28.5h posting lag",
          peakLoad: "88% peak load",
          badgeClass: "badge-amber",
          splits: [
            { label: "Initial Receipt", pct: 40, color: "#059669" },
            { label: "Partial Follow-ups", pct: 60, color: "#d97706" }
          ],
          peakSummary: "Q1 '24 Peak · 91 unposted receipts at Plant 4000",
          timeline: [
            { period: "Q3 '22", load: 51, backlog: 29 },
            { period: "Q1 '23", load: 63, backlog: 41 },
            { period: "Q3 '23", load: 77, backlog: 68 },
            { period: "Q1 '24", load: 88, backlog: 91, peak: true },
            { period: "Q2 '24", load: 79, backlog: 72 },
            { period: "Q3 '24", load: 65, backlog: 47 }
          ]
        },
        {
          id: "order-mgr",
          name: "Procurement Approvers",
          members: "2,205 approvals",
          avgQueue: "63.1h PO queue",
          peakLoad: "82% peak load",
          badgeClass: "badge-amber",
          splits: [
            { label: "Approve PO", pct: 72, color: "#2563eb" },
            { label: "Approve PR", pct: 28, color: "#4f46e5" }
          ],
          peakSummary: "Q1 '24 Peak · 74 POs awaiting sign-off",
          timeline: [
            { period: "Q3 '22", load: 49, backlog: 24 },
            { period: "Q1 '23", load: 57, backlog: 33 },
            { period: "Q3 '23", load: 70, backlog: 52 },
            { period: "Q1 '24", load: 82, backlog: 74, peak: true },
            { period: "Q2 '24", load: 71, backlog: 51 },
            { period: "Q3 '24", load: 60, backlog: 36 }
          ]
        }
      ]
    },

    comparison: {
      totalClusters: 1166,
      baseDelayedAt3d: 512,
      baseStalledEur: 1420000,
      baseRippleEvents: 633,
      rippleUnit: "extra invoice matches",
      delayTargetLabel: "Partial Delivery & Match Delay",
      factors: [
        {
          title: "3+ Partial Goods Receipts on PO",
          multiplier: "2.9× slower",
          cases: "438 payments",
          withVal: "8.4 days",
          withPct: 90,
          withoutVal: "2.9 days",
          withoutPct: 31
        },
        {
          title: "Delegated Requisition Approval",
          multiplier: "2.5× slower",
          cases: "122 requisitions",
          withVal: "11.2 days",
          withPct: 84,
          withoutVal: "4.5 days",
          withoutPct: 34
        },
        {
          title: "Plant 4000 / Group 005 Vendors",
          multiplier: "2.2× slower",
          cases: "289 POs",
          withVal: "6.8 days",
          withPct: 74,
          withoutVal: "3.1 days",
          withoutPct: 34
        }
      ]
    },

    timeline: {
      delayedCase: {
        caseId: "Payment payment:807",
        meta: "Chainring Champions Inc · PO purchase_order:1384 · €96,750",
        duration: "14.1 days",
        waitSummary: "9.2 days waiting on second partial delivery & match",
        syncStartPct: 16,
        syncEndPct: 72,
        queueEndPct: 92,
        lanes: [
          {
            objectLabel: "PO :1384",
            subLabel: "Purchase Order",
            color: "#2563eb",
            events: [
              { x: 6, label: "Create PO", time: "Jun 10, 12:51", actor: "Procurement" },
              { x: 13, label: "Approve PO", time: "Jun 11, 11:25", actor: "Order Manager" }
            ]
          },
          {
            objectLabel: "Receipt :1670",
            subLabel: "Waited 13.2d",
            color: "#059669",
            events: [{ x: 16, label: "Receipt #1", time: "Jun 11, 12:25", actor: "Warehouse" }]
          },
          {
            objectLabel: "Receipt :1669",
            subLabel: "Late Lot #2",
            color: "#dc2626",
            events: [{ x: 46, label: "Receipt #2", time: "Jun 16, 01:35", actor: "Warehouse" }]
          },
          {
            objectLabel: "Invoice :1679",
            subLabel: "Invoice",
            color: "#d97706",
            events: [
              { x: 54, label: "Invoice #1", time: "Jun 17, 12:54", actor: "Finance" },
              { x: 58, label: "Match #1", time: "Jun 17, 13:04", actor: "Finance" },
              { x: 69, label: "Invoice #2", time: "Jun 20, 08:23", actor: "Finance" },
              { x: 73, label: "Match #2", time: "Jun 20, 08:33", actor: "Finance" }
            ]
          },
          {
            objectLabel: "Payment :807",
            subLabel: "€96,750",
            color: "#059669",
            events: [{ x: 92, label: "Execute Payment", time: "Jun 24, 16:19", actor: "Finance" }]
          }
        ]
      },
      healthyCase: {
        caseId: "Payment payment:6",
        meta: "Quality Helmets Co · PO purchase_order:17 · €53,700",
        duration: "1.5 days post-receipt",
        waitSummary: "3.5 hours alignment · single full delivery",
        syncStartPct: 48,
        syncEndPct: 58,
        queueEndPct: 86,
        lanes: [
          {
            objectLabel: "PO :17",
            subLabel: "Purchase Order",
            color: "#2563eb",
            events: [
              { x: 10, label: "Create PO", time: "Apr 19, 17:32", actor: "Procurement" },
              { x: 38, label: "Approve PO", time: "Apr 24, 18:12", actor: "Order Manager" }
            ]
          },
          {
            objectLabel: "Receipt :21",
            subLabel: "Full delivery",
            color: "#059669",
            events: [{ x: 48, label: "Goods Receipt", time: "Apr 25, 08:36", actor: "Warehouse" }]
          },
          {
            objectLabel: "Invoice :13",
            subLabel: "Invoice",
            color: "#059669",
            events: [
              { x: 55, label: "Invoice", time: "Apr 25, 12:06", actor: "Finance" },
              { x: 60, label: "Two-Way Match", time: "Apr 25, 12:16", actor: "Finance" }
            ]
          },
          {
            objectLabel: "Payment :6",
            subLabel: "€53,700",
            color: "#059669",
            events: [{ x: 86, label: "Execute Payment", time: "Apr 26, 21:23", actor: "Finance" }]
          }
        ]
      }
    }
  }
};
