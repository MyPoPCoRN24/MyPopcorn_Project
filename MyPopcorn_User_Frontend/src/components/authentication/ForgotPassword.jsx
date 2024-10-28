import { Button, Col, Form, Input, Row } from "antd";
import React from "react";
import authImg from "../../assets/img/auth/login.png";
import logo from "../../assets/img/auth/logo.png";
import "./Auth.scss";

const ForgotPassword = () => {
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
                    <h4>Forgot password?</h4>
                    <p>Enter your registered mail id. We will notify you.</p>
                  </div>
                  <div className="auth__form" id="auth-form">
                    <Form
                      labelCol={{
                        span: 24,
                      }}
                      wrapperCol={{
                        span: 24,
                      }}
                    >
                      <Form.Item label="Email Address">
                        <Input />
                      </Form.Item>
                      <div className="auth__btn">
                        <Button>Confirm</Button>
                      </div>
                      <div className="auth__cancel">
                        <Button>Cancel</Button>
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

export default ForgotPassword;
