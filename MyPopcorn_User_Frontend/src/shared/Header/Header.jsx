import React, { useEffect, useState, useContext } from "react";
import "./Header.scss";
import logo from "../../assets/img/logo.png";
import profile_header from "../../assets/img/profile.png";
import { Link } from "react-router-dom";
import notify from "../../assets/img/icons/notification.svg";
import downArrow from "../../assets/img/icons/down-arrow.svg";
import { Button, Drawer, Dropdown, Menu } from "antd";
import { useLocation } from "react-router";
import depositImg from "../../assets/img/icons/deposit.svg";
import claimImg from "../../assets/img/icons/claim-img.svg";
import sentImg from "../../assets/img/icons/sent.svg";
import viewImg from "../../assets/img/icons/view.svg";
import settingImg from "../../assets/img/icons/settings.svg";
import logoutImg from "../../assets/img/icons/logout.svg";
import menuImg from "../../assets/img/icons/menu.svg";
import noData from "../../assets/img/icons/no-data.svg";
import profileImg from "../../assets/img/profile-img.png";
import { profileServices } from "../../services/profileServices";
import { AuthService } from "../../services/authServices";
import { connectionProvider } from "../../context/appProvider";
import { useNavigate } from "react-router-dom";
import { cleanMessage, timeAgo } from "../../helpers/utility";
import { not } from "rxjs/internal/util/not";

