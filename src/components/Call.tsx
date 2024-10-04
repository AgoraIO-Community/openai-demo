import AgoraRTC, {
  AgoraRTCProvider,
  RemoteUser,
  useClientEvent,
  useJoin,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteUsers,
} from "agora-rtc-react";
import { useEffect, useMemo, useRef, useState } from "react";
import SettingsPanel from "./Settings";
import { AgoraOpenAILogo } from "./icons";

function Call(props: {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
}) {
  const client = useMemo(
    () => AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }),
    []
  );

  return (
    <AgoraRTCProvider client={client}>
      <Videos
        channelName={props.channelName}
        AppID={props.appId}
        token={props.token}
        uid={props.uid}
      />
    </AgoraRTCProvider>
  );
}

function Videos(props: {
  channelName: string;
  AppID: string;
  token: string;
  uid: number;
}) {
  const { AppID, channelName, token, uid } = props;
  const client = useRTCClient();

  const { isLoading: isLoadingMic, localMicrophoneTrack } =
    useLocalMicrophoneTrack();
  const remoteUsers = useRemoteUsers();

  const [name, setName] = useState("Tadas");
  const [microphone, setMicrophone] = useState("insta360");
  const [speaker, setSpeaker] = useState("default");
  const [isAIActive, setIsAIActive] = useState(false);

  usePublish([localMicrophoneTrack]);
  useJoin({
    appid: AppID,
    channel: channelName,
    token: token,
    uid: uid,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useClientEvent(client, "user-joined", (user) => {
    console.log("user-joined", user);

    user.audioTrack?.play();
  });

  useClientEvent(client, "token-privilege-will-expire", async () => {
    try {
      const response = await fetch("/api/token.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          uid: uid,
          channel: channelName,
          role: "publisher",
          expireTime: 3600,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        client.renewToken(data.token);
      } else {
        console.error("Failed to update token");
      }
    } catch (error) {
      console.error("Error updating token:", error);
    }
  });

  const startAI = async () => {
    try {
      const endpoint = "/api/ai/start.json";
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ channel: channelName, uid: 12 }),
      });

      if (response.ok) {
        setIsAIActive(true);
      } else {
        console.error(`Failed to start AI`);
      }
    } catch (error) {
      console.error(`Error starting AI:`, error);
    }
  };

  const stopAI = async () => {
    try {
      const endpoint = "/api/ai/stop.json";
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ channel: channelName }),
      });

      if (response.ok) {
        setIsAIActive(false);
      } else {
        console.error(`Failed to stop AI`);
      }
    } catch (error) {
      console.error(`Error stopping AI:`, error);
    }
  };

  useEffect(() => {
    console.log(
      "useEffect running, localMicrophoneTrack:",
      localMicrophoneTrack
    );
    if (!localMicrophoneTrack || !canvasRef.current) {
      console.log("Returning early from useEffect");
      return;
    }

    const audioContext = new AudioContext();
    const mediaStream = new MediaStream([
      localMicrophoneTrack.getMediaStreamTrack(),
    ]);
    const source = audioContext.createMediaStreamSource(mediaStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d")!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = "rgba(23, 23, 23, 0.4)"; // Tailwind's bg-neutral-900 with 0.4 opacity
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        // Use a gradient from dark blue to light blue
        const blueValue = Math.min(255, 50 + barHeight * 1.5);
        canvasCtx.fillStyle = `rgb(0, ${blueValue}, 255)`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      source.disconnect();
      audioContext.close();
    };
  }, [localMicrophoneTrack]);

  if (isLoadingMic) {
    return <div>Loading microphone...</div>;
  }

  if (!localMicrophoneTrack) {
    return <div>No microphone track available, refre</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="flex flex-grow">
        <div className="flex-grow m-4 mr-0 border border-neutral-700 rounded-lg bg-neutral-900 relative">
          {/* Main content */}
          <div className="flex items-center justify-center h-full">
            {remoteUsers.length === 0 ? (
              <div className="text-4xl font-bold">Not Joined</div>
            ) : (
              <RemoteUser user={remoteUsers[0]} />
            )}
          </div>

          {/* Stacked component in bottom right */}
          <div className="absolute border border-neutral-700 bg-neutral-900 bottom-4 right-4 w-64 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="text-lg font-semibold mb-2">{name}</div>
              <canvas ref={canvasRef} className="w-full h-32 rounded" />
            </div>
          </div>
        </div>

        <SettingsPanel
          name={name}
          microphone={microphone}
          speaker={speaker}
          onNameChange={setName}
          onMicrophoneChange={setMicrophone}
          onSpeakerChange={setSpeaker}
        />
      </div>

      <div className="w-full py-2">
        <div className="flex items-center justify-start px-4">
          <div className="scale-50 origin-left ml-4">
            <AgoraOpenAILogo />
          </div>
          <span className="ml-2 text-lg">
            Agora & OpenAI Conversational AI Demo
          </span>
          <div className="flex-grow"></div>
          <button
            className={`px-5 py-3 text-base font-medium text-center text-white rounded-lg w-40 ${
              isAIActive
                ? "bg-red-400 hover:bg-red-500"
                : "bg-green-400 hover:bg-green-500"
            }`}
            onClick={isAIActive ? stopAI : startAI}
          >
            {isAIActive ? "Stop AI" : "Start AI"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Call;
