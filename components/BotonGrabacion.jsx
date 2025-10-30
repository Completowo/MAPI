import React, { useState, useEffect } from "react";
import { Button, Platform } from "react-native";
import { Audio } from "expo-av";

export function BotonGrabacion({ onTranscription }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permiso para grabar audio denegado");
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error("No se pudo iniciar la grabación:", err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsLoading(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // 1️⃣ Subir audio a AssemblyAI
      const audioFile = await fetch(uri);
      const audioBlob = await audioFile.blob();

      const uploadResponse = await fetch(
        "https://api.assemblyai.com/v2/upload",
        {
          method: "POST",
          headers: { authorization: "34c0f8c8a6cf41a58c516da891b1fe4c" },
          body: audioBlob,
        }
      );

      const uploadData = await uploadResponse.json();

      // 2️⃣ Crear transcripción
      const transcriptRes = await fetch(
        "https://api.assemblyai.com/v2/transcript",
        {
          method: "POST",
          headers: {
            authorization: "34c0f8c8a6cf41a58c516da891b1fe4c",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audio_url: uploadData.upload_url,
            language_code: "es",
          }),
        }
      );

      const transcriptData = await transcriptRes.json();

      // 3️⃣ Polling hasta que se complete
      const checkStatus = async () => {
        const res = await fetch(
          `https://api.assemblyai.com/v2/transcript/${transcriptData.id}`,
          { headers: { authorization: "34c0f8c8a6cf41a58c516da891b1fe4c" } }
        );
        const data = await res.json();
        if (data.status === "completed") {
          setIsLoading(false);
          onTranscription(data.text);
        } else if (data.status === "error") {
          console.error("Error en transcripción:", data.error);
          setIsLoading(false);
        } else {
          setTimeout(checkStatus, 2000);
        }
      };
      checkStatus();
    } catch (err) {
      console.error("Error al detener la grabación:", err);
      setIsLoading(false);
    }
  };

  return (
    <Button
      title={
        isRecording
          ? "Detener grabación"
          : isLoading
            ? "Transcribiendo..."
            : "Iniciar grabación"
      }
      onPress={isRecording ? stopRecording : startRecording}
      disabled={isLoading}
    />
  );
}
