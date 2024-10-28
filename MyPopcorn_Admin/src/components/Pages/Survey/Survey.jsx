import React, { useContext, useEffect, useRef, useState } from "react";
import "./Survey.scss";
import noDataImg from "../../../assets/img/icons/no-data.svg";
import downImg from "../../../assets/img/icons/down.svg";
import searchImg from "../../../assets/img/icons/search.svg";
import { Input, Select, Space, Button, Pagination } from "antd";
import rewardImg from "../../../assets/img/icons/reward.svg";
import infoImg from "../../../assets/img/icons/info.svg";
import flashImg from "../../../assets/img/icons/flash.svg";
import handImg from "../../../assets/img/icons/hand.svg";
import surveyImg from "../../../assets/img/icons/no-survey.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import profileImg from "../../../assets/img/profile-img.png";
import { surveyServices } from "../../../services/surveyServices";
import { Loader } from "../../../helpers/utility";
import downArrow from "../../../assets/img/icons/chevron-down.svg";
import upArrow from "../../../assets/img/icons/chevron-up.svg";
import { connectionProvider } from "../../../context/appProvider";

const Survey = () => {
  const { showAlertMessage } = useContext(connectionProvider);
  const { swapSurvey } = surveyServices();
  const navigate = useNavigate();
  const location = useLocation();
  const searchValue = useRef("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [surveyData, setSurveyData] = useState(null);
  console.log("surveyData=======,", surveyData);
  const { getAllSurveys } = surveyServices();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState("All");
  console.log("selectedvalue======", selectedValue);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 5;
  const [index, setIndex] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchData = async (page, setLoading) => {
    setCurrentPage(page);
    try {
      setLoading(true);
      const response = await getAllSurveys({
        page: searchValue?.current?.input?.value?.length > 0 ? 1 : page,
        key:
          searchValue?.current?.input?.value?.length > 0
            ? searchValue.current.input.value
            : null,
        status: selectedValue,
        limit: pageSize,
      });
      if (response.data.success) {
        setSurveyData(response?.data);
        setPageCount(response?.data?.count);
      } else {
        console.error("Failed to fetch fetchSurveys");
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveys = (page) => fetchData(page, setLoading);
  const fetchSearchSurveys = (page) => fetchData(page, setLoader);

  useEffect(() => {
    fetchSurveys(1);
  }, [location]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    fetchSearchSurveys(1);
  };

  const handleStatusChange = async (value) => {
    console.log("Selected value:", value);
    setSelectedValue(value);
    setCurrentPage(1);
    try {
      setLoader(true);
      const response = await getAllSurveys({
        page: 1,
        key:
          searchValue?.current?.input?.value?.length > 0
            ? searchValue.current.input.value
            : null,
        status: value,
        limit: pageSize,
      });
      if (response.data.success) {
        setSurveyData(response?.data);
        setPageCount(response?.data?.count);
      } else {
        console.error("Failed to fetch fetchSurveys");
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
    } finally {
      setLoader(false);
    }
  };

  const handleSwapSurvey = async (item, value) => {
    try {
      const data = {
        surveyId: item?._id,
        direction: value,
      };
      const response = await swapSurvey(data);
      console.log("response:===============>", response);
    } catch (error) {
      showAlertMessage({
        type: "error",
        message: error?.response?.data?.message || error.message,
        show: true,
      });
    } finally {
      fetchSearchSurveys(1);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Loader loading={loading}>
        <div className="surveys">
          <div className="container">
            <div className="dashboard__recent">
              <h3> surveys</h3>
              <Link to="/create-survey" className="default-btn">
                Create survey
              </Link>
            </div>
            <div className="surveys__row">
              <div className="dashboard__grid">
                <div className="dashboard__card">
                  <h4>Total Surveys Assigned</h4>
                  <h3>{surveyData?.totalSurveyCount ?? 0}</h3>
                </div>
                <div className="dashboard__card">
                  <h4>Total Survey Participated</h4>
                  <h3>{surveyData?.totalResponsesOverall ?? 0}</h3>
                </div>
                <div className="dashboard__card">
                  <h4>Total Reward Claimed</h4>
                  <h3 className="flex-center">
                    {" "}
                    <img src={rewardImg} alt="" />
                    {`${surveyData?.totalRewardPoints ?? 0} tPOP`}
                  </h3>
                </div>
              </div>
            </div>
            <div className="surveys__list">
              <div className="wallet__history-title">
                <h4>Survey List</h4>
                <div className="wallet__history">
                  <p>Filter</p>
                  <div id="custom-select">
                    <Select
                      placeholder="Select"
                      suffixIcon={<img src={downImg} alt="downImg" />}
                      options={[
                        {
                          value: "All",
                          label: "All",
                        },
                        {
                          value: true,
                          label: "Active",
                        },
                        {
                          value: false,
                          label: "InActive",
                        },
                      ]}
                      value={selectedValue}
                      onChange={handleStatusChange}
                    />
                  </div>
                  <div id="custom-search">
                    <Space.Compact>
                      <Input
                        ref={searchValue}
                        addonAfter={<img src={searchImg} alt="SearchImg" />}
                        placeholder="Search by name etc."
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </Space.Compact>
                  </div>
                </div>
              </div>
              <div className="surveys__list-row">
                <div className="dashboard__survey-list">
                  {surveyData?.data?.length > 0 ? (
                    <ul>
                      {surveyData.data.map((item, i) => (
                        <li key={i}>
                          <div
                            className="dashboard__survey-flex"
                            onClick={() => {
                              navigate("/survey-details", { state: item });
                            }}
                          >
                            <div className="dashboard__survey-profile">
                              <img src={item.logo} alt="" />
                            </div>
                            <div className="dashboard__survey-content">
                              <h4>{item.title}</h4>
                              <div
                                className={`table-overflows ${
                                  index === i ? "expanded" : ""
                                }`}
                              >
                                <p>{item.description}</p>
                                {item?.description?.length > 100 && (
                                  <Button
                                    className="see-more-button"
                                    onClick={(event) => {
                                      if (index === i) {
                                        setIndex(null);
                                      } else {
                                        setIndex(i);
                                      }
                                      event.stopPropagation();
                                      setIsExpanded(!isExpanded);
                                    }}
                                  >
                                    {index === i ? "View Less" : "View More"}
                                  </Button>
                                )}
                              </div>

                              <div className="dashboard__survey-tag">
                                <span
                                  className={
                                    item.status ? "active" : "inactive"
                                  }
                                >
                                  {item.status ? "Active" : "InActive"}
                                </span>
                                <div className="dashboard__total-response">
                                  <img src={handImg} alt="" />
                                  <h5>{`${item.totalResponses} Total responses`}</h5>
                                </div>
                                <div className="dashboard__response">
                                  <img src={flashImg} alt="" />
                                  <h5>{`${item.responsesLast24Hours} responses in the past 24hrs`}</h5>
                                </div>
                              </div>
                              <div className="dashboard__created">
                                <h5>
                                  Created by - <span>{item?.createdby}</span>
                                </h5>
                              </div>
                            </div>
                          </div>
                          <div className="surveys__arrow-btn">
                            <Button
                              onClick={() => {
                                handleSwapSurvey(item, "down");
                              }}
                            >
                              <img src={upArrow} alt="" />
                            </Button>
                            <Button
                              onClick={() => {
                                handleSwapSurvey(item, "up");
                              }}
                            >
                              <img src={downArrow} alt="" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    !loader && (
                      <div className="center-loader">
                        <img src={noDataImg} alt="No data available" />
                      </div>
                    )
                  )}
                  {loader && (
                    <div className="center-loader">
                      <div className="loader"></div>
                    </div>
                  )}
                </div>

                {!loading && !loader && pageCount > 5 ? (
                  <div className="common-page">
                    <Pagination
                      defaultCurrent={1}
                      current={currentPage}
                      total={pageCount}
                      pageSize={pageSize}
                      onChange={(e) => {
                        fetchSurveys(e);
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Loader>
    </>
  );
};

export default Survey;
