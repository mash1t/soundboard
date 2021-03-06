import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSounds, useSocket } from "./hooks";
import SoundItem from "./components/SoundItem";
import { playAudio } from "./helpers";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0 auto;
  padding: 8px;

  @media (min-width: 1024px) {
    padding: 16px;
  }
`;

const SoundItems = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(172px, 1fr));

  @media (min-width: 1024px) {
    grid-gap: 16px;
  }
`;

const Label = styled.div`
  display: inline-block;
  padding: 0.4em 0.6em;
  font-size: 12px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: white;
  border-radius: 4px;
  background-color: #c7cace;
  user-select: none;
`;

const Main = styled.div`
  flex: 1 1 auto;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding: 12px 0;
  width: 100%;

  > a {
    font-size: 12px;
    &:not(:last-child) {
      margin-right: 1em;
    }
  }
`;

function App() {
  const socket = useSocket();
  const { status: soundsStatus, data: sounds } = useSounds();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleConnect = () => {
      console.log(`[EVENT: connect] ${socket.id}`);
    };

    const handleUserEvent = ({ amount }) => {
      console.log("[EVENT: user]");
      setUser(amount);
    };

    const handleSoundEvent = ({ name, audio }) => {
      console.log(`[EVENT: sound] Playing ${name}`);
      playAudio(audio.src);
    };

    socket.on("connect", handleConnect);
    socket.on("user", handleUserEvent);
    socket.on("sound", handleSoundEvent);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("user", handleUserEvent);
      socket.on("sound", handleSoundEvent);
    };
  }, [socket]);

  const handleOnPlay = event => {
    const sound = sounds.find(({ id }) => id === event.id);
    socket.emit("sound", { sound });
  };

  return (
    <Wrapper className="App">
      <Main>
        <Label>Connections: {user}</Label>

        <h2>Default Sounds</h2>
        {soundsStatus === "success" && (
          <SoundItems>
            {sounds.map(({ id, name, audio, image }) => (
              <SoundItem
                key={id}
                id={id}
                name={name}
                audio={audio}
                image={image}
                onPlay={handleOnPlay}
              />
            ))}
          </SoundItems>
        )}
        {soundsStatus === "loading" && <p>Loading Sounds...</p>}
        {soundsStatus === "error" && (
          <p>
            Error: Something went wrong while loading the sounds. Please try
            again.
          </p>
        )}
      </Main>
      <Footer>
        <a
          href="https://github.com/paulborm/soundboard"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
        </a>
        <a
          href="https://www.paulborm.de"
          target="_blank"
          rel="noopener noreferrer"
        >
          @paulborm
        </a>
      </Footer>
    </Wrapper>
  );
}

export default App;
