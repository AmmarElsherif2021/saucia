import gainWeightPlanImage from "../../assets/premium/gainWeight.png";
import keepWeightPlanImage from "../../assets/premium/keepWeight.png";
import loseWeightPlanImage from "../../assets/premium/loseWeight.png";
import dailyMealPlanImage from "../../assets/premium/dailyMeal.png";
import saladsPlanImage from "../../assets/premium/saladMeal.png"; 
import {useI18nContext } from "../../Contexts/I18nContext";
import { useTranslation } from "react-i18next";

export const getPlans = () => {
  const { t } = useTranslation()

  return ([
    {
    id:1,
    name: t("plans.dailyMealPlan"), 
    description: t("plans.dailyMealDescription"), 
    image: dailyMealPlanImage,
    carb: 100,
    protein: 50,
    carbMeals: ["Rice", "Pasta", "Bread", "Potatoes"],
    proteinMeals: ["Chicken", "Fish", "Eggs", "Tofu"],
    soaps: ["Tomato Soup", "Chicken Soup", "Vegetable Soup", "Lentil Soup"],
    snacks: ["Nuts", "Fruits", "Yogurt", "Granola Bars"],
    },
    {
    name: t("plans.keepWeightPlan"), 
    description: t("plans.keepWeightDescription"), 
    image: keepWeightPlanImage, 
    carb: 200,
    protein: 120,
    carbMeals: ["Quinoa", "Sweet Potatoes", "Oats", "Brown Rice"],
    proteinMeals: ["Turkey", "Salmon", "Beans", "Cottage Cheese"],
    soaps: ["Minestrone", "Pumpkin Soup", "Chicken Noodle Soup", "Miso Soup"],
    snacks: ["Hummus", "Veggie Sticks", "Cheese", "Protein Bars"],
    },
    {
    id:2,
    name: t("plans.gainWeightPlan"),
    description: t("plans.gainWeightDescription"),
    image: gainWeightPlanImage, 
    carb: 200,
    protein: 300,
    carbMeals: ["Bagels", "Pancakes", "Mashed Potatoes", "Corn"],
    proteinMeals: ["Steak", "Pork", "Egg Whites", "Protein Shakes"],
    soaps: ["Beef Stew", "Cream of Mushroom", "Chili", "Clam Chowder"],
    snacks: ["Trail Mix", "Peanut Butter", "Smoothies", "Dark Chocolate"],
    },
    {
    id:3,
    name: t("plans.loseWeightPlan"),
    description: t("plans.loseWeightDescription"),
    image: loseWeightPlanImage,
    carb: 200,
    protein: 100,
    carbMeals: ["Zucchini Noodles", "Cauliflower Rice", "Lettuce Wraps", "Whole Wheat Bread"],
    proteinMeals: ["Grilled Chicken", "Shrimp", "Greek Yogurt", "Tempeh"],
    soaps: ["Broccoli Soup", "Cabbage Soup", "Spinach Soup", "Carrot Soup"],
    snacks: ["Celery Sticks", "Hard-Boiled Eggs", "Rice Cakes", "Popcorn"],
    },
    {
    id:4,
    name: t("plans.saldsPlan"),
    description: t("plans.saldsDescription"),
    image: saladsPlanImage, 
    carb: 200,
    protein: 100,
    carbMeals: ["Croutons", "Quinoa", "Chickpeas", "Sweet Corn"],
    proteinMeals: ["Grilled Salmon", "Boiled Eggs", "Feta Cheese", "Grilled Tofu"],
    soaps: ["Gazpacho", "Cucumber Soup", "Avocado Soup", "Tomato Basil Soup"],
    snacks: ["Olives", "Pickles", "Carrot Sticks", "Cherry Tomatoes"],
    },
  ]);
}

export default getPlans;