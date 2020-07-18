const config = require("config");
const Agenda = require("agenda");
const SimpleLogger = require("../utils/simpleLogger");
const incompleteCardCleanupJob = require("../jobs/incompleteCardCleanup");
const pendingDeletionJob = require("../jobs/pendingDeletion");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const { stringConstants } = require("../utils/constants");

const agenda = new Agenda({
  db: {
    address: config.get(stringConstants.DB_CONNECTION_STRING),
    collection: stringConstants.collectionNames.JOB,
  },
});
module.exports = async () => {
  const cronStrings = await getCronStrings();

  SimpleLogger.info("Initializing Agenda");
  // Step 1: Define the agenda
  agenda.define(
    stringConstants.jobType.INCOMPLETE_CARD_CLEANUP,
    async (job) => {
      await incompleteCardCleanupJob();
    }
  );

  agenda.define(stringConstants.jobType.PENDING_DELETION, async (job) => {
    await pendingDeletionJob();
  });

  // Step 2: Initialize the agenda
  agenda.on("ready", async () => {
    agenda.every(
      cronStrings.card_cleanup_cron_string,
      stringConstants.jobType.INCOMPLETE_CARD_CLEANUP
    );
    agenda.every(
      cronStrings.pending_deletion_cron_string,
      stringConstants.jobType.PENDING_DELETION
    );

    await agenda.start();

    SimpleLogger.info("Finished Initializing Agenda");
  });
};

function isCronValid(freq) {
  var cronregex = new RegExp(
    /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/
  );
  return cronregex.test(freq);
}

async function getCronStrings() {
  try {
    const filePath = path.join(__dirname, "../.cron_file.txt");
    const data = await fsPromises.readFile(filePath);
    const cronStrings = JSON.parse(data);

    if (
      !cronStrings.card_cleanup_cron_string ||
      !isCronValid(cronStrings.card_cleanup_cron_string)
    ) {
      throw new Error(
        "No card_cleanup_cron_string found in cron file or crons string not valid"
      );
    } else if (
      !cronStrings.pending_deletion_cron_string ||
      !isCronValid(cronStrings.pending_deletion_cron_string)
    ) {
      throw new Error(
        "No pending_deletion_cron_string found in cron file or cron string not valid"
      );
    }

    SimpleLogger.info(
      "Card cleanup cron string",
      cronStrings.card_cleanup_cron_string
    );
    SimpleLogger.info(
      "Pending deletion string",
      cronStrings.pending_deletion_cron_string
    );
    return cronStrings;
  } catch (error) {
    SimpleLogger.error(error, true);
  }
}
