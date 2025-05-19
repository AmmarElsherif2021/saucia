import gainWeightPlanImage from '../../assets/premium/gainWeight.png'
import keepWeightPlanImage from '../../assets/premium/keepWeight.png'
import loseWeightPlanImage from '../../assets/premium/loseWeight.png'


import { useTranslation } from 'react-i18next'
import { useElements } from '../../Contexts/ElementsContext';

export const getPlans= () => {
  const { plans } = useElements();
  
  return plans?.map(plan => ({
    id: plan.id,
    title: plan.title,
    title_arabic: plan.title_arabic,
    carb: plan.carb,
    protein: plan.protein,
    kcal: plan.kcal,
    periods: plan.periods,
    //avatar: plan.avatar? plan.avatar: "" ,
    carbMeals: plan.carbMeals,
    proteinMeals: plan.proteinMeals,
    soaps: plan.soaps,
    snacks: plan.snacks,
  })) || [];
};

export default getPlans;