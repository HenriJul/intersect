/**
 * Structural OCEL 2.0 Metrics & Graph Coordinates (`order-management.json` & `ocel2-p2p.json`).
 *
 * All process-specific textual labels, titles, and plain-language explanations are
 * resolved dynamically through `schemaTexts.js` (default schema profiles + user overrides).
 */

import { getResolvedLog } from "./schemaTexts.js?v=12";

export const RAW_DEMO_LOGS = {
  "order-management": {
    logId: "order-management",
    filename: "order-management.json",
    timeSpan: "Apr 2023 – Jun 2024",
    eventCount: 21008,
    objectCount: 10840,
    objectTypeCount: 6,
    defaultStepId: "create-package",
    defaultSlaDays: 3.0,

    overviewKpis: [
      { value: "10,840" },
      { value: "" },
      { value: "€312,400" }
    ],

    tracks: [
      { id: "orders", color: "#2563eb", y: 78 },
      { id: "items", color: "#d97706", y: 178 },
      { id: "employees", color: "#7c3aed", y: 278 },
      { id: "packages", color: "#059669", y: 374 }
    ],

    flowGraph: {
      singleSteps: [
        { id: "place-order", count: "2,000", track: "orders", x: 195, y: 78 },
        { id: "pick-item", count: "7,659", track: "items", x: 445, y: 178 },
        { id: "send-package", count: "1,128", track: "packages", x: 695, y: 374 }
      ],
      exceptionLoops: [
        { id: "oos-loop", count: "1,544", x: 445, y: 118, color: "#dc2626" },
        { id: "reminder-loop", count: "566", x: 750, y: 26, color: "#d97706" },
        { id: "failed-deliv-loop", count: "311", x: 815, y: 422, color: "#dc2626" }
      ],
      sharedSteps: [
        {
          id: "confirm-order",
          waitTag: "0.7d",
          x: 315,
          yTop: 60,
          yBottom: 294,
          tracksJoined: ["orders", "items", "employees"],
          slowestTrack: "employees"
        },
        {
          id: "create-package",
          waitTag: "3.8d wait",
          x: 575,
          yTop: 158,
          yBottom: 392,
          tracksJoined: ["items", "employees", "packages"],
          slowestTrack: "items"
        },
        {
          id: "pay-order",
          waitTag: "6.1d delay",
          x: 745,
          yTop: 60,
          yBottom: 196,
          tracksJoined: ["orders", "items"],
          slowestTrack: "items"
        },
        {
          id: "package-delivered",
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
        avgWait: "3.8 days",
        responsibleTeamId: "warehousing",
        affectedValue: "€312,400",
        breakdown: {
          totalDays: 3.8,
          allItemsDays: 2.4,
          allItemsPct: 62,
          otherObjectsDays: 0.6,
          otherObjectsPct: 16,
          teamDays: 0.8,
          teamPct: 22
        },
        delaySources: [
          { pct: 74, lag: "+70h", color: "#d97706" },
          { pct: 14, lag: "+28h", color: "#2563eb" },
          { pct: 12, lag: "+20h", color: "#7c3aed" }
        ],
        chain: [{}, {}, {}]
      },

      "pay-order": {
        id: "pay-order",
        rank: 2,
        severity: "amber",
        avgWait: "6.1 days",
        responsibleTeamId: "sales",
        affectedValue: "€428,900",
        breakdown: {
          totalDays: 6.1,
          allItemsDays: 1.1,
          allItemsPct: 18,
          otherObjectsDays: 3.2,
          otherObjectsPct: 53,
          teamDays: 1.8,
          teamPct: 29
        },
        delaySources: [
          { pct: 68, lag: "+78h", color: "#d97706" },
          { pct: 22, lag: "+68h", color: "#2563eb" },
          { pct: 10, lag: "+19h", color: "#7c3aed" }
        ],
        chain: [{}, {}, {}]
      },

      "package-delivered": {
        id: "package-delivered",
        rank: 3,
        severity: "blue",
        avgWait: "0.8 days",
        responsibleTeamId: "shipment",
        affectedValue: "311 retries",
        breakdown: {
          totalDays: 0.8,
          allItemsDays: 0.0,
          allItemsPct: 0,
          otherObjectsDays: 0.08,
          otherObjectsPct: 10,
          teamDays: 0.72,
          teamPct: 90
        },
        delaySources: [
          { pct: 63, lag: "+17h", color: "#7c3aed" },
          { pct: 27, lag: "+24h", color: "#dc2626" },
          { pct: 10, lag: "+3h", color: "#059669" }
        ],
        chain: [{}, {}, {}]
      },

      "confirm-order": {
        id: "confirm-order",
        rank: 4,
        severity: "blue",
        avgWait: "0.7 days",
        responsibleTeamId: "sales",
        affectedValue: "€118,000",
        breakdown: {
          totalDays: 0.7,
          allItemsDays: 0.0,
          allItemsPct: 0,
          otherObjectsDays: 0.13,
          otherObjectsPct: 19,
          teamDays: 0.57,
          teamPct: 81
        },
        delaySources: [
          { pct: 81, lag: "+14h", color: "#7c3aed" },
          { pct: 19, lag: "+3h", color: "#2563eb" }
        ],
        chain: [{}, {}, {}]
      }
    },

    capacity: {
      defaultTeamId: "warehousing",
      teams: [
        {
          id: "warehousing",
          badgeClass: "badge-red",
          splits: [
            { pct: 65, color: "#2563eb" },
            { pct: 26, color: "#d97706" },
            { pct: 9, color: "#059669" }
          ],
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
          badgeClass: "badge-amber",
          splits: [
            { pct: 44, color: "#2563eb" },
            { pct: 44, color: "#059669" },
            { pct: 12, color: "#dc2626" }
          ],
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
          badgeClass: "badge-green",
          splits: [{ pct: 100, color: "#7c3aed" }],
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
      factors: [
        {
          multiplier: "3.4× slower",
          withVal: "5.8 days",
          withPct: 92,
          withoutVal: "1.7 days",
          withoutPct: 27
        },
        {
          multiplier: "2.3× slower",
          withVal: "4.9 days",
          withPct: 78,
          withoutVal: "2.1 days",
          withoutPct: 33
        },
        {
          multiplier: "1.9× slower",
          withVal: "1.5d queue",
          withPct: 60,
          withoutVal: "0.8d queue",
          withoutPct: 31
        }
      ]
    },

    timeline: {
      delayedCase: {
        duration: "10.0 days wait",
        syncStartPct: 45,
        syncEndPct: 79,
        queueEndPct: 86,
        lanes: [
          {
            color: "#2563eb",
            events: [
              { x: 6, label: "Place Order", time: "Apr 05, 11:05", actor: "Danube Pharma" },
              { x: 10, label: "Confirm", time: "Apr 05, 16:01", actor: "Istvan Koren" },
              { x: 17, label: "Pay Order", time: "Apr 07, 11:22", actor: "Danube Pharma" }
            ]
          },
          {
            color: "#dc2626",
            events: [
              { x: 7, label: "Out of Stock", time: "Apr 05, 11:24", actor: "Marco Pegoraro" },
              { x: 26, label: "Reorder", time: "Apr 10, 09:14", actor: "Detlef Wetzeler" },
              { x: 61, label: "Pick Item", time: "Apr 18, 09:24", actor: "Nina Graves" }
            ]
          },
          {
            color: "#2563eb",
            events: [
              { x: 35, label: "Place Order", time: "Apr 12, 16:06", actor: "Danube Pharma" },
              { x: 39, label: "Confirm", time: "Apr 13, 09:26", actor: "Christine von Dobbert" },
              { x: 95, label: "Payment Reminder", time: "May 03, 09:26", actor: "Billing" }
            ]
          },
          {
            color: "#059669",
            events: [
              { x: 45, label: "Pick Item", time: "Apr 14, 09:25", actor: "Christopher Schwanen" }
            ]
          },
          {
            color: "#dc2626",
            events: [
              { x: 41, label: "Out of Stock", time: "Apr 13, 16:29", actor: "Christopher Schwanen" },
              { x: 47, label: "Reorder", time: "Apr 14, 17:45", actor: "Christopher Schwanen" },
              { x: 79, label: "Pick Item", time: "Apr 18, 13:59", actor: "Detlef Wetzeler" }
            ]
          },
          {
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
        duration: "0.9 days wait",
        syncStartPct: 36,
        syncEndPct: 52,
        queueEndPct: 68,
        lanes: [
          {
            color: "#2563eb",
            events: [
              { x: 10, label: "Place Order", time: "Apr 06, 15:40", actor: "AlpenTech AG" },
              { x: 28, label: "Confirm", time: "Apr 10, 19:55", actor: "Mara Nitschke" },
              { x: 55, label: "Pay Order", time: "Apr 12, 16:44", actor: "AlpenTech AG" }
            ]
          },
          {
            color: "#059669",
            events: [{ x: 14, label: "Pick Item", time: "Apr 06, 15:57", actor: "Christopher Schwanen" }]
          },
          {
            color: "#059669",
            events: [{ x: 38, label: "Pick Item", time: "Apr 11, 15:00", actor: "Benedikt Knopp" }]
          },
          {
            color: "#059669",
            events: [{ x: 52, label: "Pick Item", time: "Apr 12, 14:26", actor: "Christopher Schwanen" }]
          },
          {
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
    filename: "ocel2-p2p.json",
    timeSpan: "Apr 2022 – Oct 2024",
    eventCount: 14671,
    objectCount: 9543,
    objectTypeCount: 7,
    defaultStepId: "execute-payment",
    defaultSlaDays: 4.0,

    overviewKpis: [
      { value: "9,543" },
      { value: "" },
      { value: "€1.42M" }
    ],

    tracks: [
      { id: "pr", color: "#4f46e5", y: 78 },
      { id: "po", color: "#2563eb", y: 178 },
      { id: "gr", color: "#d97706", y: 278 },
      { id: "fin", color: "#059669", y: 374 }
    ],

    flowGraph: {
      singleSteps: [
        { id: "create-pr", count: "729", track: "pr", x: 195, y: 78 },
        { id: "approve-pr", count: "607", track: "pr", x: 310, y: 78 },
        { id: "create-rfq", count: "927", track: "po", x: 400, y: 178 },
        { id: "create-po", count: "1,598", track: "po", x: 488, y: 178 },
        { id: "create-inv", count: "1,941", track: "fin", x: 660, y: 374 }
      ],
      exceptionLoops: [
        { id: "delegate-pr", count: "122", x: 255, y: 26, color: "#dc2626" },
        { id: "split-gr-loop", count: "2.5 / PO", x: 660, y: 222, color: "#d97706" }
      ],
      sharedSteps: [
        {
          id: "approve-po",
          waitTag: "3.6d wait",
          x: 575,
          yTop: 60,
          yBottom: 196,
          tracksJoined: ["pr", "po"],
          slowestTrack: "po"
        },
        {
          id: "create-gr",
          waitTag: "2.8d span",
          x: 660,
          yTop: 160,
          yBottom: 296,
          tracksJoined: ["po", "gr"],
          slowestTrack: "gr"
        },
        {
          id: "two-way-match",
          waitTag: "1.9d wait",
          x: 745,
          yTop: 260,
          yBottom: 392,
          tracksJoined: ["gr", "fin"],
          slowestTrack: "gr"
        },
        {
          id: "execute-payment",
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
        avgWait: "5.3 days",
        responsibleTeamId: "finance",
        affectedValue: "€1.42M",
        breakdown: {
          totalDays: 5.3,
          allItemsDays: 0.85,
          allItemsPct: 16,
          otherObjectsDays: 1.65,
          otherObjectsPct: 31,
          teamDays: 2.8,
          teamPct: 53
        },
        delaySources: [
          { pct: 61, lag: "+59h", color: "#d97706" },
          { pct: 29, lag: "+68h", color: "#059669" },
          { pct: 10, lag: "+21h", color: "#2563eb" }
        ],
        chain: [{}, {}, {}]
      },

      "approve-po": {
        id: "approve-po",
        rank: 2,
        severity: "amber",
        avgWait: "3.6 days",
        responsibleTeamId: "order-mgr",
        affectedValue: "€890,000",
        breakdown: {
          totalDays: 3.6,
          allItemsDays: 0.0,
          allItemsPct: 0,
          otherObjectsDays: 1.0,
          otherObjectsPct: 28,
          teamDays: 2.6,
          teamPct: 72
        },
        delaySources: [
          { pct: 72, lag: "+63h", color: "#2563eb" },
          { pct: 28, lag: "+24h", color: "#4f46e5" }
        ],
        chain: [{}, {}, {}]
      },

      "two-way-match": {
        id: "two-way-match",
        rank: 3,
        severity: "blue",
        avgWait: "1.9 days",
        responsibleTeamId: "finance",
        affectedValue: "€640,000",
        breakdown: {
          totalDays: 1.9,
          allItemsDays: 0.27,
          allItemsPct: 14,
          otherObjectsDays: 1.3,
          otherObjectsPct: 68,
          teamDays: 0.33,
          teamPct: 18
        },
        delaySources: [
          { pct: 58, lag: "+31h", color: "#d97706" },
          { pct: 30, lag: "+22h", color: "#059669" },
          { pct: 12, lag: "+8h", color: "#2563eb" }
        ],
        chain: [{}, {}, {}]
      },

      "create-gr": {
        id: "create-gr",
        rank: 4,
        severity: "blue",
        avgWait: "2.8 days",
        responsibleTeamId: "warehouse-p2p",
        affectedValue: "4,042 receipts",
        breakdown: {
          totalDays: 2.8,
          allItemsDays: 1.63,
          allItemsPct: 58,
          otherObjectsDays: 0.67,
          otherObjectsPct: 24,
          teamDays: 0.5,
          teamPct: 18
        },
        delaySources: [
          { pct: 64, lag: "+40h", color: "#d97706" },
          { pct: 36, lag: "+29h", color: "#2563eb" }
        ],
        chain: [{}, {}, {}]
      }
    },

    capacity: {
      defaultTeamId: "finance",
      teams: [
        {
          id: "finance",
          badgeClass: "badge-red",
          splits: [
            { pct: 38, color: "#2563eb" },
            { pct: 38, color: "#d97706" },
            { pct: 24, color: "#059669" }
          ],
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
          badgeClass: "badge-amber",
          splits: [
            { pct: 40, color: "#059669" },
            { pct: 60, color: "#d97706" }
          ],
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
          badgeClass: "badge-amber",
          splits: [
            { pct: 72, color: "#2563eb" },
            { pct: 28, color: "#4f46e5" }
          ],
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
      factors: [
        {
          multiplier: "2.9× slower",
          withVal: "8.4 days",
          withPct: 90,
          withoutVal: "2.9 days",
          withoutPct: 31
        },
        {
          multiplier: "2.5× slower",
          withVal: "11.2 days",
          withPct: 84,
          withoutVal: "4.5 days",
          withoutPct: 34
        },
        {
          multiplier: "2.2× slower",
          withVal: "6.8 days",
          withPct: 74,
          withoutVal: "3.1 days",
          withoutPct: 34
        }
      ]
    },

    timeline: {
      delayedCase: {
        duration: "9.2 days wait",
        syncStartPct: 16,
        syncEndPct: 72,
        queueEndPct: 92,
        lanes: [
          {
            color: "#2563eb",
            events: [
              { x: 6, label: "Create PO", time: "Jun 10, 12:51", actor: "Procurement" },
              { x: 13, label: "Approve PO", time: "Jun 11, 11:25", actor: "Order Manager" }
            ]
          },
          {
            color: "#059669",
            events: [{ x: 16, label: "Receipt #1", time: "Jun 11, 12:25", actor: "Warehouse" }]
          },
          {
            color: "#dc2626",
            events: [{ x: 46, label: "Receipt #2", time: "Jun 16, 01:35", actor: "Warehouse" }]
          },
          {
            color: "#d97706",
            events: [
              { x: 54, label: "Invoice #1", time: "Jun 17, 12:54", actor: "Finance" },
              { x: 58, label: "Match #1", time: "Jun 17, 13:04", actor: "Finance" },
              { x: 69, label: "Invoice #2", time: "Jun 20, 08:23", actor: "Finance" },
              { x: 73, label: "Match #2", time: "Jun 20, 08:33", actor: "Finance" }
            ]
          },
          {
            color: "#059669",
            events: [{ x: 92, label: "Execute Payment", time: "Jun 24, 16:19", actor: "Finance" }]
          }
        ]
      },
      healthyCase: {
        duration: "1.5 days wait",
        syncStartPct: 48,
        syncEndPct: 58,
        queueEndPct: 86,
        lanes: [
          {
            color: "#2563eb",
            events: [
              { x: 10, label: "Create PO", time: "Apr 19, 17:32", actor: "Procurement" },
              { x: 38, label: "Approve PO", time: "Apr 24, 18:12", actor: "Order Manager" }
            ]
          },
          {
            color: "#059669",
            events: [{ x: 48, label: "Goods Receipt", time: "Apr 25, 08:36", actor: "Warehouse" }]
          },
          {
            color: "#059669",
            events: [
              { x: 55, label: "Invoice", time: "Apr 25, 12:06", actor: "Finance" },
              { x: 60, label: "Two-Way Match", time: "Apr 25, 12:16", actor: "Finance" }
            ]
          },
          {
            color: "#059669",
            events: [{ x: 86, label: "Execute Payment", time: "Apr 26, 21:23", actor: "Finance" }]
          }
        ]
      }
    }
  }
};

export const DEMO_LOGS = {
  get "order-management"() {
    return getResolvedLog(RAW_DEMO_LOGS["order-management"]);
  },
  get "ocel2-p2p"() {
    return getResolvedLog(RAW_DEMO_LOGS["ocel2-p2p"]);
  }
};
