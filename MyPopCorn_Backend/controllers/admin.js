const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const bcrypt = require("bcryptjs");
const EmitData = require("../services/emitData");
const Admin = require("../models/admin");
const Notification = require("../models/notification");
const createWallet = require("../services/wallet");
const checkBalance = require("../services/wallet");
const popcorn = require("../services/popconsurvey");
const User = require("../models/user");
const sgMail = require('@sendgrid/mail');
const Transaction = require("../models/transaction");
const axios = require("axios");
const Email = require('../models/email');


let cachedGasPriceData = null;
let lastFetchedTime = null;


async function fetchGasPrice() {
  try {
    if (cachedGasPriceData && lastFetchedTime && (Date.now() - lastFetchedTime) < 12 * 60 * 60 * 1000) {
      return cachedGasPriceData; 
    }

    let gasPriceResponse;
    for (let i = 0; i < 3; i++) {
      try {
        gasPriceResponse = await axios.get(
          "https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken"
        );
        break;
      } catch (error) {
        console.log("Retrying gas price fetch...", i + 1);
        if (i === 2) throw error;
      }
    }

    if (gasPriceResponse.data.status === "1" && gasPriceResponse.data.message === "OK") {
      cachedGasPriceData = gasPriceResponse.data;
      lastFetchedTime = Date.now();
    } else {
      throw new Error("Failed to fetch USD price from PolygonScan API");
    }

    return cachedGasPriceData;
  } catch (error) {
    throw new Error("Error fetching gas price: " + error.message);
  }
}

class AdminController {
  constructor() {}

