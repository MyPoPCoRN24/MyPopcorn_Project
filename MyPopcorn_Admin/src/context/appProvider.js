import { createContext, useState, useEffect } from "react";
import * as io from "socket.io-client";
import { Observable } from "rxjs";

export const connectionProvider = createContext();

export const StoreProvider = ({ children }) => {
  const [alertMessage, setAlertMessage] = useState({
    message: "",
    type: "",
    show: false,
  });
  const [sockett, setSocket] = useState(null);
  const [notifyList, setNotifyList] = useState([]);

  const showAlertMessage = (val) => {
    setAlertMessage((prev) => ({
      ...prev,
      message: val.message,
      type: val.type,
      show: val.show,
    }));
  };

  const userlocalData = localStorage.getItem("userLoginData");
  const parseData = JSON.parse(userlocalData);

  const socket = "https://api.mypopcorn.io";

  const connect = () => {
    if (parseData !== null) {
      let data = io.io(socket, {
        query: { userId: parseData?._id },
        transports: ["websocket"],
        path: "/socket.io",
      });
      setSocket(data);
    }
  };

  // Socket Connection Method Based On Event Name
  const listen = (eventName) => {
    console.log("socket connected==============>");
    return new Observable((subscriber) => {
      sockett.on(eventName, (data) => {
        subscriber.next(data);
      });
    });
  };

  const disconnectsocket = () => {
    sockett?.disconnect();
    console.log("socket disconnected==============>");
  };

  const setNotificationArray = (val) => {
    setNotifyList(val);
  };

  return (
    <connectionProvider.Provider
      value={{
        showAlertMessage,
        alertMessage,
        setNotificationArray,
        setNotifyList,
        listen,
        connect,
        disconnectsocket,
        sockett,
        notifyList,
      }}
    >
      {children}
    </connectionProvider.Provider>
  );
};
