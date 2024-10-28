import { Button, Checkbox, Col, Form, Input, Row } from "antd";
import React, { useState, useContext } from "react";
import authImg from "../../assets/img/auth/login.png";
import gmail from "../../assets/img/auth/gmail.svg";
import logo from "../../assets/img/auth/logo.png";
import "./Auth.scss";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { connectionProvider } from "../../context/appProvider";
import { AuthService } from "../../services/authServices";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = AuthService();
  const { showAlertMessage } = useContext(connectionProvider);
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);

  const onFinish = async (values) => {
     setLoader(true);
    try {
      const data = {
        name: values?.Name,
        email: values?.Email,
        password: values?.Password,
      };
      const response = await register(data);
      if (response.data.success === true) {
        showAlertMessage({
          type: "success",
          message: response?.data?.message,
          show: true,
        });
        navigate("/auth/login", { replace: true });
      } else {
        showAlertMessage({
          type: "error",
          message: response?.data?.message || error.message,
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

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // Wrap the async code inside a regular function
      (async () => {
        try {
          const response = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: {
                Authorization: `Bearer ${tokenResponse?.access_token}`,
              },
            }
          );
          const userData = await response.json();       

          const data = {
            name: userData?.name,
            email: userData?.email,
            userprofile: userData?.picture,
          };    

          const signupResponse = await register(data);
          if (signupResponse?.data?.success === true) {
            showAlertMessage({
              type: "success",
              message: signupResponse?.data?.message,
              show: true,
            });
            localStorage.setItem(
              "userSignupData",
              JSON.stringify(signupResponse?.data?.data)
            );
            navigate("/", { replace: true });
          } else {
            console.error("Failed to signup");
            showAlertMessage({
              type: "error",
              message: signupResponse?.data?.message || "Failed to sign up",
              show: true,
            });
          }
        } catch (error) {
          console.error("Failed to signup", error);
          showAlertMessage({
            type: "error",
            message: error?.response?.data?.message || error.message,
            show: true,
          });
        }
      })(); 
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

  const validateName = (rule, value) => {
    if (!value) {
      return Promise.reject("Please enter your Name");
    } else if (value.length > 30) {
      return Promise.reject("Name must be less than 30 characters");
    } else if (value.length < 3) {
      return Promise.reject("Name must be greater than 3 characters");
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
                    <h4>Get started now</h4>
                    <p>Enter your credentials to access your account</p>
                  </div>
                  <div className="auth__google">
                    <Button
                      className="auth__google-btn"
                      onClick={() => handleGoogleSignup()}
                    >
                      <img src={gmail} alt="" />
                      <p>Signup with Gmail</p>
                    </Button>
                    <div className="auth__or">
                      <p>or</p>
                    </div>
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
                        label="Name"
                        name="Name"
                        rules={[
                          {
                            validator: validateName,
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        label="Email Address"
                        name="Email"
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
                      {/* <Form.Item
                        name="remember"
                        valuePropName="checked"
                        wrapperCol={{
                          span: 24,
                        }}
                      >
                        <Checkbox>
                          I agree to <Link to="">Terms & Policy</Link>
                        </Checkbox>
                      </Form.Item> */}
                      <p className="ant-form-item-explain-error">{error}</p>
                      <div className="auth__btn">
                        <Button htmlType="submit" loading={loader}>
                          Signup
                        </Button>
                      </div>

                      <div className="auth__sign">
                        <p>Have an account ? </p>
                        <Link to="/auth/login">Sign in</Link>
                      </div>
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

export default Signup;
