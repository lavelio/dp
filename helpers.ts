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
  files?: File[]
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

  // If files are provided, convert them to base64 and add them to the request
  if (files && files.length > 0) {
    const filePromises = files.map(async (file) => {
      const fileBase64 = await fileToBase64(file);
      return {
        name: file.name,
        type: file.type,
        content: fileBase64,
      };
    });
    
    const fileData = await Promise.all(filePromises);
    data.files = fileData;
  }

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
