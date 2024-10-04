import AgoraRTC, {
  AgoraRTCProvider,
  LocalVideoTrack,
  RemoteUser,
  useClientEvent,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteUsers,
} from "agora-rtc-react";
import { useMemo } from "react";

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
      <div className="fixed z-10 bottom-0 left-0 right-0 flex justify-center pb-4 space-x-4">
        <a
          className="px-5 py-3 text-base font-medium text-center text-white bg-red-400 rounded-lg hover:bg-red-500 w-40"
          href="/"
        >
          End Call
        </a>
      </div>
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
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const remoteUsers = useRemoteUsers();

  usePublish([localMicrophoneTrack, localCameraTrack]);
  useJoin({
    appid: AppID,
    channel: channelName,
    token: token,
    uid: uid,
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

  const deviceLoading = isLoadingMic || isLoadingCam;
  if (deviceLoading)
    return (
      <div className="flex flex-col items-center pt-40">Loading devices...</div>
    );

  return (
    <div className="flex flex-col justify-between w-full h-screen">
      <div
        className={`grid gap-1 flex-1 ${
          remoteUsers.length > 9
            ? `grid-cols-4`
            : remoteUsers.length > 4
            ? `grid-cols-3`
            : remoteUsers.length >= 1
            ? `grid-cols-2`
            : `grid-cols-1`
        }`}
      >
        <LocalVideoTrack
          key={uid}
          track={localCameraTrack}
          play={true}
          className="w-full h-full"
        />
        {remoteUsers.map((user) => (
          <RemoteUser key={user.uid} user={user} />
        ))}
      </div>
    </div>
  );
}

export default Call;
