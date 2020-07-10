const SimpleLogger = require("../utils/simpleLogger");

module.exports = (app) => {
  const port = process.env.PORT || 3000;
  return app.listen(port, () => {
    SimpleLogger.info(`Started server, listening to port ${port}`);
    console.log(`Listening to port ${port}`);
  });
};
