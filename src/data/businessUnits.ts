import type { MockBusinessUnit } from "./types.js";

const raw: [string, string][] = [
  ["Human Resources", "San Francisco"],
  ["Finance", "New York"],
  ["Legal", "London"],
  ["IT Operations", "Singapore"],
  ["Engineering", "Austin"],
  ["Marketing", "Chicago"],
  ["Sales", "Toronto"],
  ["Customer Support", "Dublin"],
  ["Compliance", "Frankfurt"],
  ["Risk Management", "Boston"],
  ["Product Development", "Seattle"],
  ["Procurement", "Sydney"],
  ["Internal Audit", "Amsterdam"],
  ["Data Analytics", "Berlin"],
  ["Security Operations", "San Francisco"],
  ["Corporate Strategy", "New York"],
  ["Investor Relations", "London"],
  ["Business Development", "Tokyo"],
  ["Research", "Singapore"],
  ["Facilities Management", "Chicago"],
  ["Human Resources", "London"],
  ["Finance", "Singapore"],
  ["Legal", "New York"],
  ["IT Operations", "Austin"],
  ["Engineering", "Berlin"],
  ["Marketing", "Toronto"],
  ["Sales", "Sydney"],
  ["Customer Support", "San Francisco"],
  ["Compliance", "Boston"],
  ["Risk Management", "Dublin"],
  ["Product Development", "Amsterdam"],
  ["Procurement", "Tokyo"],
  ["Internal Audit", "Frankfurt"],
  ["Data Analytics", "Seattle"],
  ["Security Operations", "London"],
  ["Corporate Strategy", "Singapore"],
  ["Investor Relations", "Chicago"],
  ["Business Development", "Austin"],
  ["Research", "New York"],
  ["Facilities Management", "Sydney"],
  ["Human Resources", "Toronto"],
  ["Finance", "Dublin"],
  ["Legal", "Frankfurt"],
  ["IT Operations", "Berlin"],
  ["Engineering", "Amsterdam"],
  ["Marketing", "Tokyo"],
  ["Sales", "San Francisco"],
  ["Customer Support", "Seattle"],
  ["Compliance", "London"],
  ["Risk Management", "New York"],
];

export const businessUnits: MockBusinessUnit[] = raw.map(
  ([dept, location], i) => ({
    id: `BU-${String(i + 1).padStart(3, "0")}`,
    name: `${dept} \u2013 ${location}`,
  }),
);

const buById = new Map(businessUnits.map((bu) => [bu.id, bu]));

export function getBusinessUnitById(
  id: string,
): MockBusinessUnit | undefined {
  return buById.get(id);
}
