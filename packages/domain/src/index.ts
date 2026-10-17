export { Money } from './money/Money';

export {
  computeOrderTotals,
  validateOrderTotals,
  type OrderTotals,
} from './order/computeOrderTotals';
export {
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  canTransition,
  isTerminalOrderStatus,
  type OrderStatus,
} from './order/orderRules';

export {
  MIN_CART_QUANTITY,
  isValidCartQuantity,
  assertValidCartQuantity,
  lineTotal,
  cartSubtotal,
  cartItemCount,
  isCartEmpty,
  assertCartNotEmpty,
  withCartQuantity,
  type CartLine,
} from './cart/cartRules';

export {
  normalizeSaudiPhone,
  isValidSaudiPhone,
  formatSaudiPhone,
  maskSaudiPhone,
} from './identity/phoneValidation';

export {
  BMI_CATEGORIES,
  BMICalculator,
  type BMICategory,
  type BMIResult,
} from './subscription/BMICalculator';
export {
  GENDERS,
  ACTIVITY_LEVELS,
  FITNESS_GOALS,
  ACTIVITY_MULTIPLIERS,
  CALORIE_ADJUSTMENTS,
  TDEECalculator,
  isCompleteHealthProfile,
  type Gender,
  type ActivityLevel,
  type FitnessGoal,
  type HealthProfile,
} from './subscription/TDEECalculator';
export {
  MACRO_RATIOS,
  CALORIES_PER_GRAM,
  calculateMacros,
  calculateNutritionProfile,
  type MacroSplit,
  type NutritionProfile,
} from './subscription/NutritionCalculator';
