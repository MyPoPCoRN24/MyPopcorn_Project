import React, { useEffect, useState, useContext } from "react";
import "./CreateSurvey.scss";
import { Link, useLocation } from "react-router-dom";
import backImg from "../../../assets/img/icons/back.svg";
import infoImg from "../../../assets/img/icons/information.svg";
import {
  Col,
  Row,
  Steps,
  Button,
  Upload,
  Form,
  Input,
  Select,
  Tooltip,
} from "antd";
import profileImg from "../../../assets/img/profile-img.png";
import downImg from "../../../assets/img/icons/down.svg";
import addImg from "../../../assets/img/icons/add.svg";
import editImg from "../../../assets/img/icons/edit.svg";
import minusImg from "../../../assets/img/icons/minus.svg";
import deleteImg from "../../../assets/img/icons/delete.svg";
import dotImg from "../../../assets/img/icons/dot.svg";
import copyImg from "../../../assets/img/icons/copy-icon.svg";
import linkImg from "../../../assets/img/icons/link.svg";
import downloadImg from "../../../assets/img/icons/download.svg";
import { connectionProvider } from "../../../context/appProvider";
import { useNavigate } from "react-router-dom";
import { surveyServices } from "../../../services/surveyServices";
import logoUpload from "../../../helpers/fileUpload";
import { handleWalletAddressClick } from "../../../helpers/utility";
import QRCode from "qrcode.react";
import downarrow from "../../../assets/img/icons/chevron-down.svg";
import uparrow from "../../../assets/img/icons/chevron-up.svg";
import * as XLSX from "xlsx";

const { Step } = Steps;

const categoryOptions = [
  {
    value: "Blockchain Events",
    label: "Blockchain Events",
  },
  {
    value: "Blockchain Project",
    label: "Blockchain Project",
  },
  {
    value: "Speakers",
    label: "Speakers",
  },
  {
    value: "Others",
    label: "Others",
  },
];

