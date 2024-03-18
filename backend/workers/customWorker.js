const messageHandler = ({ data }) => {
  const sum = data.reduce((a, b) => a + b, 0);
  postMessage(sum);
};

self.addEventListener("message", messageHandler);
