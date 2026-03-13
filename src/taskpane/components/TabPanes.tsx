import * as React from "react";
import { makeStyles, Tab, TabList } from "@fluentui/react-components";
import type { SelectTabData, SelectTabEvent, TabValue } from "@fluentui/react-components";
import TabAnswer from "./TabAnswer";
import TabSettings from "./TabSettings";
import TabActivity from "./TabActivity";
import { ApiKeyStorage } from "../../utils/apiKeyStorage";

const useStyles = makeStyles({
  root: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    paddingTop: "10px",
    paddingLeft: "1px",
    paddingRight: "1px",
  },
  tab_menu: {
    paddingBottom: "20px",
  },
  tab_cont: {
    width: "100%",
  },
});

export const TabPanes = () => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = React.useState<TabValue | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadInitialTab = async () => {
      try {
        const hasApiKey = await ApiKeyStorage.has();
        if (isMounted) {
          setSelectedTab(hasApiKey ? "answer" : "settings");
        }
      } catch (error) {
        console.error("Error loading initial tab state:", error);
        if (isMounted) {
          setSelectedTab("settings");
        }
      }
    };

    loadInitialTab();

    return () => {
      isMounted = false;
    };
  }, []);

  const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value);
  };

  if (selectedTab === null) {
    return <div className={styles.root} />;
  }

  return (
    <div className={styles.root}>
      <TabList className={styles.tab_menu} selectedValue={selectedTab} onTabSelect={onTabSelect}>
        <Tab id="Answer" value="answer">
          Antwort
        </Tab>

        {/* Temporarily hidden Aktivität tab
        <Tab id="Activity" value="activity">
          Aktivität
        </Tab>
        */}

        <Tab id="Settings" value="settings">
          Einstellungen
        </Tab>
      </TabList>

      <div className={styles.tab_cont}>
        {selectedTab === "answer" && <TabAnswer />}

        {selectedTab === "activity" && <TabActivity />}

        {selectedTab === "settings" && <TabSettings />}
      </div>
    </div>
  );
};

export default TabPanes;
