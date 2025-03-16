import * as React from "react";
import { 
  Button, 
  Dialog, 
  DialogSurface, 
  Field, 
  InfoLabel, 
  Label, 
  LabelProps, 
  Spinner, 
  Textarea, 
  makeStyles,
  Badge,
  Text,
  Divider,
  Toast,
  ToastTitle,
  useToastController,
  Toaster
} from "@fluentui/react-components";
import DialogForm from "./DialogForm";
import { DialogInfo, FieldInfo, sendRequest } from "../../../helpers";
import { getMailDetails, insertText } from "../taskpane";
import { Pencil, FileText, X, Upload, CheckCircle2, Copy } from "lucide-react";

/* global console, HTMLTextAreaElement, HTMLDivElement, localStorage, File, fetch, document */

// API Configuration
const BUCKET_NAME = "fg-chat-ocr";
const OCR_API_ENDPOINT = "https://fg.server.lavel.io/outlook/ocr-detect";
const PRESIGNED_URL_ENDPOINT = "https://fg.server.lavel.io/generate_presigned_upload_url";

const useStyles = makeStyles({
  root: {
    flexDirection: "column",
    display: "flex",
    paddingLeft: "10px",
    paddingRight: "10px",
  },
  answer_dialog: {
    flexDirection: "column",
    display: "flex",
  },
  dialog_field: {
    fontWeight: 600,
    marginBottom: "15px",
  },
  button_send: {
    width: "100%",
    marginBottom: "10px",
  },
  spinner: {
    width: "75%",
  },
  pencil: {
    marginLeft: "2px",
    marginRight: "4px",
  },
  dropZone: {
    border: "2px dashed #ccc",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    marginBottom: "15px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  dropZoneActive: {
    border: "2px dashed #0078d4",
    backgroundColor: "rgba(0, 120, 212, 0.05)",
  },
  dropZoneSuccess: {
    border: "2px dashed #107c10",
    backgroundColor: "rgba(16, 124, 16, 0.05)",
  },
  filePreview: {
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "#f3f2f1",
    borderRadius: "4px",
    marginBottom: "15px",
  },
  fileIcon: {
    marginRight: "8px",
    color: "#0078d4",
  },
  fileName: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  removeButton: {
    cursor: "pointer",
    color: "#605e5c",
    "&:hover": {
      color: "#d13438",
    },
  },
  copyButton: {
    cursor: "pointer",
    color: "#605e5c",
    marginRight: "8px",
    "&:hover": {
      color: "#0078d4",
    },
  },
  divider: {
    margin: "15px 0",
  },
  fileUploadInfo: {
    marginBottom: "10px",
    fontSize: "12px",
    color: "#605e5c",
  },
  ocrCompletedMessage: {
    color: "green",
    display: "block",
    marginTop: "5px",
  },
  checkIcon: {
    verticalAlign: "middle",
    marginRight: "5px",
  },
  hiddenInput: {
    display: "none",
  }
});

