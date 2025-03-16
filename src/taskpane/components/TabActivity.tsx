import * as React from "react";
import { 
  Button, 
  Dialog, 
  DialogSurface, 
  Field, 
  Spinner, 
  makeStyles,
  Text,
  Divider,
  Toast,
  ToastTitle,
  useToastController,
  Toaster,
  Dropdown,
  Option,
  Input,
  Card,
  CardHeader
} from "@fluentui/react-components";
import DialogForm from "./DialogForm";
import { DialogInfo } from "../../../helpers";
import { getMailDetails } from "../taskpane";
import { CheckCircle2, ArrowRight } from "lucide-react";

/* global console, localStorage, fetch, Office */

// API Configuration
const COMBINED_ACTIVITY_ENDPOINT = "/outlook/combined-activity-data";
const CREATE_ACTIVITY_ENDPOINT = "/outlook/create-activity";

const useStyles = makeStyles({
  root: {
    flexDirection: "column",
    display: "flex",
    paddingLeft: "10px",
    paddingRight: "10px",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  button: {
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
  loadingText: {
    marginTop: "10px",
    fontSize: "14px",
    fontWeight: 600,
  },
  divider: {
    margin: "15px 0",
  },
  stepContainer: {
    marginBottom: "20px",
  },
  stepHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  stepNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#0078d4",
    color: "white",
    marginRight: "10px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  stepTitle: {
    fontWeight: "bold",
    fontSize: "16px",
  },
  suggestionCard: {
    marginBottom: "15px",
    border: "1px solid #edebe9",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  },
  cardHeader: {
    paddingBottom: "8px",
  },
  cardContent: {
    padding: "0 16px 16px 16px",
  },
  fieldGroup: {
    marginBottom: "12px",
  },
  fieldLabel: {
    fontWeight: "600",
    marginBottom: "4px",
    fontSize: "12px",
    color: "#605e5c",
  },
  fieldValue: {
    fontSize: "14px",
    padding: "8px",
    backgroundColor: "#f3f2f1",
    borderRadius: "4px",
  },
  nextStepButton: {
    marginTop: "10px",
  },
  assignedUserField: {
    marginTop: "15px",
  }
});

const TabActivity = () => {
  const styles = useStyles();
  const { dispatchToast } = useToastController();

  // State for dialog and loading
  const [showDialog, setShowDialog] = React.useState<DialogInfo>({ show: false, text: "" });
  const [showSpinner, setShowSpinner] = React.useState<boolean>(false);
  const [showCustomLoading, setShowCustomLoading] = React.useState<boolean>(false);

  // State for activity data
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [suggestedTitle, setSuggestedTitle] = React.useState<string>("");
  const [suggestedCategory, setSuggestedCategory] = React.useState<string>("");
  const [suggestedFolderId, setSuggestedFolderId] = React.useState<string>("");
  const [categories, setCategories] = React.useState<string[]>([]);
  
  // Editable fields
  const [title, setTitle] = React.useState<string>("");
  const [category, setCategory] = React.useState<string>("");
  const [assignedUser, setAssignedUser] = React.useState<string>("");
  const [folderPath, setFolderPath] = React.useState<string>("");

  // Get email details and suggestions
  React.useEffect(() => {
    const getSuggestions = () => {
      try {
        setShowSpinner(true);
        
        // Get email details using callback
        getMailDetails((mailDetails) => {
          if (!mailDetails) {
            setShowDialog({ 
              show: true, 
              text: "Keine E-Mail ausgewählt. Bitte wählen Sie eine E-Mail aus, um fortzufahren." 
            });
            setShowSpinner(false);
            return;
          }

        // Get API key from localStorage
        const apiKey = localStorage.getItem("apiKey");
        if (!apiKey) {
          setShowDialog({ 
            show: true, 
            text: "Kein API-Schlüssel gefunden. Bitte geben Sie einen API-Schlüssel in den Einstellungen ein." 
          });
          setShowSpinner(false);
          return;
        }

        // Prepare request body
        const requestBody = {
          messages: [
            {
              subject: mailDetails.subject || "",
              body: mailDetails.body || "",
              sender: mailDetails.sender || "",
              recipients: mailDetails.recipients || [],
              cc: mailDetails.cc || [],
              thread_body: mailDetails.body || "",
              raw_content: null
            }
          ]
        };

          // Call the combined activity data endpoint
          fetch(`https://fg.server.lavel.io${COMBINED_ACTIVITY_ENDPOINT}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": apiKey
            },
            body: JSON.stringify(requestBody)
          })
          .then(response => {
            if (!response.ok) {
              return response.json().then(errorData => {
                throw new Error(errorData.detail || "Fehler beim Abrufen der Aktivitätsdaten");
              });
            }
            return response.json();
          })
          .then(data => {
        
            // Update state with suggestions
            setSuggestedTitle(data.suggested_title || "");
            setSuggestedCategory(data.category || "");
            setSuggestedFolderId(data.folder_id || "");
            setCategories(data.categories || []);
            
            // Set initial values for editable fields
            setTitle(data.suggested_title || "");
            setCategory(data.category || "");
            setFolderPath(data.folder_id ? `${data.folder_id}` : "");
            
            // Get user email from localStorage or use sender email
            const userEmail = localStorage.getItem("userEmail") || mailDetails.user_email || "";
            setAssignedUser(userEmail);
            
            setShowSpinner(false);
          })
          .catch(error => {
            console.error("Error getting suggestions:", error);
            setShowDialog({ 
              show: true, 
              text: `Fehler beim Abrufen der Vorschläge: ${error.message}` 
            });
            setShowSpinner(false);
          });
        });
      } catch (error) {
        console.error("Error in getSuggestions:", error);
        setShowDialog({ 
          show: true, 
          text: `Fehler: ${error.message}` 
        });
        setShowSpinner(false);
      }
    };

    getSuggestions();
  }, []);

  // Create activity
  const createActivity = () => {
    try {
      setShowCustomLoading(true);
      
      // Get email details using callback
      getMailDetails((mailDetails) => {
        if (!mailDetails) {
          setShowDialog({ 
            show: true, 
            text: "Keine E-Mail ausgewählt. Bitte wählen Sie eine E-Mail aus, um fortzufahren." 
          });
          setShowCustomLoading(false);
          return;
        }

      // Get API key from localStorage
      const apiKey = localStorage.getItem("apiKey");
      if (!apiKey) {
        setShowDialog({ 
          show: true, 
          text: "Kein API-Schlüssel gefunden. Bitte geben Sie einen API-Schlüssel in den Einstellungen ein." 
        });
        setShowCustomLoading(false);
        return;
      }

      // Validate required fields
      if (!title.trim()) {
        setShowDialog({ show: true, text: "Bitte geben Sie einen Titel ein." });
        setShowCustomLoading(false);
        return;
      }

      if (!category.trim()) {
        setShowDialog({ show: true, text: "Bitte wählen Sie eine Kategorie aus." });
        setShowCustomLoading(false);
        return;
      }

      if (!assignedUser.trim()) {
        setShowDialog({ show: true, text: "Bitte geben Sie einen zugewiesenen Benutzer ein." });
        setShowCustomLoading(false);
        return;
      }

      if (!folderPath.trim()) {
        setShowDialog({ show: true, text: "Bitte geben Sie einen Ordnerpfad ein." });
        setShowCustomLoading(false);
        return;
      }

      // Prepare request body
      const requestBody = {
        title: title,
        category: category,
        assigned_user: assignedUser,
        messages: [
          {
            subject: mailDetails.subject || "",
            body: mailDetails.body || "",
            sender: mailDetails.sender || "",
            recipients: mailDetails.recipients || [],
            cc: mailDetails.cc || [],
            thread_body: mailDetails.body || ""
          }
        ],
        folder_path: folderPath,
        shouldCreateActivity: true
      };

        // Call the create activity endpoint
        fetch(`https://fg.server.lavel.io${CREATE_ACTIVITY_ENDPOINT}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": apiKey
          },
          body: JSON.stringify(requestBody)
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(errorData => {
              throw new Error(errorData.detail || "Fehler beim Erstellen der Aktivität");
            });
          }
          return response.json();
        })
        .then(data => {
      
          // Show success toast
          dispatchToast(
            <Toast>
              <ToastTitle media={<CheckCircle2 color="green" />}>
                Aktivität erfolgreich erstellt
              </ToastTitle>
            </Toast>,
            { position: "top", timeout: 3000 }
          );
          
          // Reset form
          setCurrentStep(1);
          setSuggestedTitle("");
          setSuggestedCategory("");
          setSuggestedFolderId("");
          setTitle("");
          setCategory("");
          setAssignedUser("");
          setFolderPath("");
          
          setShowCustomLoading(false);
        })
        .catch(error => {
          console.error("Error creating activity:", error);
          setShowDialog({ 
            show: true, 
            text: `Fehler beim Erstellen der Aktivität: ${error.message}` 
          });
          setShowCustomLoading(false);
        });
      });
    } catch (error) {
      console.error("Error in createActivity:", error);
      setShowDialog({ 
        show: true, 
        text: `Fehler: ${error.message}` 
      });
      setShowCustomLoading(false);
    }
  };

  // Go to next step
  const goToNextStep = () => {
    setCurrentStep(2);
  };

  // Go back to previous step
  const goToPreviousStep = () => {
    setCurrentStep(1);
  };

  return (
    <div className={styles.root}>
      {showSpinner && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <Spinner className={styles.spinner} label="Lade Vorschläge..." />
        </div>
      )}

      {showCustomLoading && (
        <div className={styles.customLoadingOverlay}>
          <Spinner size="large" />
          <div className={styles.loadingText}>Aktivität wird erstellt...</div>
        </div>
      )}

      {!showSpinner && (
        <div className={styles.formContainer}>
          {currentStep === 1 && (
            <div className={styles.stepContainer}>
              <div className={styles.stepHeader}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepTitle}>Aktivitätsvorschlag prüfen</div>
              </div>
              
              <Text>
                Basierend auf der ausgewählten E-Mail wurde ein Aktivitätsvorschlag erstellt.
                Überprüfen Sie die Informationen und klicken Sie auf "Weiter", um fortzufahren.
              </Text>
              
              <Divider className={styles.divider} />
              
              <Card className={styles.suggestionCard}>
                <CardHeader className={styles.cardHeader} header={<Text weight="semibold">Vorgeschlagene Aktivität</Text>} />
                <div className={styles.cardContent}>
                  <div className={styles.fieldGroup}>
                    <div className={styles.fieldLabel}>Titel</div>
                    <div className={styles.fieldValue}>{suggestedTitle}</div>
                  </div>
                  
                  <div className={styles.fieldGroup}>
                    <div className={styles.fieldLabel}>Kategorie</div>
                    <div className={styles.fieldValue}>{suggestedCategory}</div>
                  </div>
                  
                  <div className={styles.fieldGroup}>
                    <div className={styles.fieldLabel}>Ordner ID</div>
                    <div className={styles.fieldValue}>{suggestedFolderId}</div>
                  </div>
                </div>
              </Card>
              
              <Button 
                appearance="primary" 
                className={styles.nextStepButton}
                onClick={goToNextStep}
                icon={<ArrowRight />}
              >
                Weiter zur Bearbeitung
              </Button>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className={styles.stepContainer}>
              <div className={styles.stepHeader}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepTitle}>Aktivität bearbeiten und erstellen</div>
              </div>
              
              <Text>
                Bearbeiten Sie die Aktivitätsinformationen nach Bedarf und klicken Sie auf "Aktivität erstellen",
                um die Aktivität zu erstellen.
              </Text>
              
              <Divider className={styles.divider} />
              
              <Field label="Titel" required>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Aktivitätstitel"
                />
              </Field>
              
              <Field label="Kategorie" required>
                <Dropdown
                  value={category}
                  onOptionSelect={(_, data) => setCategory(data.optionValue || "")}
                  placeholder="Kategorie auswählen"
                >
                  {categories.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
              
              <Field label="Ordnerpfad" required>
                <Input 
                  value={folderPath} 
                  onChange={(e) => setFolderPath(e.target.value)} 
                  placeholder="z.B. 301 Projektname"
                />
              </Field>
              
              <Field label="Zugewiesener Benutzer" required className={styles.assignedUserField}>
                <Input 
                  value={assignedUser} 
                  onChange={(e) => setAssignedUser(e.target.value)} 
                  placeholder="E-Mail-Adresse"
                />
              </Field>
              
              <Divider className={styles.divider} />
              
              <div style={{ display: "flex", gap: "10px" }}>
                <Button 
                  appearance="secondary" 
                  onClick={goToPreviousStep}
                >
                  Zurück
                </Button>
                
                <Button 
                  appearance="primary" 
                  onClick={createActivity}
                >
                  Aktivität erstellen
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {showDialog.show && (
        <Dialog modalType="alert" open={showDialog.show}>
          <DialogSurface>
            <DialogForm
              title="Hinweis"
              message={showDialog.text}
              onClose={() => setShowDialog({ show: false, text: "" })}
            />
          </DialogSurface>
        </Dialog>
      )}
      
      <Toaster />
    </div>
  );
};

export default TabActivity;
