export function getUrgency(description, date) {
  const text = description.toLowerCase();

  const urgentWords = ["leak", "broken", "urgent", "not working", "damage"];

  for (let word of urgentWords) {
    if (text.includes(word)) {
      return "urgent";
    }
  }

  if (date === "today") return "urgent";
  if (date === "tomorrow") return "normal";

  return "flexible";
}