  async createNewUser(req, res) {
    try {
      const { name, email, password, userprofile } = req.body;

      if (!email) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Please provide email",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Email is already registered in User ",
        });
      }

      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Email is already registered in Admin ",
        });
      }

      const walletInfo = await createWallet.generateEthWallet();
      let hashedPassword = null;

      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const admin = new Admin({
        name,
        email,
        password: hashedPassword,
        secret2FA: speakeasy.generateSecret().base32,
        address: walletInfo.address,
        privatekey: walletInfo.privateKey,
        isVerified: true,
        user_type: "Admin",
        tokenaddress :'0x19A05c043E6aaea33AD6EaDaBa29b42204884E1B',
        web3url: 'https://polygon-amoy.g.alchemy.com/v2/KGz3a0WnAbxdQRNP6m5cdquEjge-nkvR',
        user_profile: userprofile,
        status: true,
        Action: true,
      });

      await admin.save();
      await new Notification({
        user_id: admin._id,
        message: `Admin registration successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "register",
        type: "",
      }).save();
      let data = await Notification.find({ user_id: admin._id, read: false })
        .sort({ createdAt: -1 })
        .limit(5);
      EmitData.sendData("new_notification", admin._id, data);
      const userResponse = admin.toObject();
      delete userResponse.password;
      delete userResponse.secret2FA;
      delete userResponse.privatekey;
      return res.json({
        status: 200,
        success: true,
        data: userResponse,
        message: "Admin registration Successfully",
      });
    } catch (error) {
      console.log("Error @ createNewUser: ", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Failed to create new user",
        error: error,
      });
    }
  }

  async passwordlogin(req, res) {
    try {
      const { email, password } = req.body;
  
      if (!email) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Please provide an email",
        });
      }
  
      // Fetch the admin with the full set of fields
      const admin = await Admin.findOne({ email });
  
      if (!admin) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Invalid email or password",
        });
      }



  
      if (admin.enable2FA) {
        // Remove sensitive fields from the response object
        const adminData = admin.toObject();
        delete adminData.password;
        delete adminData.secret2FA;
        delete adminData.privatekey;
  
        return res.status(200).json({
          status: 200,
          success: true,
          message: "G2FA is enabled, provide G2FA code to get the token",
          data: adminData,
        });
      }
  
      if (password) {
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return res.status(400).json({
            status: 400,
            success: false,
            message: "Invalid email or password",
          });
        }
      }
  
      const token = await admin.generateAuthToken();
  
      await new Notification({
        user_id: admin._id,
        message: `Logged in Successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Login",
        type: "",
      }).save();
  
      let notifications = await Notification.find({
        user_id: admin._id,
        read: false,
      })
        .sort({ createdAt: -1 })
        .limit(5);
  
      EmitData.sendData("new_notification", admin._id, notifications);
  
      // Remove sensitive fields before sending the final response
      const adminData = admin.toObject();
      delete adminData.password;
      delete adminData.secret2FA;
      delete adminData.privatekey;
  
      return res
        .cookie("admintoken", token, {
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: true,
        })
        .json({
          status: 200,
          success: true,
          data: adminData,
          message: "Login Successfully",
        });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        status: 500,
        success: false,
        message: "Internal server error",
      });
    }
  }
  

  async verify2FA(req, res) {
    const adminId = req.params.adminId;
    console.log(adminId);
    const { otp } = req.body;

    try {
      const admin = await Admin.findById(adminId).select([
        "-password",
        "-privatekey",
      ]);

      if (!admin || !admin.enable2FA) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "2FA verification not required",
        });
      }

      const secret = admin.secret2FA;
      const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token: otp,
      });

      if (!verified) {
        return res
          .status(400)
          .json({ status: 400, success: false, message: "Invalid OTP code" });
      }

      const token = await admin.generateAuthToken();

      await new Notification({
        user_id: admin._id,
        message: `Logged in Successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Login",
        type: "",
      }).save();

      let notifications = await Notification.find({
        user_id: admin._id,
        read: false,
      })
        .sort({ createdAt: -1 })
        .limit(5);

      EmitData.sendData("new_notification", admin._id, notifications);

      const adminData = admin.toObject();
    delete adminData.secret2FA;

      return res
        .cookie("admintoken", token, {
          maxAge: 1000 * 60 * 60 * 24 * 15,
          httpOnly: false,
        })
        .json({
          status: 200,
          success: true,
          message: "Login Successfully",
          data: adminData,
        });
    } catch (error) {
      console.error("Error@ admin verify2FA:", error);
      return res
        .status(500)
        .json({ status: 500, success: false, error: "Something went wrong" });
    }
  }

  async getqr(req, res) {
    try {
      const adminId = req.admin;

      const admin = await Admin.findById(adminId);

      if (!admin) {
        return res
          .status(404)
          .json({ status: 404, success: false, message: "Admin not found" });
      }

      if (!admin.secret2FA) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Admin has not set up 2FA",
        });
      }

      const otpauthUrl = speakeasy.otpauthURL({
        secret: admin.secret2FA,
        label: `${admin.email} - popcorn survey`,
        issuer: "popcorn survey",
        encoding: "base32",
        algorithm: "sha1",
      });

      const otp = speakeasy.totp({
        secret: admin.secret2FA,
        encoding: "base32",
        algorithm: "sha1",
      });

      qrcode.toDataURL(otpauthUrl, (err, dataUrl) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            success: false,
            message: "Error generating QR code",
          });
        } else {
          const qrCodeMessage = admin.enable2FA
            ? "Scan this QR code with your Google Authenticator app."
            : "2FA is not enabled for this user. Use the secret2FA for manual setup in your authenticator app.";

          return res.status(200).json({
            status: 200,
            success: true,
            message: "Your QR code was successfully generated",
            qrCode: dataUrl,
            secret2FA: admin.secret2FA,
            message: qrCodeMessage,
          });
        }
      });
    } catch (error) {
      console.error("Error@ admin getqr:", error);
      return res
        .status(500)
        .json({ status: 500, success: false, message: "Something went wrong" });
    }
  }

  async qrcodeEnableDisable(req, res, next) {
    const admin = req.admin;
    var result = speakeasy.totp.verify({
      secret: admin.secret2FA,
      encoding: "base32",
      token: req.body.otp,
    });
    if (result) {
      if (admin.enable2FA === false) {
        admin.enable2FA = true;
        await admin.save();
        await new Notification({
          user_id: admin._id,
          message: "2FA Enabled Successfully",
          title: "2FA Enabled",
          type: "",
        }).save();
        let data = await Notification.find({ user_id: admin._id, read: false })
        .sort({ createdAt: -1 })
        .limit(5);
      EmitData.sendData("new_notification", admin._id, data);
        return res
          .status(200)
          .send({ success: true, message: "2FA Enabled Successfully" });
      } else {
        admin.enable2FA = false;
        await admin.save();
        await new Notification({
          user_id: admin._id,
          message: "2FA Disabled Successfully",
          title: "2FA Disabled",
          type: "",
        }).save();
        let data = await Notification.find({ user_id: admin._id, read: false })
        .sort({ createdAt: -1 })
        .limit(5);
      EmitData.sendData("new_notification", admin._id, data);
        res
          .status(200)
          .send({ success: true, message: "2FA Disabled Successfully " });
      }
    } else {
      return res
        .status(400)
        .send({ success: false, message: "You have entered wrong OTP" });
    }
  }

  async AdminInfo(req, res, next) {
    const admin = await Admin.findById(req.admin._id).select([
      "-password",
      "-secret2FA",
      "-privatekey",
    ]);
    res.status(200).json({
      success: true,
      data: admin,
      message: "Successfully Fetched Admin Info",
    });
  }

  async updateAdmin(req, res) {
    try {
      const { name, email, user_profile } = req.body;
      const admin = await Admin.findById(req.admin).select([
        "-password",
        "-secret2FA",
        "-privatekey",
      ]);
      if (!admin) {
        return res.status(404).send({ error: "Admin not found" });
      }
      if (name) admin.name = name;
      if (email) admin.email = email;
      if (user_profile) admin.user_profile = user_profile;
      await admin.save();
      await new Notification({
        user_id: admin._id,
        message: `Profile updated Successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Profile update",
        type: "",
      }).save();
      let data = await Notification.find({ user_id: admin._id, read: false })
        .sort({ createdAt: -1 })
        .limit(5);
      EmitData.sendData("new_notification", admin._id, data);
      return res.json({
        status: 200,
        success: true,
        data: admin,
        message: "Profile updated Successfully",
      });
    } catch (error) {
      console.log("Error @ updateAdmin: ", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Failed to update the profile",
        error: error,
      });
    }
  }


  async updatetoken(req, res) {
    try {
      const { tokenaddress } = req.body;
      const admin = await Admin.findById(req.admin).select([
        "-password",
        "-secret2FA",
        "-privatekey",
      ]);
  
      if (!admin) {
        return res.status(404).send({ error: "Admin not found" });
      }
  
      let symbol;
      let user = req.admin;
      const web3ProviderUrl = user.web3url;
      try {
        symbol = await popcorn.getTokenSymbol(tokenaddress , web3ProviderUrl); 
        console.log("Token Symbol:==============", symbol); 
      } catch (error) {
        return res.status(400).send({ error: error.message }); 
      }
  
      if (symbol !== 'POP' && symbol !== 'tPOP') {
        return res.status(400).send({ error: 'Invalid token symbol. Only POP or tPOP are allowed.' });
      }
  
      if (tokenaddress) admin.tokenaddress = tokenaddress;
  
      if (symbol === 'tPOP') {
        admin.web3url = 'https://polygon-amoy.g.alchemy.com/v2/KGz3a0WnAbxdQRNP6m5cdquEjge-nkvR';
      } else if (symbol === 'POP') {
        admin.web3url = 'https://polygon-mainnet.infura.io/v3/9eb6ef4f94c64ad78d6d5a257debfbc1';
      }
  
      await admin.save();
  
      await new Notification({
        user_id: admin._id,
        message: `Token address updated Successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Token address update",
        type: "",
      }).save();
  
      let data = await Notification.find({ user_id: admin._id, read: false })
        .sort({ createdAt: -1 })
        .limit(5);
      EmitData.sendData("new_notification", admin._id, data);
  
      return res.json({
        status: 200,
        success: true,
        data: admin,
        message: "Token address updated Successfully",
      });
    } catch (error) {
      console.log("Error @ updateAdmin: ", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Failed to update the Token address",
        error: error.message,
      });
    }
  }
  
  
  

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;

      const admin = await Admin.findById(req.admin).select([
        "-secret2FA",
        "-privatekey",
      ]);

      if (!admin) {
        return res.status(404).send({ error: "Admin not found" });
      }
      if (admin.password === null) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Password is not available",
        });
      }
      const isMatch = await bcrypt.compare(oldPassword, admin.password);
      if (!isMatch) {
        return res.status(400).send({ error: "Incorrect old password" });
      }

      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .send({ error: "New password and confirm password do not match" });
      }

      if (newPassword === oldPassword) {
        return res.status(400).send({
          error: "New password must be different from the old password",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 8);
      admin.password = hashedPassword;

      await admin.save();

      await new Notification({
        user_id: admin._id,
        message: `Password updated Successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Password updated",
        type: "",
      }).save();
      let data = await Notification.find({ user_id: admin._id, read: false })
        .sort({ createdAt: -1 })
        .limit(5);
      EmitData.sendData("new_notification", admin._id, data);
      res.clearCookie("admintoken");
      return res.json({
        status: 200,
        success: true,
        data: admin,
        message: "Password updated Successfully",
      });
    } catch (error) {
      console.log("Error @ updateAdmin: ", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Failed to update the Password",
        error: error,
      });
    }
  }

  async getallnotifications(req, res, next) {
    const limit = parseInt(req.body.limit);
    const page = parseInt(req.body.page);
    const skip = (page - 1) * limit;
    let allnotification = await Notification.find({
      user_id: req.admin._id,
      deleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    let totalCount = await Notification.find({
      user_id: req.admin._id,
      deleted: false,
    }).countDocuments();
    let unReadCount = await Notification.find({
      user_id: req.admin._id,
      deleted: false,
      read: false,
    }).countDocuments();
    res.status(200).json({
      status: 200,
      success: true,
      count: totalCount,
      unReadCount: unReadCount,
      data: allnotification,
      message: "Notification Details Fetch Success",
    });
  }

  async unReadNotifications(req, res) {
    try {
      let notification = await Notification.find({
        user_id: req.admin._id,
        deleted: false,
        read: false,
      });
      return res.status(200).json({
        status: 200,
        success: true,
        count: notification.length,
        data: notification,
        message: "Unread Notification Details Fetch Success",
      });
    } catch (error) {
      console.log("Error @unReadNotifications : ", error);
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Failed to Fetch the Unread Notifications",
        error: error.message,
      });
    }
  }

  async deleteallnotifications(req, res, next) {
    let deleted = await Notification.deleteMany({
      user_id: req.admin._id,
      deleted: false,
    });
    res.status(200).json({ success: true, message: "Notification Deleted" });
  }

  async readallnotifications(req, res) {
    const read = await Notification.updateMany(
      { user_id: req.admin._id, read: false },
      { $set: { read: true } }
    );
    res
      .status(200)
      .json({ success: true, data: read, message: "Notifications readed" });
  }


  
  async  getBalances(req, res) {
    try {
      let user = req.admin;
      const wallet_address = user.address;
      const web3ProviderUrl = user.web3url;
  
      let balance = await checkBalance.checkBalance(wallet_address , web3ProviderUrl);
  
      const gasPriceData = await fetchGasPrice();
  
      const usdPrice = gasPriceData.result.UsdPrice;
      const approximateValueInUSD = (parseFloat(balance) * parseFloat(usdPrice)).toFixed(4);
      const balanceValue = parseFloat(balance).toFixed(4);
  
      return res.status(200).json({
        status: 200,
        success: true,
        Balance: balanceValue,
        approximateValueInUSD: approximateValueInUSD,
        usdPrice: usdPrice,
        message: "Balance and approximate value fetched successfully",
      });
    } catch (error) {
      console.log("Error @ getBalances", error.message);
      return res.status(500).json({ message: error.message, success: false });
    }
  }
  
  
  

  async getBalancesss(req, res) {
    try {
      let user = req.admin;
      const wallet_address = user.address;
      const tokenadress = user.tokenaddress;
      const web3ProviderUrl = user.web3url;

      let Balance = await popcorn.getBalanceOf(wallet_address , tokenadress , web3ProviderUrl);
      const balanceOfvalue = Balance / (10 ** 18)
      const approximateValue = balanceOfvalue * 0.1;

  
      return res.status(200).json({
        status: 200,
        success: true,
        Balance: balanceOfvalue, 
        approximateValue: approximateValue.toFixed(3),
        message: "Balance and approximate value fetched successfully",
      });
    } catch (error) {
      console.log("Error @ getBalancesss", error.message);
      return res.status(500).json({ message: error.message, success: false });
    }
  }
  
  
  

  async Fundtranfered(req, res) {
    try {
      const { receiverAddress, amountInEther } = req.body;
      let user = req.admin;
      const wallet_address = user.address;
      const wallet_privatekey = user.privatekey;
      const web3ProviderUrl = user.web3url;

      let transfer = await checkBalance.transferFunds(
        wallet_address,
        receiverAddress,
        amountInEther,
        wallet_privatekey,
        web3ProviderUrl
      );

      console.log("============================", transfer.transactionHash);

      const newTransaction = new Transaction({
        user_id: user._id,
        coin: "MATIC",
        transaction_status: "success",
        status: "send",
        from_address: user.address,
        to_address: receiverAddress,
        amount: amountInEther,
        transaction_id: transfer.transactionHash,
      });

      await newTransaction.save();

      await new Notification({
        user_id: user._id,
        message: `Transferred ${amountInEther} MATIC to ${receiverAddress} - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Fund transferred",
        type: "",
      }).save();

      let notifications = await Notification.find({
        user_id: user._id,
        read: false,
      })
        .sort({ createdAt: -1 })
        .limit(5);

      EmitData.sendData("new_notification", user._id, notifications);

      return res.status(200).json({
        status: 200,
        success: true,
        Balance: transfer,
        message: "Fund transferred successfully",
      });
    } catch (error) {
      console.log("Error @ Fund transferred ", error.message);
      if (error.message.includes("Transaction has been reverted by the EVM")) {
        const newTransaction = new Transaction({
          user_id: req.admin._id,
          coin: "MATIC",
          transaction_status: "failed",
          status: "Send",
          from_address: req.admin.address,
          to_address: req.body.receiverAddress,
          amount: req.body.amountInEther,
          transaction_id: error.receipt.transactionHash,
        });

        await newTransaction.save();
      }
      return res.status(400).json({
        message: "Insufficient balance or network busy",
        success: false,
      });
    }
  }

  async tokentransfer(req, res) {
    try {
      const { to, value } = req.body;
      let user = req.admin;
      const wallet_address = user.address;
      const wallet_privatekey = user.privatekey;
      const tokenaddress = user.tokenaddress;
      const web3ProviderUrl = user.web3url;

      let tokentransfer = await popcorn.safeTransfer(
        wallet_address,
        to,
        value,
        wallet_privatekey,
        tokenaddress,
        web3ProviderUrl
      );

      const newTransaction = new Transaction({
        user_id: user._id,
        coin: "POPCORN",
        transaction_status: "success",
        status: "send",
        from_address: user.address,
        to_address: to,
        amount: value,
        transaction_id: tokentransfer.transactionHash,
      });

      await newTransaction.save();

      await new Notification({
        user_id: user._id,
        message: `Transferred ${value} POPCORN TOKEN to ${to} - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Token transferred",
        type: "",
      }).save();

      let notifications = await Notification.find({
        user_id: user._id,
        read: false,
      })
        .sort({ createdAt: -1 })
        .limit(5);

      EmitData.sendData("new_notification", user._id, notifications);
      return res.status(200).json({
        status: 200,
        success: true,
        Balance: tokentransfer,
        message: "token tranfered successfully",
      });
    } catch (error) {
      console.log("Error @ token tranfered ", error.message);
      if (error.message.includes("Transaction has been reverted by the EVM")) {
        const newTransaction = new Transaction({
          user_id: req.admin._id,
          coin: "POPCORN",
          transaction_status: "failed",
          status: "Send",
          from_address: req.admin.address,
          to_address: req.body.to,
          amount: req.body.value,
          transaction_id: error.receipt?.transactionHash,
        });

        await newTransaction.save();
      }
      return res.status(500).json({
        message: "Insufficient balance or network busy",
        success: false,
      });
    }
  }

  async gettransaction(req, res) {
    try {
      const { limit, page, key, status } = req.body;
      const limitValue = parseInt(limit) || 10;
      const pageValue = parseInt(page) || 1;
      const skip = (pageValue - 1) * limitValue;
  
      const search = {
        user_id: req.admin._id,
        ...(key
          ? {
              $or: [
                { from_address: { $regex: new RegExp(key, "i") } },
                { to_address: { $regex: new RegExp(key, "i") } },
                { transaction_id: { $regex: new RegExp(key, "i") } },
              ],
            }
          : {}),
        ...(status ? { transaction_status: status } : {}),
      };
  
      const transactions = await Transaction.find(search)
        .populate({
          path: "user_id",
          select: "-password -secret2FA -privatekey",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitValue);
  
      const totalCounts = await Transaction.countDocuments(search);
  
      res.status(200).json({
        success: true,
        message: "Successfully fetched transactions",
        data: transactions,
        totalCount: totalCounts,
        currentPage: pageValue,
        totalPages: Math.ceil(totalCounts / limitValue),
      });
    } catch (error) {
      console.error("Error @ gettransaction: ", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch transactions",
        error: error.message,
      });
    }
  }
  

  async logout(req, res) {
    try {
      const address = await Admin.findOne({ _id: req.admin._id });
      if (address) {
        res.clearCookie("admintoken");
        res
          .status(200)
          .json({ status: 200, success: true, message: "Logout Successfully" });
      }
    } catch (err) {
      console.error("Error during logout:", err);
      return res.status(400).json({
        status: 400,
        success: false,
        message: "something went wrong",
        error: err,
      });
    }
  }

  async  sendmail(req, res) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
    try {
      const { subject, message_one, message_two, message_three } = req.body;
      if (!subject || !message_one) {
        return res.status(400).json({ error: 'Subject and messages are required' });
      }
  
      const users = await User.find({ status: true });
      const userIds = users.map(user => user._id);
  
      const emails = users.map(user => ({
        to: user.email,
        from: 'hello@mypopcorn.io',
        templateId: 'd-34a84d8772c54c0f939a93df870a5a6a',
        dynamic_template_data: {
          title: subject, 
          username: user.name,
          message_one: message_one, 
          message_two: message_two || "", 
          message_three: message_three || "", 
        },
      }));
  
      await Promise.all(emails.map(email => 
        sgMail.send(email)
          .then(result => {
            console.log('Email sent successfully:', result);
          })
          .catch(err => {
            console.log("Error sending email:", err.response.body.errors);
          })
      ));
  
      const notification = new Email({
        title: subject,
        message: `${message_one} ${message_two || ""} ${message_three || ""}`, 
        toUsers: userIds,
        fromUser: req.admin._id,
      });
      await notification.save();
  
      res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
      console.error('Error sending emails:', error.response ? error.response.body : error);
      res.status(500).json({ error: 'Failed to send emails' });
    }
  }
  
  async getemaildata(req, res) {
    try {
      const limit = parseInt(req.body.limit);
      const page = parseInt(req.body.page);
      const skip = (page - 1) * limit;


      const responses = await Email.find({ deleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCounts = await Email.countDocuments({ deleted: false }); 

      res.status(200).json({
        success: true,
        message: "Successfully fetched emaildata",
        data: responses,
        totalCount: totalCounts,
      });
    } catch (error) {
      console.error("Error @ emaildata: ", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch emaildata",
        error,
      });
    }
  }


  async deleteemail  (req, res)  {
    try {
      const emailId = req.params.id; 
  
      const email = await Email.findByIdAndUpdate(emailId, { deleted: true }, { new: true });
  
      if (!email) {
        return res.status(404).json({success: false, message: 'Email not found' });
      }
  
      res.status(200).json({success: true, message: 'Email deleted successfully', email });
    } catch (error) {
      console.error(error);
      res.status(500).json({success: false, message: 'Internal server error' });
    }
  };
  

  async removeUserProfile  (req, res)  {
    try {
      const adminId = req.admin._id; 
  
      const updatedAdmin = await Admin.findByIdAndUpdate(
        adminId,
        { $unset: { user_profile: "" } },
        { new: true, runValidators: true }
      );
  
      if (!updatedAdmin) {
        return res.status(404).json({success: false, error: "Admin not found" });
      }
  
      res.status(200).json({success: true, message: "Admin profile removed successfully", admin: updatedAdmin });
    } catch (error) {
      res.status(500).json({success: false, error: error.message });
    }
  }



  async getapikey  (req, res)  {
    const API_KEY = '453432453454453613434499'; 
    try {
    return res.status(200).json({
      status: 200,
      success: true,
      apiKey: API_KEY,
      message: "API Key retrieved successfully",
    });
  } catch (error) {
    console.log("Error @ getApiKey: ", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to retrieve API Key",
      error: error,
    });
  }
}

}

module.exports = AdminController;
