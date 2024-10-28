import React, { useState, useEffect, useContext, useRef } from "react";
import "./Wallet.scss";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Pagination,
} from "antd";
import maticImg from "../../../assets/img/icons/matic.svg";
import viewImg from "../../../assets/img/icons/view-icon.svg";
import noDataImg from "../../../assets/img/icons/no-data.svg";
import popcornImg from "../../../assets/img/icons/Popcorn.svg";
import downImg from "../../../assets/img/icons/down.svg";
import searchImg from "../../../assets/img/icons/search.svg";
import claimedImg from "../../../assets/img/icons/claim-img.svg";
import depositImg from "../../../assets/img/icons/deposit.svg";
import sentImg from "../../../assets/img/icons/sent.svg";
import claimImg from "../../../assets/img/icons/claim.svg";
import copyImg from "../../../assets/img/icons/copy.svg";
import closeImg from "../../../assets/img/icons/close.svg";
import qrImg from "../../../assets/img/icons/qrcode.png";
import rewardImg from "../../../assets/img/icons/reward.svg";
import successImg from "../../../assets/img/icons/success.svg";
import downloadImg from "../../../assets/img/icons/download.svg";
import redeemImg from "../../../assets/img/icons/redeem.svg";
import arrowImg from "../../../assets/img/icons/arrow-right.svg";
import { walletServices } from "../../../services/walletServices";
import { connectionProvider } from "../../../context/appProvider";
import QRCode from "qrcode.react";
import { truncateAddress } from "../../../helpers/utility";
import { formatValue } from "../../../helpers/utility";
import { handleWalletAddressClick } from "../../../helpers/utility";
import { Loader } from "../../../helpers/utility";
import { Link, useLocation } from "react-router-dom";

const { Option } = Select;

