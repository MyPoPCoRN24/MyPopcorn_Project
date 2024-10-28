// timeUtils.js
export const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    // less than 1 hour
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    // less than 1 day
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
};

export const cleanMessage = (msg) => {
  // Check if the message contains the address pattern
  if (msg.includes("Transferred") && msg.includes("to 0x")) {
    // Split the message at " - IP:"
    const [message, ipPart] = msg.split(" - IP:");

    // Extract the part of the message that contains the address
    const parts = message.split(" ");
    const address = parts[parts.length - 1];

    // Shorten the address to the format 0x1C83f1...a143BaF135D94
    const shortenedAddress = `${address.slice(0, 6)}...${address.slice(-6)}`;

    // Reconstruct the message with the shortened address
    parts[parts.length - 1] = shortenedAddress;
    const cleanedMessage = parts.join(" ");

    return cleanedMessage.trim();
  }

  // For other messages, remove the " - IP:" part if it exists
  const [cleanedMessage] = msg.split(" - IP:");

  return cleanedMessage.trim();
};

export const copyToClipboard = (surveyLink, setMessage) => {
  navigator.clipboard
    .writeText(surveyLink) // Copy the link to clipboard
    .then(() => {
      setMessage("Link copied to clipboard!"); // Notify the user
    })
    .catch((err) => {
      console.error("Failed to copy: ", err); // Handle error
    });
};

export const truncateAddress = (address) => {
  const start = address?.slice(0, 10);
  const end = address?.slice(-3);
  return `${start}...${end}`;
};

export const handleWalletAddressClick = (walletAddress, setTooltipText) => {
  navigator.clipboard
    .writeText(walletAddress)
    .then(() => {
      setTooltipText((prev) => ({
        ...prev,
        [walletAddress]: "Copied!",
      }));
      setTimeout(() => {
        setTooltipText((prev) => ({
          ...prev,
          [walletAddress]: "Copy",
        }));
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy wallet address: ", err);
    });
};

export const Loader = ({ loading, children }) => {
  if (!loading) {
    return children;
  }
  return (
    <div className="center-loader">
      <div className="loader"></div>
    </div>
  );
};


