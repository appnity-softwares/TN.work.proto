'use server';
/**
 * @fileOverview Flow for verifying employee credentials using AI, as a fallback for when bcrypt comparison fails.
 *
 * - verifyCredentials - A function that verifies employee credentials.
 * - CredentialVerificationInput - The input type for the verifyCredentials function.
 * - CredentialVerificationOutput - The return type for the verifyCredentials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CredentialVerificationInputSchema = z.object({
  employeeCode: z.string().describe('The employee code entered by the user.'),
  passcode: z.string().describe('The plaintext passcode entered by the user.'),
  databaseEmployeeCode: z.string().describe('The employee code as stored in the database.'),
  databaseHashedPasscode: z.string().describe('The securely hashed passcode (using bcrypt) as stored in the database.'),
});
export type CredentialVerificationInput = z.infer<typeof CredentialVerificationInputSchema>;

const CredentialVerificationOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the entered credentials are valid or not.'),
  reason: z.string().optional().describe('Reason for invalid credentials, if applicable. Be helpful and suggest possible typos.'),
});
export type CredentialVerificationOutput = z.infer<typeof CredentialVerificationOutputSchema>;

export async function verifyCredentials(input: CredentialVerificationInput): Promise<CredentialVerificationOutput> {
  return credentialVerificationFlow(input);
}

const credentialVerificationPrompt = ai.definePrompt({
  name: 'credentialVerificationPrompt',
  input: {schema: CredentialVerificationInputSchema},
  output: {schema: CredentialVerificationOutputSchema},
  prompt: `You are an AI assistant specializing in helping users who have trouble logging in. The user has already failed a standard login attempt. Your task is to intelligently assess if the user likely made a common typo in their employee code or passcode.

You are given the user's input and the stored (hashed) credentials. DO NOT attempt to reverse the hash. Instead, focus on the employee code. Could the user's input be a simple typo (e.g., swapped letters, missed character) of the stored employee code?

Based on the employee code similarity, and considering the user also entered a passcode (which you cannot verify), decide if this login attempt is a "likely valid" attempt despite the failed hash check. Only do this for very obvious typos in the employee code. If the code is exact but the password failed, the credentials are not valid.

Employee Code Entered: {{{employeeCode}}}
Passcode Entered: {{{passcode}}} (You cannot verify this directly)
Stored Employee Code: {{{databaseEmployeeCode}}}
Stored Hashed Passcode: {{{databaseHashedPasscode}}} (bcrypt hash)

Return a JSON object indicating whether the credentials are valid (isValid: true/false). If invalid, provide a helpful reason to the user (e.g., "Invalid passcode." or "Employee code not found. Did you mean '...'?").
`, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  }
});

const credentialVerificationFlow = ai.defineFlow(
  {
    name: 'credentialVerificationFlow',
    inputSchema: CredentialVerificationInputSchema,
    outputSchema: CredentialVerificationOutputSchema,
  },
  async input => {
    // If the codes are an exact match, the only possibility is a wrong password.
    // The AI should not override this.
    if (input.employeeCode === input.databaseEmployeeCode) {
        return { isValid: false, reason: "Invalid passcode." };
    }
    
    const {output} = await credentialVerificationPrompt(input);
    return output!;
  }
);
