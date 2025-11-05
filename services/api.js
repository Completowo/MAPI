const BASE = "http://localhost:4000/api"; 

export async function saveMessage({ text, sender }) {
  const res = await fetch(`${BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, sender })
  });
  if (!res.ok) throw new Error("Error saving message");
  return res.json();
}

export async function getMessages() {
  const res = await fetch(`${BASE}/messages`);
  if (!res.ok) throw new Error("Error getting messages");
  return res.json();
}