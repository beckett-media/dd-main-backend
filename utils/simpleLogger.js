const fs = require("fs");
const path = require("path");
const colors = require("colors");

/*
    Log shall cover the following:
    1. Debug
        If set to debug it will write to console.
        Remain three shall be written to file.
    2. Warn
    3. Info
    4. Error
*/

let logName = "ApplicationLogs";
class SimpleLogger {
  constructor() {
    // Could be used to set options
  }

  static debug(...messages) {
    for (const message of messages) {
      const date = this.getDate();
        this.writeToFile(`${date}: Debug: ${message}`, false);
      console.log(`${date}: Debug: ${message}`.yellow);
    }
  }

  static info(...messages) {
    for (const message of messages) {
      const date = this.getDate();
      this.writeToFile(`${date}: Info: ${message}`, false);
        console.log(`${date}: Info: ${message}`.green);
    }
  }

  static warn(...messages) {
    for (const message of messages) {
      const date = this.getDate();
      this.writeToFile(`${date}: ** WARNING ** ${message}`, false);
        console.log(`${date}: ** WARNING ** ${message}`.blue);
    }
  }

  static error(err, isExit) {
    const date = this.getDate();
    if (isExit)
      console.log("Process exiting, please check the logs for errors.".red);
    let message = err;
    let stack = "";
    if (err.stack) stack = err.stack;
    const key = Date.now();
    const errorKey = `Error Key ${key}`;
    this.writeToFile(
      `\n${errorKey}\n${date}: !!** ERROR **!! ${message}\n STACK TRACE: ${stack}`,
      isExit
    );
    return errorKey;
  }

  static getDate() {
    return new Date().toLocaleString();
  }

  static writeToFile(message, isExit) {
    const fileName = `./logs/${logName}`;
    const dirName = "./logs";

    fs.access(fileName, (err) => {
      if (err) {
        // console.error(err);
        fs.mkdir(dirName, (err) => {
          if (err && err.errno !== -17) return console.error(err);
          fs.appendFile(
            path.join(__dirname, `/../logs/${logName}`),
            `${message}\n`,
            (err) => {
              if (err) console.error(err);
              if (isExit) process.exit(1);
            }
          );
        });
      } else {
        fs.appendFile(
          path.join(__dirname) + `/../logs/${logName}`,
          `${message}\n`,
          (err) => {
            if (err) console.error(err);
            if (isExit) process.exit(1);
          }
        );
      }
    });
  }

  static initializeLogs(name = "ApplicationLogs") {
    logName = name;
    this.createNewLogFile();
    setInterval(() => {
      let date = new Date().toLocaleDateString();
      let time = new Date().toLocaleTimeString();
      time = time.replace(/ /g, "").replace(/:/g, "");
      date = date.replace(/\s+|[,\/]/g, "");
      fs.rename(
        path.join(__dirname, `/../logs/${logName}`),
        path.join(__dirname, `/../logs/${logName}.${date}.${time}`),
        (err) => {
          if (err) console.error(err);
          this.createNewLogFile();
        }
      );
      this.removeOldFiles();
    }, 86400000);
    // For 24 hours: 86400000
  }

  static createNewLogFile() {
    fs.appendFile(
      path.join(__dirname, `/../logs/${logName}`),
      "*** Logs ***\n",
      (err) => {
        if (err) console.error(err);
      }
    );
  }

  static removeOldFiles() {
    let logsDirectory = path.join(__dirname, "/../logs/");

    fs.readdir(logsDirectory, function (err, files) {
      files.forEach(function (file, index) {
        console.log(file);
        fs.stat(path.join(logsDirectory, file), function (err, stat) {
          if (err) return console.log(err);
          const now = new Date().getTime();
          const endTime = new Date(stat.ctime).getTime() + 604800000; // Check file that are 7 days old.
          if (now > endTime) {
            fs.unlink(path.join(logsDirectory, file), (err) => {
              if (err) return console.log(err);
              console.log("Deleted sucessfuly");
            });
          }
        });
      });
    });
  }
}

module.exports = SimpleLogger;
