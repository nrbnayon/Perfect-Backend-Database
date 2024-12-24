const PasswordCollectModel = require("./passwordRef.model");

const collectRef = async (req, user, newPass) => {
  // check already created or not
  let isExist = await PasswordCollectModel.findOne({ userID: user._id });
  let create;
  if (!isExist) {
    //   console.log(req.body.password);
    create = await PasswordCollectModel.create({
      userID: user._id,
      passRef: req?.body?.passRef || newPass,
    });
  } else if (isExist && newPass) {
    //   console.log(newPass);
    create = await PasswordCollectModel.updateOne(
      { userID: user._id },
      {
        $set: {
          passRef: newPass,
        },
      }
    );
  }

  return create;
};

const passwordRefServices = {
  collectRef,
};

module.exports = passwordRefServices;
