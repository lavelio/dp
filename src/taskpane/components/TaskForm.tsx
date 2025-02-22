import * as React from "react";
import {
  makeStyles,
  Button,
  Input,
  Field,
  Textarea,
  RadioGroup,
  Radio,
  tokens
} from "@fluentui/react-components";
import type { TaskTemplate } from "./TabActivities";
import { getMailDetails } from "../taskpane";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  checklistContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  checklistItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  removeButton: {
    color: tokens.colorPaletteRedForeground1,
    cursor: "pointer",
  },
});

interface TaskFormProps {
  template: TaskTemplate | null;
  onBack: () => void;
}

interface TaskData {
  name: string;
  category: string;
  startDate: string;
  dueDate: string;
  progressState: "Not Started" | "In Progress" | "Finished";
  notes: string;
  checklistItems: string[];
  responsiblePerson: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ template, onBack }) => {
  const styles = useStyles();
  const [taskData, setTaskData] = React.useState<TaskData>({
    name: template?.name || "",
    category: template?.category || "",
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progressState: "Not Started",
    notes: "",
    checklistItems: template?.checklistItems || [],
    responsiblePerson: ""
  });

  React.useEffect(() => {
    const loadSenderEmail = () => {
      getMailDetails((mailDetails) => {
        setTaskData(prev => ({
          ...prev,
          responsiblePerson: mailDetails.sender
        }));
      });
    };
    loadSenderEmail();
  }, []);

  const handleInputChange = (field: keyof TaskData, value: string) => {
    setTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddChecklistItem = () => {
    setTaskData(prev => ({
      ...prev,
      checklistItems: [...prev.checklistItems, ""]
    }));
  };

  const handleRemoveChecklistItem = (index: number) => {
    setTaskData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateChecklistItem = (index: number, value: string) => {
    setTaskData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item, i) => i === index ? value : item)
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("https://fg.server.lavel.io/create-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      // Handle success (could show a success message or redirect)
      onBack();
    } catch (error) {
      console.error("Error creating task:", error);
      // Handle error (show error message)
    }
  };

  return (
    <div className={styles.root}>
      <Field label="Task Name" required>
        <Input
          value={taskData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
        />
      </Field>

      <Field label="Category">
        <Input
          value={taskData.category}
          onChange={(e) => handleInputChange("category", e.target.value)}
        />
      </Field>

      <Field label="Start Date" required>
        <Input
          type="date"
          value={taskData.startDate}
          onChange={(e) => handleInputChange("startDate", e.target.value)}
        />
      </Field>

      <Field label="Due Date">
        <Input
          type="date"
          value={taskData.dueDate}
          onChange={(e) => handleInputChange("dueDate", e.target.value)}
        />
      </Field>

      <Field label="Progress State" required>
        <RadioGroup
          value={taskData.progressState}
          onChange={(_e, data) => handleInputChange("progressState", data.value as any)}
        >
          <Radio value="Not Started" label="Not Started" />
          <Radio value="In Progress" label="In Progress" />
          <Radio value="Finished" label="Finished" />
        </RadioGroup>
      </Field>

      <Field label="Responsible Person">
        <Input
          value={taskData.responsiblePerson}
          onChange={(e) => handleInputChange("responsiblePerson", e.target.value)}
        />
      </Field>

      <Field label="Notes">
        <Textarea
          value={taskData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
        />
      </Field>

      <Field label="Checklist Items">
        <div className={styles.checklistContainer}>
          {taskData.checklistItems.map((item, index) => (
            <div key={index} className={styles.checklistItem}>
              <Input
                value={item}
                onChange={(e) => handleUpdateChecklistItem(index, e.target.value)}
              />
              <span 
                className={styles.removeButton}
                onClick={() => handleRemoveChecklistItem(index)}
              >
                ✕
              </span>
            </div>
          ))}
          <Button appearance="secondary" onClick={handleAddChecklistItem}>
            Add Item
          </Button>
        </div>
      </Field>

      <div className={styles.buttonContainer}>
        <Button appearance="secondary" onClick={onBack}>
          Back
        </Button>
        <Button appearance="primary" onClick={handleSubmit}>
          Create Task
        </Button>
      </div>
    </div>
  );
};

export default TaskForm;
