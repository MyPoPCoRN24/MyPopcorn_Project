import React, { useContext, useEffect, useState } from "react";
import "./Dashboard.scss";
import noDataImg from "../../../assets/img/icons/no-data.svg";
import infoImg from "../../../assets/img/icons/info.svg";
import rewardImg from "../../../assets/img/icons/reward.svg";
import flashImg from "../../../assets/img/icons/flash.svg";
import handImg from "../../../assets/img/icons/hand.svg";
import calenderImg from "../../../assets/img/icons/calendar.svg";
import topImg from "../../../assets/img/icons/raise.svg";
import { Button, Col, Row } from "antd";
import profileImg from "../../../assets/img/profile-img.png";
import chartImg from "../../../assets/img/chart.png";
import BarChart from "../BarChart/BarChart";
import { Link, useLocation } from "react-router-dom";
import { profileServices } from "../../../services/profileServices";
import { connectionProvider } from "../../../context/appProvider";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../../helpers/utility";

const Dashboard = () => {
  const navigate = useNavigate();
  const { getDashboardData } = profileServices();
  const { showAlertMessage } = useContext(connectionProvider);
  const [dashboardData, setDashboardData] = useState(null);
  const [index, setIndex] = useState(null);
  console.log("index======>", index);

  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getDashboardData();
      if (response.data.success) {
        setDashboardData(response?.data?.data);
        localStorage.setItem(
          "dashboardData",
          JSON.stringify(response?.data?.data)
        );
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
    fetchDashboardData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Loader loading={loading}>
        <div className="dashboard">
          <div className="container">
            <div className="dashboard__title">
              <h2>Dashboard</h2>
            </div>
            <div className="dashboard__row">
              <Row gutter={32}>
                <Col
                  className="gutter-row"
                  xs={24}
                  sm={24}
                  md={12}
                  lg={9}
                  xl={8}
                >
                  <div className="dashboard__left">
                    <div className="dashboard__left-title">
                      <h3>User Activity</h3>
                      <div className="dashboard__activity">
                        <img src={calenderImg} alt="" />
                        <p>Last 7 days</p>
                      </div>
                    </div>
                    <div className="dashboard__chart-flex">
                      <div className="dashboard__chart-value">
                        <h3>{dashboardData?.totalUsers}</h3>
                        <span>Total Users</span>
                      </div>
                      <div className="dashboard__chart-icon">
                        <p>
                          <span className="new"></span> New User
                        </p>
                        <p>
                          <span className="old"></span> Old User
                        </p>
                      </div>
                    </div>
                    <div className="dashboard__chart">
                      {/* <img src={chartImg} alt="" /> */}
                      <BarChart chartData={dashboardData?.dailyUserActivity} />
                    </div>
                    <div className="dashboard__count">
                      <div className="dashboard__count-flex">
                        <h4>Top Survey</h4>
                        <p>Count</p>
                      </div>
                      <div className="dashboard__count-list">
                        <ul>
                          {dashboardData?.surveyResponses?.map(
                            (item, index) => (
                              <li key={index}>
                                <div className="dashboard__count-profile">
                                  <div className="dashboard__survey-profile">
                                    <img src={item?.logo} alt="" />
                                  </div>
                                  <div className="dashboard__count-content">
                                    <h4>{item?.title}</h4>
                                    <p>{item?.description}</p>
                                  </div>
                                </div>
                                <div className="dashboard__count-value">
                                  <p>{item?.totalResponses}</p>
                                </div>
                              </li>
                            )
                          )}
                          {!loading &&
                            dashboardData?.surveyResponses?.length === 0 && (
                              <div className="center-loader">
                                <img src={noDataImg} alt="No data" />
                              </div>
                            )}
                        </ul>
                      </div>
                      {loading && (
                        <div className="center-loader">
                          <div className="loader"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
                <Col
                  className="gutter-row"
                  xs={24}
                  sm={24}
                  md={12}
                  lg={15}
                  xl={16}
                >
                  <div className="dashboard__right">
                    <div className="dashboard__grid">
                      <div className="dashboard__card">
                        <h4>No.of Survey Created</h4>
                        <h3>{dashboardData?.totalSurveys}</h3>
                      </div>
                      <div className="dashboard__card">
                        <h4>Total Reward Claimed</h4>

                        <h3 className="flex-center">
                          {" "}
                          <img src={rewardImg} alt="" />
                          {`${dashboardData?.totalRewardPoints ?? 0} tPOP`}
                        </h3>
                      </div>
                    </div>
                    <div className="dashboard__view-btn">
                      <Link to="/top-result">
                        <img src={topImg} alt="" />
                        <span>View top survey results</span>
                      </Link>
                    </div>
                    <div className="dashboard__survey">
                      <div className="dashboard__recent">
                        <h3>Recent surveys</h3>
                        <Link to="/create-survey" className="default-btn">
                          Create survey
                        </Link>
                      </div>
                      <div className="dashboard__survey-list">
                        <ul>
                          {dashboardData?.recentSurveys?.map((item, i) => (
                            <li
                              key={i}
                              onClick={() => {
                                navigate("/survey-details", { state: item });
                              }}
                            >
                              <div className="dashboard__survey-flex">
                                <div className="dashboard__survey-profile">
                                  <img src={item?.logo} alt="" />
                                </div>
                                <div className="dashboard__survey-content">
                                  <h4>{item?.title}</h4>
                                  <div
                                    className={`table-overflows ${
                                      index === i ? "expanded" : ""
                                    }`}
                                  >
                                    <p>{item?.description}</p>
                                    {item?.description?.length > 100 && (
                                      <Button
                                        className="see-more-button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          if (index === i) {
                                            setIndex(null);
                                          } else {
                                            setIndex(i);
                                          }
                                        }}
                                      >
                                        {index === i
                                          ? "View Less"
                                          : "View More"}
                                      </Button>
                                    )}
                                  </div>

                                  <div className="dashboard__survey-tag">
                                    <span
                                      className={
                                        item.status ? "active" : "inactive"
                                      }
                                    >
                                      {item?.status === true
                                        ? "Active"
                                        : "InActive"}
                                    </span>
                                    <div className="dashboard__total-response">
                                      <img src={handImg} alt="" />
                                      <h5>{`${item?.totalResponses} Total responses`}</h5>
                                    </div>
                                    <div className="dashboard__response">
                                      <img src={flashImg} alt="" />
                                      <h5>{`${item?.recentResponses} responses in the past 24hrs`}</h5>
                                    </div>
                                  </div>
                                  <div className="dashboard__created">
                                    <h5>
                                      Created by -{" "}
                                      <span>{item?.createdby}</span>
                                    </h5>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        {loading && (
                          <div className="center-loader">
                            <div className="loader"></div>
                          </div>
                        )}
                        {!loading &&
                          dashboardData?.recentSurveys?.length === 0 && (
                            <div className="center-loader">
                              <img src={noDataImg} alt="No data" />
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
      </Loader>

      {/* <div className="page-loader">
        <div class="loading"></div>
      </div> */}
    </>
  );
};

export default Dashboard;
