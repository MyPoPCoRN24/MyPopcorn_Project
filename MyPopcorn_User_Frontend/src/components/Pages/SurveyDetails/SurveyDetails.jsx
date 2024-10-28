import React, { useContext, useEffect, useState, useRef } from "react";
import "./SurveyDetails.scss";
import {
  Button,
  Col,
  Progress,
  Row,
  Select,
  Tabs,
  Collapse,
  Radio,
  Form,
  Input,
} from "antd";
import backImg from "../../../assets/img/icons/back.svg";
import noDataImg from "../../../assets/img/icons/no-data.svg";
import downImg from "../../../assets/img/icons/down.svg";
import shareImg from "../../../assets/img/icons/share.svg";
import tickImg from "../../../assets/img/icons/tick.svg";
import copyImg from "../../../assets/img/icons/copy.svg";
import rightImg from "../../../assets/img/icons/right.svg";
import rewardImg from "../../../assets/img/icons/reward.svg";
import resImg from "../../../assets/img/icons/arrow-up-right.svg";
import profileImg from "../../../assets/img/profile-img.png";
import { useLocation, useNavigate } from "react-router-dom";
import { surveyServices } from "../../../services/surveyServices";
import { connectionProvider } from "../../../context/appProvider";
import { Loader } from "../../../helpers/utility";
import cupImg from "../../../assets/img/icons/cup.svg";
import TextArea from "antd/es/input/TextArea";

const { Panel } = Collapse;

