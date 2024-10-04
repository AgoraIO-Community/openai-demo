import AgoraRTC from "agora-rtc-sdk-ng";
import React, { useEffect, useState } from "react";

interface SettingsPanelProps {
  name: string;
  microphone: string;
  speaker: string;
  onNameChange: (name: string) => void;
  onMicrophoneChange: (device: string) => void;
  onSpeakerChange: (device: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  name,
  microphone,
  speaker,
  onNameChange,
  onMicrophoneChange,
  onSpeakerChange,
}) => {
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    async function getDevices() {
      const audioDevices = await AgoraRTC.getMicrophones();
      setMicrophones(audioDevices);

      const speakerDevices = await AgoraRTC.getPlaybackDevices();
      setSpeakers(speakerDevices);
    }

    getDevices();
  }, []);

  return (
    <div className="w-1/4 h-full bg-neutral-900 text-white p-6 overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">Settings</h2>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Your Name</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full bg-black rounded px-3 py-2 text-white"
        />
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Microphone</h3>
        <select
          value={microphone}
          onChange={(e) => onMicrophoneChange(e.target.value)}
          className="w-full bg-black rounded px-3 py-2 text-white"
        >
          {microphones.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Speaker</h3>
        <select
          value={speaker}
          onChange={(e) => onSpeakerChange(e.target.value)}
          className="w-full bg-black rounded px-3 py-2 text-white"
        >
          {speakers.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
      {/* End call button */}
      <a
        className="px-5 py-3 text-base font-medium text-center text-white bg-red-400 rounded-lg hover:bg-red-500 w-40"
        href="/"
      >
        Leave
      </a>
    </div>
  );
};

export default SettingsPanel;
