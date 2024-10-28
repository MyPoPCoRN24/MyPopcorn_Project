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
  Pagination,
  Tooltip,
} from "antd";
import maticImg from "../../../assets/img/icons/matic.svg";
import popcornImg from "../../../assets/img/icons/Popcorn.svg";
import downImg from "../../../assets/img/icons/down.svg";
import viewImg from "../../../assets/img/icons/view-icon.svg";
import searchImg from "../../../assets/img/icons/search.svg";
import sentImg from "../../../assets/img/icons/sent.svg";
import depositImg from "../../../assets/img/icons/deposit.svg";
import noDataImg from "../../../assets/img/icons/no-data.svg";
import claimImg from "../../../assets/img/icons/redeem.svg";
import claimedImg from "../../../assets/img/icons/claim-img.svg";
import copyImg from "../../../assets/img/icons/copy.svg";
import closeImg from "../../../assets/img/icons/close.svg";
import qrImg from "../../../assets/img/icons/qrcode.png";
import scanImg from "../../../assets/img/icons/scan.svg";
import cupImg from "../../../assets/img/icons/cup.svg";
import arrowImg from "../../../assets/img/icons/arrow-right.svg";
import { walletServices } from "../../../services/walletServices";
import { connectionProvider } from "../../../context/appProvider";
import downloadImg from "../../../assets/img/icons/download.svg";
import { Loader, truncateAddress } from "../../../helpers/utility";
import QRCode from "qrcode.react";
import { handleWalletAddressClick } from "../../../helpers/utility";
import { ReedemRewards } from "./ReedemRewards";
import { Html5Qrcode } from "html5-qrcode";
import { Link, useLocation } from "react-router-dom";
import { profileServices } from "../../../services/profileServices";
import successImg from "../../../assets/img/icons/success.svg";

const { Option } = Select;

