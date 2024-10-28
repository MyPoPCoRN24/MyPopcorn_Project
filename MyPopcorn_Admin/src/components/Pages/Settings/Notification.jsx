import React, { useState, useEffect, useContext } from "react";
import depositImg from "../../../assets/img/icons/deposit.svg";
import claimedImg from "../../../assets/img/icons/claim-img.svg";
import { Button } from "antd";
import sentImg from "../../../assets/img/icons/sent.svg";
import noDataImg from "../../../assets/img/icons/no-data.svg";
import profileImg from "../../../assets/img/profile-img.png";
import { profileServices } from "../../../services/profileServices";
import { Pagination } from "antd";
import { connectionProvider } from "../../../context/appProvider";
import { timeAgo } from "../../../helpers/utility";
import { cleanMessage } from "../../../helpers/utility";
import { useLocation } from "react-router-dom";

const Notification = () => {
  const path = useLocation();
  const { getNotifications, deleteNotification, readAllNotifications } =
    profileServices();
  const { showAlertMessage, setNotificationArray } =
    useContext(connectionProvider);
  const [notifications, setNotifications] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  console.log("notifications======>", notifications);
  const [pageCount, setPageCount] = useState(0);
  console.log("notifications======>", notifications);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const pageLimit = 10;
  const [userProfile, setUserProfile] = useState(null);
  console.log("parseData123=======>", userProfile);

  useEffect(() => {
    const fetchUserDetails = () => {
      const userData = localStorage.getItem("userProfile");
      const parseData = JSON.parse(userData);
      setUserProfile(parseData);
    };

    fetchUserDetails();
  }, [path]);

  const fetchNotifications = async (page) => {
    setCurrentPage(page);
    try {
      setLoading(true);
      const response = await getNotifications({
        limit: pageLimit,
        page: page,
      });
      console.log("response============>", response);

      if (response.data.success) {
        readAllNotifications().then((res) => {
          setNotificationArray([]);
        });
        setNotifications(response?.data?.data);
        setPageCount(response?.data?.count);
      } else {
        console.error("Failed to fetch polygon balance");
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
      showAlertMessage({
        type: "error",
        message: error?.message,
        show: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const handleDeleteNotifications = async () => {
    try {
      setLoader(true);
      const response = await deleteNotification();
      showAlertMessage({
        type: "success",
        message: response?.data?.message,
        show: true,
      });
      fetchNotifications(1);
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
      showAlertMessage({
        type: "error",
        message: error?.message,
        show: true,
      });
    } finally {
      setLoader(false);
    }
  };

  const getImageSource = (item, userProfile) => {
    const defaultImage = depositImg; // Fallback image
    const userProfileImage = userProfile?.user_profile ?? profileImg;

    const imageMapping = {
      Login: userProfileImage,
      Logout: userProfileImage,
      "Profile update": userProfileImage,
      "Survey created": item?.logo,
      "Response Submission": item?.logo,
      "Fund transferred": sentImg,
      "2FA Disabled": userProfileImage,
      "2FA Enabled": userProfileImage,
      "Token claim": claimedImg,
    };

    return imageMapping[item?.title] || defaultImage;
  };

  return (
    <>
      <div className="notification">
        <div className="notification__title">
          <h3>Notification</h3>
          {notifications?.length > 0 && (
            <Button
              className="default-btn"
              onClick={handleDeleteNotifications}
              loading={loader}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="notification__list">
          {notifications?.length > 0 ? (
            <ul>
              {!loading &&
                notifications?.map((item, index) => {
                  return (
                    <li key={index}>
                      <div className="notification__img">
                        <img src={getImageSource(item, userProfile)} alt="" />
                      </div>
                      <div className="notification__content">
                        <h4>{item.title}</h4>
                        <p>
                          <p>{cleanMessage(item?.message)}</p>
                        </p>
                        <p>{timeAgo(item?.createdAt)}</p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          ) : (
            !loading && (
              <div className="center-loader">
                <img src={noDataImg} alt="" />
              </div>
            )
          )}
        </div>

        {loading && (
          <div className="center-loader">
            <div className="loader"></div>
          </div>
        )}
        {!loading && pageCount > 10 ? (
          <div className="common-page">
            <Pagination
              defaultCurrent={1}
              current={currentPage}
              total={pageCount}
              pageSize={pageLimit}
              onChange={(e) => {
                fetchNotifications(e);
              }}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Notification;
