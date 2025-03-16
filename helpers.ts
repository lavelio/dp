// helper functions & parameters

/* global console fetch */

const Host = "https://fg.server.lavel.io";

export interface DialogInfo {
  show: boolean;
  text: string;
}

export interface FieldInfo {
  current: string;
  state: "none" | "error" | "warning" | "success" | undefined;
}

// send Request to API
export async function sendRequest(
  endpoint: string,
  apiKey: string,
  subject: string,
  sender: string,
  body: string,
  user_input: string,
  user_email: string,
  recipients: string[] = [],
  cc: string[] = [],
  _files?: File[],
  documentTexts?: Array<{ filename: string; text: string }>
): Promise<any> {
  var url = Host + endpoint;
  console.log(` sendRequest to: ${url}`);

  const headers = {
    "Content-Type": "application/json",
    authorization: apiKey,
  };

  const data: any = {
    messages: [
      {
        subject: subject,
        body: body,
        sender: sender,
        recipients: recipients,
        cc: cc,
        thread_body: body,
        raw_content: null
      },
    ],
    user_input: user_input,
    target_language: "german",
    user_email: user_email,
  };

  // If document texts are provided, add them to the request
  if (documentTexts && documentTexts.length > 0) {
    // Only add documents if there's at least one with text
    if (documentTexts.some((doc) => doc.text)) {
      data.documents = documentTexts;
    }
  }

  // If document texts are provided directly, use them instead of processing files
  if (documentTexts && documentTexts.length > 0) {
    data.documents = documentTexts.filter((doc) => doc.text.trim() !== "");
  }
  
  // We don't need to process files for base64 content anymore since we're using the document texts
  // that were already extracted via OCR

  console.log("data = " + JSON.stringify(data, null, 2));

  var options = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
    muteHttpExceptions: true,
  };

  // HTTP request
  var response = await fetch(url, options);

  if (![200, 400, 401, 404, 502].includes(response.status)) {
    console.log(`Wrong response code: ${response.status}`);
    return { detail: `Wrong response code: ${response.status}` };
  }

  try {
    let data: any = await response.json();
    console.log("data: " + JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.log(`Invalid JSON: ${error}`);
    return { detail: `Invalid JSON: ${error}` };
  }
}

// Helper function to convert File to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = error => reject(error);
  });
}