const Wallet = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  console.log("location======", location);
  const searchValue = useRef("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState({});
  const [isModalWithdraw, setIsModalWithdraw] = useState(false);
  const {
    popcornBalance,
    polygonBalance,
    transfer,
    transtoken,
    getTransaction,
  } = walletServices();
  const [loading, setLoading] = useState(false);
  const [polygonBalanceData, setPolygonBalanceData] = useState(null);
  console.log("polygonBalanceData========>", polygonBalanceData);
  const [popcornBalanceData, setPopcornBalanceData] = useState(null);
  console.log("popcornBalanceData========>", popcornBalanceData);
  const [transaction, setTransaction] = useState([]);
  const [selectedOption, setSelectedOption] = useState("Matic");
  console.log("selectedOption====>", selectedOption);
  const { showAlertMessage } = useContext(connectionProvider);
  const [loader, setLoader] = useState(false);
  const [walletLoader, setWalletLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 5;
  const [usdValue, setUsdValue] = useState(0);
  const [amount, setAmount] = useState(null);
  console.log("usdValue=====", usdValue);

  const Options = [
    {
      id: "1",
      image: maticImg,
      name: "Matic",
    },
    {
      id: "2",
      image: popcornImg,
      name: "MyPoPCoRN",
    },
  ];
  const [isModalSuccess, setIsModalSuccess] = useState(false);

  const showModalSuccess = () => {
    setIsModalSuccess(true);
  };
  const [isModalQr, setIsModalQr] = useState(false);
  const showModalQr = () => {
    setIsModalQr(true);
  };
  const [userProfile, setUserProfile] = useState(null);
  console.log("walletProfile=====", userProfile);

  useEffect(() => {
    const fetchUserData = () => {
      const userData = localStorage.getItem("userProfile");
      const parseData = JSON.parse(userData);
      setUserProfile(parseData); 
    };
    fetchUserData();
  }, []);

  const handleChange = (value) => {
    setSelectedOption(value); // Update the selected value
    setUsdValue(0);
    form.resetFields();
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showModalWithdraw = () => {
    setIsModalWithdraw(true);
    form.resetFields();
    setAmount(null);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setIsModalWithdraw(false);
    setIsModalSuccess(false);
    setIsModalQr(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModalWithdraw(false);
    setIsModalSuccess(false);
    setIsModalQr(false);
    form.resetFields();
    setSelectedOption("Matic");
  };

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const [polygonResponse, popcornResponse] = await Promise.all([
        polygonBalance(),
        popcornBalance(),
      ]);

      if (polygonResponse.data.success) {
        setPolygonBalanceData(polygonResponse?.data);
      } else {
        console.error("Failed to fetch polygon balance");
      }

      if (popcornResponse.data.success) {
        setPopcornBalanceData(popcornResponse?.data);
      } else {
        console.error("Failed to fetch popcorn balance");
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
    fetchTransactionData(1);
  }, [location]);

  const handleFinish = async (values) => {
    console.log("Values=======>", values);

    if (amount <= 0) {
      return;
    }
    setWalletLoader(true);

    const transferData = {
      receiverAddress: values?.Address,
      amountInEther: amount,
    };

    const tokenData = {
      to: values?.Address,
      value: amount,
    };

    const handleResponse = (response) => {
      if (response.data.success) {
        showAlertMessage({
          type: "success",
          message: response?.data?.message,
          show: true,
        });
      } else {
        showAlertMessage({
          type: "error",
          message: response?.message,
          show: true,
        });
        console.error("Failed to signup user");
      }
    };

    try {
      let response;
      if (selectedOption === "Matic") {
        response = await transfer(transferData);
      } else {
        response = await transtoken(tokenData);
      }
      console.log("response:===============>", response);
      handleResponse(response);
    } catch (error) {
      console.error("Error during signup API request:", error.message);
      showAlertMessage({
        type: "error",
        message: error?.response?.data?.message || error.message,
        show: true,
      });
    } finally {
      setWalletLoader(false);
      handleCancel();
      form.resetFields();
      setSelectedOption("Matic");
      fetchBalances();
      fetchTransactionData(1);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Wallet form Failed:", errorInfo);
  };

  const ValidateAddress = (rule, value) => {
    if (!value) {
      return Promise.reject("Please enter your Address");
    }
    return Promise.resolve();
  };

  const ValidateAmount = (rule, value) => {
    if (!value) {
      return Promise.reject("Please enter your Amount");
    }
    if (isNaN(value)) {
      return Promise.reject("Please enter a valid number");
    }

    if (
      value >
      (selectedOption === "Matic"
        ? polygonBalanceData?.Balance
        : popcornBalanceData?.Balance)
    ) {
      return Promise.reject("Insufficient Balance");
    }
    return Promise.resolve();
  };

  function handleAddressClick(transactionId) {
    const url = `https://amoy.polygonscan.com/tx/${transactionId}`;
    window.open(url, "_blank"); // This will open the link in a new tab
  }

  const handleStatusChange = async (value) => {
    console.log("Selected value:", value);
    setSelectedValue(value);
    setCurrentPage(1);
    await fetchData(
      {
        page: 1,
        status: value === "success" || value === "failed" ? value : "",
      },
      setLoader
    );
  };

  const fetchTransactionData = async (page) => {
    setCurrentPage(page);
    localStorage.setItem("page", page);
    await fetchData({ page }, setLoader);
  };

  const fetchData = async (params, setLoading) => {
    const { page, status } = params;
    console.log("pagewallet=======", page);

    try {
      setLoading(true);
      const data = {
        page: page,
        key:
          searchValue?.current?.input?.value?.length > 0
            ? searchValue.current.input.value
            : null,
        status: status || null,
        limit: pageSize,
      };
      const transactionResponse = await getTransaction(data);

      console.log("walletRequestData=========", data);

      if (transactionResponse.data.success) {
        setTransaction(transactionResponse?.data);
        setPageCount(transactionResponse?.data?.totalCount);
      } else {
        console.error("Failed to fetch transaction balance");
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransaction = (page) => fetchData(page, setLoading);
  const fetchSearchTransaction = (page) => fetchData(page, setLoader);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    const page = Number(localStorage.getItem("page"));
    fetchSearchTransaction(page ? page : 1);
  };

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
    aEl.download = "QR_Code.png";
    document.body.appendChild(aEl);
    aEl.click();
    document.body.removeChild(aEl);
  };

  const calculateUsdValue = (changedValues, allValues) => {
    const { Amount } = allValues;

    const convertAmount = Amount?.replace(/[^0-9.]/g, "");

    if (convertAmount) {
      let conversionRate = 0;

      if (selectedOption === "Matic") {
        conversionRate = polygonBalanceData?.usdPrice || 0;
      } else if (selectedOption === "Popcorn") {
        conversionRate = 0.1;
      }

      const calculatedUsdValue = convertAmount * conversionRate;
      setUsdValue(calculatedUsdValue.toFixed(2)); // Update the state with the calculated value
    }
  };
  return (
    <>
      <Loader loading={loading}>
        <div className="wallet">
          <div className="container">
            <div className="wallet__title">
              <h3>Wallet</h3>
            </div>
            <div className="wallet__row">
              <Row gutter={[24, 40]}>
                <Col
                  className="gutter-row"
                  xs={24}
                  sm={24}
                  md={10}
                  lg={8}
                  xl={8}
                >
                  <div className="wallet__left">
                    <div className="wallet__box">
                      <p>Wallet balance</p>
                      <h4>{`${polygonBalanceData?.Balance ?? 0} Matic`}</h4>
                      <div className="wallet__btn-flex">
                        <Button onClick={showModalWithdraw}>Send</Button>
                        <Button onClick={showModal}>Deposit</Button>
                      </div>
                    </div>
                    <div className="wallet__flex-title">
                      <h5>Coin</h5>
                      <p>Balance</p>
                    </div>
                    <div className="wallet__coin-list">
                      <ul>
                        <li>
                          <div className="wallet__coin-flex">
                            <div className="wallet__coin-img">
                              <img src={maticImg} alt="" />
                            </div>
                            <div className="wallet__content">
                              <h5>Matic</h5>
                              <p>USDT</p>
                            </div>
                          </div>
                          <div className="wallet__value">
                            <p>{`${polygonBalanceData?.Balance ?? 0} MATIC`}</p>
                            <span>{`~$${
                              polygonBalanceData?.approximateValueInUSD ?? 0
                            }`}</span>
                          </div>
                        </li>
                        <li>
                          <div className="wallet__coin-flex">
                            <div className="wallet__coin-img">
                              <img src={popcornImg} alt="" />
                            </div>
                            <div className="wallet__content">
                              <h5>MyPoPCoRN</h5>
                              <p>USDT</p>
                            </div>
                          </div>
                          <div className="wallet__value">
                            <p>{`${popcornBalanceData?.Balance ?? 0} tPOP`}</p>
                            <span>{`~$${
                              popcornBalanceData?.approximateValue ?? 0
                            }`}</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Col>
                <Col
                  className="gutter-row"
                  xs={24}
                  sm={24}
                  md={14}
                  lg={16}
                  xl={16}
                >
                  <div className="wallet__right">
                    <div className="wallet__gird">
                      <div className="wallet__grid-card">
                        <p>Total redeem token</p>
                        <div className="wallet__grid-btn">
                          <h5>{`${
                            userProfile?.total_redeem_token.toFixed(2) ?? 0
                          } tPOP`}</h5>
                          <Button onClick={showModalQr}>
                            <img src={redeemImg} alt="" />
                          </Button>
                        </div>
                      </div>
                      <div className="wallet__grid-card">
                        <p>Total Reward Distributed</p>
                        <div className="wallet__grid-flex">
                          <img src={rewardImg} alt="" />
                          <h4>{userProfile?.reward_points_given}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="wallet__history-sec">
                      <div className="wallet__history-title">
                        <h4>Transaction History</h4>
                        <div className="wallet__history">
                          <p>Filter</p>
                          <div id="custom-select">
                            <Select
                              placeholder="Select"
                              suffixIcon={<img src={downImg} alt="download" />}
                              options={[
                                {
                                  value: "All",
                                  label: "All",
                                },
                                {
                                  value: "success",
                                  label: "Success",
                                },
                                {
                                  value: "failed",
                                  label: "Failed",
                                },
                              ]}
                              value={
                                selectedValue !== "" ? selectedValue : "All"
                              }
                              onChange={handleStatusChange}
                            />
                          </div>
                          <div id="custom-search">
                            <Space.Compact>
                              <Input
                                ref={searchValue}
                                addonAfter={
                                  <img src={searchImg} alt="SearchImg" />
                                }
                                placeholder="Search by id etc."
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
                              <th>Coin & date</th>
                              <th>From</th>
                              <th>To</th>
                              <th>Amount</th>
                              <th>transaction Id</th>
                              <th>Status</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {!loading &&
                              !loader &&
                              transaction?.data?.map((data, index) => {
                                console.log("item===========", data?.status);
                                return (
                                  <>
                                    <tr key={index}>
                                      <td>
                                        <div className="wallet__table-flex">
                                          <div className="wallet__table-icon">
                                            <img
                                              src={
                                                data?.status === "send"
                                                  ? sentImg
                                                  : data?.status === "Claimed"
                                                  ? claimedImg
                                                  : depositImg
                                              }
                                              alt=""
                                            />
                                          </div>
                                          <div className="wallet__table-content">
                                            <h4>
                                              {data?.status === "send"
                                                ? "Sent"
                                                : "token received"}{" "}
                                              <strong>
                                                {data?.coin === "POPCORN"
                                                  ? "MyPoPCoRN"
                                                  : "Matic"}
                                              </strong>
                                            </h4>
                                            <p>{`${new Date(
                                              data?.createdAt
                                            ).toLocaleDateString()}`}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="wallet__copy">
                                          <p>
                                            {truncateAddress(
                                              data?.from_address
                                            )}
                                          </p>
                                          <Tooltip
                                            title={
                                              tooltipText[data?.from_address] ||
                                              "Copy"
                                            }
                                          >
                                            <Button
                                              onClick={() =>
                                                handleWalletAddressClick(
                                                  data?.from_address,
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
                                        <div className="wallet__copy">
                                          <p>
                                            {truncateAddress(data?.to_address)}
                                          </p>

                                          <Tooltip
                                            title={
                                              tooltipText[data?.to_address] ||
                                              "Copy"
                                            }
                                          >
                                            <Button
                                              onClick={() =>
                                                handleWalletAddressClick(
                                                  data?.to_address,
                                                  setTooltipText
                                                )
                                              }
                                            >
                                              <img src={copyImg} alt="Copy" />
                                            </Button>
                                          </Tooltip>
                                        </div>
                                      </td>
                                      <td>{data?.amount}</td>
                                      <td>
                                        <Tooltip title="View Explore">
                                          <div
                                            role="button"
                                            className="flex-line"
                                            tabIndex="0"
                                            onClick={() =>
                                              handleAddressClick(
                                                data?.transaction_id
                                              )
                                            }
                                            onKeyDown={(e) => {
                                              if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                              ) {
                                                e.preventDefault();
                                                handleAddressClick(
                                                  data?.transaction_id
                                                );
                                              }
                                            }}
                                          >
                                            {truncateAddress(
                                              data?.transaction_id
                                            )}{" "}
                                            <img
                                              src={viewImg}
                                              alt="View icon"
                                            />{" "}
                                          </div>
                                        </Tooltip>
                                      </td>
                                      <td>
                                        <div
                                          className={
                                            data?.transaction_status ===
                                            "success"
                                              ? "wallet__table-profit"
                                              : "wallet__table-loss"
                                          }
                                        >
                                          {data?.transaction_status ===
                                          "success"
                                            ? "Success"
                                            : "Failure"}
                                        </div>
                                      </td>
                                    </tr>
                                  </>
                                );
                              })}
                            {loader && (
                              <div className="center-loader">
                                <div className="loader"></div>
                              </div>
                            )}
                          </tbody>
                        </table>
                        {!loader && transaction?.data?.length === 0 && (
                          <div className="center-loader">
                            <img src={noDataImg} alt="No data" />
                          </div>
                        )}
                        {!loader && pageCount > 5 ? (
                          <div className="common-page">
                            <Pagination
                              defaultCurrent={1}
                              current={currentPage}
                              total={pageCount}
                              pageSize={pageSize}
                              onChange={(e) => {
                                fetchTransactionData(e);
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>

        {/* Deposit modal  */}

        <Modal
          width={408}
          centered={true}
          footer={null}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          wrapClassName="custom-modal"
        >
          <div className="deposit">
            <div className="deposit__title">
              <h3>Deposit</h3>
              <Button onClick={handleCancel}>
                <img src={closeImg} alt="" />
              </Button>
            </div>
            <div className="deposit__coin">
              <div className="deposit__coin-img">
                <img src={maticImg} alt="" />
              </div>
              <h4>Polygon</h4>
            </div>
            <div className="deposit__qr">
              <QRCode
                id="qrCodeEl"
                title={userProfile?.address}
                value={userProfile?.address}
                size={150}
              />
            </div>
            <div className="deposit__copy">
              <p>{truncateAddress(userProfile?.address)}</p>
              <Tooltip title={tooltipText[userProfile?.address] || "Copy"}>
                <Button
                  onClick={() =>
                    handleWalletAddressClick(
                      userProfile?.address,
                      setTooltipText
                    )
                  }
                >
                  <img src={copyImg} alt="Copy" />
                </Button>
              </Tooltip>
            </div>
            <div className="deposit__form" id="auth-form">
              <Form
                labelCol={{
                  span: 24,
                }}
                wrapperCol={{
                  span: 24,
                }}
              >
                <div className="deposit__list">
                  <ul>
                    <li>Deposit Polygon network tokens to this address</li>
                    <li>Deposit MATIC to maintain network fee.</li>
                  </ul>
                </div>
                <div className="deposit__btn">
                  <Button className="default-btn" onClick={handleCancel}>
                    Okay
                  </Button>
                  <Button className="outline-btn" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Modal>

        {/* Withdraw Modal  */}
        <Modal
          width={408}
          centered={true}
          footer={null}
          open={isModalWithdraw}
          onOk={handleOk}
          onCancel={handleCancel}
          wrapClassName="custom-modal"
        >
          <div className="deposit">
            <div className="deposit__title">
              <h3>Withdraw</h3>
              <Button onClick={handleCancel}>
                <img src={closeImg} alt="" />
              </Button>
            </div>
            <div className="deposit__form" id="auth-form">
              <Form
                form={form}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                onFinish={handleFinish}
                onFinishFailed={onFinishFailed}
                onValuesChange={calculateUsdValue}
                autoComplete="off"
              >
                <Form.Item label="Coin Pair">
                  <Select
                    value={selectedOption} // Bind the value prop to the state
                    suffixIcon={<img src={downImg} alt="networkImg" />}
                    placeholder="Select Coin"
                    optionFilterProp="children"
                    defaultValue={"Matic"}
                    onChange={handleChange}
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    renderOption={(option) => (
                      <div>
                        {option.icon} {option.label}
                      </div>
                    )}
                  >
                    {Options?.map((option, index) => (
                      <Option
                        key={index}
                        value={option.name}
                        label={option.name}
                      >
                        <div className="coin-flex">
                          <span className="input-coin">
                            <img src={option?.image} alt="" />
                          </span>
                          <span>{option?.name}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Network">
                  <Input value="Polygon" disabled={true} />
                </Form.Item>
                <Form.Item
                  label="Address"
                  name="Address"
                  rules={[
                    {
                      validator: ValidateAddress,
                    },
                  ]}
                >
                  <Input placeholder="Enter Address" />
                </Form.Item>
                <Form.Item
                  label="Amount"
                  name="Amount"
                  rules={[
                    {
                      validator: ValidateAmount,
                    },
                  ]}
                >
                  <Space.Compact>
                    <Input
                      addonAfter={
                        <span style={{ color: "#000000" }}>
                          {`~${usdValue > 0 ? usdValue : 0} USDT`}
                        </span>
                      }
                      value={amount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, "");
                        const validValue = value.match(/^\d*\.?\d{0,3}$/)
                          ? value
                          : value.slice(0, -1);
                        setAmount(validValue);
                      }}
                      placeholder="Please Enter your Amount"
                    />
                  </Space.Compact>
                </Form.Item>
                <h4>
                  Avl Bal:{" "}
                  <span>
                    {selectedOption === "Matic"
                      ? `${polygonBalanceData?.Balance ?? 0} Matic`
                      : `${popcornBalanceData?.Balance ?? 0} tPOP`}
                  </span>
                </h4>
                <div className="deposit__btn">
                  <Button
                    className="default-btn"
                    htmlType="submit"
                    loading={walletLoader}
                  >
                    Confirm
                  </Button>
                  <Button className="outline-btn" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Modal>
        {/* withdraw successful */}
        <Modal
          width={408}
          centered={true}
          footer={null}
          open={isModalSuccess}
          onOk={handleOk}
          onCancel={handleCancel}
          wrapClassName="custom-modal"
        >
          <div className="success">
            <div className="success__img">
              <img src={successImg} alt="" />
              <h4>Withdrawn successful</h4>
            </div>
            <div className="success__content">
              <p>
                Your withdrawn amount of <span>1123.21 MATIC</span> has been
                successfully done. Check your withdrawn history in transaction
                history.
              </p>
              <div className="success__btn">
                <Button className="default-btn">Okay</Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Token Qr */}
        <Modal
          width={408}
          centered={true}
          footer={null}
          open={isModalQr}
          onOk={handleOk}
          onCancel={handleCancel}
          wrapClassName="custom-modal"
        >
          <div className="qr">
            <div className="qr__content">
              <h4>Token redeem QR</h4>
            </div>
            <div className="qr__img">
              <QRCode
                id="qrCodeEl"
                title={userProfile?.address}
                value={userProfile?.address}
                size={150}
              />
            </div>
            <div className="qr__download">
              <Button
                onClick={() => {
                  handleDownload();
                }}
              >
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
      </Loader>
    </>
  );
};

export default Wallet;
