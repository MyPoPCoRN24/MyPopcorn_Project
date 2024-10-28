import React, { useContext, useEffect, useRef, useState } from "react";
import "./Survey.scss";
import profitImg from "../../../assets/img/icons/profit.svg";
import downImg from "../../../assets/img/icons/down.svg";
import searchImg from "../../../assets/img/icons/search.svg";
import { Input, Select, Space, Button, Modal, Form, Pagination } from "antd";
import infoImg from "../../../assets/img/icons/info.svg";
import flashImg from "../../../assets/img/icons/flash.svg";
import handImg from "../../../assets/img/icons/hand.svg";
import noDataImg from "../../../assets/img/icons/no-data.svg";
import claimImg from "../../../assets/img/icons/redeem.svg";
import { Link, useNavigate } from "react-router-dom";
import profileImg from "../../../assets/img/profile-img.png";
import { surveyServices } from "../../../services/surveyServices";
import { connectionProvider } from "../../../context/appProvider";
import { ReedemRewards } from "../Wallet/ReedemRewards";
import { walletServices } from "../../../services/walletServices";
import { Loader } from "../../../helpers/utility";
import cupImg from "../../../assets/img/icons/cup.svg";
import downArrow from "../../../assets/img/icons/chevron-down.svg";
import upArrow from "../../../assets/img/icons/chevron-up.svg";

const Survey = () => {
  const searchValue = useRef("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getAllSurveys } = surveyServices();
  const { claimTransaction } = walletServices();
  const { showAlertMessage } = useContext(connectionProvider);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [surveyList, setSurveyList] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 5;
  const [isModalClaim, setIsModalClaim] = useState(false);
  const [rewardsResponse, setRewardsResponse] = useState(false);
  const [index, setIndex] = useState(null);

  useEffect(() => {
    if (rewardsResponse?.status === 200) {
      fetchSearchSurveyList(1);
    }
  }, [rewardsResponse]);

  const handleStatusChange = async (value) => {
    setCurrentPage(1);
    setSelectedValue(
      value === "Assigned" || value === "Responded" ? value : ""
    );
    await fetchData(
      {
        page: 1,
        status: value === "Assigned" || value === "Responded" ? value : "",
      },
      setLoader
    );
  };

  const fetchSurveyList = async (page) => {
    setCurrentPage(page);
    await fetchData({ page, status: selectedValue }, setLoader);
  };

  const fetchData = async (params, setLoading) => {
    const { page, status } = params;

    try {
      setLoading(true);
      const response = await getAllSurveys({
        page: page,
        key:
          searchValue?.current?.input?.value?.length > 0
            ? searchValue.current.input.value
            : null,
        status: status || null,
        limit: pageSize,
      });

      if (response.data.success) {
        setSurveyList(response?.data);
        setPageCount(response?.data?.count);
      } else {
        console.error("Failed to fetch surveys");
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

  const fetchSurveys = (page) => fetchData(page, setLoading);
  const fetchSearchSurveyList = (page) => fetchData(page, setLoader);

  const handleSearchChange = async (e) => {
    setSearchQuery(e.target.value);
    await fetchData(
      {
        page: 1,
        status: selectedValue,
      },
      setLoader
    );
  };

  useEffect(() => {
    fetchSurveys(1);
  }, []);

  const showModalClaim = () => {
    setIsModalClaim(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setIsModalClaim(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModalClaim(false);
  };

  const handleReedemRewards = async () => {
    ReedemRewards(
      claimTransaction,
      showAlertMessage,
      setIsModalClaim,
      setLoading,
      setRewardsResponse
    );
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Loader loading={loading}>
        <div className="surveys">
          <div className="container">
            <div className="surveys__title">
              <h3>Surveys</h3>
            </div>
            <div className="surveys__row">
              <div className="dashboard__grid">
                <div className="dashboard__card">
                  <h4>Total Reward Claimed</h4>
                  <h3>{`${surveyList?.totalRewardClaimed ?? 0} tPOP`}</h3>
                </div>
                <div className="dashboard__card">
                  <h4>Rewards</h4>
                  <div className="surveys__claim">
                    <h3 className="flex">
                      <img src={cupImg} alt="" />
                      {`${surveyList?.rewards ?? 0}`}
                    </h3>
                    {surveyList?.rewards > 0 && (
                      <Button className="outline-btn" onClick={showModalClaim}>
                        Claim
                      </Button>
                    )}
                  </div>
                </div>
                <div className="dashboard__card">
                  <h4>No.of Survey Participated Count</h4>
                  <h3>{`${surveyList?.totalSurveysResponded ?? 0}`}</h3>
                </div>
              </div>
            </div>
            <div className="surveys__list">
              <div className="wallet__history-title">
                <h4>Survey list</h4>
                <div className="wallet__history">
                  <p>Filter</p>
                  <div id="custom-select">
                    <Select
                      placeholder="Select"
                      suffixIcon={<img src={downImg} />}
                      options={[
                        {
                          value: "All",
                          label: "All",
                        },
                        {
                          value: "Assigned",
                          label: "Assigned",
                        },
                        {
                          value: "Responded",
                          label: "Responded",
                        },
                      ]}
                      value={selectedValue !== "" ? selectedValue : "All"}
                      onChange={handleStatusChange}
                    />
                  </div>
                  <div id="custom-search">
                    <Space.Compact>
                      <Input
                        ref={searchValue}
                        addonAfter={<img src={searchImg} alt="SearchImg" />}
                        placeholder="Search by name"
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </Space.Compact>
                  </div>
                </div>
              </div>
              <div className="surveys__list-row">
                <div className="dashboard__survey-list">
                  {surveyList?.data?.length > 0 ? (
                    <ul>
                      {surveyList?.data?.map((item, i) => (
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
                                  Created by - <span>{item?.createdby}</span>
                                </h5>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    !loading &&
                    !loader && (
                      <div className="center-loader">
                        <img src={noDataImg} alt="" />
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
                        fetchSurveyList(e);
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        {/* claim UI  */}
        <Modal
          width={408}
          centered={true}
          footer={null}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          wrapClassName="custom-modal"
        >
          <div className="claim">
            <div className="claim__img">
              <img src={claimImg} alt="" />
              <h4>Reward redeem</h4>
            </div>
            <div className="claim__label">
              <p>POP Token</p>
              <h4>
                Avl Bal:<span>219.52 tPOP</span>
              </h4>
            </div>
            <div id="auth-form">
              <Form.Item>
                <Space.Compact>
                  <Input
                    addonAfter="~532.16 USD"
                    placeholder="Search by id etc."
                  />
                </Space.Compact>
              </Form.Item>
            </div>
            <div className="claim__para">
              <p>
                To process the Redeem option, maintain the MATIC balance in your
                wallet.
              </p>
            </div>
            <div className="deposit__btn">
              <Button className="default-btn">Redeem now</Button>
              <Button className="outline-btn" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          width={408}
          centered={true}
          footer={null}
          open={isModalClaim}
          onOk={handleOk}
          onCancel={handleCancel}
          wrapClassName="custom-modal"
        >
          <div className="claim">
            <div className="claim__img">
              <img src={claimImg} alt="" />
              <h4>Rewards Claim</h4>
            </div>

            <div className="claim__para">
              <h4>Are you sure you want to claim rewards?</h4>
            </div>
            <div className="deposit__btn">
              <Button
                className="default-btn"
                onClick={handleReedemRewards}
                loading={loading}
              >
                Ok
              </Button>
              <Button className="outline-btn" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </Loader>
    </>
  );
};

export default Survey;
