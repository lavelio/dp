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
  Toaster,
  Checkbox,
  Tooltip
} from "@fluentui/react-components";
import DialogForm from "./DialogForm";
import { DialogInfo, FieldInfo, sendRequest } from "../../../helpers";
import { getMailDetails, insertText } from "../taskpane";
import { Pencil, FileText, X, Upload, CheckCircle2, Copy, Mail, Settings } from "lucide-react";

/* global console, HTMLTextAreaElement, HTMLDivElement, localStorage, File, fetch, document */

// API Configuration
const BUCKET_NAME = "fg-chat-ocr";
const OCR_API_ENDPOINT = "https://fg.server.lavel.io/outlook/ocr-detect";
const PRESIGNED_URL_ENDPOINT = "https://fg.server.lavel.io/generate_presigned_upload_url";

const useStyles = makeStyles({
  root: {
    flexDirection: "column",
    display: "flex",
    padding: "0 10px",
    width: "100%",
    boxSizing: "border-box",
  },
  answer_dialog: {
    flexDirection: "column",
    display: "flex",
    width: "100%",
    boxSizing: "border-box",
    maxWidth: "100%",
    overflow: "hidden",
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
  customLoadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  toggleContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: "15px",
    padding: "0",
    width: "100%",
    boxSizing: "border-box",
    maxWidth: "100%",
    overflow: "hidden",
  },
  toggleGroupContainer: {
    display: "flex",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  toggleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 15px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    flex: 1,
    transition: "all 0.2s ease",
    fontWeight: 400,
    fontSize: "14px",
    userSelect: "none",
  },
  toggleButtonLeft: {
    borderRadius: "4px 0 0 4px",
    borderRight: "none",
  },
  toggleButtonRight: {
    borderRadius: "0 4px 4px 0",
  },
  toggleButtonActive: {
    backgroundColor: "#006d5c",
    color: "white",
    fontWeight: 600,
  },
  toggleButtonInactive: {
    opacity: 0.9,
  },
  toggleIcon: {
    marginRight: "8px",
    verticalAlign: "middle",
  },
  checkboxContainer: {
    marginTop: "5px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
  },
  loadingText: {
    marginTop: "10px",
    fontSize: "14px",
    fontWeight: 600,
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
  const [showCustomLoading, setShowCustomLoading] = React.useState<boolean>(false); // custom loading overlay

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
  
  // New state for the generate type toggle (email or content)
  const [generateType, setGenerateType] = React.useState<string>("email"); // Default to "email"
  // New state for the include email checkbox
  const [includeEmail, setIncludeEmail] = React.useState<boolean>(true); // Default to true

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
    
    // Ensure custom loading is hidden when copying text
    setShowCustomLoading(false);
    
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
            <ToastTitle media={<CheckCircle2 color="green" />}>Text in die Zwischenablage kopiert</ToastTitle>
          </Toast>,
          { position: "top", timeout: 3000 }
        );
      } catch (error) {
        console.error("Error copying text to clipboard:", error);
        setShowDialog({ show: true, text: `Fehler beim Kopieren des Textes: ${error.message}` });
      }
    } else {
      setShowDialog({ show: true, text: "Kein OCR-Text für dieses Dokument verfügbar" });
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

  // Handle toggle change between generate email and generate content
  const handleGenerateTypeChange = (value: string) => {
    setGenerateType(value as "email" | "content");
  };

  // Handle checkbox change for including email information
  const handleIncludeEmailChange = (_: React.FormEvent<HTMLInputElement>, data: { checked: boolean }) => {
    setIncludeEmail(data.checked);
  };

  // button - get full answer
  const onButtonSaveClick = () => {
    if (!ValidateField()) {
      return;
    }
    
    // Hide any previous custom loading overlay
    setShowCustomLoading(false);

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
      setShowCustomLoading(true);

      var user_input: string = answerValue.current;

      console.log("subject = " + data.subject);
      console.log("sender = " + data.sender);
      console.log("body = " + data.body);
      console.log("recipients = " + JSON.stringify(data.recipients));
      console.log("cc = " + JSON.stringify(data.cc));
      console.log("user_input = " + user_input);
      console.log("user_email = " + data.user_email);
      console.log("files = " + (uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.name).join(", ") : "none"));
      console.log("generateType = " + generateType);
      console.log("includeEmail = " + includeEmail);

      // send Request
      // We don't need to send the actual files anymore, just the extracted text
      let filesToSend = undefined;
      
      // Create a document texts object to pass to the API
      const documentTextsList = [];
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          // Only add documents that have text content
          if (documentTexts[file.name] && documentTexts[file.name].trim() !== "") {
            documentTextsList.push({
              filename: file.name,
              text: documentTexts[file.name],
            });
          }
        }
      }
      
      sendRequest(
        "", // Empty string as endpoint will be determined in sendRequest based on generateType
        apiKey, 
        data.subject, 
        data.sender, 
        data.body, 
        user_input, 
        data.user_email, 
        data.recipients, 
        data.cc,
        filesToSend,
        documentTextsList,
        generateType,
        includeEmail
      )
        .then(async (response) => {
          setShowSpinner(false);
          setShowCustomLoading(false);

          console.log("response = " + JSON.stringify(response, null, 2));

          // show error dialog
          if (response.status != "success") {
            // Format the error message properly as a string
            let errorMessage = "Ein Fehler ist aufgetreten.";
            if (response.detail) {
              if (typeof response.detail === 'string') {
                errorMessage = response.detail;
              } else if (Array.isArray(response.detail)) {
                // Format array of errors
                errorMessage = response.detail.map(err => {
                  if (typeof err === 'string') return err;
                  if (err.msg) return err.msg;
                  return JSON.stringify(err);
                }).join('\n');
              } else {
                // Convert object to string
                errorMessage = JSON.stringify(response.detail);
              }
            }
            setShowDialog({ show: true, text: errorMessage });
            return;
          }

          // Handle different response formats based on the generate type
          if (generateType === "email") {
            insertText(response.email_text); // Write email text to the cursor point
          } else {
            insertText(response.content_text); // Write content text to the cursor point
          }
        })
        .catch((error) => {
          setShowSpinner(false);
          setShowCustomLoading(false);
          setShowDialog({ show: true, text: `Anfragefehler: ${error}` }); // show error dialog
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
      
      {showCustomLoading && (
        <div className={styles.customLoadingOverlay}>
          <Spinner size="large" />
          <div className={styles.loadingText}>Antwort wird generiert...</div>
        </div>
      )}
      
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
                    : "Wird geladen..."
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
        <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
          <Settings size={18} style={{ marginRight: "4px" }} />
          <span style={{ fontWeight: 500, fontSize: "14px" }}>Modus</span>
        </div>
        <div style={{ display: "flex", width: "100%", marginBottom: "15px" }}>
          <Tooltip content="Erstellt eine formelle E-Mail-Antwort mit Anrede und Grußformel basierend auf Ihrem Input und den vorliegenden Informationen." relationship="label">
            <div
              className={`${styles.toggleButton} ${styles.toggleButtonLeft} ${generateType === "email" ? styles.toggleButtonActive : styles.toggleButtonInactive}`}
              onClick={() => handleGenerateTypeChange("email")}
            >
              <Mail
                size={18}
                color={generateType === "email" ? "white" : "#006d5c"}
                className={styles.toggleIcon}
              />
              E-Mail Antwort
            </div>
          </Tooltip>
          <Tooltip content="Erzeugt flexiblen Text nach Ihren Vorgaben - mit oder ohne Berücksichtigung des E-Mail-Kontexts." relationship="label">
            <div
              className={`${styles.toggleButton} ${styles.toggleButtonRight} ${generateType === "content" ? styles.toggleButtonActive : styles.toggleButtonInactive}`}
              onClick={() => handleGenerateTypeChange("content")}
            >
              <FileText
                size={18}
                color={generateType === "content" ? "white" : "#006d5c"}
                className={styles.toggleIcon}
              />
              Freier Text
            </div>
          </Tooltip>
        </div>
        
        {generateType === "content" && (
          <div className={styles.checkboxContainer}>
            <Checkbox
              label="E-Mail-Informationen einbeziehen"
              checked={includeEmail}
              onChange={handleIncludeEmailChange}
            />
          </div>
        )}
        
        <Field
          className={styles.dialog_field}
          label={
            <>
              <Pencil size={18} className={styles.pencil} />
              {generateType === "email" ? "Nutzer Input" : "Nutzer Input (+ Anweisungen an KI)"}
            </>
          }
          validationState={answerValue.state}
          validationMessage="Kurze Antwort eingeben"
          required
        >
          <Textarea
            value={answerValue.current}
            rows={10}
            placeholder={generateType === "email" ? "Kurzen Text eingeben.." : "Kurzen Text und Anweisungen eingeben.."}
            size="large"
            resize="vertical"
            onChange={handleChangeValue}
            lang="de"
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
          {generateType === "email" ? "Antwort generieren" : "Text generieren"}
        </Button>
      </div>
    </div>
  );
};

export default TabAnswer;
