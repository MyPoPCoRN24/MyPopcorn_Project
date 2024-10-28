import { useState, useEffect, useContext, useCallback } from "react";
import "./alert.scss";
import classNames from "classnames";
import { connectionProvider } from "../../context/appProvider";
import { CloseCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

export const AlertMessage = () => {
  const { alertMessage, showAlertMessage } = useContext(connectionProvider);
  const [isShow, setShow] = useState(false);
  const [classNameList, setClassNameList] = useState("");
  const showAlertMessageCallback = useCallback(showAlertMessage, []); // Memoized callback

  useEffect(() => {
    setShow(alertMessage.show);
    setClassNameList(
      classNames({
        alert: alertMessage.show === true,
        "alert-success": alertMessage.type === "success",
        "alert-warning": alertMessage.type === "warning",
        "alert-error": alertMessage.type === "error",
        "alert-info": alertMessage.type === "info",
      })
    );

    const timeoutId = setTimeout(() => {
      clearAlert();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [alertMessage.show]);

  const clearAlert = () => {
    let val = { message: "", type: "", show: false };
    showAlertMessageCallback(val);
    setShow(false);
  };

  return (
    <>
      {isShow && (
        <div className={classNameList}>
          <div className="message-flex">
            {alertMessage?.message}
            <Tooltip>
              <CloseCircleOutlined
                className="close-icon"
                onClick={clearAlert}
              />
            </Tooltip>
          </div>
        </div>
      )}
    </>
  );
};
