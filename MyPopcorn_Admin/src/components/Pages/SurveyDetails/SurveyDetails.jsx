import React, { useContext, useEffect, useState } from "react";
import "./SurveyDetails.scss";
import {
  Button,
  Col,
  Progress,
  Row,
  Select,
  Tabs,
  Collapse,
  Pagination,
  Tooltip,
  Modal,
} from "antd";
import backImg from "../../../assets/img/icons/back.svg";
import downImg from "../../../assets/img/icons/down.svg";
import tickImg from "../../../assets/img/icons/tick.svg";
import copyImg from "../../../assets/img/icons/copy.svg";
import rightImg from "../../../assets/img/icons/right.svg";
import exportImg from "../../../assets/img/icons/export.svg";
import rewardImg from "../../../assets/img/icons/reward.svg";
import downloadQr from "../../../assets/img/icons/scan-img.svg";
import shareImg from "../../../assets/img/icons/share-img.svg";
import noDataImg from "../../../assets/img/icons/no-data.svg";
import Chart from "../Chart/Chart";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { surveyServices } from "../../../services/surveyServices";
import { connectionProvider } from "../../../context/appProvider";
import {
  handleWalletAddressClick,
  handleShareClick,
  Loader,
} from "../../../helpers/utility";
import downloadImg from "../../../assets/img/icons/download.svg";
import QRCode from "qrcode.react";
import htmlDocx from "html-docx-js/dist/html-docx";

const { Panel } = Collapse;

