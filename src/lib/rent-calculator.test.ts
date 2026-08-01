import { describe, expect, it } from "vitest";
import { calculateRentBudget } from "./rent-calculator";

const berlinInput = {
  rentPerSquareMeter: 15.3,
  apartmentSize: 55,
  incidentalCostPerSquareMeter: 3.2,
  budgetPercent: 35,
  customBudgetEuro: 1_800,
  householdIncomes: 1 as const,
  localMedianNetIncome: 2_850,
};

describe("rent budget calculation", () => {
  it("calculates the percentage-budget scenario", () => {
    const result = calculateRentBudget({ ...berlinInput, budgetMode: "percent" });

    expect(result.coldRent).toBeCloseTo(841.5);
    expect(result.warmRent).toBeCloseTo(1_017.5);
    expect(result.requiredNetIncome).toBeCloseTo(2_907.14, 1);
    expect(result.requiredGrossIncome).toBeCloseTo(4_215.36, 1);
    expect(result.affordabilityFactor).toBeCloseTo(1.02, 2);
    expect(result.rentShare).toBeCloseTo(0.35, 3);
  });

  it("splits a fixed household budget across two incomes", () => {
    const result = calculateRentBudget({
      ...berlinInput,
      budgetMode: "euro",
      householdIncomes: 2,
    });

    expect(result.requiredNetIncome).toBe(1_800);
    expect(result.netIncomePerSource).toBe(900);
    expect(result.localMedianPerSource).toBe(1_425);
    expect(result.rentShare).toBeCloseTo(0.565, 2);
  });
});
