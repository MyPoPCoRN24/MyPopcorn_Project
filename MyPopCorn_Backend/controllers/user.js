const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const bcrypt = require("bcryptjs");
const EmitData = require("../services/emitData");
const User = require("../models/user");
const Notification = require("../models/notification");
const createWallet = require("../services/wallet");
const checkBalance = require("../services/wallet");
const popcorn = require("../services/popconsurvey");
const Survey = require("../models/surveycreation");
const Admin = require("../models/admin");
const Transaction = require("../models/transaction");
const reward = require("../models/reward");
const axios = require("axios");



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

class UserController {
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

      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Email is already registered in Admin",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Email is already registered in User",
        });
      }

      const walletInfo = await createWallet.generateEthWallet();
      let hashedPassword = null;
      let passwordthere = false;

      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
        passwordthere = true;
      }

      const user = new User({
        name,
        email,
        password: hashedPassword,
        secret2FA: speakeasy.generateSecret().base32,
        address: walletInfo.address,
        privatekey: walletInfo.privateKey,
        isVerified: true,
        user_type: "User",
        user_profile: userprofile,
        status: true,
        Action: true,
        passwordthere,
      });

      await user.save();

      await new Notification({
        user_id: user._id,
        message: `User registration Successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "register",
        type: "",
      }).save();

      let data = await Notification.find({ user_id: user._id, read: false })
        .sort({ createdAt: -1 })
        .limit(5);

      EmitData.sendData("new_notification", user._id, data);

      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.secret2FA;
      delete userResponse.privatekey;

      return res.json({
        status: 200,
        success: true,
        data: userResponse,
        message: "User registration Successfully",
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

      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Email is already registered in Admin ",
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Invalid email or password",
        });
      }

      if (user.password === null) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Password is not available",
        });
      }

      if (user.enable2FA) {
        const userData = user.toObject();
        delete userData.password;
        delete userData.secret2FA;
        delete userData.privatekey;
        return res.status(200).json({
          status: 200,
          success: true,
          message: "G2FA is enabled, provide G2FA code to get the token",
          data: userData,
        });
      }

      if (!user.status) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Sorry, your account is inactive. Please contact admin",
        });
      }

      if (!user.Action) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "You are restricted by the admin",
        });
      }

      if (password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({
            status: 400,
            success: false,
            message: "Invalid email or password",
          });
        }
      }

      const token = await user.generateAuthToken();

      await new Notification({
        user_id: user._id,
        message: `Logged in Successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Login",
        type: "",
      }).save();

      let notifications = await Notification.find({
        user_id: user._id,
        read: false,
      })
        .sort({ createdAt: -1 })
        .limit(5);

      EmitData.sendData("new_notification", user._id, notifications);

      const userData = user.toObject();
      delete userData.password;
      delete userData.secret2FA;
      delete userData.privatekey;

      return res
        .cookie("token", token, {
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: true,
        })
        .json({
          status: 200,
          success: true,
          data: userData,
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

  async login(req, res) {
    try {
      const { name, email, userprofile } = req.body;

      if (!email) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Please provide email",
        });
      }

      const emailaddress = await User.findOne({ email })

      if (emailaddress) {
        if (emailaddress.enable2FA) {
          const userData = emailaddress.toObject();
      delete userData.password;
      delete userData.secret2FA;
      delete userData.privatekey;
          return res.status(200).json({
            status: 200,
            success: true,
            message: "G2FA is enabled, provide G2FA code to get the token",
            data: userData,
          });
        }
        if (emailaddress.status === true) {
          if (emailaddress.Action === true) {
            const token = await emailaddress.generateAuthToken();
            await new Notification({
              user_id: emailaddress._id,
              message: `Logged in Successfully - IP: ${
                req.headers["x-forwarded-for"] || req.connection.remoteAddress
              }`,
              title: "Login",
              type: "",
            }).save();

            let data = await Notification.find({
              user_id: emailaddress._id,
              read: false,
            })
              .sort({ createdAt: -1 })
              .limit(5);

            EmitData.sendData("new_notification", emailaddress._id, data);

            const userData = emailaddress.toObject();
      delete userData.password;
      delete userData.secret2FA;
      delete userData.privatekey;

            return res
              .cookie("token", token, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: false,
              })
              .json({
                status: 200,
                success: true,
                data: userData,
                message: "Login Successfully",
              });
          } else {
            return res.status(400).json({
              status: 400,
              success: false,
              message: "You are restricted by the admin",
            });
          }
        } else {
          return res.status(400).json({
            status: 400,
            success: false,
            message: "Sorry, your account is inactive. Please contact admin",
          });
        }
      } else {
        const walletInfo = await createWallet.generateEthWallet();

        const user = new User({
          name,
          email,
          password: null,
          secret2FA: speakeasy.generateSecret().base32,
          address: walletInfo.address,
          privatekey: walletInfo.privateKey,
          isVerified: true,
          user_type: "User",
          user_profile: userprofile,
          status: true,
          Action: true,
        });

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.secret2FA;
        delete userResponse.privatekey;

        const token = await user.generateAuthToken();

        await new Notification({
          user_id: user._id,
          message: `Logged in Successfully - IP: ${
            req.headers["x-forwarded-for"] || req.connection.remoteAddress
          }`,
          title: "Login",
          type: "",
        }).save();

        let data = await Notification.find({ user_id: user._id, read: false })
          .sort({ createdAt: -1 })
          .limit(5);

        EmitData.sendData("new_notification", user._id, data);

        return res
          .cookie("token", token, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: false,
          })
          .json({
            status: 200,
            success: true,
            data: userResponse,
            message: "Login Successfully",
          });
      }
    } catch (error) {
      console.log("Error @ login: ", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Failed in Signin",
        error: error,
      });
    }
  }

  async updateuser(req, res) {
    try {
      const { name, email, user_profile } = req.body;
      const user = await User.findById(req.user).select([
        "-password",
        "-secret2FA",
        "-privatekey",
      ]);
      if (!user) {
        return res.status(404).send({ error: "user not found" });
      }
      if (name) user.name = name;
      if (email) user.email = email;
      if (user_profile) user.user_profile = user_profile;
      await user.save();
      await new Notification({
        user_id: user._id,
        message: `Profile updated Successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Profile updated",
        type: "",
      }).save();
      let data = await Notification.find({ user_id: user._id, read: false })
        .sort({ createdAt: -1 })
        .limit(5);
      EmitData.sendData("new_notification", user._id, data);
      return res.json({
        status: 200,
        success: true,
        data: user,
        message: "Profile updated Successfully",
      });
    } catch (error) {
      console.log("Error @ updateuser: ", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Failed to update the profile",
        error: error,
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
  
      // Fetch user and exclude sensitive fields
      const user = await User.findById(req.user).select([
        "-secret2FA",
        "-privatekey",
      ]);

      console.log("User password is",user.password); 

  
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }


  
      if (user.password === null) {
        console.log("User password is null",user.password); 
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Password is not available",
        });
      }
  
      // Verify the old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).send({ error: "Incorrect old password" });
      }
  
      // Check if the new password matches the confirmation password
      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .send({ error: "New password and confirm password do not match" });
      }
  
      // Ensure the new password is different from the old one
      if (newPassword === oldPassword) {
        return res.status(400).send({
          error: "New password must be different from the old password",
        });
      }
  
      // Hash the new password and save it
      const hashedPassword = await bcrypt.hash(newPassword, 8);
      user.password = hashedPassword;
      await user.save();
  
      // Notify the user of a successful password change
      await new Notification({
        user_id: user._id,
        message: `Password updated Successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Password updated",
        type: "",
      }).save();
  
      let data = await Notification.find({ user_id: user._id, read: false })
        .sort({ createdAt: -1 })
        .limit(5);
  
      EmitData.sendData("new_notification", user._id, data);
      res.clearCookie("token");

      return res.json({
        status: 200,
        success: true,
        data: user,
        message: "Password updated Successfully",
      });
    } catch (error) {
      console.error("Error @ changePassword: ", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Failed to update the Password",
        error: error,
      });
    }
  }
  

  async verify2FA(req, res) {
    const userId = req.params.userId;
    console.log(userId);
    const { otp } = req.body;

    try {
      const user = await User.findById(userId).select([
        "-password",
        "-privatekey",
      ]);

      if (!user || !user.enable2FA) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "2FA verification not required",
        });
      }

      const secret = user.secret2FA;
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

      const token = await user.generateAuthToken();

      await new Notification({
        user_id: user._id,
        message: `Logged in Successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Login",
        type: "",
      }).save();

      let notifications = await Notification.find({
        user_id: user._id,
        read: false,
      })
        .sort({ createdAt: -1 })
        .limit(5);

      EmitData.sendData("new_notification", user._id, notifications);
      const userdata = user.toObject();
      delete userdata.secret2FA;
      return res
        .cookie("token", token, {
          maxAge: 1000 * 60 * 60 * 24 * 15,
          httpOnly: false,
        })
        .json({
          status: 200,
          success: true,
          message: "Login Successfully",
          data: userdata,
        });
    } catch (error) {
      console.error("Error@ user verify2FA:", error);
      return res
        .status(500)
        .json({ status: 500, success: false, error: "Something went wrong" });
    }
  }

  async getqr(req, res) {
    try {
      const userId = req.user;

      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ status: 404, success: false, message: "user not found" });
      }

      if (!user.secret2FA) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "user has not set up 2FA",
        });
      }

      const otpauthUrl = speakeasy.otpauthURL({
        secret: user.secret2FA,
        label: `${user.email} - popcorn survey`,
        issuer: "popcorn survey",
        encoding: "base32",
        algorithm: "sha1",
      });

      const otp = speakeasy.totp({
        secret: user.secret2FA,
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
          const qrCodeMessage = user.enable2FA
            ? "Scan this QR code with your Google Authenticator app."
            : "2FA is not enabled for this user. Use the secret2FA for manual setup in your authenticator app.";

          return res.status(200).json({
            status: 200,
            success: true,
            message: "Your QR code was successfully generated",
            qrCode: dataUrl,
            secret2FA: user.secret2FA,
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
    const user = req.user;
    var result = speakeasy.totp.verify({
      secret: user.secret2FA,
      encoding: "base32",
      token: req.body.otp,
    });
    if (result) {
      if (user.enable2FA === false) {
        user.enable2FA = true;
        await user.save();
        await new Notification({
          user_id: user._id,
          message: "2FA Enabled Successfully",
          title: "2FA Enabled",
          type: "",
        }).save();
        return res
          .status(200)
          .send({ success: true, message: "2FA Enabled Successfully" });
      } else {
        user.enable2FA = false;
        await user.save();
        await new Notification({
          user_id: user._id,
          message: "2FA Disabled Successfully",
          title: "2FA Disabled",
          type: "",
        }).save();
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

  async userInfo(req, res, next) {
    const user = await User.findById(req.user._id).select([
      "-password",
      "-secret2FA",
      "-privatekey",
    ]);
    res.status(200).json({
      success: true,
      data: user,
      message: "Successfully Fetched User Info",
    });
  }











async  getBalances(req, res) {
  try {
    let user = req.user;
    const wallet_address = user.address;

    const admin = await Admin.findOne({ user_type: 'Admin' }); 
      if (!admin) {
      return res.status(404).json({ message: "Admin not found", success: false });
    }
    const web3ProviderUrl = admin.web3url;
  

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
      let user = req.user;
      const wallet_address = user.address;
      const admin = await Admin.findOne({ user_type: 'Admin' }); 
      if (!admin) {
      return res.status(404).json({ message: "Admin not found", success: false });
    }
    const admin_token_address = admin.tokenaddress;
    const web3ProviderUrl = admin.web3url;

      let balance = await popcorn.getBalanceOf(wallet_address , admin_token_address , web3ProviderUrl);
      const balanceOfvalue = balance / (10 ** 18)

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
      let user = req.user;
      const wallet_address = user.address;
      const wallet_privatekey = user.privatekey;
      const admin = await Admin.findOne({ user_type: 'Admin' }); 
      if (!admin) {
      return res.status(404).json({ message: "Admin not found", success: false });
    }
    const web3ProviderUrl = admin.web3url;

      let transfer = await checkBalance.transferFunds(
        wallet_address,
        receiverAddress,
        amountInEther,
        wallet_privatekey,
        web3ProviderUrl
      );

      const newTransaction = new Transaction({
        user_id: user._id,
        coin: "MATIC",
        transaction_status: "success",
        status: "Send",
        from_address: wallet_address,
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
        message: "Fund tranfered successfully",
      });
    } catch (error) {
      console.log("Error @ Fund tranfered ", error.message);
      if (error.message.includes("Transaction has been reverted by the EVM")) {
        const newTransaction = new Transaction({
          user_id: req.user._id,
          coin: "MATIC",
          transaction_status: "failed",
          status: "Send",
          from_address: req.user.address,
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
      let user = req.user;
      const wallet_address = user.address;
      const wallet_privatekey = user.privatekey;
      const admin = await Admin.findOne({ user_type: 'Admin' }); 
      if (!admin) {
      return res.status(404).json({ message: "Admin not found", success: false });
    }
    const web3ProviderUrl = admin.web3url;

    const admin_token_address = admin.tokenaddress;
      let tokentransfer = await popcorn.safeTransfer(
        wallet_address,
        to,
        value,
        wallet_privatekey,
        admin_token_address,
        web3ProviderUrl
      );
      const newTransaction = new Transaction({
        user_id: user._id,
        coin: "POPCORN",
        transaction_status: "success",
        status: "Send",
        from_address: wallet_address,
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
          user_id: req.user._id,
          coin: "POPCORN",
          transaction_status: "failed",
          status: "Send",
          from_address: req.user.address,
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

  async getallnotifications(req, res, next) {
    try {
      const limit = parseInt(req.body.limit);
      const page = parseInt(req.body.page);
      const skip = (page - 1) * limit;
      let allnotification = await Notification.find({
        user_id: req.user._id,
        deleted: false,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      let totalCount = await Notification.find({
        user_id: req.user._id,
        deleted: false,
      }).countDocuments();
      return res.status(200).json({
        status: 200,
        success: true,
        count: totalCount,
        data: allnotification,
        message: "Notification Details Fetch Success",
      });
    } catch (error) {
      console.log("Error @ getallnotifications :", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: error.message ? error.message : " Error ocurred ",
      });
    }
  }

  async unReadNotifications(req, res) {
    try {
      let notification = await Notification.find({
        user_id: req.user._id,
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
      user_id: req.user._id,
      deleted: false,
    });
    res.status(200).json({ success: true, message: "Notification Deleted" });
  }

  async readallnotifications(req, res) {
    const read = await Notification.updateMany(
      { user_id: req.user._id, read: false },
      { $set: { read: true } }
    );
    res
      .status(200)
      .json({ success: true, data: read, message: "Notifications readed" });
  }

  async logout(req, res) {
    try {
      const address = await User.findOne({ _id: req.user._id });
      if (address) {
        res.clearCookie("token");
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

  async rewardpoints(req, res) {
    try {
      const user = await User.findById(req.user._id).select(
        "name email _id address reward_points"
      );
      if (!user) {
        return res
          .status(404)
          .send({ status: 400, success: false, error: "User not found" });
      }
      res.status(200).json({
        status: 200,
        success: true,
        data: user,
        message: "data fetched Successfully",
      });
    } catch (err) {
      console.error("Error during rewardpoints:", err);
      return res.status(400).json({
        status: 400,
        success: false,
        message: "something went wrong",
        error: err,
      });
    }
  }

  async rewardtransfer(req, res) {
    try {
      let user = req.user;
      const to = user.address;
      const value = user.reward_points;
      const wallet_address = "0x68BE6C099055dd594cB1A3b3DA79aa2e7af2e987";
      const wallet_privatekey =
        "0x9411044f11821e0cecc253a4fdd9450313a50c29368e2ee25e82f77703a9f06b";
        const admin = await Admin.findOne({ user_type: 'Admin' }); 
      if (!admin) {
      return res.status(404).json({ message: "Admin not found", success: false });
    }
    const admin_token_address = admin.tokenaddress;
    const web3ProviderUrl = admin.web3url;

      let tokentransfer = await popcorn.safeTransfer(
        wallet_address,
        to,
        value,
        wallet_privatekey,
        admin_token_address,
        web3ProviderUrl
      );

      const newTransaction = new Transaction({
        user_id: user._id,
        coin: "POPCORN",
        transaction_status: "success",
        status: "Claimed",
        from_address: wallet_address,
        to_address: to,
        amount: value,
        transaction_id: tokentransfer.transactionHash,
      });

      await newTransaction.save();

      const newreward = new reward({
        user_id: user._id,
        reward_points: value,
        isclaimed: true,
        status: "success",
        from_address: wallet_address,
        to_address: to,
        transaction_id: tokentransfer.transactionHash,
      });

      await newreward.save();

      user.claimed_reward_points += value;
      user.reward_points = 0;
      await user.save();

      await new Notification({
        user_id: user._id,
        message: `Token claimed successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Token claimed",
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
        message: "Token claimed successfully",
      });
    } catch (error) {
      console.log("Error @ token transfer: ", error.message);

      if (error.message.includes("Transaction has been reverted by the EVM")) {
        const newTransaction = new Transaction({
          user_id: req.user._id,
          coin: "POPCORN",
          transaction_status: "failed",
          status: "Claimed",
          from_address: "0x68BE6C099055dd594cB1A3b3DA79aa2e7af2e987",
          to_address: req.user.address,
          amount: req.user.reward_points,
          transaction_id: error.receipt.transactionHash,
        });

        await newTransaction.save();
      }


      await new Notification({
        user_id: "66bc33dbddaf4100be9b2c78",
        message: `Insufficient balance check the wallet - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Token claim",
        type: "",
      }).save();

      let notifications = await Notification.find({
        user_id: "66bc33dbddaf4100be9b2c78",
        read: false,
      })
        .sort({ createdAt: -1 })
        .limit(5);

      EmitData.sendData("new_notification", "66bc33dbddaf4100be9b2c78", notifications);

      return res.status(400).json({
        message: "Insufficient balance or network busy",
        success: false,
      });
    }
  }

  async redeemtoken(req, res) {
    try {
      let user = req.user;
      const to = "0x68BE6C099055dd594cB1A3b3DA79aa2e7af2e987";
      const value = req.body.value;
      const wallet_address = user.address;
      const wallet_privatekey = user.privatekey;
      const adminId = "66bc33dbddaf4100be9b2c78";
  
      const admins = await Admin.findOne({ user_type: 'Admin' });
      if (!admins) {
        return res.status(404).json({ message: "Admin not found", success: false });
      }
      const admin_token_address = admins.tokenaddress;
      const web3ProviderUrl = admins.web3url;
  
      let tokentransfer = await popcorn.safeTransfer(
        wallet_address,
        to,
        value,
        wallet_privatekey,
        admin_token_address,
        web3ProviderUrl
      );
  
      const newTransactionRedeemed = new Transaction({
        user_id: user._id,
        coin: "POPCORN",
        transaction_status: "success",
        status: "token redeemed",
        from_address: wallet_address,
        to_address: to,
        amount: value,
        transaction_id: tokentransfer.transactionHash,
      });
      await newTransactionRedeemed.save();
  
      const newTransactionReceived = new Transaction({
        user_id: adminId,
        coin: "POPCORN",
        transaction_status: "success",
        status: "token received",
        from_address: wallet_address,
        to_address: to,
        amount: value,
        transaction_id: tokentransfer.transactionHash,
      });
      await newTransactionReceived.save();
  
      user.claimed_reward_points -= value;
      await user.save();
  
      
  
      admins.total_redeem_token += Number(value); 
await admins.save();
  
      await new Notification({
        user_id: user._id,
        message: `Token redeemed successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Token redeemed",
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
        valuebalance: value,
        message: "Token redeemed successfully",
      });
    } catch (error) {
      console.log("Error @ token transfer: ", error.message);
  
      if (error.message.includes("Transaction has been reverted by the EVM")) {
        const newTransactionFailed = new Transaction({
          user_id: req.user._id,
          coin: "POPCORN",
          transaction_status: "failed",
          status: "token redeemed",
          from_address: req.user.address,
          to_address: "0x24E8bc500e375ce99e915CFA38AE99D353F83137",
          amount: req.body.value,
          transaction_id: error.receipt.transactionHash,
        });
        await newTransactionFailed.save();
      }
  
      return res.status(400).json({
        message: "Insufficient balance or network busy",
        success: false,
      });
    }
  }
  

  async getusertransaction(req, res) {
    try {
      const { limit, page, key, status } = req.body;
      const limitValue = parseInt(limit) || 10;
      const pageValue = parseInt(page) || 1;
      const skip = (pageValue - 1) * limitValue;
  
      // Constructing the search object
      const search = {
        user_id: req.user._id,
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
  
      // Fetching transactions with pagination and search criteria
      const transactions = await Transaction.find(search)
        .populate({
          path: "user_id",
          select: "-password -secret2FA -privatekey",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitValue);
  
      // Counting the total number of matching documents
      const totalCounts = await Transaction.countDocuments(search);
  
      // Sending the response with transaction data, total count, and pagination details
      res.status(200).json({
        success: true,
        message: "Successfully fetched transactions",
        data: transactions,
        totalCount: totalCounts,
        currentPage: pageValue,
        totalPages: Math.ceil(totalCounts / limitValue),
      });
    } catch (error) {
      console.error("Error @ getusertransaction: ", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch transactions",
        error: error.message,
      });
    }
  }
  
  async removeUserProfile  (req, res)  {
    try {
      const userId = req.user._id; 
  
      const updateduser = await User.findByIdAndUpdate(
        userId,
        { $unset: { user_profile: "" } },
        { new: true, runValidators: true }
      );
  
      if (!updateduser) {
        return res.status(404).json({ error: "user not found" });
      }
  
      res.status(200).json({ message: "User profile removed successfully", user: updateduser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

}

module.exports = UserController;
