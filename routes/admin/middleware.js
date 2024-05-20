const { validationResult } = require("express-validator");
module.exports = {
  handleErrors(func, dataCb) {
    return async (req, res, next) => {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        let data = {};
        if (dataCb) {
          data = await dataCb();
        }
        return res.send(func({ error, ...data }));
      }
      next();
    };
  },
  requireAuth(req, res, next) {
    if (!req.session.userId) {
      return res.redirect("/signin");
    }
    next();
  },
};
