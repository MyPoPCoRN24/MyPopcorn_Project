import React, { useEffect, useState } from "react";
import noDataImg from "../../../assets/img/icons/no-data.svg";
import backImg from "../../../assets/img/icons/back.svg";
import { Link } from "react-router-dom";

const TopResult = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchDashboardData = () => {
      const dashboard = localStorage.getItem("dashboardData");
      const parsedDashboard = dashboard ? JSON.parse(dashboard) : null;
      console.log("localDashboardData======", parsedDashboard);
      setDashboardData(parsedDashboard);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <div className="result">
        <div className="container">
          <div className="result__flex">
            <Link to="/">
              <img src={backImg} alt="" />
            </Link>
            <h4>Top Result</h4>
          </div>
          <div className="dashboard__count">
            <div className="dashboard__count-flex">
              <h4>Top Survey</h4>
              <p>Count</p>
            </div>
            <div className="dashboard__count-list">
              <ul>
                {dashboardData?.surveyResponses?.map((item, index) => (
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
                ))}
                {!loading && dashboardData?.surveyResponses?.length === 0 && (
                  <div className="center-loader">
                    <img src={noDataImg} alt="No data" />
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopResult;