export const Header = () => {
  const path = useLocation();
  const isActive = path.pathname.startsWith("/survey-details");
  const {
    showAlertMessage,
    disconnectsocket,
    sockett,
    connect,
    listen,
    setNotificationArray,
    notifyList,
  } = useContext(connectionProvider);
  const navigate = useNavigate();
  const { getProfile } = profileServices();
  const { logout } = AuthService();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  console.log("notifyList========", notifyList);

  useEffect(() => {
    if (profile !== null) {
      connect();
    }
  }, [profile]);

  useEffect(() => {
    if (sockett) {
      const subscription = listen("new_notification").subscribe((res) => {
        let data = Array.isArray(res) ? res : [];

        let arr = data.length > 0 ? data?.reverse().slice(0, 3) : [];

        setNotificationArray(arr);
      });

      // Return a cleanup function that unsubscribes from the event
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
        disconnectsocket();
      };
    }
  }, [sockett, notifyList]);

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    localStorage.removeItem("activeTab");
    localStorage.removeItem("survey_id");
    setOpen(false);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.data.success) {
        setProfile(response?.data?.data);
        localStorage.setItem(
          "userProfile",
          JSON.stringify(response?.data?.data)
        );
      } else {
        console.error("Failed to fetch polygon balance");
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [path]);

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response.data.success === true) {
        showAlertMessage({
          type: "success",
          message: response?.data?.message,
          show: true,
        });
        localStorage.clear();
        setNotificationArray(0);
        navigate("/auth/login", { replace: true });
      } else {
        showAlertMessage({
          type: "error",
          message: response?.message,
          show: true,
        });
        console.error("failed to signup user");
      }
    } catch (error) {
      console.error("Error during signup API request:", error.message);
      showAlertMessage({
        type: "error",
        message: error?.response?.data?.message || error.message,
        show: true,
      });
    }
  };

  const getImageSource = (item, profile) => {
    const defaultImage = profile?.user_profile ?? profile_header;
    const userProfileImage = profile?.user_profile ?? profile_header;

    const imageMapping = {
      Login: userProfileImage,
      Logout: userProfileImage,
      "Profile updated": userProfileImage,
      "Survey created": item?.logo,
      "Response Submission": item?.logo,
      "Fund transferred": sentImg,
      "Token claimed": claimImg,
      "Token redeemed": depositImg,
      "2FA Disabled": userProfileImage,
      "2FA Enabled": userProfileImage,
    };

    return imageMapping[item?.title] || defaultImage;
  };

  const items = (
    <Menu>
      <Menu.Item key="1">
        <div className="notify">
          <h4>Notification</h4>
          <div className="notification__list">
            {notifyList?.length > 0 ? (
              <ul>
                {notifyList?.map((item, index) => (
                  <li key={index}>
                    <div className="notification__img">
                      <img src={getImageSource(item, profile)} alt="" />
                    </div>
                    <div className="notification__content">
                      <h4>
                        <span>{cleanMessage(item?.message)}</span>
                      </h4>
                      <p>{timeAgo(item?.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="notify__no-data">
                <img src={noData} alt="" />
              </div>
            )}

            <div className="notify__link">
              <Link
                to="/settings/Notification"
                onClick={() => {
                  setNotificationArray(0);
                }}
              >
                <img src={viewImg} alt="" />
                <span>View all notifications</span>
              </Link>
            </div>
          </div>
        </div>
      </Menu.Item>
    </Menu>
  );
  const profileList = (
    <Menu>
      <Menu.Item key="1">
        <div className="head">
          <div className="head__flex">
            <div className="head__img">
              <img
                src={
                  profile?.user_profile ? profile?.user_profile : profile_header
                }
                alt="profileImg"
              />
            </div>
            <div className="head__content">
              <h4>{profile?.name}</h4>
              <p>{profile?.email}</p>
            </div>
          </div>
          <div className="head__list">
            <ul>
              <li>
                <Link to="/settings/Profile">
                  <img src={settingImg} alt="" />
                  <span>Settings</span>
                </Link>
              </li>
              <li>
                <Button onClick={handleLogout}>
                  <img src={logoutImg} alt="" />
                  <span>Logout</span>
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </Menu.Item>
    </Menu>
  );
  return (
    <>
      <div className="header">
        <div className="header__flex">
          <div className="header__logo">
            <Link to="/">
              <img src={logo} alt="" />
            </Link>
          </div>
          <div className="header__middle">
            <ul>
              <li onClick={onClose}>
                <Link className={path.pathname === "/" ? "active" : ""} to="/">
                  Dashboard
                </Link>
              </li>
              <li onClick={onClose}>
                <Link
                  className={
                    path.pathname === "/surveys" ||
                    path.pathname === "/surveydetails" ||
                    isActive
                      ? "active"
                      : ""
                  }
                  to="/surveys"
                >
                  Surveys
                </Link>
              </li>
              <li onClick={onClose}>
                <Link
                  className={path.pathname === "/wallet" ? "active" : ""}
                  to="/wallet"
                >
                  Wallet
                </Link>
              </li>
            </ul>
          </div>
          <div className="header__end">
            <div className="header__notify">
              <Dropdown
                overlayClassName="custom-dropdown"
                overlay={items}
                trigger={["click"]}
              >
                <Button>
                  <img src={notify} alt="" />
                  {notifyList?.length > 0 && <span>{notifyList?.length}</span>}
                </Button>
              </Dropdown>
            </div>
            <div className="header__profile">
              <Dropdown
                overlayClassName="custom-dropdown"
                overlay={profileList}
                trigger={["click"]}
              >
                <Button>
                  <div className="head__img">
                    <img
                      src={
                        profile?.user_profile
                          ? profile?.user_profile
                          : profile_header
                      }
                      alt="profile"
                    />
                  </div>
                  <img src={downArrow} alt="" />
                </Button>
              </Dropdown>
            </div>
            <div className="header__menu">
              <Button onClick={showDrawer}>
                <img src={menuImg} alt="" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Drawer title="Close" onClose={onClose} open={open}>
        <div className="menu">
          <div className="menu__list">
            <ul>
              <li onClick={onClose}>
                <Link className={path.pathname === "/" ? "active" : ""} to="/">
                  Dashboard
                </Link>
              </li>
              <li onClick={onClose}>
                <Link
                  className={path.pathname === "/surveys" ? "active" : ""}
                  to="/surveys"
                >
                  Surveys
                </Link>
              </li>
              <li onClick={onClose}>
                <Link
                  className={path.pathname === "/wallet" ? "active" : ""}
                  to="/wallet"
                >
                  Wallet
                </Link>
              </li>
              <li onClick={onClose}>
                <Link
                  className={
                    path.pathname === "/settings/Notification" ? "active" : ""
                  }
                  to="/settings/Notification"
                >
                  Notification
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Drawer>
    </>
  );
};
