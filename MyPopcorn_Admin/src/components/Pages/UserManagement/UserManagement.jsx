import React, { useEffect, useRef, useState } from "react";
import "./UserManagement.scss";
import profitImg from "../../../assets/img/icons/profit.svg";
import noDataImg from "../../../assets/img/icons/no-data.svg";
import copyImg from "../../../assets/img/icons/copy.svg";
import { Button, Input, Space, Pagination, Tooltip } from "antd";
import searchImg from "../../../assets/img/icons/search.svg";
import infoImg from "../../../assets/img/icons/info.svg";
import { profileServices } from "../../../services/profileServices";
import { formatDate } from "../../../helpers/utility";
import { handleWalletAddressClick } from "../../../helpers/utility";
import { Loader } from "../../../helpers/utility";
import { useLocation } from "react-router-dom";
import downarrow from "../../../assets/img/icons/chevron-down.svg";
import uparrow from "../../../assets/img/icons/chevron-up.svg";
import filterImg from "../../../assets/img/icons/filter.svg";
import filterFilled from "../../../assets/img/icons/filter-filled.svg";

const UserManagement = () => {
  const location = useLocation();
  const searchValue = useRef("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [usersData, setUsersData] = useState([]);
  console.log("usersData=======,", usersData);
  const { getAllUsers } = profileServices();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [tooltipText, setTooltipText] = useState({});
  console.log("tooltiptext=====", tooltipText);
  const pageSize = 5;

  const fetchData = async (page, setLoadingState, sortOption) => {
    setCurrentPage(page);
    try {
      setLoadingState(true);
      const searchKey =
        searchValue?.current?.input?.value?.length > 0
          ? searchValue.current.input.value
          : null;

      const response = await getAllUsers({
        page,
        key: searchKey,
        limit: pageSize,
        sortOption,
      });

      console.log("userResponse========>", response);
      if (response.data.success) {
        setUsersData(response.data);
        setPageCount(response.data.count);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
    } finally {
      setLoadingState(false);
    }
  };

  const fetchUsers = (page) => fetchData(page, setLoading, sortValue);
  const fetchSearchUsers = (page) => fetchData(page, setLoader, sortValue);

  useEffect(() => {
    fetchUsers(1);
  }, [location]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    fetchSearchUsers(1);
  };

  const handleSort = async (sortKey) => {
    setSortValue(sortKey);
    fetchData(1, setLoader, sortKey);
  };

  const handleSortAscending = () => handleSort("asc");
  const handleSortDescending = () => handleSort("desc");

  const formatString = (str) => {
    if (!str) return "";
    if (str.length <= 18) return str;
    const start = str.substring(0, 9);
    const end = str.substring(str.length - 9);
    return `${start}...${end}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Loader loading={loading}>
        <div className="user">
          <div className="container">
            <div className="user__title">
              <h3>User Management</h3>
            </div>
            <div className="user__top">
              <div className="dashboard__grid">
                <div className="dashboard__card">
                  <h4>Total User on platform</h4>
                  <h3>{usersData?.totalusersCount}</h3>
                </div>
                <div className="dashboard__card">
                  <h4>Total Responses</h4>
                  <h3>{usersData?.overallSurveyParticipations}</h3>
                </div>
              </div>
            </div>
            <div className="user__table">
              <div className="wallet__history-title">
                <h4>User List</h4>
                <div className="wallet__history">
                  <div id="custom-search">
                    <Space.Compact>
                      <Input
                        ref={searchValue}
                        addonAfter={<img src={searchImg} alt="SearchImg" />}
                        placeholder="Search by username, mail id etc."
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </Space.Compact>
                  </div>
                </div>
              </div>
              <div className="wallet__table">
                <table>
                  <thead>
                    <tr>
                      <th>Sno</th>
                      <th>User name</th>
                      <th>Wallet address</th>
                      {/* <th>Email ID</th> */}
                      <th>Joining date</th>
                      <th>
                        <div className="table__arrow-btn">
                          <Button onClick={handleSortAscending}>
                            <img src={filterImg} alt="" />
                          </Button>
                          <p>Surveys attended</p>
                          <Button onClick={handleSortDescending}>
                            <img src={filterFilled} alt="" />
                          </Button>
                        </div>
                      </th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loader &&
                      usersData?.data?.map((data, index) => (
                        <tr key={index}>
                          <td>
                            {currentPage * pageSize - pageSize + index + 1}
                          </td>
                          <td>
                            <div className="table-user">
                              <img src={data?.logo} alt="" />
                              <p>{data.name}</p>
                            </div>
                          </td>
                          <td>
                            <div className="wallet__copy">
                              <p>{formatString(data.address)}</p>
                              <Tooltip
                                title={tooltipText[data.address] || "Copy"}
                              >
                                <Button
                                  onClick={() =>
                                    handleWalletAddressClick(
                                      data.address,
                                      setTooltipText
                                    )
                                  }
                                >
                                  <img src={copyImg} alt="Copy" />
                                </Button>
                              </Tooltip>
                            </div>
                          </td>
                          {/* <td>{data.email}</td> */}
                          <td>{formatDate(data.createdAt)}</td>
                          <td>{data.totalResponses}</td>
                          <td>
                            <div className="table-active">
                              {data.status ? "Active" : "InActive"}
                            </div>
                          </td>
                        </tr>
                      ))}

                    {loading ||
                      (loader && (
                        <div className="center-loader">
                          <div className="loader"></div>
                        </div>
                      ))}
                  </tbody>
                </table>
                {!loading && !loader && usersData?.data?.length === 0 && (
                  <div className="center-loader">
                    <img src={noDataImg} alt="No data" />
                  </div>
                )}
                {!loading && !loader && pageCount > 5 ? (
                  <div className="common-page">
                    <Pagination
                      defaultCurrent={1}
                      current={currentPage}
                      total={pageCount}
                      pageSize={pageSize}
                      onChange={(e) => {
                        fetchUsers(e);
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

export default UserManagement;
