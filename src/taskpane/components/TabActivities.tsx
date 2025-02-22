import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import TaskTemplateSelector from "./TaskTemplateSelector";
import TaskForm from "./TaskForm";

const useStyles = makeStyles({
  root: {
    flexDirection: "column",
    display: "flex",
    paddingLeft: "10px",
    paddingRight: "10px",
  },
});

export interface TaskTemplate {
  id: string;
  name: string;
  category: string;
  checklistItems: string[];
}

// Initial template based on the image
const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "site-inspection",
    name: "Site Inspection",
    category: "Inspection",
    checklistItems: [
      "Check structural integrity",
      "Document existing conditions",
      "Take photographs",
      "Measure dimensions"
    ]
  }
];

const TabActivities = () => {
  const styles = useStyles();
  const [selectedTemplate, setSelectedTemplate] = React.useState<TaskTemplate | null>(null);
  const [showTaskForm, setShowTaskForm] = React.useState(false);

  const handleTemplateSelect = (template: TaskTemplate | null) => {
    setSelectedTemplate(template);
    setShowTaskForm(true);
  };

  const handleBack = () => {
    setShowTaskForm(false);
  };

  return (
    <div className={styles.root}>
      {!showTaskForm ? (
        <TaskTemplateSelector 
          templates={TASK_TEMPLATES}
          onSelect={handleTemplateSelect}
        />
      ) : (
        <TaskForm 
          template={selectedTemplate}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default TabActivities;
