/* global console, fetch */

import { API_BASE_URL } from "./src/config";

export interface DialogInfo {
  show: boolean;
  text: string;
}

export interface FieldInfo {
  current: string;
  state: "none" | "error" | "success" | "warning";
}

export interface DocumentText {
  filename: string;
  text: string;
}

// Function to send request to the backend
export const sendRequest = async (
  endpoint: string,
  apiKey: string,
  subject: string,
  sender: string,
  body: string,
  user_input: string,
  user_email: string,
  recipients: string[],
  cc: string[],
  files?: File[],
  documents?: DocumentText[],
  generateType: string = "email",
  includeEmail: boolean = true
): Promise<any> => {
  try {
    // Determine which endpoint to use based on generateType
    const targetEndpoint = generateType === "email" ? "/outlook/generate-email" : "/outlook/generate-content";

    // Create the request body
    const requestBody: any = {
      user_input: user_input,
      user_email: user_email,
      messages: [
        {
          subject: subject, // Include subject in the message object
          sender: sender,
          body: body,
          recipients: recipients,
          cc: cc,
        },
      ],
    };

    // Add documents if available
    if (documents && documents.length > 0) {
      requestBody.documents = documents;
    }

    // Add includeEmail flag for generate-content endpoint
    if (generateType === "content") {
      requestBody.include_email = includeEmail;
    }

    // Set the API URL
    const apiUrl = API_BASE_URL + targetEndpoint;

    // Send the request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    // Parse the response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in sendRequest:", error);
    throw error;
  }
};