const SurveyDetails = () => {
  const { showAlertMessage } = useContext(connectionProvider);
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  console.log("state======", state);
  const {
    getGraphData,
    getSurveyByUser,
    getSurveyQnsAnswers,
    getSurveyAnalytics,
    changeSurveyStatus,
    deleteSurvey,
  } = surveyServices();
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [surveyUsers, setSurveyUsers] = useState([]);
  console.log("surveyUsers======", surveyUsers);
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [current, setCurrent] = useState(0);
  const [surveyQnsAns, setSurveyQnsAns] = useState(null);
  const [surveyAnalytics, setSurveyAnalytics] = useState(null);
  console.log("surveyAnalytics======", surveyAnalytics);
  const [tooltipText, setTooltipText] = useState({});
  const [shareTooltipText, setShareTooltipText] = useState({});
  const [loader, setLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownloadMultipleChoice = async (item) => {
    if (!item || !item.options || !Array.isArray(item.options)) {
      console.error("Invalid item data");
      return;
    }

    // Import ExcelJS
    const ExcelJS = require("exceljs");

    const rows = item.options.map((option, optionIndex) => ({
      questionId: optionIndex, // assuming you want to use the question's ID
      questionText: item.question.questionText,
      option: option.option,
      percentage: option.percentage,
      userCount: option.userCount,
    }));

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Survey Data");

    // Add a header row with bold styling
    worksheet.columns = [
      { header: "Sl No", key: "questionId", width: 10 },
      { header: "Question Text", key: "questionText", width: 30 },
      { header: "Answer Choices", key: "option", width: 20 },
      { header: "Responses (%)", key: "percentage", width: 15 },
      { header: "Users Count", key: "userCount", width: 15 },
    ];

    // Apply bold style to header row
    worksheet.getRow(1).font = { bold: true };

    // Add data rows
    rows.forEach((row) => {
      worksheet.addRow(row);
    });

    // Generate Excel file buffer
    try {
      const buffer = await workbook.xlsx.writeBuffer();

      // Create a Blob from the buffer
      const blob = new Blob([buffer], { type: "application/octet-stream" });

      // Create a link element
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);

      // Use item title or a generic name for the Excel file
      const fileName = item?.question?.questionText || "SurveyData";
      link.download = `${fileName}.xlsx`;

      // Append to the document and trigger a click
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error writing file", error);
    }
  };

  const handleDownloadTextType = (item) => {
    console.log("excel item=========", item);

    const question = item.question;
    const answers = item.answers;

    // Check if question and answers exist
    if (!question || !answers || answers.length === 0) {
      alert("No question or answers available for download.");
      return;
    }

    // Create the content for the text document with Markdown for bold
    const content =
      `Survey Question\n\n**Question:** ${question.questionText}\n\n**Answers:**\n` +
      answers
        .map((answer) => `**${answer.user.name}:** ${answer.answer}`)
        .join("\n");

    // Create a Blob with the text content
    const blob = new Blob([content], { type: "text/plain" });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create an anchor element for downloading
    const a = document.createElement("a");
    a.href = url;

    // Set the download attribute with a proper file name
    const fileName = `${
      question.questionText.replace(/[<>:"/\\|?*]+/g, "") || "survey"
    }.txt`;
    a.download = fileName;

    // Append the anchor to the body, click it to trigger download, and remove it
    document.body.appendChild(a);

    // Trigger the download
    a.click();

    // Clean up: remove the anchor and revoke the object URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchData = async (page, setLoading) => {
    setCurrentPage(page);
    try {
      setLoading(true);
      const [graphResponse, surveyResponse] = await Promise.all([
        getGraphData(state?._id),
        getSurveyByUser({ page: page, limit: pageSize }, state?._id),
      ]);

      if (graphResponse?.data?.success && surveyResponse?.data?.success) {
        setGraphData(graphResponse.data);
        setSurveyUsers(surveyResponse.data.data);
        setPageCount(surveyResponse?.data?.totalCount);
      } else {
        console.error("Failed to fetch data from one or both APIs");
      }
    } catch (error) {
      console.error("Error during API requests:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGraphAndUserData = (page) => fetchData(page, setLoading);
  const fetchUserData = (page) => fetchData(page, setLoader);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const analyticsResponse = await getSurveyAnalytics(state?._id);
      if (analyticsResponse?.data?.success) {
        setSurveyAnalytics(analyticsResponse?.data?.data);
      } else {
        console.error("Failed to fetch data from one or both APIs");
      }
    } catch (error) {
      console.error("Error during API requests:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphAndUserData(1);
    fetchAnalyticsData();
  }, []);

  const formatString = (str) => {
    if (!str) return "";
    if (str.length <= 18) return str;
    const start = str.substring(0, 9);
    const end = str.substring(str.length - 9);
    return `${start}...${end}`;
  };

  const fetchSurveyQuestionsAns = async (data) => {
    try {
      setLoading(true);
      const response = await getSurveyQnsAnswers(state?._id, data?.userid);
      if (response?.data?.success) {
        setSurveyQnsAns(response.data.data);
      } else {
        console.error("Failed to fetch data from one or both APIs");
      }
    } catch (error) {
      console.error("Error during API requests:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (value) => {
    console.log("Selected value:", value);

    try {
      setLoading(true);
      const response = await changeSurveyStatus(state?._id, { status: value });
      console.log("surveyChnagestatus======>", response);
      if (response?.data?.success === true) {
        showAlertMessage({
          type: "success",
          message: response?.data?.message,
          show: true,
        });
      }
    } catch (error) {
      console.log("error=====>", error);
      showAlertMessage({
        type: "error",
        message: error?.response?.data?.message,
        show: true,
      });
    } finally {
      fetchGraphAndUserData(1);
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
    setIsModalConfirm(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModalConfirm(false);
  };

  const handleDownloadQr = () => {
    const qrCodeEl = document.getElementById("qrCodeEl");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = qrCodeEl.width + 20;
    canvas.height = qrCodeEl.height + 20;

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(qrCodeEl, 10, 10);

    const qrCodeURL = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    console.log(qrCodeURL);

    let aEl = document.createElement("a");
    aEl.href = qrCodeURL;
    aEl.download = `${state?.title} QR_Code.png`;
    document.body.appendChild(aEl);
    aEl.click();
    document.body.removeChild(aEl);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDeleteSurvey = async () => {
    try {
      setDeleteLoader(true);
      const response = await deleteSurvey(state?._id);
      console.log("delete response============>", response);
      if (response.status === 200) {
        showAlertMessage({
          type: "success",
          message: response?.data?.message,
          show: true,
        });
        navigate("/surveys");
      } else {
        console.error("Failed to delete survey");
        showAlertMessage({
          type: "error",
          message: response?.message,
          show: true,
        });
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error);
      showAlertMessage({
        type: "error",
        message: error?.response?.data?.message || error.message,
        show: true,
      });
    } finally {
      setDeleteLoader(false);
    }
  };

  const showModalConfirm = () => {
    setIsModalConfirm(true);
  };

  const renderPagination = () => {
    return(
      !loader && pageCount > 10 ? (
        <div className="common-page">
          <Pagination
            defaultCurrent={1}
            current={currentPage}
            total={pageCount}
            pageSize={pageSize}
            onChange={(e) => {
              fetchUserData(e);
            }}
          />
        </div>
      ) : null
    )
  }

  return (
    <>
      <Loader loading={loading}>
        <div className="survey">
          <div className="container">
            <div className="survey__title">
              <div className="survey__head">
                <img
                  onClick={() => {
                    navigate(-1);
                  }}
                  src={backImg}
                  alt=""
                />
                <div className="survey__profile">
                  <img src={state?.logo} alt="" />
                </div>
                <h4>{state?.title}</h4>
              </div>
              <div className="survey__end">
                <p>Change status</p>
                <div id="custom-select">
                  <Select
                    placeholder="Select"
                    suffixIcon={<img src={downImg} alt="Activity" />}
                    value={graphData?.surveystatus}
                    options={[
                      {
                        value: true,
                        label: "Active",
                      },
                      {
                        value: false,
                        label: "InActive",
                      },
                    ]}
                    onChange={handleStatusChange}
                  />
                </div>
              </div>
            </div>
            <div className="survey__row">
              <Row gutter={[16, 16]}>
                <Col
                  className="gutter-row"
                  xs={24}
                  sm={24}
                  md={8}
                  lg={8}
                  xl={8}
                >
                  <div className="survey__left p-0">
                    <div className="survey__left-box">
                      <div className="survey__left-title">
                        <h4>Activity</h4>
                        <p>{`Created on ${new Date(
                          graphData?.surveyCreatedAt
                        ).toLocaleDateString()}`}</p>
                      </div>
                      <div className="survey__circle">
                        <Progress
                          strokeColor="#EB5B00"
                          strokeWidth="10"
                          type="circle"
                          percent={graphData?.graphData?.toFixed(2)}
                        />
                      </div>
                      <div className="survey__left-list">
                        <ul>
                          <li>
                            <p>Total responses</p>
                            <h3>{graphData?.totalResponses ?? 0}</h3>
                          </li>
                          <li></li>
                          <li>
                            <p>Rewards</p>

                            <h3 className="flex">
                              <img src={rewardImg} alt="reward" />
                              {`${graphData?.rewardpoints ?? 0}`}
                            </h3>
                          </li>
                        </ul>
                      </div>
                      <div className="survey__left-btn">
                        <Button onClick={showModal}>
                          <img src={downloadQr} alt="" />
                          <span>Download QR</span>
                        </Button>
                        <Tooltip
                          title={
                            shareTooltipText[graphData?.surveylink] || "Copy"
                          }
                        >
                          <Button
                            onClick={() =>
                              handleShareClick(
                                graphData?.surveylink,
                                setShareTooltipText
                              )
                            }
                          >
                            <img src={shareImg} alt="" />
                            <span>Share URL</span>
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="survey__created">
                      <div className="survey__created-flex">
                        <h4>Created by</h4>
                        <p>{graphData?.createdby}</p>
                      </div>
                      <div className="survey__created-flex right">
                        <h4>Survey Category</h4>
                        <p>{graphData?.category}</p>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col
                  className="gutter-row"
                  xs={24}
                  sm={24}
                  md={16}
                  lg={16}
                  xl={16}
                >
                  <div className="survey__right">
                    <div className="survey__right-btn">
                      <Button
                        className="outline-btn"
                        onClick={() => {
                          navigate("/create-survey", { state: state });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        className="default-btn"
                        onClick={showModalConfirm}
                      >
                        Delete
                      </Button>
                    </div>
                    <div id="custom-tab">
                      {current === 0 && (
                        <Tabs defaultActiveKey="1">
                          <Tabs.TabPane
                            tab={
                              <div className="tab-title">
                                <span>Responses</span>
                              </div>
                            }
                            key="1"
                          >
                            <div className="survey__table-list">
                              <table>
                                <tbody>
                                  {!loader &&
                                    surveyUsers?.map((data, index) => (
                                      <tr key={index}>
                                        <td>
                                          <div className="survey__name">
                                            <div className="survey__details">
                                              {data?.name?.slice(0, 2)}
                                            </div>
                                            <h4>{data?.name}</h4>
                                          </div>
                                        </td>
                                        <td>
                                          <div className="survey__copy">
                                            <p>{formatString(data?.address)}</p>
                                            <Tooltip
                                              title={
                                                tooltipText[data?.address] ||
                                                "Copy"
                                              }
                                            >
                                              <Button
                                                onClick={() =>
                                                  handleWalletAddressClick(
                                                    data?.address,
                                                    setTooltipText
                                                  )
                                                }
                                              >
                                                <img src={copyImg} alt="Copy" />
                                              </Button>
                                            </Tooltip>
                                          </div>
                                        </td>
                                        <td>
                                          <div className="survey__points">
                                            <img src={rewardImg} alt="Reward" />
                                            <p>
                                              {data?.status === "Answered"
                                                ? data?.rewardpoints
                                                : 0}{" "}
                                              reward points
                                            </p>
                                          </div>
                                        </td>
                                        <td>
                                          <div
                                            className={
                                              data?.status === "Answered"
                                                ? "survey__ans-tag"
                                                : "survey__tag"
                                            }
                                          >
                                            <span>{data?.status}</span>
                                          </div>
                                        </td>
                                        <td>
                                          <div className="survey__view">
                                            <Button
                                              onClick={() => {
                                                setCurrent(1);
                                                fetchSurveyQuestionsAns(data);
                                              }}
                                            >
                                              <img src={rightImg} alt="View" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  {loader && (
                                    <div className="center-loader">
                                      <div className="loader"></div>
                                    </div>
                                  )}

                                  {!loader && surveyUsers?.length === 0 && (
                                    <div className="center-loader">
                                      <img src={noDataImg} alt="No data" />
                                    </div>
                                  )}
                                </tbody>
                              </table>
                             {renderPagination()}
                            </div>
                            <div className="survey__panel">
                              <Collapse
                                defaultActiveKey={["1"]}
                                expandIconPosition="end"
                              >
                                {surveyUsers?.map((data, index) => (
                                  <Panel
                                    header={
                                      <div className="survey__panel-title">
                                        <div className="survey__name">
                                          <div className="survey__details">
                                            {data?.name?.slice(0, 2)}
                                          </div>
                                          <h4>{data?.name}</h4>
                                        </div>
                                        <div
                                          className={
                                            data?.status === "Answered"
                                              ? "survey__ans-tag"
                                              : "survey__tag"
                                          }
                                        >
                                          <span>{data?.status}</span>
                                        </div>
                                      </div>
                                    }
                                    key={index}
                                  >
                                    <div className="survey__panel-list">
                                      <ul>
                                        <li>
                                          <div className="survey__panel-para">
                                            <p>Wallet ID</p>
                                          </div>
                                          <div className="survey__panel-address">
                                            <h4>
                                              {formatString(data.address)}
                                            </h4>
                                            <Tooltip
                                              title={
                                                tooltipText[data?.address] ||
                                                "Copy"
                                              }
                                            >
                                              <Button
                                                onClick={() =>
                                                  handleWalletAddressClick(
                                                    data?.address,
                                                    setTooltipText
                                                  )
                                                }
                                              >
                                                <img src={copyImg} alt="Copy" />
                                              </Button>
                                            </Tooltip>
                                          </div>
                                        </li>
                                        <li>
                                          <div className="survey__panel-para">
                                            <p>Reward points</p>
                                          </div>
                                          <div className="survey__panel-address">
                                            <img src={rewardImg} alt="" />
                                            <h4>
                                              {data?.status === "Answered"
                                                ? data?.rewardpoints
                                                : 0}
                                            </h4>
                                          </div>
                                        </li>
                                      </ul>
                                      <div
                                        className="survey__panel-view"
                                        role="button"
                                        tabIndex="0"
                                        onClick={() => {
                                          setCurrent(1);
                                          fetchSurveyQuestionsAns(data);
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                          ) {
                                            e.preventDefault();
                                            setCurrent(1);
                                            fetchSurveyQuestionsAns(data);
                                          }
                                        }}
                                        aria-pressed="false"
                                      >
                                        <Link>View response</Link>
                                      </div>
                                    </div>
                                  </Panel>
                                ))}
                                {loading && (
                                  <div className="center-loader">
                                    <div className="custom-loader"></div>
                                  </div>
                                )}
                                {!loading && surveyUsers?.length === 0 && (
                                  <div className="center-loader">
                                    <img src={noDataImg} alt="No data" />
                                  </div>
                                )}
                              </Collapse>
                              {renderPagination()}
                            </div>
                          </Tabs.TabPane>
                          <Tabs.TabPane
                            tab={
                              <div className="tab-title">
                                <span>Analytics</span>
                              </div>
                            }
                            key="2"
                          >
                            <div className="survey__question">
                              {surveyAnalytics?.questionsSummary?.length > 0 ? (
                                <ul>
                                  {surveyAnalytics?.questionsSummary?.map(
                                    (item, index) => {
                                      console.log("analyticsItem======>", item);
                                      return (
                                        <li key={index}>
                                          <div className="survey__export-flex">
                                            <div>
                                              <h4>{`Q${index + 1}: ${
                                                item?.question?.questionText
                                              }`}</h4>
                                              <p>
                                                {item.question.questionType ===
                                                  "multiple_choice" &&
                                                  "Survey Options"}
                                              </p>
                                            </div>
                                            <div className="survey__exp-btn">
                                              <Button
                                                onClick={() => {
                                                  item?.question
                                                    ?.questionType ===
                                                  "multiple_choice"
                                                    ? handleDownloadMultipleChoice(
                                                        item
                                                      )
                                                    : handleDownloadTextType(
                                                        item
                                                      );
                                                }}
                                              >
                                                <img src={exportImg} alt="" />
                                              </Button>
                                            </div>
                                          </div>
                                          {item.question.questionType ===
                                          "multiple_choice" ? (
                                            <>
                                              <div className="survey__chart">
                                                <Chart
                                                  chartData={item.options}
                                                />
                                              </div>
                                              <div
                                                className="survey__table"
                                                id="custom-table"
                                              >
                                                <table>
                                                  <thead>
                                                    <tr>
                                                      <th>Answer choices</th>
                                                      <th>Responses</th>
                                                      <th>Users Count</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {item?.options?.map(
                                                      (data, index) => (
                                                        <tr key={index}>
                                                          <td className="grey">
                                                            {data?.option}
                                                          </td>
                                                          <td>
                                                            {data.percentage?.toFixed(
                                                              2
                                                            )}
                                                            %
                                                          </td>
                                                          <td>
                                                            {data.userCount}
                                                          </td>
                                                        </tr>
                                                      )
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </>
                                          ) : (
                                            item?.answers?.map(
                                              (answer, index) => (
                                                <div key={index}>
                                                  <p>
                                                    <span>Answer :</span>{" "}
                                                    {answer?.answer}
                                                  </p>
                                                </div>
                                              )
                                            )
                                          )}
                                        </li>
                                      );
                                    }
                                  )}
                                </ul>
                              ) : (
                                loading && (
                                  <div className="center-loader">
                                    <div className="custom-loader"></div>
                                  </div>
                                )
                              )}

                              {!loading && surveyAnalytics === null && (
                                <div className="center-loader">
                                  <img src={noDataImg} alt="No data" />
                                </div>
                              )}
                            </div>
                          </Tabs.TabPane>
                        </Tabs>
                      )}
                    </div>

                    {current === 1 && (
                      <div className="survey__view">
                        <div className="survey__view-title">
                          <Button
                            onClick={() => {
                              setCurrent(0);
                            }}
                          >
                            <img src={backImg} alt="BackImg" />
                          </Button>
                          <h4>{surveyQnsAns?.user_id?.name}</h4>
                        </div>
                        <div className="survey__view-list">
                          <ul>
                            {surveyQnsAns?.answers?.map((item, index) => {
                              console.log("answeroptionitem======>", item);
                              return (
                                <li key={index}>
                                  <h4>{`Question ${index + 1}`}</h4>
                                  <h5>{item?.question_id?.questionText}</h5>
                                  {item?.question_id?.questionType ===
                                  "multiple_choice" ? (
                                    <div className="survey__view-option">
                                      {item?.question_id?.options?.map(
                                        (option, index) => (
                                          <div
                                            key={index}
                                            className="survey__view-option-list"
                                          >
                                            <span
                                              className={
                                                option === item?.answer
                                                  ? "active"
                                                  : ""
                                              }
                                            >
                                              {option === item?.answer ? (
                                                <img src={tickImg} alt="" />
                                              ) : null}
                                            </span>
                                            <p>{option}</p>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    <div className="survey__view-option">
                                      <div className="survey__view-option-list">
                                        <p>{item?.answer}</p>
                                      </div>
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        {/* Download Qr */}
        <Modal
          width={408}
          centered={true}
          footer={null}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          wrapClassName="custom-modal"
        >
          <div className="qr">
            <div className="qr__content">
              <h4>{`${state?.title} QR`}</h4>
            </div>
            <div className="qr__img">
              <QRCode
                id="qrCodeEl"
                title={graphData?.surveylink}
                value={graphData?.surveylink}
                size={150}
              />
            </div>
            <div className="qr__download">
              <Button onClick={handleDownloadQr}>
                <img src={downloadImg} alt="" />
                <span>Download QR</span>
              </Button>
            </div>
            <div className="qr__btn">
              <Button className="default-btn" onClick={handleCancel}>
                Okay
              </Button>
            </div>
          </div>
        </Modal>

        {/* confrim modal  */}
        <Modal
          width={408}
          centered={true}
          footer={null}
          open={isModalConfirm}
          onOk={handleOk}
          onCancel={handleCancel}
          wrapClassName="custom-modal"
        >
          <div className="confirm">
            <h4>Delete the Survey</h4>
            <p>Are you sure to delete this Survey?</p>
          </div>
          <div className="deposit__btn">
            <Button
              className="default-btn"
              onClick={handleDeleteSurvey}
              loading={deleteLoader}
            >
              Okay
            </Button>
            <Button className="outline-btn" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </Modal>
      </Loader>
    </>
  );
};

export default SurveyDetails;
