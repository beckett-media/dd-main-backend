const sgMail = require("@sendgrid/mail");
const SENDGRID_API_KEY = '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';

sgMail.setApiKey(SENDGRID_API_KEY);

const getMessage = ({
    email, subject, text
}) => {
      return {
        to: email,
        from: 'a@duedilly.co',
        subject,
        text
      };
}

const sendMail = async (props) => {
    try {
      const res = await sgMail.sendMultiple(getMessage(props));
      return {
        success: true,
        res
      };
    } catch (err) {
      return {
        success: false,
        err
      };
    }
};

module.exports = sendMail;