const SurveyDetails = () => {
  const location = useLocation();
  const { state } = location;
  const { getSurveyData, getGraphData, submitSurvey, surveyResponse } =
    surveyServices();
  const { showAlertMessage } = useContext(connectionProvider);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [surveyQnsData, setSurveyQnsData] = useState(null);
  const [storedSurveyId, setStoredSurveyId] = useState(null);
  const [answers, setAnswers] = useState([]);
  console.log("answers======", answers);
  const [graphData, setGraphData] = useState(null);
  const [surveyUserResponse, setSurveyUserResponse] = useState(null);
  console.log("surveyUserResponse======", surveyUserResponse);
  const [Datareceived, setDatareceived] = useState(false);
  const [answer, setAnswer] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  console.log("validationErrors======", validationErrors);
  const questionRefs = useRef({});

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    const fetchedSurveyId = localStorage.getItem("survey_id");
    setStoredSurveyId(fetchedSurveyId);
    if (storedSurveyId || state) {
      fetchSurveyQnsAndAnawers();
      fetchGraphData();
      fetchSurveyResponse();
    }
  }, [storedSurveyId, state]);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const response = await getGraphData(storedSurveyId ?? state?._id);

      if (response.data.success) {
        setGraphData(response?.data);
      } else {
        console.error("Failed to fetch graph data");
      }
    } catch (error) {
      console.error("Error during API requests:", error.message);
      if (error?.response?.data?.message === "Survey not found") {
        localStorage.removeItem("survey_id");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyResponse = async () => {
    try {
      setLoading(true);
      const response = await surveyResponse(storedSurveyId ?? state?._id);
      if (response.data.success) {
        setSurveyUserResponse(response?.data?.data);
      } else {
        console.error("Failed to fetch graph data");
      }
    } catch (error) {
      console.error("Error during API requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyQnsAndAnawers = async () => {
    try {
      setLoading(true);
      const response = await getSurveyData(storedSurveyId ?? state?._id);
      if (response.data.success) {
        setDatareceived(true);
        setSurveyQnsData(response?.data?.data);
      } else {
        console.error("Failed to fetch graph data");
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRadioChange = (questionId, e) => {
    const selectedAnswer = e.target.value;

    setAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (answer) => answer.question_id === questionId
      );

      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex].answer = selectedAnswer;
        return updatedAnswers;
      } else {
        return [
          ...prevAnswers,
          {
            question_id: questionId,
            answer: selectedAnswer,
          },
        ];
      }
    });

    // Clear validation error for this question
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [questionId]: false,
    }));
  };

  const handleTextChange = (id, value) => {
    setAnswer(value);
    setAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (answer) => answer.question_id === id
      );

      if (existingAnswerIndex > -1) {
        // Update the existing answer
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex].answer = value;
        return updatedAnswers;
      } else {
        // Add a new answer
        return [
          ...prevAnswers,
          {
            question_id: id,
            answer: value,
          },
        ];
      }
    });

    // Clear validation error for this question
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [id]: false,
    }));
  };

  const validateAnswers = () => {
    const errors = {};
    let firstErrorId = null;

    surveyQnsData.questions.forEach((question) => {
      if (
        !answers.some(
          (answer) => answer.question_id === question._id && answer.answer
        )
      ) {
        errors[question._id] = true; // Mark as invalid if no answer is found
        if (!firstErrorId) {
          firstErrorId = question._id; // Store the first unanswered question ID
        }
      }
    });

    setValidationErrors(errors);

    if (Object.keys(errors).length !== 0) {
      showAlertMessage({
        type: "error",
        message: "Fill in the required questions.",
        show: true,
      });
    }

    if (firstErrorId) {
      // Scroll to the first unanswered question
      questionRefs.current[firstErrorId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleSubmitSurvey = async () => {
    if (validateAnswers()) {
      try {
        setLoader(true);
        const response = await submitSurvey(
          { answers: answers },
          storedSurveyId ?? state?._id
        );
        if (response.data.success === true) {
          showAlertMessage({
            type: "success",
            message: response?.data?.message,
            show: true,
          });
          navigate("/surveys");
          localStorage.removeItem("survey_id");
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
      console.log("Form submitted with answers:", answers);
    } else {
      console.log("Validation errors:", validationErrors);
    }
  };

  return (
    <>
      <Loader loading={loading}>
        <div className="survey">
          <div className="container">
            <div className="survey__title">
              <div className="survey__head">
                <img
                  src={backImg}
                  alt=""
                  onClick={() => {
                    navigate(-1);
                  }}
                />
                <div className="survey__profile">
                  <img src={surveyQnsData?.logo} alt="" />
                </div>
                <h4>{surveyQnsData?.title}</h4>
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
                        <h4>Summary</h4>
                        <p>{`Created on ${new Date(
                          graphData?.surveyCreatedAt
                        ).toLocaleDateString()}`}</p>
                      </div>
                    </div>

                    <div className="survey__created">
                      <div className="survey__created-flex">
                        <h4>Reward Point</h4>
                        <p className="flex-center">
                          {" "}
                          <img src={cupImg} alt="" />
                          {`${graphData?.rewardpoints ?? 0}`}
                        </p>
                      </div>
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
                    {surveyUserResponse === null && Datareceived ? (
                      <div className="survey__view">
                        <div className="survey__view-title">
                          <h4>Survey Questions</h4>
                        </div>
                        <div className="survey__view-list" id="auth-form">
                          {surveyQnsData?.questions?.length > 0 ? (
                            <ul>
                              {surveyQnsData?.questions?.map((item, index) => (
                                <li
                                  key={index}
                                  ref={(el) =>
                                    (questionRefs.current[item._id] = el)
                                  }
                                >
                                  <h4>{`Question ${index + 1}`}</h4>
                                  <h5>{item?.questionText}</h5>
                                  <div className="survey__view-option">
                                    {item?.questionType === "text" ? (
                                      <>
                                        <Form.Item className="m-0">
                                          <TextArea
                                            value={
                                              answers.find(
                                                (answer) =>
                                                  answer.question_id ===
                                                  item._id
                                              )?.answer || ""
                                            }
                                            onChange={(e) => {
                                              handleTextChange(
                                                item._id,
                                                e.target.value
                                              );
                                            }}
                                            autoSize={{
                                              minRows: 3,
                                              maxRows: 4,
                                            }}
                                            maxLength={500}
                                          />
                                        </Form.Item>
                                        <div className="survey__count-content">
                                          <p>
                                            <span>
                                              {answers.find(
                                                (answer) =>
                                                  answer.question_id ===
                                                  item._id
                                              )?.answer?.length || 0}
                                            </span>
                                            /500
                                          </p>
                                        </div>
                                        {validationErrors[item._id] && (
                                          <p className="ant-form-item-explain-error">
                                            This question is requires answer.
                                          </p>
                                        )}
                                      </>
                                    ) : (
                                      <div className="survey__view-option-list">
                                        <Radio.Group
                                          value={
                                            answers.find(
                                              (answer) =>
                                                answer.question_id === item._id
                                            )?.answer || null
                                          }
                                          onChange={(e) =>
                                            handleRadioChange(item?._id, e)
                                          }
                                        >
                                          {item?.options?.map((option, i) => (
                                            <Radio key={i} value={option}>
                                              {option}
                                            </Radio>
                                          ))}
                                        </Radio.Group>
                                        {validationErrors[item._id] && (
                                          <p className="ant-form-item-explain-error">
                                            This question is requires answer.
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            !loading &&
                            Datareceived && (
                              <div className="center-loader">
                                <img src={noDataImg} alt="" />
                              </div>
                            )
                          )}
                          {loader && Datareceived && (
                            <div className="center-loader">
                              <div className="loader"></div>
                            </div>
                          )}
                        </div>
                        {Datareceived && (
                          <div className="survey__two-btn survey__end-btns">
                            <Button
                              className="default-btn"
                              onClick={handleSubmitSurvey}
                              loading={loader}
                            >
                              Submit
                            </Button>
                            <Button
                              className="outline-btn"
                              onClick={() => {
                                localStorage.removeItem("survey_id");
                                navigate("/surveys");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      Datareceived && (
                        <div className="survey__view">
                          <div className="survey__view-title">
                            <h4>Survey Questions</h4>
                            <div className="survey__res-tag">Responded</div>
                          </div>
                          <div className="survey__view-list" id="auth-form">
                            <ul>
                              {surveyUserResponse?.answers?.map(
                                (item, index) => {
                                  return (
                                    <li key={index}>
                                      <h4>{`Question ${index + 1}`}</h4>
                                      <h5>{item?.question_id?.questionText}</h5>
                                      {item?.question_id?.questionType ===
                                      "multiple_choice" ? (
                                        <div className="survey__view-option">
                                          {item?.question_id?.options?.map(
                                            (option, index) => {
                                              return (
                                                option === item?.answer && (
                                                  <div
                                                    key={index}
                                                    className="survey__view-options-list"
                                                  >
                                                    <span className="active">
                                                      <img
                                                        src={tickImg}
                                                        alt=""
                                                      />
                                                    </span>
                                                    <p>{option}</p>
                                                  </div>
                                                )
                                              );
                                            }
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
                                }
                              )}
                            </ul>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Loader>
    </>
  );
};

export default SurveyDetails;
