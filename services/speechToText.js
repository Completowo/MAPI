//AssemblyAPI = "34c0f8c8a6cf41a58c516da891b1fe4c"


import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: "34c0f8c8a6cf41a58c516da891b1fe4c",
});

// const audioFile = "./local_file.mp3";
const audioFile = 'https://assembly.ai/wildfires.mp3'

const params = {
  audio: audioFile,
  speech_model: "universal",
};

const run = async () => {
  const transcript = await client.transcripts.transcribe(params);

  console.log(transcript.text);
};

run();