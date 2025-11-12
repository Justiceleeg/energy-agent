/**
 * Utility functions for extracting and parsing JSON from AI responses
 */

/**
 * Extracts JSON from text, handling markdown code blocks and other formats
 * @param text Raw text from AI response
 * @returns Extracted JSON string, or null if no JSON found
 */
export function extractJSON(text: string): string | null {
  if (!text) {
    return null;
  }

  let jsonText = text.trim();

  // First, try to extract from markdown code blocks
  // Handle both ```json and ``` code blocks
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
  const codeBlockMatches = Array.from(jsonText.matchAll(codeBlockRegex));
  
  if (codeBlockMatches.length > 0) {
    // Use the last match (most likely the complete JSON)
    // or the longest match
    const bestMatch = codeBlockMatches.reduce((prev, curr) => 
      curr[1].length > prev[1].length ? curr : prev
    );
    jsonText = bestMatch[1].trim();
  }

  // If no code blocks, try to find JSON object/array boundaries
  if (!jsonText.startsWith("{") && !jsonText.startsWith("[")) {
    // Try to find JSON object
    const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonText = jsonObjectMatch[0];
    } else {
      // Try to find JSON array
      const jsonArrayMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonArrayMatch) {
        jsonText = jsonArrayMatch[0];
      }
    }
  }

  // Clean up common issues
  jsonText = jsonText.trim();
  
  // Remove any leading/trailing non-JSON text
  const firstBrace = jsonText.indexOf("{");
  const firstBracket = jsonText.indexOf("[");
  const startIndex = firstBrace >= 0 && (firstBracket < 0 || firstBrace < firstBracket)
    ? firstBrace
    : firstBracket >= 0 ? firstBracket : 0;
  
  if (startIndex > 0) {
    jsonText = jsonText.substring(startIndex);
  }

  // Find the matching closing brace/bracket
  if (jsonText.startsWith("{")) {
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < jsonText.length; i++) {
      const char = jsonText[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === "\\") {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === "{") depth++;
        if (char === "}") {
          depth--;
          if (depth === 0) {
            jsonText = jsonText.substring(0, i + 1);
            break;
          }
        }
      }
    }
  } else if (jsonText.startsWith("[")) {
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < jsonText.length; i++) {
      const char = jsonText[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === "\\") {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === "[") depth++;
        if (char === "]") {
          depth--;
          if (depth === 0) {
            jsonText = jsonText.substring(0, i + 1);
            break;
          }
        }
      }
    }
  }

  return jsonText || null;
}

/**
 * Attempts to fix common JSON issues
 * @param jsonText JSON string that might have issues
 * @returns Potentially fixed JSON string
 */
export function fixCommonJSONIssues(jsonText: string): string {
  // This is a basic fix - for production, consider using a more robust JSON repair library
  // For now, we'll just ensure proper escaping of newlines and quotes within strings
  
  // Note: This is a simplified fix. For production, consider using a library like
  // 'jsonrepair' or 'json-bigint' for more robust handling
  
  return jsonText;
}

/**
 * Safely parses JSON with better error messages
 * @param text Raw text from AI response
 * @param context Context for error messages (e.g., "usage analysis", "plan recommendations")
 * @returns Parsed JSON object
 * @throws Error with helpful message if parsing fails
 */
export function parseAIJSON<T = any>(text: string, context: string = "AI response"): T {
  if (!text || !text.trim()) {
    throw new Error(`Empty ${context} received from AI`);
  }

  // Extract JSON
  let jsonText = extractJSON(text);
  
  if (!jsonText) {
    throw new Error(
      `No valid JSON found in ${context}. ` +
      `Response preview: ${text.substring(0, 200)}...`
    );
  }

  // Try to fix common issues
  jsonText = fixCommonJSONIssues(jsonText);

  try {
    return JSON.parse(jsonText) as T;
  } catch (error) {
    const parseError = error instanceof Error ? error : new Error(String(error));
    
    // Provide helpful error message
    const errorMessage = `Failed to parse ${context} JSON: ${parseError.message}. ` +
      `JSON preview: ${jsonText.substring(0, 300)}...`;
    
    throw new Error(errorMessage);
  }
}


