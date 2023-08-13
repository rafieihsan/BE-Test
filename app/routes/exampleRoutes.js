const { exampleMiddleware } = require("../middleware");
const exampleController = require("../controllers/exampleController");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  const router = require("express").Router();

  router.get(
    "/refactorme1",
    [exampleMiddleware.exampleMiddleware],
    exampleController.refactoreMe1
  );

  router.get(
    "/refactorme2",
    [exampleMiddleware.exampleMiddleware],
    exampleController.exampleFunction
  );

  app.use("/api/data", router);
};
