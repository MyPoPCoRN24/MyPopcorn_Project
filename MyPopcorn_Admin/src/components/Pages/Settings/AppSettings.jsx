import { Button, Col, Form, Input, Row, Space, Tooltip } from "antd";
import copyImg from "../../../assets/img/icons/copy.svg";
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Web3 from "web3";
import { connectionProvider } from "../../../context/appProvider";
import { profileServices } from "../../../services/profileServices";
import { handleWalletAddressClick } from "../../../helpers/utility";

const AppSettings = () => {
  const path = useLocation();
  const { showAlertMessage } = useContext(connectionProvider);
  const { updateToken, getApiKey } = profileServices();
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenDisable, setTokenDisable] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");
  const [apikey, setApiKey] = useState("");
  console.log("apikey=========", apikey);
  const [tooltipText, setTooltipText] = useState({});

  useEffect(() => {
    const fetchUserDetails = () => {
      const userData = localStorage.getItem("userProfile");
      const parseData = JSON.parse(userData);

      setTokenAddress(parseData?.tokenaddress);
      setTokenDisable(true);
    };

    fetchUserDetails();
  }, [path]);

  const handleAddTokenAddress = async () => {
    setTokenDisable(false);

    if (!tokenDisable) {
      try {
        setLoader(true);
        const data = {
          tokenaddress: tokenAddress,
        };
        const response = await updateToken(data);
        console.log("response:===============>", response);
        if (response.data.success === true) {
          showAlertMessage({
            type: "success",
            message: response?.data?.message,
            show: true,
          });
          setTokenDisable(true);
        } else {
          showAlertMessage({
            type: "error",
            message: "Invalid token address",
            show: true,
          });
          console.error("failed to signup user");
        }
      } catch (error) {
        console.error("Error during signup API request:", error.message);
        showAlertMessage({
          type: "error",
          message: "Invalid token address",
          show: true,
        });
      } finally {
        setLoader(false);
      }
    }
  };

  const fetchApiKey = async () => {
    try {
      setLoading(true);
      const response = await getApiKey();
      console.log("api response========", response);
      if (response?.data?.success) {
        setApiKey(response.data.apiKey);
      } else {
        console.error("Failed to fetch polygon balance");
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="app">
        <div className="app__row">
          <Row gutter={16}>
            <Col className="gutter-row" xs={24} sm={16} md={16} lg={12} xl={12}>
              <div className="app__title">
                <h3>App Settings</h3>
              </div>
              <div className="app__form" id="auth-form">
                <Form
                  labelCol={{
                    span: 24,
                  }}
                  wrapperCol={{
                    span: 24,
                  }}
                >
                  <Form.Item label="Token Address">
                    <Input
                      placeholder="Enter here"
                      disabled={tokenDisable}
                      value={tokenAddress}
                      onChange={(e) => {
                        setTokenAddress(e.target.value);
                      }}
                    />
                  </Form.Item>
                  <div className="profile__btn">
                    <Button
                      className="default-btn"
                      onClick={handleAddTokenAddress}
                      loading={loader}
                    >
                      {!tokenDisable ? "Submit" : "Add Token"}
                    </Button>
                  </div>
                </Form>
              </div>
              <div className="app__form" id="auth-form">
                <div className="app__create">
                  <h4>Generate API Key</h4>
                  <Button className="default-btn" onClick={fetchApiKey}>
                    API Key
                  </Button>
                </div>
                <Form
                  labelCol={{
                    span: 24,
                  }}
                  wrapperCol={{
                    span: 24,
                  }}
                >
                  {apikey !== "" && (
                    <Form.Item className="custom-form" label="API Key">
                      <Space.Compact>
                        <Input
                          value={apikey}
                          disabled={true}
                          addonAfter={
                            <Tooltip title={tooltipText[apikey] || "Copy"}>
                              <Button
                                onClick={() =>
                                  handleWalletAddressClick(
                                    apikey,
                                    setTooltipText
                                  )
                                }
                              >
                                <img src={copyImg} alt="copyImg" />
                              </Button>
                            </Tooltip>
                          }
                        />
                      </Space.Compact>
                    </Form.Item>
                  )}
                </Form>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default AppSettings;
