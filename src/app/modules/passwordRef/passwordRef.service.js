const moment = require("moment");

const PasswordCollectModel = require("./passwordRef.model");

const collectRef = async (req, user, newPass) => {
  try {
    if (!user._id) {
      throw new Error("User ID is required");
    }

    let isExist = await PasswordCollectModel.findOne({
      userId: user._id,
    });

    let create;
    if (!isExist) {
      create = await PasswordCollectModel.create({
        userId: user._id,
        passRef: newPass,
      });
    } else if (isExist && newPass) {
      create = await PasswordCollectModel.updateOne(
        { userId: user._id },
        {
          $set: {
            passRef: newPass,
            lastPasswordChange: moment().toDate(),
          },
        }
      );
    }
    return create;
  } catch (error) {
    console.error("Error in collectRef:", error);
    throw error;
  }
};

const passwordRefServices = {
  collectRef,
};

module.exports = passwordRefServices;
