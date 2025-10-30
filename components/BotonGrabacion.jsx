// BotonGrabacionExpo.jsx
//API AssembliAI = 34c0f8c8a6cf41a58c516da891b1fe4c
import React, { useState, useEffect } from "react";
import { Button, Platform } from "react-native";
import { Audio } from "expo-av";

export function BotonGrabacion({ onTranscription }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permiso para grabar audio denegado");
          return;
        }
        // Configuración de audio en iOS
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
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // Subir audio a AssemblyAI
      const file = await fetch(uri);
      const blob = await file.blob();

      const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          authorization: "34c0f8c8a6cf41a58c516da891b1fe4c",
        },
        body: blob,
      });

      if (!uploadRes.ok) {
        console.error("Error al subir audio:", await uploadRes.text());
        return;
      }

      const { upload_url } = await uploadRes.json();

      // Crear transcripción en español
      const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          authorization: "34c0f8c8a6cf41a58c516da891b1fe4c",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio_url: upload_url,
          language_code: "es",
        }),
      });

      if (!transcriptRes.ok) {
        console.error("Error al crear transcripción:", await transcriptRes.text());
        return;
      }

      const transcriptData = await transcriptRes.json();

      //esperar a que la transcripción esté lista
      const polling = async () => {
        const statusRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptData.id}`, {
          headers: { authorization: "34c0f8c8a6cf41a58c516da891b1fe4c" },
        });
        const statusData = await statusRes.json();

        if (statusData.status === "completed") {
          onTranscription(statusData.text);
        } else if (statusData.status === "error") {
          console.error("Error en transcripción:", statusData.error);
        } else {
          setTimeout(polling, 2000);
        }
      };
      polling();
    } catch (err) {
      console.error("Error al detener la grabación:", err);
      setIsRecording(false);
    }
  };

  return (
    <Button
      title={isRecording ? "Detener grabación" : "Iniciar grabación"}
      onPress={isRecording ? stopRecording : startRecording}
    />
  );
}
