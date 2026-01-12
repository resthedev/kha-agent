import * as readline from "readline";
import { Agent } from "./agent";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const agent = new Agent();

function askQuestion() {
  rl.question("\nYou: ", async (userInput) => {
    if (userInput.toLowerCase() === "exit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    await agent.chat(userInput);
    askQuestion(); // Call itself again after getting response
  });
}

console.log("Chat with Claude! Type 'exit' to end the conversation.");
askQuestion();
