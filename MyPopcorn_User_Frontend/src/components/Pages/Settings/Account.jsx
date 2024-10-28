import { Button, Col, Form, Input, Row, Space, Switch, Tooltip } from "antd";
import qrImg from "../../../assets/img/icons/qrcode.png";
import copyImg from "../../../assets/img/icons/copy.svg";
import React, { useContext, useEffect, useState } from "react";
import { profileServices } from "../../../services/profileServices";
import { connectionProvider } from "../../../context/appProvider";
import { handleWalletAddressClick } from "../../../helpers/utility";
import { useNavigate } from "react-router-dom";

const Account = ({ tab }) => {
  const navigate = useNavigate();
  const { get2FAQrDetails, submit2FA, updatePassword, getProfile } =
    profileServices();
  const { showAlertMessage } = useContext(connectionProvider);
  const [notifications, setNotifications] = useState(null);
  const [qrDetails, setQrDetails] = useState(null);
  const [checked, setChecked] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpErr, setOtpErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [profile, setProfile] = useState(null);
  const [tooltipText, setTooltipText] = useState({});

  useEffect(() => {
    if (tab === "2") {
      form.resetFields();
      setShowFields(false);
    }
  }, [tab]);

  const fetchQrDetails = async () => {
    try {
      setLoading(true);
      const response = await get2FAQrDetails();
      if (response.data.success) {
        setQrDetails(response?.data);
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
    fetchQrDetails();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.data.success) {
        setProfile(response?.data?.data);
        setChecked(response?.data?.data?.enable2FA);
      } else {
        console.error("Failed to fetch polygon balance");
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateOtp = (text) => {
    if (text === "") {
      setOtpErr("Please enter otp");
    } else {
      setOtpErr("");
    }
  };

  const handleSubmit2FA = async () => {
    validateOtp(otp);
    if (otpErr === "" && otp !== "") {
      try {
        setLoader(true);
        const response = await submit2FA({ otp: otp });
        if (response.data.success) {
          showAlertMessage({
            type: "success",
            message: response?.data?.message,
            show: true,
          });
          setOtp("");
          fetchProfile();
        } else {
          console.error("Failed to enable 2FA");
        }
      } catch (error) {
        console.error("Error during dashboard API request:", error.message);
        showAlertMessage({
          type: "error",
          message: error?.response?.data?.message,
          show: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const validatePassword = (rule, value) => {
    if (!value) {
      return Promise.reject("Please enter your Password");
    } else if (value.length > 15) {
      return Promise.reject(
        "Password should not be greater than 15 characters"
      );
    } else if (value.length < 8) {
      return Promise.reject("Password should be greater than 8 characters");
    } else if (!/[A-Z]/.test(value)) {
      return Promise.reject(
        "Password must contain at least one uppercase letter"
      );
    } else if (!/[a-z]/.test(value)) {
      return Promise.reject(
        "Password must contain at least one lowercase letter"
      );
    } else if (!/[0-9]/.test(value)) {
      return Promise.reject("Password must contain at least one number");
    } else if (!/[!@#$%^&*]/.test(value)) {
      return Promise.reject(
        "Password must contain at least one special character"
      );
    }
    return Promise.resolve();
  };

  const validatePassword2 = (rule, value, callback, getFieldValue) => {
    if (!value) {
      return Promise.reject("Please enter your Password");
    } else if (value.length > 15) {
      return Promise.reject(
        "Password should not be greater than 15 characters"
      );
    } else if (value.length < 8) {
      return Promise.reject("Password should be greater than 8 characters");
    } else if (!/[A-Z]/.test(value)) {
      return Promise.reject(
        "Password must contain at least one uppercase letter"
      );
    } else if (!/[a-z]/.test(value)) {
      return Promise.reject(
        "Password must contain at least one lowercase letter"
      );
    } else if (!/[0-9]/.test(value)) {
      return Promise.reject("Password must contain at least one number");
    } else if (!/[!@#$%^&*]/.test(value)) {
      return Promise.reject(
        "Password must contain at least one special character"
      );
    } else if (
      rule.field === "confirmpassword" &&
      value !== getFieldValue("newpassword")
    ) {
      return Promise.reject("Passwords do not match");
    }
    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    setLoader(true);
    try {
      const data = {
        oldPassword: values.oldpassword,
        newPassword: values.newpassword,
        confirmPassword: values.confirmpassword,
      };
      const response = await updatePassword(data);
      if (response.data.success === true) {
        showAlertMessage({
          type: "success",
          message: response?.data?.message,
          show: true,
        });
        fetchProfile();
      } else {
        showAlertMessage({
          type: "error",
          message: response?.message,
          show: true,
        });
        navigate("/auth/login");
        console.error("failed to signup user");
      }
    } catch (error) {
      console.error("Error during signup API request:", error.message);
      showAlertMessage({
        type: "error",
        message: error?.response?.data?.error,
        show: true,
      });
    } finally {
      setLoader(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleSwitch = (value) => {
    if (profile?.enable2FA === true) {
      setChecked(true);
      if (otp === "") {
        checked && setOtpErr("Please enter your 2FA OTP");
      }
    } else {
      setOtpErr("");
      setChecked((prev) => !prev);
    }
  };

  const [form] = Form.useForm();

  return (
    <>
      <div className="account">
        <div className="account__row">
          <Row gutter={16}>
            <Col className="gutter-row" xs={24} sm={16} md={16} lg={10} xl={10}>
              <div className="account__password">
                <div className="account__flex">
                  <h3>Password change</h3>
                  <Button
                    className="default-btn"
                    onClick={() => {
                      setShowFields((prev) => !showFields);
                    }}
                  >
                    Change Password
                  </Button>
                </div>
                {showFields && (
                  <div className="account__form" id="auth-form">
                    <Form
                      labelCol={{
                        span: 24,
                      }}
                      wrapperCol={{
                        span: 24,
                      }}
                      onFinish={handleSubmit}
                      onFinishFailed={onFinishFailed}
                      autoComplete="off"
                      form={form}
                    >
                      <Form.Item
                        label="Old password"
                        name="oldpassword"
                        rules={[
                          {
                            validator: validatePassword,
                          },
                        ]}
                      >
                        <Input.Password placeholder="Enter Old Password" />
                      </Form.Item>
                      <Form.Item
                        label="New password"
                        name="newpassword"
                        rules={[
                          {
                            validator: validatePassword,
                          },
                        ]}
                      >
                        <Input.Password placeholder="Enter New Password " />
                      </Form.Item>
                      <Form.Item
                        label="Confirm password"
                        name="confirmpassword"
                        dependencies={["newpassword"]}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(rule, value) {
                              return validatePassword2(
                                rule,
                                value,
                                undefined,
                                getFieldValue
                              );
                            },
                          }),
                        ]}
                      >
                        <Input.Password placeholder="Enter Confirm Password" />
                      </Form.Item>

                      <div className="account__btn">
                        <Button
                          className="default-btn"
                          htmlType="submit"
                          loading={loader}
                        >
                          Save
                        </Button>
                        <Button
                          className="outline-btn"
                          onClick={() => {
                            form.resetFields();
                            setShowFields((prev) => !showFields);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </div>
                )}
              </div>
              <div className="account__auth">
                <div className="account__auth-top">
                  <div className="account__top-flex">
                    <h4>2FA</h4>
                    <Switch
                      value={checked}
                      defaultChecked
                      onChange={handleSwitch}
                    />
                  </div>
                  <p>
                    Enter the six-digit code from your two factor authentication
                    app
                  </p>
                </div>
                {checked && (
                  <div className="account__content">
                    <div className="account__scan">
                      <img src={qrDetails?.qrCode} alt="qrCode" />
                    </div>
                    <div className="account__list">
                      <p>
                        1. Download the Google Authenticator App from the Play
                        Store or App Store
                      </p>
                      <p>
                        2. Copy the code given below and paste it into the app
                        to get a 6-digit key
                      </p>
                    </div>
                    <div className="account__form" id="auth-form">
                      <Form
                        labelCol={{
                          span: 24,
                        }}
                        wrapperCol={{
                          span: 24,
                        }}
                      >
                        <Form.Item
                          className="custom-form"
                          label="Save Backup Key"
                        >
                          <Space.Compact>
                            <Input
                              value={qrDetails?.secret2FA}
                              addonAfter={
                                <Tooltip
                                  title={
                                    tooltipText[qrDetails?.secret2FA] || "Copy"
                                  }
                                >
                                  <Button
                                    onClick={() =>
                                      handleWalletAddressClick(
                                        qrDetails?.secret2FA,
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
                        <Form.Item label="Enter 6-digit code">
                          <Input
                            value={otp}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              setOtp(value);
                              validateOtp(value);
                            }}
                            type="text"
                            maxLength={6}
                          />
                          {otpErr && (
                            <p className="ant-form-item-explain-error">
                              {otpErr}
                            </p>
                          )}
                        </Form.Item>
                        <div className="account__btn">
                          <Button
                            className="default-btn"
                            onClick={handleSubmit2FA}
                          >
                            Save
                          </Button>
                          <Button
                            className="outline-btn"
                            onClick={() => {
                              setOtp("");
                              setOtpErr("");
                              setChecked(profile?.data?.data?.enable2FA);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default Account;