const TabAnswer = () => {
  const styles = useStyles();

  const [showDialog, setShowDialog] = React.useState<DialogInfo>({ show: false, text: "" }); // dialog form
  const [showSpinner, setShowSpinner] = React.useState<boolean>(false); // spinner

  const [answerValue, setAnswerValue] = React.useState<FieldInfo>({ current: "", state: "none" }); // answer field value
  // Store OCR results for each document separately
  const [documentTexts, setDocumentTexts] = React.useState<{[key: string]: string}>({});
  // Combined text input for all documents - used for display and answer generation
  const [textInput, setTextInput] = React.useState<string>("");
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [isOcrProcessing, setIsOcrProcessing] = React.useState<boolean>(false);
  const [ocrCompleted, setOcrCompleted] = React.useState<boolean>(false);
  // Track file names for OCR processing - used in the processOCR function
  const [fileNames, setFileNames] = React.useState<string[]>([]);

  const dropZoneRef = React.useRef<HTMLDivElement>(null);
  const { dispatchToast } = useToastController();

  const def_answer = "Eingeben..";

  React.useEffect(() => {
    const getStartData = async () => {
      var answer = localStorage.getItem("answer"); // load last answer from storage

      // set default value
      if (!answer || answer == "") {
        answer = def_answer;
      }

      setAnswerValue({ current: answer, state: "none" });
      
      // Clear any previous OCR data when component mounts
      setTextInput("");
      setDocumentTexts({});
      setUploadedFiles([]);
      setOcrCompleted(false);
      setFileNames([]);
    };

    getStartData(); // get Start Data
  }, []);

  // validate answer field
  const ValidateField = (): boolean => {
    let valid = true;
    var answer = answerValue.current ?? "";

    // set default value
    if (answer == " ") {
      answer = def_answer;
      localStorage.setItem("answer", answer); // save
    }

    answer = answer.trim();

    if (answer == "") {
      setAnswerValue({ current: answer, state: "error" });
      valid = false;
    } else {
      setAnswerValue({ current: answer, state: "none" });
    }

    return valid;
  };

  // change answer value
  const handleChangeValue = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setAnswerValue({ ...answerValue, current: value });
    setTextInput(value); // Update textInput state as well
  };

  // Handle file drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validFiles = newFiles.filter((file) => file.type === "application/pdf");
      const invalidFiles = newFiles.length - validFiles.length;
      
      if (invalidFiles > 0) {
        setShowDialog({
          show: true,
          text: `${invalidFiles} Datei(en) wurden ignoriert. Nur PDF-Dateien werden unterstützt.`,
        });
      }
      
      if (validFiles.length > 0) {
        const updatedFiles = [...uploadedFiles, ...validFiles].slice(0, 5);
        setUploadedFiles(updatedFiles);
        setOcrCompleted(false);
        
        if (uploadedFiles.length + validFiles.length > 5) {
          setShowDialog({ show: true, text: "Maximal 5 Dateien können hochgeladen werden." });
        }
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter((file) => file.type === "application/pdf");
      const invalidFiles = newFiles.length - validFiles.length;
      
      if (invalidFiles > 0) {
        setShowDialog({
          show: true,
          text: `${invalidFiles} Datei(en) wurden ignoriert. Nur PDF-Dateien werden unterstützt.`,
        });
      }
      
      if (validFiles.length > 0) {
        const updatedFiles = [...uploadedFiles, ...validFiles].slice(0, 5);
        setUploadedFiles(updatedFiles);
        setOcrCompleted(false);
        
        if (uploadedFiles.length + validFiles.length > 5) {
          setShowDialog({ show: true, text: "Maximal 5 Dateien können hochgeladen werden." });
        }
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    const updatedFiles = [...uploadedFiles];
    updatedFiles.splice(index, 1);
    setUploadedFiles(updatedFiles);
    
    // Remove the document text for this file
    if (fileToRemove) {
      const updatedDocumentTexts = { ...documentTexts };
      delete updatedDocumentTexts[fileToRemove.name];
      setDocumentTexts(updatedDocumentTexts);
      
      // Update the combined text input
      updateCombinedText(updatedFiles, updatedDocumentTexts);
    }
    
    // Reset OCR status if all files are removed
    if (updatedFiles.length === 0) {
      setOcrCompleted(false);
      setFileNames([]);
      setTextInput("");
      setDocumentTexts({});
    }
  };
  
  // Helper function to update the combined text from all documents
  const updateCombinedText = (files: File[], texts: { [key: string]: string }) => {
    const combinedText = files
      .map((file) => texts[file.name] || "")
      .filter((text) => text.trim() !== "")
      .join("\n\n");
    setTextInput(combinedText);
  };

  // Copy OCR text to clipboard for a specific document
  const copyOcrText = (index: number) => {
    const file = uploadedFiles[index];
    const fileName = file ? file.name : "";
    const textToCopy = fileName && documentTexts[fileName] ? documentTexts[fileName] : "";
    
    if (textToCopy && textToCopy.trim() !== "") {
      // Use document.execCommand as a fallback for Office Add-ins environment
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        // Show success toast
        dispatchToast(
          <Toast>
            <ToastTitle media={<CheckCircle2 color="green" />}>Text copied to clipboard</ToastTitle>
          </Toast>,
          { position: "top", timeout: 3000 }
        );
      } catch (error) {
        console.error("Error copying text to clipboard:", error);
        setShowDialog({ show: true, text: `Error copying text: ${error.message}` });
      }
    } else {
      setShowDialog({ show: true, text: "No OCR text available for this document" });
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  // Upload files to S3 using presigned URLs and trigger OCR processing
  const uploadFilesToS3 = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    setIsOcrProcessing(true);
    
    try {
      // Upload each file to S3 using presigned URLs
      const newFileNames = [];
      const newFileUuids = [];
      const newFileTypes = [];
      
      for (const file of uploadedFiles) {
        // Get presigned URL from the server
        const presignedUrlResponse = await fetch(PRESIGNED_URL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("apiKey") || ""
          },
          body: JSON.stringify({
            filename: file.name,
            content_type: file.type,
            bucket_name: BUCKET_NAME,
          }),
        });
        
        if (!presignedUrlResponse.ok) {
          throw new Error(`Failed to get presigned URL: ${presignedUrlResponse.statusText}`);
        }
        
        const presignedData = await presignedUrlResponse.json();
        // Upload file using the presigned URL
        const uploadResponse = await fetch(presignedData.url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}: ${uploadResponse.statusText}`);
        }
        
        // Store the file information returned from the server
        newFileNames.push(presignedData.filename);
        newFileUuids.push(presignedData.uuid);
        newFileTypes.push(presignedData.filetype);
      }
      
      setFileNames(newFileNames);
      setIsUploading(false);
      
      // Trigger OCR processing with the new file information
      await triggerOcrProcessing(newFileUuids.map((uuid, index) => `${uuid}${newFileTypes[index]}`));
    } catch (error) {
      console.error("Error uploading files to S3:", error);
      setShowDialog({ show: true, text: `Fehler beim Hochladen: ${error.message}` });
      setIsUploading(false);
      setIsOcrProcessing(false);
    }
  };
  
  // Trigger OCR processing on the backend
  const triggerOcrProcessing = async (fileNames: string[]) => {
    try {
      const apiKey: string = localStorage.getItem("apiKey") || "";
      
      if (apiKey === "") {
        setShowDialog({ show: true, text: "API-Schlüssel nicht angegeben" });
        setIsOcrProcessing(false);
        return;
      }
      
      // Prepare files array according to OCRRequest schema
      const files = fileNames.map((filename) => ({
        filename,
        bucket: BUCKET_NAME,
      }));
      
      const response = await fetch(OCR_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify({
          files: files,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "OCR processing failed");
      }
      
      // Update text input with OCR results if available
      if (data.documents && data.documents.length > 0) {
        // Store text for each document separately
        const updatedDocumentTexts = { ...documentTexts };
        
        // Map each document to its file using the index
        data.documents.forEach((doc: { text: string }, index: number) => {
          if (index < fileNames.length && doc.text) {
            // Use the original filename (without UUID) as the key
            const originalFileName = uploadedFiles[index]?.name || `Document ${index + 1}`;
            updatedDocumentTexts[originalFileName] = doc.text;
          }
        });
        
        setDocumentTexts(updatedDocumentTexts);
        
        // Update the combined text input
        const combinedText = uploadedFiles
          .map((file) => updatedDocumentTexts[file.name] || "")
          .filter((text) => text.trim() !== "")
          .join("\n\n");
        
        setTextInput(combinedText);
      }
      
      setIsOcrProcessing(false);
      setOcrCompleted(true);
      
      // Show success toast
      dispatchToast(
        <Toast>
          <ToastTitle media={<CheckCircle2 color="green" />}>OCR erfolgreich abgeschlossen</ToastTitle>
        </Toast>,
        { position: "top", timeout: 5000 }
      );
      
    } catch (error) {
      console.error("Error processing OCR:", error);
      setShowDialog({ show: true, text: `OCR-Fehler: ${error.message}` });
      setIsOcrProcessing(false);
    }
  };

  // React to file uploads
  React.useEffect(() => {
    if (uploadedFiles.length > 0 && !isUploading && !isOcrProcessing && !ocrCompleted) {
      uploadFilesToS3();
    }
  }, [uploadedFiles, isUploading, isOcrProcessing, ocrCompleted]);

  // button - get full answer
  const onButtonSaveClick = () => {
    if (!ValidateField()) {
      return;
    }

    // Save both answer value and text input
    localStorage.setItem("answer", answerValue.current); // save
    setTextInput(answerValue.current); // Ensure textInput is synced

    var apiKey: string = localStorage.getItem("apiKey"); // load apiKey from storage

    if (apiKey == "") {
      setShowDialog({ show: true, text: "API-Schlüssel nicht angegeben" });
      return;
    }
    
    // Check if we need to wait for OCR processing
    if (uploadedFiles.length > 0 && !ocrCompleted) {
      setShowDialog({
        show: true,
        text: "Bitte warten Sie, bis die OCR-Verarbeitung der PDF-Dateien abgeschlossen ist, bevor Sie eine Antwort generieren.",
      });
      return;
    }

    // get Mail Details
    getMailDetails((data) => {
      setShowSpinner(true);

      var user_input: string = answerValue.current;

      console.log("subject = " + data.subject);
      console.log("sender = " + data.sender);
      console.log("body = " + data.body);
      console.log("recipients = " + JSON.stringify(data.recipients));
      console.log("cc = " + JSON.stringify(data.cc));
      console.log("user_input = " + user_input);
      console.log("user_email = " + data.user_email);
      console.log("files = " + (uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.name).join(", ") : "none"));

      // send Request
      // Use the original files without modification
      let filesToSend = undefined;
      
      if (uploadedFiles.length > 0) {
        // Use the original files without any modifications
        filesToSend = uploadedFiles;
      }
      
      // Create a separate document texts object to pass to the API
      const documentTextsList = [];
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          documentTextsList.push({
            filename: file.name,
            text: documentTexts[file.name] || "",
          });
        }
      }
      
      sendRequest(
        "/outlook/generate-email", 
        apiKey, 
        data.subject, 
        data.sender, 
        data.body, 
        user_input, 
        data.user_email, 
        data.recipients, 
        data.cc,
        filesToSend,
        documentTextsList
      )
        .then(async (response) => {
          setShowSpinner(false);

          console.log("response = " + JSON.stringify(response, null, 2));

          // show error dialog
          if (response.status != "success") {
            setShowDialog({ show: true, text: response.detail });
            return;
          }

          insertText(response.email_text); // Write text to the cursor point in the compose surface.
        })
        .catch((error) => {
          setShowSpinner(false);
          setShowDialog({ show: true, text: `Request error: ${error}` }); // show error dialog
        });
    });
  };

  // result dialog event
  const handleResultDialog = () => {
    setShowSpinner(false);
    setShowDialog({ ...showDialog, show: false });
  };

  return (
    <div className={styles.root} role="tabpanel" aria-labelledby="Settings">
      <Toaster />
      
      {(showSpinner || isUploading || isOcrProcessing) && (
        <Dialog defaultOpen={true}>
          <DialogSurface className={styles.spinner}>
            <Spinner 
              autoFocus 
              labelPosition="after" 
              label={
                isUploading
                  ? "Dateien werden hochgeladen..."
                  : isOcrProcessing
                    ? "OCR-Verarbeitung läuft..."
                    : "Loading..."
              }
            />
          </DialogSurface>
        </Dialog>
      )}

      {showDialog.show && (
        <DialogForm
          type="alert"
          title="Fehler"
          content={showDialog.text}
          closeName="OK"
          showPrimary={false}
          onResultDialog={handleResultDialog}
        />
      )}

      <div className={styles.answer_dialog}>
        <Field
          className={styles.dialog_field}
          label={
            <>
              <Pencil size={18} className={styles.pencil} /> Nutzer Input
            </>
          }
          validationState={answerValue.state}
          validationMessage="Kurze Antwort eingeben"
          required
        >
          <Textarea
            value={answerValue.current}
            rows={10}
            placeholder="Kurzen Text eingeben.."
            size="large"
            resize="vertical"
            onChange={handleChangeValue}
          />
        </Field>

        <Divider className={styles.divider} />

        <Text className={styles.fileUploadInfo}>
          Laden Sie bis zu 5 PDF-Dateien hoch, um Text zu extrahieren und in die Anfrage einzubeziehen
        </Text>

        <div 
          ref={dropZoneRef}
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ""} ${ocrCompleted ? styles.dropZoneSuccess : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <Upload size={24} />
          <p>
            PDF-Dateien hierher ziehen oder klicken zum Auswählen ({uploadedFiles.length}/5)
            {ocrCompleted && uploadedFiles.length > 0 && (
              <span className={styles.ocrCompletedMessage}>
                <CheckCircle2 size={16} className={styles.checkIcon} />
                OCR abgeschlossen
              </span>
            )}
          </p>
          <input
            id="file-input"
            type="file"
            accept="application/pdf"
            className={styles.hiddenInput}
            multiple
            onChange={handleFileSelect}
            aria-label="PDF-Datei auswählen"
          />
        </div>
        
        {uploadedFiles.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            {uploadedFiles.map((file, index) => (
              <div key={index} className={styles.filePreview}>
                <FileText size={20} className={styles.fileIcon} />
                <span className={styles.fileName}>{file.name}</span>
                <Copy size={18} className={styles.copyButton} onClick={() => copyOcrText(index)} aria-label="Copy OCR text" />
                <X size={18} className={styles.removeButton} onClick={() => handleRemoveFile(index)} aria-label="Remove file" />
              </div>
            ))}
          </div>
        )}

        <Button className={styles.button_send} appearance="primary" onClick={onButtonSaveClick}>
          Antwort generieren
        </Button>
      </div>
    </div>
  );
};

export default TabAnswer;
