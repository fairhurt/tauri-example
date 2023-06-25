import { Button, Flex, Text } from "@chakra-ui/react";
import { ask } from "@tauri-apps/api/dialog";
import { sendNotification } from "@tauri-apps/api/notification";
import { open } from "@tauri-apps/api/dialog";
import { appLocalDataDir } from "@tauri-apps/api/path";
import { useEffect, useState } from "react";
import { resolveResource } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/api/fs";

function App() {
  const [time, setTime] = useState(0);
  const [timerStart, setTimerStart] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const buttons = [
    {
      value: 900,
      display: "15 minutes",
    },
    {
      value: 1800,
      display: "30 minutes",
    },
    {
      value: 3600,
      display: "60 minutes",
    },
  ];

  const handleDirectorySelection = async () => {
    const selected = await open({
      directory: true,
      defaultPath: await appLocalDataDir(),
    });
    if (Array.isArray(selected)) {
      // user selected multiple directories
      setSelectedFolder(selected[0]);
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      console.log(selected);
      const content = await readTextFile(selected);
      console.log(content);
      setSelectedFolder(selected);
      // user selected a single directory
    }
  };

  const toggleTimer = () => {
    setTimerStart(!timerStart);
  };
  const triggerResetDialog = async () => {
    let shouldReset = await ask("Do you want to reset the timer?", {
      title: "Pomodoro Timer App",
      type: "warning",
    });
    if (shouldReset) {
      setTime(900);
      setTimerStart(false);
    }
  };
  useEffect(() => {
    console.log("fodler: ", selectedFolder);
    const interval = setInterval(() => {
      if (timerStart) {
        if (time > 0) {
          setTime(time - 1);
        } else if (time === 0) {
          sendNotification({
            title: "Time is up!",
            body: "Congrats on completing a session! ",
          });
          clearInterval(interval);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStart, time, selectedFolder]);
  return (
    <div className="App" style={{ height: "100vh" }}>
      <Flex
        background="gray.700"
        height="100vh"
        alignItems="center"
        flexDirection="column"
      >
        <Text color="white" fontWeight="bold" marginTop="20" fontSize="35">
          Pomodoro Timer
        </Text>
        <Text fontWeight="bold" fontSize="7xl" color="white">
          {`${
            Math.floor(time / 60) < 10
              ? `0${Math.floor(time / 60)}`
              : `${Math.floor(time / 60)}`
          }:${time % 60 < 10 ? `0${time % 60}` : time % 60}`}
        </Text>
        <Flex>
          <Button
            width="7rem"
            background="tomato"
            color="white"
            onClick={toggleTimer}
          >
            {!timerStart ? "Start" : "Pause"}
          </Button>
          <Button
            background="blue.300"
            marginX={5}
            onClick={triggerResetDialog}
          >
            Reset
          </Button>
          {/* TODO: Add Button to reset timer */}
        </Flex>
        <Flex marginTop={10}>
          {buttons.map(({ value, display }) => (
            <Button
              key={display}
              marginX={4}
              background="green.300"
              color="white"
              onClick={() => {
                setTimerStart(false);
                setTime(value);
              }}
            >
              {display}
            </Button>
          ))}
        </Flex>
        <Flex>
          <Button marginY={10} onClick={handleDirectorySelection}>
            Open a folder
          </Button>
        </Flex>
        <Flex>
          <Text>{selectedFolder}</Text>
        </Flex>
      </Flex>
    </div>
  );
}
export default App;
