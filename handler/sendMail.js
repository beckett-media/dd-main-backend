const sgMail = require("@sendgrid/mail");
const SENDGRID_API_KEY = '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';

sgMail.setApiKey(SENDGRID_API_KEY);

const getMessage = ({
    email, subject, text
}) => {
      return {
        to: email,
        from: 'bahl.chahatbahl@gmail.com',
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
