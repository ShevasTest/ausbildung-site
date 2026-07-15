export type RentBudgetInput = {
  rentPerSquareMeter: number;
  apartmentSize: number;
  incidentalCostPerSquareMeter: number;
  budgetMode: "percent" | "euro";
  budgetPercent: number;
  customBudgetEuro: number;
  householdIncomes: 1 | 2;
  localMedianNetIncome: number;
};

export type RentBudgetResult = {
  coldRent: number;
  warmRent: number;
  requiredNetIncome: number;
  requiredGrossIncome: number;
  netIncomePerSource: number;
  localMedianPerSource: number;
  affordabilityFactor: number;
  rentShare: number;
};

export function calculateRentBudget(input: RentBudgetInput): RentBudgetResult {
  const coldRent = input.rentPerSquareMeter * input.apartmentSize;
  const warmRent = coldRent + input.apartmentSize * input.incidentalCostPerSquareMeter;
  const safePercent = Math.max(1, input.budgetPercent);
  const requiredNetIncome =
    input.budgetMode === "percent" ? warmRent / (safePercent / 100) : input.customBudgetEuro;
  const requiredGrossIncome = requiredNetIncome * 1.45;
  const netIncomePerSource = requiredNetIncome / input.householdIncomes;
  const localMedianPerSource = input.localMedianNetIncome / input.householdIncomes;
  const affordabilityFactor =
    localMedianPerSource > 0 ? netIncomePerSource / localMedianPerSource : 0;
  const rentShare = requiredNetIncome > 0 ? warmRent / requiredNetIncome : 0;

  return {
    coldRent,
    warmRent,
    requiredNetIncome,
    requiredGrossIncome,
    netIncomePerSource,
    localMedianPerSource,
    affordabilityFactor,
    rentShare,
  };
}
