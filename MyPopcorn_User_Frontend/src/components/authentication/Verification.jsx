import { Button, Col, Form, Input, Row } from "antd";
import React, { useContext, useState } from "react";
import authImg from "../../assets/img/auth/login.png";
import logo from "../../assets/img/auth/logo.png";
import "./Auth.scss";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { connectionProvider } from "../../context/appProvider";
import { AuthService } from "../../services/authServices";
import { InputOTP } from "antd-input-otp";

const Verification = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { otpVerifySubmit } = AuthService();
  const { showAlertMessage } = useContext(connectionProvider);
  const [loader, setLoader] = useState(false);
  const location = useLocation();
  const { state } = location;
  
  const handleFinish = async (values) => {   
    setLoader(true);
    try {
      const value = {
        otp: values?.otp?.join(""),
      };
      const id = state?.response?._id;
      const response = await otpVerifySubmit(value, id);     
      if (response.data.success === true) {
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
                    <h4>OTP Generated!</h4>
                    <p>
                      Enter the six-digit code from your two factor <br />{" "}
                      authentication app
                    </p>
                  </div>
                  <div className="auth__form auth__otp" id="auth-form">
                    <Form
                      labelCol={{
                        span: 24,
                      }}
                      wrapperCol={{
                        span: 24,
                      }}
                      onFinish={handleFinish}
                      form={form}
                    >
                      <Form.Item label="OTP" name="otp">
                        <InputOTP inputType="numeric" maxLength={6} />
                      </Form.Item>

                      <div className="auth__btn">
                        <Button htmlType="submit" loading={loader}>
                          Confirm
                        </Button>
                      </div>
                      <div className="auth__cancel">
                        <Button
                          onClick={() => {
                            navigate("/auth/login");
                          }}
                        >
                          Cancel
                        </Button>
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

export default Verification;
