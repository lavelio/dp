import * as React from "react";
import { 
  makeStyles,
  Button,
  Card,
  CardHeader,
  Body1,
  tokens
} from "@fluentui/react-components";
import type { TaskTemplate } from "./TabActivities";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  buttonContainer: {
    marginTop: "16px",
  },
});

interface TaskTemplateSelectorProps {
  templates: TaskTemplate[];
  onSelect: (template: TaskTemplate | null) => void;
}

const TaskTemplateSelector: React.FC<TaskTemplateSelectorProps> = ({ templates, onSelect }) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Body1>Select a task template or create a custom task:</Body1>
      
      {templates.map((template) => (
        <Card 
          key={template.id}
          className={styles.card}
          onClick={() => onSelect(template)}
        >
          <CardHeader header={template.name} description={template.category} />
        </Card>
      ))}

      <div className={styles.buttonContainer}>
        <Button 
          appearance="primary"
          onClick={() => onSelect(null)}
        >
          Create Custom Task
        </Button>
      </div>
    </div>
  );
};

export default TaskTemplateSelector;
