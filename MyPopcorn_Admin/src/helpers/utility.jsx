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

export const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strTime = hours + ":" + minutes + " " + ampm;

  return `${day}/${month}/${year} ${strTime}`;
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

export const handleShareClick = (walletAddress, setTooltipText) => {
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
          [walletAddress]: "Share",
        }));
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to Share wallet address: ", err);
    });
};

export const formatValue = (value) => {
  return parseFloat(value).toFixed(2);
};

export const Loader = ({ loading, children }) => {
  if (!loading) {
    return children;
  }
  return (
    <div className="page-loader">
      <div className="loading"></div>
    </div>
  );
};

export const formatEmailDate = (createdAt) => {
  const date = new Date(createdAt);

  // Get the day, month, and year
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-indexed
  const year = date.getFullYear().toString().slice(-2); // Get the last two digits of the year

  // Get the hours and minutes
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  // Determine AM/PM and adjust hours if necessary
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight

  // Format the date and time
  return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
};
