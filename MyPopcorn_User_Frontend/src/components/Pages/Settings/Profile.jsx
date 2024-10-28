import { Col, Row, Button, Form, Input, Upload } from "antd";
import React, { useContext, useEffect, useState } from "react";
import profileImg from "../../../assets/img/profile-img.png";
import profile_header from "../../../assets/img/profile.png";
import { surveyServices } from "../../../services/surveyServices";
import { connectionProvider } from "../../../context/appProvider";
import logoUpload from "../../../helpers/fileUpload";
import { profileServices } from "../../../services/profileServices";
import { useLocation, useNavigate } from "react-router-dom";

const Profile = () => {
  const path = useLocation();
  const navigate = useNavigate();
  const { uploadLogo } = surveyServices();
  const { updateProfile, getProfile } = profileServices();
  const { showAlertMessage } = useContext(connectionProvider);
  const [loader, setLoader] = useState(false);
  const [profileLoader, setProfileLoader] = useState(false);
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const [logoData, setLogoData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [disableBtn, setDisableBtn] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        if (response.data.success) {
          setUserData(response?.data?.data);
          setLogoData((prev) => ({
            ...prev,
            data: response?.data?.data?.user_profile,
          }));
        } else {
          console.error("Failed to fetch polygon balance");
        }
      } catch (error) {
        console.error("Error during dashboard API request:", error.message);
      }
    };

    fetchProfile();
  }, [path]);

  const onFileChange = (info) => {
    logoUpload({
      info,
      setLogoData,
      uploadLogo,
      showAlertMessage,
      setLoader,
    });
    setShowDeleteBtn(true);
    setDisableBtn(false);
  };

  const onFinish = async (values) => {
    setProfileLoader(true);

    try {
      const data = {
        name: values?.profileName,
        email: values?.emailId,
        user_profile: logoData?.data,
      };    
      const response = await updateProfile(data);
      if (response.data.success) {
        showAlertMessage({
          type: "success",
          message: response?.data?.message,
          show: true,
        });
        form.setFieldsValue({
          profileName: response?.data?.data?.name,
          emailId: response?.data?.data?.email,
        });
        navigate("/settings/Profile");
        setShowDeleteBtn(false);
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
      setProfileLoader(false);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      profileName: userData?.name,
      emailId: userData?.email,
    });
  }, [userData]);

  return (
    <>
      <div className="profile">
        <div className="profile__row">
          <Row gutter={16}>
            <Col className="gutter-row" xs={24} sm={16} md={16} lg={12} xl={12}>
              <div className="profile__title">
                <h3>Profile picture</h3>
              </div>
              <div className="profile__upload">
                <div id="custom-upload">
                  <div className="custom-file">
                    <div class="custom-file__box">
                      <div class="custom-file__center">
                        <img
                          src={logoData?.data ?? profile_header}
                          alt="profileImg"
                          class="placeholder-img"
                        />
                      </div>
                    </div>
                  </div>
                  <Upload
                    name="avatar"
                    accept="image/*"
                    beforeUpload={() => false}
                    disabled={loader}
                    onChange={onFileChange}
                    showUploadList={false}
                  >
                    <Button loading={loader} className="default-btn">
                      Change picture
                    </Button>
                  </Upload>
                  {logoData !== null && showDeleteBtn ? (
                    <Button
                      className="outline-btn"
                      onClick={() => {
                        setLogoData(null);
                      }}
                    >
                      Delete picture
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="profile__form" id="auth-form">
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
                  form={form}
                >
                  <Form.Item
                    label="Profile name"
                    name="profileName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your Profile Name",
                      },
                      {
                        min: 3,
                        message: "Profile Name must be at least 3 characters",
                      },
                      {
                        max: 35,
                        message: "Profile Name cannot exceed 35 characters",
                      },
                    ]}
                    initialValue={userData?.name}
                  >
                    <Input
                      onChange={(e) => {
                        setDisableBtn(false);
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Email id"
                    name="emailId"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your Emailid",
                      },
                      {
                        type: "email",
                        message: "The input is not valid E-mailid",
                      },
                    ]}
                    initialValue={userData?.email}
                  >
                    <Input disabled={true} />
                  </Form.Item>
                  <div className="profile__btn">
                    <Button
                      className="default-btn"
                      htmlType="submit"
                      loading={profileLoader}
                      disabled={disableBtn}
                    >
                      Save Changes
                    </Button>
                    <Button
                      className="outline-btn"
                      onClick={() => {
                        form.resetFields();
                        setLogoData((prev) => ({
                          ...prev,
                          data: userData?.user_profile,
                        }));
                        setShowDeleteBtn(false);
                      }}
                      disabled={disableBtn}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default Profile;
