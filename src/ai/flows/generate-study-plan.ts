'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized study plans.
 *
 * generateStudyPlan - A function that generates a personalized study plan based on user input.
 * GenerateStudyPlanInput - The input type for the generateStudyPlan function.
 * GenerateStudyPlanOutput - The return type for the generateStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyPlanInputSchema = z.object({
  targetExamDate: z
    .string()
    .describe('The target date for the exam, in YYYY-MM-DD format.'),
  currentKnowledgeLevel: z
    .string()
    .describe(
      'The students current knowledge level, e.g., beginner, intermediate, advanced.'
    ),
  examType: z.string().describe('The type of exam the student is preparing for.'),
  topics: z
    .string()
    .describe(
      'A comma separated list of topics that will be covered in the study plan.'
    ),
});
export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

const GenerateStudyPlanOutputSchema = z.object({
  studyPlan: z
    .string()
    .describe('A personalized study plan with recommended topics and a schedule.'),
});
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;

export async function generateStudyPlan(
  input: GenerateStudyPlanInput
): Promise<GenerateStudyPlanOutput> {
  return generateStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyPlanPrompt',
  input: {schema: GenerateStudyPlanInputSchema},
  output: {schema: GenerateStudyPlanOutputSchema},
  prompt: `You are an expert study plan generator. Generate a personalized study plan based on the following information:

Target Exam Date: {{{targetExamDate}}}
Current Knowledge Level: {{{currentKnowledgeLevel}}}
Exam Type: {{{examType}}}
Topics: {{{topics}}}

The study plan should include a schedule with recommended topics to study each day.
`,
});

const generateStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateStudyPlanFlow',
    inputSchema: GenerateStudyPlanInputSchema,
    outputSchema: GenerateStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