const CreateSurvey = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const {
    createSurvey,
    editSurvey,
    uploadLogo,
    getAllQuestions,
    createQuestions,
    deleteQuestions,
    submitSurvey,
    submitUpdateSurvey,
    editQuestions,
    swapQuestions,
    editSurveyWithLinkresponse,
  } = surveyServices();
  const [current, setCurrent] = useState(0);
  console.log("current=======>", current);
  const location = useLocation();
  const { state } = location;
  console.log("state============>", state);
  const [editQuestion, setEditQuestion] = useState(null);
  const [surveyCategory, setSurveyCategory] = useState(
    state !== null ? state?.category : categoryOptions[0]?.value
  );
  const [questionText, setQuestionText] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [answerType, setAnswerType] = useState("multiple_choice");
  const [questions, setQuestions] = useState([]);
  console.log("questions12345=======>", questions);
  const [inputCount, setInputCount] = useState(2);
  console.log("inputcount=========>", inputCount);
  const [answerOptions, setAnswerOptions] = useState([]);
  console.log("answerOptions=======>", answerOptions);
  const [showAddNewQuestion, setShowAddQuestion] = useState(true);
  console.log("showAddNewQuestion=======>", showAddNewQuestion);
  const [choiceError0, setchoiceError0] = useState("");
  const [choiceError1, setchoiceError1] = useState("");
  const { showAlertMessage } = useContext(connectionProvider);
  const [surveyResponse, setSurveyResponse] = useState(null);
  console.log("surveyResponse=======>", surveyResponse);
  const [loader, setLoader] = useState(false);
  const [excelloader, setExcelLoader] = useState(false);
  const [logoData, setLogoData] = useState(
    state?.logo ? { data: state.logo } : null
  );
  console.log("logoData========", logoData);
  const [logoError, setLogoError] = useState("");
  const [rewardPoints, setRewardPoints] = useState(state?.reward_points ?? "");
  const [rewardPointsError, setRewardPointsError] = useState("");
  const [surveyLink, setSurveyLink] = useState("");
  const [option0, setOption0] = useState("");
  const [option1, setOption1] = useState("");
  console.log("option0======", option0);
  console.log("option1======", option1);
  const [localSurveyResponse, setLocalSurveyResponse] = useState(null);
  const [editValuesChanged, setEditValuesChanged] = useState(false);
  const [tooltipText, setTooltipText] = useState({});
  const [exceldata, setExcelData] = useState([]);

  useEffect(() => {
    form.setFieldsValue({
      surveytitle: state?.title,
      createdby: state?.createdby,
      surveydescription: state?.description,
    });
    setQuestions(state?.questions);
    setShowAddQuestion(false);

    return () => {
      setQuestions([]);
    };
  }, [state]);

  useEffect(() => {
    const localSurveyRes = localStorage.getItem("survey_response");
    const parseResponse = localSurveyRes ? JSON.parse(localSurveyRes) : null;
    setLocalSurveyResponse(parseResponse);

    return () => {
      localStorage.removeItem("survey_response");
    };
  }, []);

  const handleDownload = () => {
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
    aEl.download = `${surveyResponse?.title}.png`;
    document.body.appendChild(aEl);
    aEl.click();
    document.body.removeChild(aEl);
  };

  useEffect(() => {
    if (editQuestion !== null) {
      setQuestionText(editQuestion?.questionText);
      setAnswerOptions(editQuestion.options);
      setInputCount(
        editQuestion.options.length === 0 ? 2 : editQuestion.options.length
      );
      setAnswerType(editQuestion?.questionType);
    }
  }, [editQuestion]);

  const generateLink = () => {
    const link = `https://event.mypopcorn.io/survey-details/${
      localSurveyResponse ? localSurveyResponse?._id : surveyResponse?._id
    }`;
    setSurveyLink(link);
  };

  useEffect(() => {
    generateLink();

    if (state !== null) {
      setSurveyLink(state?.surveylink);
    }
  }, [surveyResponse]);

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const fetchQuestions = async (survey) => {
    try {
      setLoader(true);
      const response = await getAllQuestions(
        localSurveyResponse ? localSurveyResponse?._id : surveyResponse?._id
      );
      console.log("questionsResponse=========", response);
      if (response.status === 200) {
        setQuestions(response?.data?.data);
      } else {
        console.error("Failed to fetch questions");
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
      setLoader(false);
    }
  };

  const handleFirstSlide = async (values) => {
    console.log("values=====>", values);
    validateRewardPoints(rewardPoints);
    if (rewardPointsError) {
      return;
    }
    if (logoData?.data !== undefined && rewardPointsError === "") {
      try {
        const surveyData = {
          logo: logoData?.data,
          title: values.surveytitle,
          reward_points: rewardPoints,
          createdby: values?.createdby,
          description: values?.surveydescription,
          category: surveyCategory,
        };

        let response;
        if (state !== null) {
          response = await editSurvey(state?._id, surveyData);
        } else {
          response = await createSurvey(surveyData);
        }

        console.log("response:===============>", response);
        if (response.data.success === true) {
          setSurveyResponse(response?.data?.survey);
          localStorage.setItem(
            "survey_response",
            JSON.stringify(response?.data?.survey)
          );
        } else {
          showAlertMessage({
            type: "error",
            message: response?.message,
            show: true,
          });
          setCurrent(0);
        }
      } catch (error) {
        showAlertMessage({
          type: "error",
          message: error?.response?.data?.message || error.message,
          show: true,
        });
        setCurrent(0);
      }
      state === null && setQuestions([]);
      setQuestionError("");
      next();
    } else {
      setLogoError("Logo is required");
    }
  };

  const handleAddQuestion = async () => {
    validateQuestion(questionText);
    const uniqueAnswers = [
      ...new Set(
        answerOptions.filter((item) => item !== undefined && item !== "")
      ),
    ];

    if (questionText !== "") {
      if (answerType === "multiple_choice") {
        if (
          uniqueAnswers.length >= 2 &&
          choiceError1 === "" &&
          choiceError0 === ""
        ) {
          try {
            setLoader(true);
            if (editQuestion !== null) {
              const questionData = {
                surveyId: localSurveyResponse
                  ? localSurveyResponse?._id
                  : surveyResponse?._id,
                questionText: questionText,
                questionType: answerType,
                options: uniqueAnswers,
              };
              console.log("addQuestionReq===>", questionData);
              const response = await editQuestions(
                questionData,
                editQuestion?._id
              );
              showAlertMessage({
                type: "success",
                message: response?.data?.message,
                show: true,
              });
              setEditQuestion(null);
              console.log("editQuestionRes===>", response);
            } else {
              const questionData = {
                surveyId: localSurveyResponse
                  ? localSurveyResponse?._id
                  : surveyResponse?._id,
                questions: [
                  {
                    questionText: questionText,
                    questionType: answerType,
                    options: uniqueAnswers,
                  },
                ],
              };
              console.log("addQuestionReq===>", questionData);
              const response = await createQuestions(questionData);
              console.log("createQuestionRes===>", response);
            }
            fetchQuestions();
          } catch (error) {
            console.log("error===>", error);
            showAlertMessage({
              type: "error",
              message: error?.response?.data?.message || error.message,
              show: true,
            });
          } finally {
            setLoader(false);
          }
        } else if (option0 === "" || option1 === "") {
          if (option0 === "") setchoiceError0("This choice is required");
          if (option1 === "") setchoiceError1("This choice is required");
          return;
        } else if (option0 === option1) {
          setchoiceError1("This choice must be different");
          return;
        }
      } else {
        try {
          setLoader(true);
          if (editQuestion !== null) {
            const questionData = {
              surveyId: localSurveyResponse
                ? localSurveyResponse?._id
                : surveyResponse?._id,
              questionText: questionText,
              questionType: answerType,
            };
            console.log("addQuestionReq===>", questionData);
            const response = await editQuestions(
              questionData,
              editQuestion?._id
            );
            setEditQuestion(null);
            console.log("editQuestionRes===>", response);
          } else {
            const questionData = {
              surveyId: localSurveyResponse
                ? localSurveyResponse?._id
                : surveyResponse?._id,
              questions: [
                {
                  questionText: questionText,
                  questionType: answerType,
                },
              ],
            };
            const response = await createQuestions(questionData);
            console.log("createQuestionRes===>", response);
          }
        } catch (error) {
          console.log("error===>", error);
          showAlertMessage({
            type: "error",
            message: error?.response?.data?.message || error.message,
            show: true,
          });
        } finally {
          setLoader(false);
        }
      }
      fetchQuestions();
      setchoiceError0("");
      setchoiceError1("");
      setOption0("");
      setOption1("");
      setShowAddQuestion(false);
      setQuestionText("");
      setQuestionError("");
      setAnswerType("multiple_choice"); // Reset answer type
      if (editQuestion === null) {
        setInputCount(2); // Reset input count
      }
      setAnswerOptions([]);
    } else {
      setQuestionError("Question text is required");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Wallet form Failed:", errorInfo);
    validateRewardPoints(rewardPoints);
    logoData === null && setLogoError("Logo is required");
  };

  const AddTextInput = () => {
    if (inputCount < 8) {
      setInputCount((prevCount) => prevCount + 1);
      setAnswerOptions((prevValues) => [...prevValues, ""]);
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 0);
    }
  };

  const RemoveTextInput = (index) => {
    if (inputCount > 2) {
      setInputCount((prevCount) => prevCount - 1);
      setAnswerOptions((prevValues) =>
        prevValues.filter((_, i) => i !== index)
      );
    }
  };

  const handleInputChange = (index, event) => {
    if (index === 0) {
      setOption0(event.target.value);
    } else if (index === 1) {
      setOption1(event.target.value);
    }
    const newValue = event.target.value;
    const newValues = [...answerOptions];

    newValues[index] = newValue;
    setAnswerOptions(newValues);

    // Clear previous error messages for the specific index
    if (index === 0) {
      if (newValue === "") {
        setchoiceError0("This choice is required");
      } else {
        setchoiceError0("");
      }
    }

    if (index === 1) {
      if (newValue === "") {
        setchoiceError1("This choice is required");
      } else {
        setchoiceError1("");
      }
    }

    // Optional: Log for debugging
    console.log("index====", index);
    console.log("event123====", event);
  };

  const validateQuestion = (text) => {
    console.log("text=======", text);
    if (!text) {
      setQuestionError("Please Enter question");
    } else {
      setQuestionError("");
    }
  };

  const handleCreateSurvey = async () => {
    setLoader(true);
    try {
      const publishSurvey = {
        surveyId:
          state !== null
            ? state?._id
            : localSurveyResponse
            ? localSurveyResponse?._id
            : surveyResponse?._id,
        surveylink: surveyLink,
      };

      let response;
      if (state?.surveyresponse.length > 0) {
        response = await editSurveyWithLinkresponse(publishSurvey);
      } else if (state?.surveyresponse.length === 0) {
        response = await submitUpdateSurvey(publishSurvey);
      } else if (state === null) {
        response = await submitSurvey(publishSurvey);
      }

      console.log("response:===============>", response);
      if (response.data.success === true) {
        showAlertMessage({
          type: "success",
          message: response?.data?.message,
          show: true,
        });
        next();
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

  const handleDeleteItem = async (item) => {
    try {
      const response = await deleteQuestions(item?._id);
      console.log("delete res==========", response);
      if (response?.data?.success) {
        showAlertMessage({
          type: "success",
          message: response?.data?.message,
          show: true,
        });
      }
    } catch (error) {
      console.log("error", error);
      showAlertMessage({
        type: "error",
        message: error?.response?.data?.message || error.message,
        show: true,
      });
      setCurrent(0);
    } finally {
      fetchQuestions();
    }
  };

  const onFileChange = (info) => {
    logoUpload({
      info,
      setLogoData,
      uploadLogo,
      showAlertMessage,
      setLoader,
    });
    setLogoError("");
  };

  const validateRewardPoints = (text) => {
    if (text === "") {
      setRewardPointsError("Reward points are required");
    } else if (parseInt(text) > 500) {
      setRewardPointsError("Reward points must be less than 500.");
    } else {
      setRewardPointsError("");
    }
  };

  const handleEditQuestion = async (item) => {
    setQuestionError("");
    setchoiceError0("");
    setchoiceError1("");
    setEditQuestion(item);
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 0);

    console.log("editQuestion======>", item);
  };

  const handleSwapQuestion = async (item, value) => {
    try {
      const data = {
        surveyId: localSurveyResponse
          ? localSurveyResponse?._id
          : surveyResponse?._id,
        questionId: item?._id,
        direction: value,
      };
      const response = await swapQuestions(data);
      console.log("response:===============>", response);
      if (response.status === 200) {
        fetchQuestions();
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
      fetchQuestions();
    }
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateSurveyTitle = (rule, value) => {
    if (!value) {
      return Promise.reject("Survey Title is required");
    } else if (value.length > 125) {
      return Promise.reject("Survey Title cannot exceed 125 characters");
    } else if (value.length < 5) {
      return Promise.reject("Survey Title must be at least 5 characters");
    }
    return Promise.resolve();
  };

  const validateSurveyDescription = (rule, value) => {
    if (!value) {
      return Promise.reject("Survey Description is required");
    } else if (value.length > 255) {
      return Promise.reject("Survey Description cannot exceed 255 characters");
    } else if (value.length < 5) {
      return Promise.reject("Survey Description must be at least 5 characters");
    }
    return Promise.resolve();
  };

  const validateCreatedBy = (rule, value) => {
    if (!value) {
      return Promise.reject("Please Provide Survey Creator Name");
    } else if (value.length > 35) {
      return Promise.reject(
        "Survey Creator Name must be less than 35 characters"
      );
    } else if (value.length < 3) {
      return Promise.reject(
        "Survey Creator Name must be greater than 3 characters"
      );
    }
    return Promise.resolve();
  };

  const handleFormChange = (changedValues, allValues) => {
    console.log("Changed values:", changedValues);
    console.log("All form values:", allValues);
    setEditValuesChanged(true);
  };

  const handleAddExcelQuestions = async (data) => {
    console.log("addExcelQuestions=======", data);

    const convertedResponse = {
      surveyId: localSurveyResponse
        ? localSurveyResponse?._id
        : surveyResponse?._id,
      questions: [],
    };

    // Iterate through the data array and validate each item
    for (const item of data) {
      let questionObject = {
        questionText: item?.Question,
        questionType: item?.Question_Type?.toLowerCase()
          .trim()
          .replace("multi_choice", "multiple_choice"),
      };

      if (item.Question_Type === "Multi_Choice") {
        const options = [];
        for (let i = 1; i <= item.OPNumber; i++) {
          if (item[`OP${i}`]) {
            options.push(item[`OP${i}`]);
          }
        }

        // Validation for minimum 2 and maximum 6 options
        if (options.length < 2 || options.length > 6) {
          showAlertMessage({
            type: "error",
            message: "Invalid Options Count",
            show: true,
          });
          return; // Exit the function if there is a validation error
        }

        questionObject.options = options;
      }

      // Add the validated question object to the questions array
      convertedResponse.questions.push(questionObject);
    }

    console.log("convertedResponse===============", convertedResponse);

    // Proceed only if all questions are valid
    try {
      const response = await createQuestions(convertedResponse);
      console.log("createQuestionRes===>", response);
    } catch (error) {
      console.log("error===>", error);
      showAlertMessage({
        type: "error",
        message: error?.response?.data?.message || error.message,
        show: true,
      });
    } finally {
      fetchQuestions();
    }
  };

  const handleFileChange = (info) => {
    const { file } = info;

    if (!file) return;

    const reader = new FileReader();
    setExcelLoader(true);

    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      setExcelData(jsonData);

      const requiredHeadings = ["Question", "Question_Type", "OPNumber"];

      // Extract headings from the first row of the Excel data
      const extractedHeadings = Object.keys(jsonData[0]);

      console.log("extractedHeadings=====", extractedHeadings);

      // Check if all required headings are present in the extracted headings
      const isValid = requiredHeadings?.every((heading) =>
        extractedHeadings.includes(heading)
      );

      if (!isValid) {
        console.log("Invalid Excel file: Required headings missing");
        showAlertMessage({
          type: "error",
          message: "Invalid Excel file: Required headings missing.",
          show: true,
        });
        setLoader(false);
        return;
      }
      handleAddExcelQuestions(jsonData);
      setExcelLoader(false);
    };

    reader.onerror = () => {
      console.log("Error reading file");
      setLoader(false);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <>
      <div className="create">
        <div className="container">
          <div className="create__title">
            <Link to="/">
              <img src={backImg} alt="" />
            </Link>
            <h3>Create survey</h3>
          </div>
          <div className="create__row">
            <Row gutter={16} justify="center">
              <Col
                className="gutter-row"
                xs={24}
                sm={24}
                md={24}
                lg={20}
                xl={14}
              >
                <div className="create__steps">
                  <div id="custom-step">
                    <Steps current={current} direction="horizontal">
                      <Step title="Basic detail" />
                      <Step title="Add Questions" />
                      <Step title="Submit" />
                    </Steps>
                    <div className="steps-content">
                      {current === 0 && (
                        <div className="create__step-box">
                          <div className="create__new">
                            <h4>New survey</h4>

                            <div className="create__upload">
                              <div className="create__label">
                                <p>Upload logo</p>
                                <Tooltip
                                  placement="top"
                                  title={"Max size of logo can be 5MB."}
                                >
                                  <img src={infoImg} alt="" />
                                </Tooltip>
                              </div>
                              <div id="custom-upload">
                                <div className="custom-file">
                                  <div class="custom-file__box">
                                    <div class="custom-file__center-survey">
                                      <img
                                        src={logoData?.data ?? profileImg}
                                        alt=""
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
                                  <Button
                                    loading={loader}
                                    className="default-btn"
                                  >
                                    Upload
                                  </Button>
                                </Upload>
                                {logoData?.data && (
                                  <Button
                                    className="outline-btn"
                                    onClick={() => {
                                      setLogoData(null);
                                    }}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                              {logoError && (
                                <div className="ant-form-item-explain-error">
                                  {logoError}
                                </div>
                              )}
                            </div>
                            <div className="create__form" id="auth-form">
                              <Form
                                labelCol={{
                                  span: 24,
                                }}
                                wrapperCol={{
                                  span: 24,
                                }}
                                onFinish={handleFirstSlide}
                                onFinishFailed={onFinishFailed}
                                onValuesChange={(changedValues, allValues) =>
                                  handleFormChange(changedValues, allValues)
                                }
                                autoComplete="off"
                                form={form}
                              >
                                <Form.Item
                                  label="Survey title"
                                  name="surveytitle"
                                  rules={[
                                    {
                                      validator: validateSurveyTitle,
                                    },
                                  ]}
                                  initialValue={
                                    localSurveyResponse
                                      ? localSurveyResponse?.title
                                      : surveyResponse?.title
                                  }
                                >
                                  <Input placeholder="Enter Survey Title" />
                                </Form.Item>
                                <Form.Item
                                  label="Survey Description"
                                  name="surveydescription"
                                  rules={[
                                    {
                                      validator: validateSurveyDescription,
                                    },
                                  ]}
                                  initialValue={
                                    localSurveyResponse
                                      ? localSurveyResponse?.description
                                      : surveyResponse?.description
                                  }
                                >
                                  <Input placeholder="Enter Survey Description" />
                                </Form.Item>
                                <Form.Item
                                  label="Created by"
                                  name="createdby"
                                  rules={[
                                    {
                                      validator: validateCreatedBy,
                                    },
                                  ]}
                                >
                                  <Input placeholder="Enter here" />
                                </Form.Item>
                                <Form.Item
                                  label="Reward point"
                                  name="Rewardpoints"
                                  initialValue={
                                    localSurveyResponse
                                      ? localSurveyResponse?.rewardpoints
                                      : surveyResponse?.rewardpoints
                                  }
                                >
                                  <Input
                                    value={rewardPoints}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(
                                        /[^0-9]/g,
                                        ""
                                      );
                                      setRewardPoints(value);
                                      validateRewardPoints(value);
                                    }}
                                    type="text"
                                    placeholder="eg: 100 or 150"
                                    maxLength={3}
                                  />
                                  {rewardPointsError && (
                                    <div className="ant-form-item-explain-error">
                                      {rewardPointsError}
                                    </div>
                                  )}
                                </Form.Item>
                                <Form.Item label="Survey category">
                                  <Select
                                    placeholder="Select"
                                    suffixIcon={
                                      <img
                                        src={downImg}
                                        alt="survey category"
                                      />
                                    }
                                    value={surveyCategory}
                                    options={categoryOptions}
                                    onChange={(option) => {
                                      setSurveyCategory(option);
                                    }}
                                  />
                                </Form.Item>

                                <div className="create__btn ml-0">
                                  <Button
                                    className="default-btn"
                                    htmlType="submit"
                                    disabled={loader}
                                  >
                                    {state !== null
                                      ? editValuesChanged ||
                                        rewardPoints !== state?.reward_points ||
                                        surveyCategory !== state?.category ||
                                        logoData?.data !== state?.logo
                                        ? "Update Survey"
                                        : "Next"
                                      : "Create survey"}
                                  </Button>
                                  <Button
                                    className="outline-btn"
                                    onClick={() => {
                                      navigate("/");
                                      localStorage.removeItem(
                                        "survey_response"
                                      );
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </Form>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* question div */}
                      {current === 1 && questions?.length > 0 && (
                        <div className="create__step-box">
                          {questions?.map((item, index) => {
                            return (
                              <div className="create__list" key={index}>
                                <ul>
                                  <li>
                                    <div className="create__list-flex">
                                      <div className="create__list-head">
                                        <img src={dotImg} alt="" />
                                        <h4>{`Question ${index + 1}`}</h4>
                                      </div>
                                      <div className="create__list-btn">
                                        <div className="create__arrow-btn">
                                          <Button
                                            onClick={() => {
                                              handleSwapQuestion(item, "up");
                                            }}
                                          >
                                            <img src={uparrow} alt="" />
                                          </Button>
                                          <Button
                                            onClick={() => {
                                              handleSwapQuestion(item, "down");
                                            }}
                                          >
                                            <img src={downarrow} alt="" />
                                          </Button>
                                        </div>
                                        <Button
                                          onClick={() => {
                                            handleEditQuestion(item);
                                            setShowAddQuestion(true);
                                          }}
                                        >
                                          <img src={editImg} alt="" />
                                        </Button>
                                        <Button
                                          onClick={() => {
                                            handleDeleteItem(item);
                                          }}
                                        >
                                          <img src={deleteImg} alt="" />
                                        </Button>
                                      </div>
                                    </div>
                                    <h4>{item.questionText}</h4>
                                    {item.questionType === "text" ? (
                                      <Form.Item>
                                        <Input disabled={true} />
                                      </Form.Item>
                                    ) : (
                                      <div className="create__option-list">
                                        {item.options?.map(
                                          (option, optIndex) => (
                                            <div
                                              className="create__option"
                                              key={optIndex}
                                            >
                                              <span></span>
                                              <p>{option}</p>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </li>
                                </ul>
                              </div>
                            );
                          })}
                          {!showAddNewQuestion ? (
                            <>
                              <div className="create__add-btn">
                                <Button
                                  onClick={() => {
                                    setShowAddQuestion(true);
                                    setQuestionText("");
                                    setQuestionError("");
                                    setAnswerOptions([]);
                                    setInputCount(2);
                                    setchoiceError0("");
                                    setchoiceError1("");
                                    setTimeout(() => {
                                      window.scrollTo({
                                        top: document.documentElement
                                          .scrollHeight,
                                        behavior: "smooth",
                                      });
                                    }, 0);
                                  }}
                                >
                                  + Add New Question
                                </Button>
                              </div>
                              <div className="create__submit-btn">
                                <Button
                                  className="default-btn"
                                  onClick={() => {
                                    next();
                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                  }}
                                >
                                  Done
                                </Button>
                                <Button
                                  className="outline-btn"
                                  onClick={prev}
                                  disabled={state !== null}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div>
                              <div className="create__head">
                                <h3>Add Question</h3>
                                {questions?.length > 0 && (
                                  <Button
                                    className="outline-btn"
                                    onClick={() => {
                                      fetchQuestions();
                                      next();
                                      setTimeout(() => {
                                        window.scrollTo({
                                          top: 0,
                                          behavior: "smooth",
                                        });
                                      }, 0);
                                    }}
                                  >
                                    Preview
                                  </Button>
                                )}
                              </div>
                              <div className="create__form" id="auth-form">
                                <Form
                                  labelCol={{
                                    span: 24,
                                  }}
                                  wrapperCol={{
                                    span: 24,
                                  }}
                                  onFinishFailed={onFinishFailed}
                                  autoComplete="off"
                                >
                                  <div className="create__top">
                                    <h4>Question</h4>
                                    <Form.Item label="Enter your question">
                                      <Input
                                        value={questionText}
                                        onChange={(e) => {
                                          setQuestionText(e.target.value);
                                          validateQuestion(e.target.value);
                                        }}
                                      />
                                      {questionError && (
                                        <div className="ant-form-item-explain-error">
                                          {questionError}
                                        </div>
                                      )}
                                    </Form.Item>
                                    <Form.Item label="Select answer type">
                                      <Select
                                        placeholder="Select"
                                        suffixIcon={
                                          <img
                                            src={downImg}
                                            alt="survey answer"
                                          />
                                        }
                                        value={answerType}
                                        onChange={(option) => {
                                          setAnswerType(option);
                                        }}
                                        options={[
                                          {
                                            value: "multiple_choice",
                                            label: "Multiple Choice",
                                          },
                                          {
                                            value: "text",
                                            label: "Text Box",
                                          },
                                        ]}
                                      />
                                    </Form.Item>
                                  </div>

                                  {answerType === "multiple_choice" ? (
                                    <div className="create__btm">
                                      {[...Array(inputCount)].map(
                                        (_, index) => (
                                          <div
                                            className="create__form-flex"
                                            key={index}
                                          >
                                            <Form.Item
                                              label={`Enter an answer choice ${
                                                index + 1
                                              }`}
                                            >
                                              <Input
                                                value={answerOptions[index]}
                                                onChange={(event) =>
                                                  handleInputChange(
                                                    index,
                                                    event
                                                  )
                                                }
                                              />
                                              {index === 0 && choiceError0 && (
                                                <div className="ant-form-item-explain-error">
                                                  {choiceError0}
                                                </div>
                                              )}
                                              {index === 1 && choiceError1 && (
                                                <div className="ant-form-item-explain-error">
                                                  {choiceError1}
                                                </div>
                                              )}
                                            </Form.Item>

                                            <Button
                                              type="primary"
                                              onClick={AddTextInput}
                                            >
                                              <img src={addImg} alt="Add" />
                                            </Button>
                                            <Button
                                              type="danger"
                                              onClick={() =>
                                                RemoveTextInput(index)
                                              }
                                            >
                                              <img src={minusImg} alt="Minus" />
                                            </Button>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ) : null}
                                  <div className="create__btn">
                                    <Button
                                      className="default-btn"
                                      onClick={handleAddQuestion}
                                      loading={loader}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      className="outline-btn"
                                      onClick={() => {
                                        // setCurrent(0);
                                        setShowAddQuestion(false);
                                        // prev();
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
                      )}

                      {current === 1 && questions?.length === 0 && (
                        <div className="create__step-box">
                          <div className="create__head">
                            <h3>Add Question</h3>
                            <Upload
                              name="excelFile"
                              accept=".xls,.xlsx,.xlsm,.xlsb,.xlt,.xltx,.xltm,.csv"
                              beforeUpload={() => false}
                              disabled={loader}
                              onChange={handleFileChange}
                              showUploadList={false}
                            >
                              <Button
                                loading={excelloader}
                                className="default-btn"
                              >
                                Import
                              </Button>
                            </Upload>
                            {questions?.length > 0 && (
                              <Button
                                className="outline-btn"
                                onClick={() => next()}
                              >
                                Preview
                              </Button>
                            )}
                          </div>
                          <div className="create__form" id="auth-form">
                            <Form
                              labelCol={{
                                span: 24,
                              }}
                              wrapperCol={{
                                span: 24,
                              }}
                              onFinishFailed={onFinishFailed}
                              autoComplete="off"
                            >
                              <div className="create__top">
                                <h4>Question</h4>
                                <Form.Item label="Enter your question">
                                  <Input
                                    value={questionText}
                                    onChange={(e) => {
                                      setQuestionText(e.target.value);
                                      validateQuestion(e.target.value);
                                    }}
                                  />
                                  {questionError && (
                                    <div className="ant-form-item-explain-error">
                                      {questionError}
                                    </div>
                                  )}
                                </Form.Item>
                                <Form.Item label="Select answer type">
                                  <Select
                                    placeholder="Select"
                                    suffixIcon={
                                      <img src={downImg} alt="survey answer" />
                                    }
                                    value={answerType}
                                    onChange={(option) => {
                                      setAnswerType(option);
                                    }}
                                    options={[
                                      {
                                        value: "multiple_choice",
                                        label: "Multiple Choice",
                                      },
                                      {
                                        value: "text",
                                        label: "Text Box",
                                      },
                                    ]}
                                  />
                                </Form.Item>
                              </div>

                              {answerType === "multiple_choice" ? (
                                <div className="create__btm">
                                  {[...Array(inputCount)].map((_, index) => (
                                    <div
                                      className="create__form-flex"
                                      key={index}
                                    >
                                      <Form.Item
                                        label={`Enter an answer choice ${
                                          index + 1
                                        }`}
                                      >
                                        <Input
                                          value={answerOptions[index]}
                                          onChange={(event) =>
                                            handleInputChange(index, event)
                                          }
                                        />
                                        {choiceError0 && index === 0 && (
                                          <div className="ant-form-item-explain-error">
                                            {choiceError0}
                                          </div>
                                        )}
                                        {choiceError1 && index === 1 && (
                                          <div className="ant-form-item-explain-error">
                                            {choiceError1}
                                          </div>
                                        )}
                                      </Form.Item>

                                      <Button
                                        type="primary"
                                        onClick={AddTextInput}
                                      >
                                        <img src={addImg} alt="Add" />
                                      </Button>
                                      <Button
                                        type="danger"
                                        onClick={() => RemoveTextInput(index)}
                                      >
                                        <img src={minusImg} alt="Minus" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                              <div className="create__btn">
                                <Button
                                  className="default-btn"
                                  onClick={handleAddQuestion}
                                >
                                  Save
                                </Button>
                                <Button
                                  className="outline-btn"
                                  onClick={() => {
                                    setCurrent(0);
                                    setShowAddQuestion(false);
                                    prev();
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </Form>
                          </div>
                        </div>
                      )}

                      {current === 2 && (
                        <div className="create__step-box">
                          <div className="create__final">
                            <div className="create__final-title">
                              <h3>Are you sure?</h3>
                              <div className="create__two-btn">
                                <Button
                                  className="default-btn"
                                  onClick={handleCreateSurvey}
                                  loading={loader}
                                >
                                  {state !== null ? "Update" : "Publish"}
                                </Button>
                                <Button
                                  className="outline-btn"
                                  onClick={() => prev()}
                                  disabled={loader}
                                >
                                  Back
                                </Button>
                              </div>
                            </div>
                            {questions?.map((item, index) => {
                              console.log("item========>", item);
                              return (
                                <div className="create__list" key={index}>
                                  <ul>
                                    {item?.questionType === "text" ? (
                                      <li>
                                        <div className="create__list-flex">
                                          <div className="create__list-head">
                                            <img src={dotImg} alt="" />
                                            <h4>{`Question ${index + 1}`}</h4>
                                          </div>
                                          <div className="create__list-btn">
                                            <div className="create__arrow-btn">
                                              <Button
                                                onClick={() => {
                                                  handleSwapQuestion(
                                                    item,
                                                    "up"
                                                  );
                                                }}
                                              >
                                                <img src={uparrow} alt="" />
                                              </Button>
                                              <Button
                                                onClick={() => {
                                                  handleSwapQuestion(
                                                    item,
                                                    "down"
                                                  );
                                                }}
                                              >
                                                <img src={downarrow} alt="" />
                                              </Button>
                                            </div>
                                            <Button
                                              onClick={() => {
                                                handleEditQuestion(item);
                                                setShowAddQuestion(true);
                                                setCurrent(1);
                                              }}
                                            >
                                              <img src={editImg} alt="" />
                                            </Button>
                                            <Button
                                              onClick={() => {
                                                handleDeleteItem(item);
                                              }}
                                            >
                                              <img src={deleteImg} alt="" />
                                            </Button>
                                          </div>
                                        </div>
                                        <h4>{item?.questionText}</h4>
                                        <Form.Item>
                                          <Input disabled={true} />
                                        </Form.Item>
                                      </li>
                                    ) : (
                                      <li>
                                        <div className="create__list-flex">
                                          <div className="create__list-head">
                                            <img src={dotImg} alt="" />
                                            <h4>{`Question ${index + 1}`}</h4>
                                          </div>
                                          <div className="create__list-btn">
                                            <div className="create__arrow-btn">
                                              <Button
                                                onClick={() => {
                                                  handleSwapQuestion(
                                                    item,
                                                    "up"
                                                  );
                                                }}
                                              >
                                                <img src={uparrow} alt="" />
                                              </Button>
                                              <Button
                                                onClick={() => {
                                                  handleSwapQuestion(
                                                    item,
                                                    "down"
                                                  );
                                                }}
                                              >
                                                <img src={downarrow} alt="" />
                                              </Button>
                                            </div>
                                            <Button
                                              onClick={() => {
                                                handleEditQuestion(item);
                                                setShowAddQuestion(true);
                                                setCurrent(1);
                                              }}
                                            >
                                              <img src={editImg} alt="" />
                                            </Button>
                                            <Button
                                              onClick={() => {
                                                handleDeleteItem(item);
                                              }}
                                            >
                                              <img src={deleteImg} alt="" />
                                            </Button>
                                          </div>
                                        </div>
                                        <h4>{item?.questionText}</h4>
                                        <div className="create__option-list">
                                          {item?.options?.map(
                                            (option, optIndex) => (
                                              <div
                                                className="create__option"
                                                key={optIndex}
                                              >
                                                <span></span>
                                                <p>{option}</p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              );
                            })}
                            <div className="create__add-btn">
                              <Button
                                onClick={() => {
                                  setQuestionText("");
                                  setQuestionError("");
                                  setAnswerOptions([]);
                                  setInputCount(2);
                                  setchoiceError0("");
                                  setchoiceError1("");
                                  prev();
                                  setShowAddQuestion(true);
                                  setTimeout(() => {
                                    window.scrollTo({
                                      top: document.body.scrollHeight,
                                      behavior: "smooth",
                                    });
                                  }, 0);
                                }}
                              >
                                + Add New Question
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3rd Slide */}
                      {current === 3 && (
                        <div className="">
                          <div className="create__step-box">
                            <div className="create__final">
                              <div className="create__final-title">
                                <h3>Share the link</h3>
                                <Link to="/surveys">
                                  <Button className="default-btn">Done</Button>
                                </Link>
                              </div>
                              <div className="create__final-card">
                                <div className="create__card-flex">
                                  <div className="dashboard__survey-flex">
                                    <div className="dashboard__survey-profile">
                                      <img
                                        src={
                                          localSurveyResponse
                                            ? localSurveyResponse?.logo
                                            : surveyResponse?.logo
                                        }
                                        alt="titleLogo"
                                      />
                                    </div>
                                    <div className="dashboard__survey-content">
                                      <h4>
                                        {localSurveyResponse
                                          ? localSurveyResponse?.title
                                          : surveyResponse?.title}
                                      </h4>
                                      <p>
                                        {localSurveyResponse
                                          ? localSurveyResponse?.description
                                          : surveyResponse?.description}
                                      </p>
                                      <div className="dashboard__survey-tag">
                                        <div className="create__total-response">
                                          <Link to="">
                                            <img src={linkImg} alt="" />
                                            <h5>
                                              {" "}
                                              {surveyLink
                                                .toString()
                                                .slice(0, 55)}
                                            </h5>
                                          </Link>
                                        </div>
                                        <div className="create__response">
                                          <Tooltip
                                            title={
                                              tooltipText[surveyLink] || "Copy"
                                            }
                                          >
                                            <Button
                                              onClick={() => {
                                                handleWalletAddressClick(
                                                  surveyLink,
                                                  setTooltipText
                                                );
                                              }}
                                            >
                                              <img src={copyImg} alt="" />
                                              <span>Copy</span>
                                            </Button>
                                          </Tooltip>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="create__scan">
                                <QRCode
                                  id="qrCodeEl"
                                  title={surveyLink}
                                  value={surveyLink}
                                  size={150}
                                />
                                <div className="create__download-btn">
                                  <Button
                                    onClick={() => {
                                      handleDownload();
                                    }}
                                  >
                                    <img src={downloadImg} alt="" />
                                    <span>Download QR</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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

export default CreateSurvey;
