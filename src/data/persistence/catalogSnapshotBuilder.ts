import { assets } from "../assets.js";
import { businessUnits } from "../businessUnits.js";
import { controls } from "../controls.js";
import { cyberRisks } from "../cyberRisks.js";
import { mitigationPlans } from "../mitigationPlans.js";
import { riskAssessments } from "../riskAssessments.js";
import { getScenarioOverridesForPersistence } from "../scenarios.js";
import { threats } from "../threats.js";
import { users } from "../users.js";
import { vulnerabilities } from "../vulnerabilities.js";
import { getPersistedCraDraft } from "./catalogStore.js";
import type { PersistedCatalogV1 } from "./catalogTypes.js";

function cloneJson<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/** Builds a full v1 snapshot for localStorage / IndexedDB. */
export function buildPersistedCatalogSnapshot(): PersistedCatalogV1 {
  return {
    schemaVersion: 1,
    users: cloneJson(users),
    businessUnits: cloneJson(businessUnits),
    assets: cloneJson(assets),
    vulnerabilities: cloneJson(vulnerabilities),
    threats: cloneJson(threats),
    controls: cloneJson(controls),
    mitigationPlans: cloneJson(mitigationPlans),
    cyberRisks: cloneJson(cyberRisks),
    riskAssessments: cloneJson(riskAssessments),
    scenarioOverrides: cloneJson(getScenarioOverridesForPersistence()),
    craDraft: (() => {
      const d = getPersistedCraDraft();
      return d ? cloneJson(d) : null;
    })(),
  };
}
