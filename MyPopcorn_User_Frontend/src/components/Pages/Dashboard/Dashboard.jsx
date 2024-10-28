import React, { createContext, useContext, useEffect, useState } from "react";
import "./Dashboard.scss";
import { Button, Col, Row } from "antd";
import viewImg from "../../../assets/img/icons/view-link.svg";
import profileImg from "../../../assets/img/profile-img.png";
import handImg from "../../../assets/img/icons/hand.svg";
import noDataImg from "../../../assets/img/icons/no-data.svg";
import assignImg from "../../../assets/img/icons/assign.svg";
import participateImg from "../../../assets/img/icons/participated.svg";
import calenderImg from "../../../assets/img/icons/calendar.svg";
import LineChart from "../LineChart/LineChart";
import { useNavigate } from "react-router-dom";
import { profileServices } from "../../../services/profileServices";
import { connectionProvider } from "../../../context/appProvider";
import { Loader } from "../../../helpers/utility";
import cupImg from "../../../assets/img/icons/cup.svg";

const Dashboard = () => {
  const { getDashbaord } = profileServices();
  const navigate = useNavigate();
  const [dashboardData, setdashbaordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timezone, setTimeZone] = useState("");
  const { showAlertMessage } = useContext(connectionProvider);
  const [index, setIndex] = useState(null);

  useEffect(() => {
    const fetchedSurveyId = () => {
      const fetchedSurveyId = localStorage.getItem("survey_id");
      if (fetchedSurveyId !== null) {
        navigate("/surveydetails");
      }
    };

    fetchedSurveyId();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashbaord({
        days: "7",
        timezone: timezone,
      });

      if (response.data.success) {
        setdashbaordData(response?.data);
      } else {
        console.error("Failed to fetch dashboardData");
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
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimeZone(timeZone);
  }, []);

  useEffect(() => {
    if (timezone !== "") {
      fetchDashboardData();
    }
  }, [timezone]);

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
              <Row gutter={[24, 24]}>
                <Col
                  className="gutter-row"
                  xs={24}
                  sm={24}
                  md={12}
                  lg={12}
                  xl={12}
                >
                  <div className="dashboard__right">
                    <div className="dashboard__flex">
                      <div className="dashboard__flex-card">
                        <div className="dashboard__flex-img">
                          <img src={assignImg} alt="" />
                        </div>
                        <h3>
                          No.of Survey <br />
                          Assigned
                        </h3>
                        <h4>{dashboardData?.surveyAssignedCount ?? 0}</h4>
                      </div>
                      <div className="dashboard__flex-card">
                        <div className="dashboard__flex-img">
                          <img src={participateImg} alt="" />
                        </div>
                        <h3>No.of Survey Participated</h3>
                        <h4>{dashboardData?.surveyParticipatedCount ?? 0}</h4>
                      </div>
                    </div>
                    <div className="dashboard__line">
                      <div className="dashboard__left-title">
                        <h3>Total rewards received</h3>
                        <div className="dashboard__activity">
                          <img src={calenderImg} alt="" />
                          <p>Last 7 days</p>
                        </div>
                      </div>
                      <div className="dashboard__value">
                        <h4 className="flex">
                          <img src={cupImg} alt="" />
                          {`${dashboardData?.totalRewards ?? 0}`}
                        </h4>
                      </div>
                      <div className="dashboard__line-chart">
                        <LineChart data={dashboardData?.rewardHistory} />
                      </div>
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
                  <div className="dashboard__left">
                    <div className="dashboard__left-title p-2">
                      <h3>Recent surveys</h3>
                      <div className="dashboard__two-btn">
                        <Button
                          onClick={() => {
                            navigate("/surveys");
                          }}
                        >
                          <img src={viewImg} alt="" />
                          <span>View all</span>
                        </Button>
                      </div>
                    </div>
                    <div className="dashboard__left-list">
                      {dashboardData?.recentSurveys?.length > 0 ? (
                        <ul>
                          {dashboardData?.recentSurveys?.map((item, i) => (
                            <li
                              key={i}
                              onClick={() => {
                                navigate("/surveydetails", { state: item });
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
                                        {index === i ? "See Less" : "See More"}
                                      </Button>
                                    )}
                                  </div>
                                  <div className="dashboard__survey-tag">
                                    <span
                                      className={
                                        item.userStatus === "Assigned"
                                          ? "assigned"
                                          : "active"
                                      }
                                    >
                                      {item?.userStatus}
                                    </span>
                                    <div className="dashboard__total-response">
                                      <img src={handImg} alt="" />
                                      <h5>{`${item?.totalResponses} Total responses`}</h5>
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
                      ) : (
                        !loading && (
                          <div className="center-loader">
                            <img src={noDataImg} alt="" />
                          </div>
                        )
                      )}
                      {loading && (
                        <div className="center-loader">
                          <div className="loader"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Loader>

      {/* <div className="pageloader">
      </div> */}
    </>
  );
};

export default Dashboard;
