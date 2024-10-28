import { Col, Row, Tabs } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import "./Settings.scss";
import notifyImg from "../../../assets/img/icons/notifications.svg";
import settingImg from "../../../assets/img/icons/settings.svg";
import termsImg from "../../../assets/img/icons/terms-and-connditions.svg";
import profileImg from "../../../assets/img/icons/profile.svg";
import AppsettingsImg from "../../../assets/img/icons/app-settings.svg";
import notifyAdd from "../../../assets/img/icons/notify-icon.svg";
import Profile from "./Profile";
import Notification from "./Notification";
import Account from "./Account";
import { Link } from "react-router-dom";
import SendNotification from "./SendNotification";
import AppSettings from "./AppSettings";

const Settings = () => {
  const path = useLocation();
  console.log("path=======>", path);
  const tabKey = localStorage.getItem("activeTab");
  const [activeTab, setActiveTab] = useState(tabKey ? tabKey : "1");
  console.log("activeTab====", activeTab);
  const { TabPane } = Tabs;

  useEffect(() => {
    if (path?.pathname === "/settings/Notification") {
      setActiveTab("4");
    }
  }, [path]);
  const handleTabClick = (tabKey) => {
    localStorage.setItem("activeTab", tabKey);
    setActiveTab(tabKey);
  };
  const menuRef = useRef(null);
  useEffect(() => {
    const menu = menuRef.current;
    if (menu) {
      const activeItem = menu.querySelector(".active");
      if (activeItem) {
        menu.scrollLeft =
          activeItem.offsetLeft -
          menu.clientWidth / 2 +
          activeItem.clientWidth / 2;
      }
    }
  }, [activeTab]);
  function CustomMenu({ activeTab, onTabClick }) {
    const handleKeyPress = (event, tabKey) => {
      if (event.key === "Enter" || event.key === " ") {
        onTabClick(tabKey);
      }
    };
    return (
      <ul ref={menuRef}>
        <li
          key="1"
          className={activeTab === "1" ? "active" : ""}
          onClick={() => {
            onTabClick("1");
          }}
          onKeyDown={handleKeyPress}
        >
          <Link to="/settings/Profile">
            <img src={profileImg} alt="" />
            <span>Profile</span>
          </Link>
        </li>
        <li
          key="2"
          className={activeTab === "2" ? "active" : ""}
          onClick={() => {
            onTabClick("2");
          }}
          onKeyDown={handleKeyPress}
        >
          <Link to="/settings/Accounts">
            <img src={settingImg} alt="" />
            <span>Accounts</span>
          </Link>
        </li>
        <li
          key="3"
          className={activeTab === "3" ? "active" : ""}
          onClick={() => {
            onTabClick("3");
          }}
          onKeyDown={handleKeyPress}
        >
          <Link to="/settings/Accounts">
            <img src={AppsettingsImg} alt="" />
            <span>App Settings</span>
          </Link>
        </li>
        <li
          key="4"
          className={activeTab === "4" ? "active" : ""}
          onClick={() => {
            onTabClick("4");
          }}
          onKeyDown={handleKeyPress}
        >
          <Link to="/settings/Notification">
            <img src={notifyImg} alt="" />
            <span>Notification</span>
          </Link>
        </li>
        <li
          key="5"
          className={activeTab === "5" ? "active" : ""}
          onClick={() => {
            onTabClick("5");
          }}
          onKeyDown={handleKeyPress}
        >
          <Link to="/settings/send-notification">
            <img src={notifyAdd} alt="" />
            <span>Send Notification</span>
          </Link>
        </li>

        {/* <li
          key="5"
          className={activeTab === "5" ? "active" : ""}
            onClick={() => {
              onTabClick("5");
            }}
            onKeyDown={handleKeyPress}
        >
          <Link to="/settings/Termsandconditions">
            <img src={termsImg} alt="" />
            <span>Terms & condition</span>
          </Link>
        </li> */}
      </ul>
    );
  }

  return (
    <>
      <div className="settings">
        <div className="container">
          <div className="settings__title">
            <h2>Settings</h2>
          </div>
          <div className="settings__tab">
            <Row>
              <Col xl={5} lg={5} md={7} sm={24} xs={24}>
                <div className="settings__left">
                  <CustomMenu
                    activeTab={activeTab}
                    onTabClick={handleTabClick}
                  />
                </div>
              </Col>
              <Col xl={19} lg={19} md={17} sm={24} xs={24}>
                <div className="settings__right" id="custom-tabs">
                  <Tabs activeKey={activeTab} onChange={handleTabClick}>
                    <TabPane key="1">
                      <Profile />
                    </TabPane>

                    <TabPane key="2">
                      <Account tab={activeTab} />
                    </TabPane>
                    <TabPane key="3">
                      <AppSettings />
                    </TabPane>
                    <TabPane key="4">
                      <Notification />
                    </TabPane>
                    <TabPane key="5">
                      <SendNotification />
                    </TabPane>
                    <TabPane key="6"></TabPane>
                  </Tabs>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
