import { Button, Form, Input, Modal, Select, Pagination } from "antd";
import React, { useContext, useEffect, useState } from "react";
import deleteImg from "../../../assets/img/icons/delete-icon.svg";
import closeImg from "../../../assets/img/icons/close.svg";
import downImg from "../../../assets/img/icons/down.svg";
import TextArea from "antd/es/input/TextArea";
import { useLocation } from "react-router-dom";
import { profileServices } from "../../../services/profileServices";
import { connectionProvider } from "../../../context/appProvider";
import noDataImg from "../../../assets/img/icons/no-data.svg";
import { formatEmailDate } from "../../../helpers/utility";

const SendNotification = () => {
  const path = useLocation();
  const { sendNotification, getAllEmails, deleteEmail } = profileServices();
  const { showAlertMessage, setNotificationArray } =
    useContext(connectionProvider);
  const [notifications, setNotifications] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  console.log("notifications======>", notifications);
  const [loading, setLoading] = useState(false);
  //   const [loader, setLoader] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const pageLimit = 10;
  const [emailsData, setEmailsData] = useState(null);
  console.log("emailsData=======>", emailsData);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEmailsData = async (page) => {
    setCurrentPage(page);
    try {
      setLoading(true);
      const response = await getAllEmails({
        limit: pageLimit,
        page: page,
      });
      console.log("email response============>", response);

      if (response.data.success) {
        setEmailsData(response?.data?.data);
        setPageCount(response?.data?.totalCount);
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
    fetchEmailsData(1);
  }, [path]);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    console.log("Success :", values);
    setLoading(true);

    try {
      const data = {
        subject: values?.title,
        message_one: values?.message_1,
        message_two: values?.message_2,
        message_three: values?.message_3,
      };
      console.log("requestdata========", data);
      const response = await sendNotification(data);
      console.log("email sent response:===============>", response);
      if (response.status === 200) {
        showAlertMessage({
          type: "success",
          message: response?.data?.message,
          show: true,
        });
        form.resetFields();
        fetchEmailsData(1);
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
      setLoading(false);
      handleCancel();
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const [form] = Form.useForm();

  const handleDeleteEmail = async (item) => {
    try {
      setLoading(true);
      const response = await deleteEmail(item?._id);
      console.log("email response============>", response);

      if (response.status === 200) {
        showAlertMessage({
          type: "success",
          message: response?.data?.message,
          show: true,
        });
        fetchEmailsData(1);
      } else {
        console.error("Failed to fetch polygon balance");
        showAlertMessage({
          type: "error",
          message: response?.message,
          show: true,
        });
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
      showAlertMessage({
        type: "error",
        message: error?.response?.data?.message || error.message,
        show: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    const formattedValue = value
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/\B\w/g, (char) => char.toLowerCase());
    form.setFieldsValue({ title: formattedValue });
  };

  return (
    <>
      <div className="notification">
        <div className="notification__title">
          <h3>Notification</h3>
          <Button className="default-btn" onClick={showModal}>
            Send Notification
          </Button>
        </div>
        <div className="notification__table">
          <div className="notification__scroll">
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  emailsData?.map((data, index) => (
                    <tr>
                      <td>{currentPage * pageLimit - pageLimit + index + 1}</td>
                      <td>{formatEmailDate(data?.createdAt)}</td>
                      <td>{data?.type}</td>
                      <td>{data?.title}</td>
                      <td>
                        <div
                          className={`table-overflow ${isExpanded ? "expanded" : ""
                            }`}
                        >
                          <p>{data?.message}</p>
                          {data?.message?.length > 100 && (
                            <Button
                              className="see-more-button"
                              onClick={() => setIsExpanded(!isExpanded)}
                            >
                              {isExpanded ? "See Less" : "See More"}
                            </Button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="table-delete">
                          <Button
                            onClick={() => {
                              handleDeleteEmail(data);
                            }}
                          >
                            <img src={deleteImg} alt="" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!loading && emailsData?.length === 0 && (
                  <div className="center-loader">
                    <img src={noDataImg} alt="" />
                  </div>
                )}
                {loading && (
                  <div className="center-loader">
                    <div className="loader"></div>
                  </div>
                )}
              </tbody>
            </table>
          </div>

          {!loading && pageCount > 10 ? (
            <div className="common-page">
              <Pagination
                defaultCurrent={1}
                current={currentPage}
                total={pageCount}
                pageSize={pageLimit}
                onChange={(e) => {
                  fetchEmailsData(e);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        width={408}
        centered={true}
        footer={null}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        wrapClassName="custom-modal"
      >
        <div className="send">
          <div className="deposit__title">
            <h3>Send Notification</h3>
            <Button onClick={handleCancel}>
              <img src={closeImg} alt="" />
            </Button>
          </div>
          <div className="send__list" id="auth-form">
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
              <div className="send__form">
                <Form.Item label="Type">
                  <Input placeholder="Enter here" value="All users" disabled />
                </Form.Item>
                <Form.Item label="Notification Type">
                  <Input placeholder="Enter here" value="Mail" disabled />
                </Form.Item>
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your Title",
                    },
                    {
                      min: 3,
                      message: "Title Name must be at least 3 characters",
                    },
                    {
                      max: 35,
                      message: "Title Name cannot exceed 35 characters",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter here"
                    onChange={handleTitleChange}
                  />
                </Form.Item>
                <Form.Item
                  label="Message 1"
                  name="message_1"
                  rules={[
                    {
                      required: true,
                      message: "Atleast one message is required",
                    },
                  ]}
                >
                  <TextArea rows={3} placeholder="Enter message" />
                </Form.Item>
                <Form.Item label="Message 2" name="message_2">
                  <TextArea rows={3} placeholder="Enter message" />
                </Form.Item>
                <Form.Item label="Message 3" name="message_3">
                  <TextArea rows={3} placeholder="Enter message" />
                </Form.Item>
              </div>
              <div className="deposit__btn">
                <Button
                  className="default-btn"
                  htmlType="submit"
                  loading={loading}
                >
                  Submit
                </Button>
                <Button className="outline-btn" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SendNotification;
