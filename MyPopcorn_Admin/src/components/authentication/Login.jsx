import { Button, Col, Form, Input, Row } from "antd";
import React, { useContext, useState } from "react";
import authImg from "../../assets/img/auth/login.png";
import logo from "../../assets/img/auth/logo.png";
import gmail from "../../assets/img/auth/gmail.svg";
import "./Auth.scss";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/authServices";
import { connectionProvider } from "../../context/appProvider";
import { useGoogleOneTapLogin } from "react-google-one-tap-login";

const Login = () => {
  const navigate = useNavigate();
  const { passwordLogin } = AuthService();
  const { showAlertMessage } = useContext(connectionProvider);
  const [loader, setLoader] = useState(false);

  const handleGoogleAuthAndOneTapLogin = async (userData) => {
    try {
      const data = {
        name: userData?.name,
        email: userData?.email,
      };
      const response = await passwordLogin(data);
      console.log("loginResponse123======>", response);
      if (response?.data?.success === true) {
        if (response?.data?.data?.enable2FA === true) {
          navigate("/auth/verification", {
            state: { response: response.data.data },
          });
        } else {
          showAlertMessage({
            type: "success",
            message: response?.data?.message,
            show: true,
          });
          localStorage.setItem(
            "userLoginData",
            JSON.stringify(response?.data?.data)
          );
          navigate("/", { replace: true });
        }
      } else {
        console.error("Failed to login");
      }
    } catch (error) {
      console.log("error=====>", error);
      showAlertMessage({
        type: "error",
        message: error?.response?.data?.message,
        show: true,
      });
    }
  };

  // useGoogleOneTapLogin({
  //   onSuccess: (response) => {
  //     handleGoogleAuthAndOneTapLogin(response);
  //     console.log("login response======>", response);
  //   },
  //   onError: (error) => console.log("error======>", error),
  //   googleAccountConfigs: {
  //     client_id:
  //       "907297670784-525i4ls70j2f66li26ld4m368qnnra76.apps.googleusercontent.com",
  //   },
  // });

  const onFinish = async (values) => {
    console.log("Success:", values);
    setLoader(true);
    try {
      const data = {
        email: values?.emailAddress?.toLowerCase(),
        password: values?.Password,
      };
      const response = await passwordLogin(data);
      console.log("response:===============>", response);
      if (response.data.success === true) {
        if (response?.data?.data?.enable2FA === true) {
          navigate("/auth/verification", {
            state: { response: response?.data?.data },
          });
        } else {
          showAlertMessage({
            type: "success",
            message: response?.data?.message,
            show: true,
          });
          localStorage.setItem(
            "userLoginData",
            JSON.stringify(response?.data?.data)
          );
          navigate("/", { replace: true });
        }
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
    } finally {
      setLoader(false);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleGooglelogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // Define an async function to handle the token response
      const fetchUserData = async () => {
        try {
          console.log("tokenResponse=======>", tokenResponse);
          const response = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: {
                Authorization: `Bearer ${tokenResponse?.access_token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch user details");
          }

          const userData = await response.json();
          handleGoogleAuthAndOneTapLogin(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      // Call the async function
      fetchUserData();
    },
    onError: (error) => console.log("authError=======>", error),
  });

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

  const validateEmail = (rule, value) => {
    if (!value) {
      return Promise.reject("Please enter your Email");
    }
    return Promise.resolve();
  };

  return (
    <>
      <div className="auth">
        <div className="container">
          <div className="auth__row">
            <Row gutter={70} justify="space-between">
              <Col
                className="gutter-row"
                xs={24}
                sm={24}
                md={11}
                lg={11}
                xl={11}
              >
                <div className="auth__left">
                  <div className="auth__logo">
                    <img src={logo} alt="" />
                  </div>
                  <div className="auth__left-content">
                    <h4>Welcome!</h4>
                    <p>Enter your credentials to access your account</p>
                  </div>
                  <div className="auth__google">
                    {/* <Button
                      className="auth__google-btn"
                      onClick={() => handleGooglelogin()}
                    >
                      <img src={gmail} alt="" />
                      <p>Login with Gmail</p>
                    </Button> */}

                    {/* <div className="auth__or">
                      <p>or</p>
                    </div> */}
                  </div>
                  <div className="auth__form" id="auth-form">
                    <Form
                      labelCol={{
                        span: 24,
                      }}
                      wrapperCol={{
                        span: 24,
                      }}
                      onFinish={onFinish}
                      onFinishFailed={onFinishFailed}
                      autoComplete="off"
                    >
                      <Form.Item
                        label="Email Address"
                        name="emailAddress"
                        rules={[
                          {
                            validator: validateEmail,
                          },
                          {
                            type: "email",
                            message: "The input is not valid E-mail!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      <div className="auth__flex">
                        {/* <Link to="/auth/forgot-password">Forgot password?</Link> */}
                      </div>
                      <Form.Item
                        label="Password"
                        name="Password"
                        rules={[
                          {
                            validator: validatePassword,
                          },
                        ]}
                      >
                        <Input.Password />
                      </Form.Item>

                      <div className="auth__btn">
                        <Button htmlType="submit" loading={loader}>
                          Login
                        </Button>
                      </div>

                      {/* <div className="auth__sign">
                        <p>Don’t have an account ? </p>
                        <Link to="/auth/signup">Sign up</Link>
                      </div> */}
                    </Form>
                  </div>
                </div>
              </Col>
              <Col
                className="gutter-row"
                xs={24}
                sm={24}
                md={12}
                lg={12}
                xl={12}
              >
                <div className="auth__right">
                  <div className="auth__right-content">
                    <h4>Manage your surveys with simplicity and ease</h4>
                    <p>Easily manage your surveys in one place</p>
                  </div>
                  <div className="auth__right-img">
                    <img src={authImg} alt="" />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
