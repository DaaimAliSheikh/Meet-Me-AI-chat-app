import React from "react";

const BotResponse = () => {
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    const response = await fetch("http://localhost:8000/");
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let done = false;

    if (!reader) return;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value, { stream: true });
      setMessage((prev) => prev + chunk);
    }
  };
  return (
    <div>
      {message}
      <button onClick={fetchData}>click</button>
    </div>
  );
};

export default BotResponse;
