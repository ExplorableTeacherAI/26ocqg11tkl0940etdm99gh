import { type ReactElement } from "react";

// Initialize variables and their colors from this file's variable definitions
import { useVariableStore, initializeVariableColors } from "@/stores";
import { getDefaultValues, variableDefinitions } from "./variables";
useVariableStore.getState().initialize(getDefaultValues());
initializeVariableColors(variableDefinitions);

// Import the Fractions Introduction lesson
import { fractionsIntroBlocks } from "./sections/FractionsIntro";

/**
 * ------------------------------------------------------------------
 * FRACTIONS LESSON - Introduction to Fractions
 * ------------------------------------------------------------------
 * Target Audience: Primary 4 students (ages 9-10)
 * Learning Objective: Identify the parts of a fraction (numerator and denominator)
 *
 * Sections:
 * 1. What is a Fraction? - Introduction with pizza sharing
 * 2. The Two Parts of a Fraction - Numerator and Denominator explained
 * 3. Let's Explore! - Interactive fraction explorer
 * 4. Check Your Understanding - Quiz questions
 * ------------------------------------------------------------------
 */

export const blocks: ReactElement[] = [
    ...fractionsIntroBlocks,
];