const Wallet = () => {
  const path = useLocation();
  const [form] = Form.useForm();
  const searchValue = useRef("");
  const { getProfile } = profileServices();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelBtnShow, setCancelBtnShow] = useState(false);
  const [tooltipText, setTooltipText] = useState({});
  const [isModalWithdraw, setIsModalWithdraw] = useState(false);
  const {
    popcornBalance,
    polygonBalance,
    transfer,
    transtoken,
    getTransaction,
    claimTransaction,
    redeemToken,
  } = walletServices();
  const [loading, setLoading] = useState(false);
  const [polygonBalanceData, setPolygonBalanceData] = useState(null);
  console.log("polygonBalanceData========>", polygonBalanceData);
  const [popcornBalanceData, setPopcornBalanceData] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Matic");
  console.log("selectedOption========>", selectedOption);
  const [transaction, setTransaction] = useState([]);
  const [walletLoader, setWalletLoader] = useState(false);
  const { showAlertMessage } = useContext(connectionProvider);
  const [loader, setLoader] = useState(false);
  const [rewardLoader, setRewardLoader] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  console.log("walletuserprofile====>", userProfile);
  const [selectedValue, setSelectedValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 5;
  const [isModalClaim, setIsModalClaim] = useState(false);
  const [isModalQrClaim, setIsModalQrClaim] = useState(false);
  const [amount, setAmount] = useState("");
  console.log("amount========", amount);
  const [walletAmount, setWalletAmount] = useState(null);
  const [qrCodeDetails, setQrCodeDetails] = useState(null);
  const [adminAddress, setAdminAddress] = useState(null);
  const [usdValue, setUsdValue] = useState(0);
  const [QrUsdValue, setQrUsdValue] = useState(0);
  const [usdError, setUsdError] = useState("");
  console.log("usdvalue========", QrUsdValue);
  const [rewardsResponse, setRewardsResponse] = useState(false);
  const [isModalSuccess, setIsModalSuccess] = useState(false);
  const [redeemResponse, setRedeemResponse] = useState(null);

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

  useEffect(() => {
    if (rewardsResponse?.status === 200) {
      fetchProfile();
      fetchBalances();
      fetchSearchTransaction(1);
    }
  }, [rewardsResponse]);

  const handleChange = (value) => {
    setSelectedOption(value); // Update the selected value
    form.resetFields();
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showModalWithdraw = () => {
    setIsModalWithdraw(true);
    form.resetFields();
    setWalletAmount(null);
  };

  const showModalClaim = () => {
    setIsModalClaim(true);
  };

  const [isModalScanQr, setIsModalScanQr] = useState(false);

  const handleOk = () => {
    setIsModalOpen(false);
    setIsModalWithdraw(false);
    setIsModalClaim(false);
    setIsModalQrClaim(false);
    setIsModalScanQr(false);
    setIsModalReward(false);
    setIsModalSuccess(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModalWithdraw(false);
    setIsModalClaim(false);
    setIsModalQrClaim(false);
    setIsModalScanQr(false);
    form.resetFields();
    setSelectedOption("Matic");
    setCancelBtnShow(false);
    setIsModalReward(false);
    setIsModalSuccess(false);
    setAmount("");
    setUsdError("");
    setUsdValue(0);
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

  const fetchProfile = async () => {
    console.log("this profile called======>");
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.data.success) {
        setUserProfile(response?.data?.data);
        localStorage.setItem(
          "userProfile",
          JSON.stringify(response?.data?.data)
        );
      } else {
        console.error("Failed to fetch polygon balance");
      }
    } catch (error) {
      console.error("Error during dashboard API request:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfile();
    fetchBalances();
    fetchTransaction(1);
  }, [path]);

  const handleFinish = async (values) => {
    console.log("Values=======>", values);

    if (walletAmount <= 0) {
      return;
    }

    setWalletLoader(true);

    const transferData = {
      receiverAddress: values?.Address,
      amountInEther: walletAmount,
    };

    const tokenData = {
      to: values?.Address,
      value: walletAmount,
    };

    const handleResponse = (response) => {
      console.log("send response==========", response);
      if (response.data.success) {
        showAlertMessage({
          type: "success",
          message: response?.data?.message,
          show: true,
        });
        fetchTransactionData(1);
        setIsModalOpen(false);
        fetchBalances();
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    fetchSearchTransaction(1);
  };

  const handleStatusChange = async (value) => {
    console.log("Selected value:", value);

    setSelectedValue(value === "success" || value === "failed" ? value : "");
    setCurrentPage(1);

    await fetchSearchTransaction({
      page: 1,
      status: value === "success" || value === "failed" ? value : "",
    });
  };

  const fetchTransaction = (page) => fetchData(page, setLoading);
  const fetchSearchTransaction = (page) => fetchData(page, setLoader);

  const fetchTransactionData = async (page) => {
    setCurrentPage(page);
    await fetchData({ page }, setLoader);
  };

  const fetchData = async (params, setLoading) => {
    const { page, status } = params;

    try {
      setLoading(true);
      const transactionResponse = await getTransaction({
        page: searchValue?.current?.input?.value?.length > 0 ? 1 : page,
        key:
          searchValue?.current?.input?.value?.length > 0
            ? searchValue.current.input.value
            : null,
        status: status || null,
        limit: pageSize,
      });

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

  const handleAddressClick = (transactionId) => {
    const url = `https://amoy.polygonscan.com/tx/${transactionId}`;
    window.open(url, "_blank");
  };

  const handleWalletAlert = () => {
    const url = "https://faucets.chain.link/polygon-amoy";
    window.open(url, "_blank");
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

  const handleOpenScanner = () => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          const cameraId = devices[devices.length - 1].id;
          const html5QrCode = new Html5Qrcode("reader");
          console.log("devices=========", devices);
          setQrCodeDetails(html5QrCode);
          setTimeout(() => {
            setCancelBtnShow(true);
          }, 800);

          html5QrCode
            .start(
              cameraId,
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
              },
              (decodedText, decodedResult) => {
                console.log(`Code matched = ${decodedText}`, decodedResult);
                setAdminAddress(decodedResult?.text);
                html5QrCode
                  .stop()
                  .then((ignore) => {
                    setIsModalScanQr(false);
                    setIsModalQrClaim(true);
                    html5QrCode.clear();
                    console.log("QR code scanning stopped========", ignore);
                  })
                  .catch((err) => {
                    console.warn(`Error stopping QR code scanning = ${err}`);
                  });
              },
              (errorMessage) => {
                console.warn(`QR code scan error = ${errorMessage}`);
              }
            )
            .catch((err) => {
              console.warn(`Error starting QR code scanning = ${err}`);
              if (err === "Permission denied") {
                // Permission denied, cleanup the instance to allow retry
                html5QrCode.clear();
              }
            });
        }
      })
      .catch((err) => {
        console.warn(`Error getting cameras = ${err}`);
      });
  };

  const handleRedeemToken = async () => {
    if (usdError === "" && amount > 0) {
      try {
        setRewardLoader(true);
        const response = await redeemToken({
          value: amount,
        });

        if (response.data.success) {
          // showAlertMessage({
          //   type: "success",
          //   message: response?.data?.message,
          //   show: true,
          // });
          setRedeemResponse(response?.data);
          setIsModalSuccess(true);
          setAmount("");
        } else {
          console.error("Failed to post response response");
        }
      } catch (error) {
        console.error("Error during post response response:", error.message);
        showAlertMessage({
          type: "error",
          message: error?.response?.data?.message,
          show: true,
        });
      } finally {
        setRewardLoader(false);
        setIsModalQrClaim(false);
      }
    }
  };

  const calculateUsdValue = (changedValues, allValues) => {
    const { Amount } = allValues;
    console.log("Amount=========", Amount);

    const convertAmount = Amount?.replace(/[^0-9.]/g, "");

    if (convertAmount) {
      let conversionRate = 0;

      if (selectedOption === "Matic") {
        conversionRate = polygonBalanceData?.usdPrice || 0;
      } else {
        conversionRate = 0.1;
      }

      const calculatedUsdValue = convertAmount * conversionRate;
      setUsdValue(calculatedUsdValue.toFixed(2)); // Update the state with the calculated value
    }
  };

  const calculateQrUsdValue = (value) => {
    const calculatedUsdValue = value * 0.1;

    if (value > userProfile?.claimed_reward_points) {
      setUsdError("Insufficient tokens");
    } else if (value < 1) {
      setUsdError("Token value must be greater than 0");
    } else {
      setUsdError("");
    }
    setQrUsdValue(calculatedUsdValue.toFixed(2));
  };

  const [isModalReward, setIsModalReward] = useState(false);

  const showModalReward = () => {
    setIsModalReward(true);
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
                              <h5>Polygon</h5>
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
                        <p>Total Reward Claimed</p>
                        <div className="wallet__grid-last">
                          <h5>{`${
                            userProfile?.claimed_reward_points ?? 0
                          } tPOP`}</h5>
                          <Button
                            className="outline-btn"
                            onClick={showModalReward}
                          >
                            Reedem reward
                          </Button>
                        </div>
                        {Number(polygonBalanceData?.Balance) <= 0.0015 && (
                          <div className="wallet__alert">
                            <Link>
                              <p onClick={handleWalletAlert}>
                                Low Matic balance. Get a matic deposit into your
                                wallet.
                                <img src={viewImg} alt="" />
                              </p>
                            </Link>
                          </div>
                        )}
                      </div>
                      <div className="wallet__grid-card">
                        <p>Rewards earned</p>
                        <div className="wallet__grid-btn">
                          <h5>
                            <img src={cupImg} alt="" />
                            {`${
                              userProfile?.reward_points?.toFixed(2) ?? 0
                            } tPOP`}
                          </h5>
                          {userProfile?.reward_points > 0 && (
                            <Button
                              className="outline-btn"
                              onClick={showModalClaim}
                            >
                              Claim
                            </Button>
                          )}
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
                                  <img src={searchImg} alt="Search" />
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
                              <th>Transaction Id</th>
                              <th>Status</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {!loading &&
                              !loader &&
                              transaction?.data?.map((data, index) => (
                                <>
                                  <tr key={index}>
                                    <td>
                                      <div className="wallet__table-flex">
                                        <div className="wallet__table-icon">
                                          <img
                                            src={
                                              data?.status === "Send"
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
                                            {data?.status === "Send"
                                              ? "Sent"
                                              : data?.status === "Claimed"
                                              ? "Claimed"
                                              : "Token redeemed"}{" "}
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
                                          {truncateAddress(data?.from_address)}
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
                                          className="flex-line"
                                          role="button"
                                          tabIndex="0"
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
                                          onClick={() =>
                                            handleAddressClick(
                                              data?.transaction_id
                                            )
                                          }
                                        >
                                          {truncateAddress(
                                            data?.transaction_id
                                          )}
                                          <img src={viewImg} alt="" />
                                        </div>
                                      </Tooltip>
                                    </td>
                                    <td>
                                      <div
                                        className={
                                          data?.transaction_status === "success"
                                            ? "wallet__table-profit"
                                            : "wallet__table-loss"
                                        }
                                      >
                                        {data?.transaction_status === "success"
                                          ? "Success"
                                          : "Failed"}
                                      </div>
                                    </td>
                                  </tr>
                                </>
                              ))}
                          </tbody>
                        </table>
                        {loader && (
                          <div className="center-loader">
                            <div className="loader"></div>
                          </div>
                        )}
                        {!loading &&
                          !loader &&
                          transaction?.data?.length === 0 && (
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
                    <li>
                      Deposit Polygon - testnet network tokens to this address
                    </li>
                    <li>Deposit Testnet MATIC to maintain network fee.</li>
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
                labelCol={{
                  span: 24,
                }}
                wrapperCol={{
                  span: 24,
                }}
                onFinish={handleFinish}
                onFinishFailed={onFinishFailed}
                onValuesChange={calculateUsdValue}
                autoComplete="off"
                form={form}
              >
                <Form.Item label="Coin Pair">
                  <Select
                    value={selectedOption} // Bind the value prop to the state
                    suffixIcon={<img src={downImg} alt="networkImg" />}
                    placeholder="Select Coin"
                    optionFilterProp="children"
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
                          {`~${usdValue ?? 0} USDT`}
                        </span>
                      }
                      value={walletAmount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, "");
                        const validValue = value.match(/^\d*\.?\d{0,3}$/)
                          ? value
                          : value.slice(0, -1);
                        setWalletAmount(validValue);
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

        {/* claim UI  */}
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
              <h4>Reward redeem</h4>
            </div>

            <div className="claim__para">
              <h4>Are you sure you want to reedem rewards?</h4>
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

        {/* Qr Reedem */}
        <Modal
          width={700}
          centered={true}
          footer={null}
          open={isModalScanQr}
          onOk={handleOk}
          onCancel={handleCancel}
          wrapClassName="custom-modal"
        >
          <div className="qr">
            <div id="reader"></div>
            <div className="deposit__btn">
              {cancelBtnShow && (
                <Button
                  className="default-btn"
                  onClick={() => {
                    handleCancel();
                    qrCodeDetails?.stop();
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </Modal>

        {/* Qr Claim Modal */}
        <Modal
          width={408}
          centered={true}
          footer={null}
          open={isModalQrClaim}
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
                Avl:
                <span>{`${userProfile?.claimed_reward_points ?? 0} tPOP`}</span>
              </h4>
            </div>
            <div id="auth-form">
              <Form.Item>
                <Space.Compact>
                  <Input
                    addonAfter={`~${QrUsdValue} USDT`}
                    placeholder="Search by id etc."
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, "");
                      const validValue = value.match(/^\d*\.?\d{0,3}$/)
                        ? value
                        : value.slice(0, -1);
                      setAmount(validValue);
                      calculateQrUsdValue(validValue);
                    }}
                  />
                </Space.Compact>
                {usdError && (
                  <p className="ant-form-item-explain-error">{usdError}</p>
                )}
              </Form.Item>
            </div>
            <div className="claim__para">
              <p>
                To process the Redeem option, maintain the MATIC balance in your
                wallet.
              </p>
            </div>
            <div className="deposit__btn">
              <Button
                className="default-btn"
                onClick={handleRedeemToken}
                loading={rewardLoader}
              >
                Redeem now
              </Button>
              <Button
                className="outline-btn"
                onClick={handleCancel}
                disabled={rewardLoader}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          width={408}
          centered={true}
          footer={null}
          open={isModalReward}
          onOk={handleOk}
          onCancel={handleCancel}
          wrapClassName="custom-modal"
        >
          <div className="claim">
            <div className="claim__img">
              <img src={claimImg} alt="" />
              <h4>Reward redeem</h4>
            </div>
            <div className="claim__reward-btn">
              <Button
                className="default-btn"
                onClick={() => {
                  setIsModalScanQr(true);
                  handleOpenScanner();
                  setIsModalReward(false);
                }}
              >
                Scan QR
              </Button>
              <Button
                className="default-btn"
                onClick={() => {
                  setIsModalQrClaim(true);
                  setIsModalReward(false);
                }}
              >
                Reward redeem
              </Button>
            </div>
            <div className="deposit__btn">
              <Button className="outline-btn" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* reward sucessfull */}
        <Modal
          width={450}
          centered={true}
          footer={null}
          open={isModalSuccess}
          onOk={() => {
            handleOk();
            fetchProfile();
            fetchBalances();
          }}
          onCancel={null}
          maskClosable={false}
          keyboard={false}
          wrapClassName="custom-modal"
        >
          <div className="success">
            <div className="success__img">
              <img src={successImg} alt="" />
              <h4>{`${redeemResponse?.valuebalance ?? 0}  tPOP`}</h4>
              <h5>{`$${
                Number(redeemResponse?.valuebalance) * (0.1).toFixed(3)
              }`}</h5>
            </div>
            <div className="success__content">
              <p>You have Sucessfully Redmeeded the Reward Amount</p>
              <div className="success__btn">
                <Button
                  className="default-btn"
                  onClick={() => {
                    handleCancel();
                    fetchProfile();
                    fetchBalances();
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </Loader>
    </>
  );
};

export default Wallet;
