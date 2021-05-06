module.exports.stringConstants = {
  DB_CONNECTION_STRING: "dbConnectionString",

  AUTH_TOKEN_STRING: "x-auth-token",

  REFRESH_TOKEN_STRING: "x-refresh-token",

  APP_TOKEN_STRING: "x-app-token",

  APPLE_TOKEN_STRING: "x-apple-token",

  JWT_PRIATE_KEY: "snapGradeJwtPrivateKey",

  JWT_REFRESH_KEY: "snapGradeJwtRefreshKey",

  JWT_APP_KEY: "snapGradeJwtAppKey",

  STRIPE_TEST_KEY: "stripeTestKey",

  GOOGLE_APPLICATION_CREDENTIALS: "googleApplicationCredentials",

  EBAY_CLIENT_ID: "eBayClientId",

  EBAY_CLIENT_SECRET: "eBayClientSecret",

  EBAY_ACCESS_TOKEN: "ebay-access-token",

  EBAY_REFRESH_TOKEN: "ebay-refresh-token",

  EBAY_ACCESS_TOKEN_REQUIRED:
    "eBay refresh token is required in the header under ebay-access-token",

  INTERNAL_SERVER_ERROR: "Internal server error",

  INVALID_OR_TOKEN_EXPIRED: "Auth token invalid or expired",

  REFRESH_TOKEN_INVALID_OR_EXPIRED: "Refresh token invalid or expired",

  APP_TOKEN_INVALID_OR_EXPIRED: "App token invalid or expired",

  REQUEST_VALIDATION_FAILED: "Request validation failed",

  USER_EMAIL_ALREADY_EXISTS: "User with the given email already exists",

  USER_EMAIL_NOT_FOUND: "User with the given email not found",
  OTP_NOT_VERIFIED: "Please verify the OTP first and try again",

  USER_ID_DOEST_NOT_EXISTS: "User with the given ID does not exists",
  NO_OTP: "No OTP found in the system. Please re-generate the OTP",
  INVALID_OTP: "Invalid OTP",

  NO_AUTH_TOKEN_FOUND: "No auth token found",

  NO_REFRESH_TOKEN_FOUND: "No refresh token found",

  NO_REFRESH_TOKEN_FOUND_FOR_USER:
    "No refresh token found for the user, please login again",

  FETCH_SUCESSFUL: "Fetch successful",

  UPDATE_SUCCESSFUL: "Update successful",

  GRADING_COMPLETED: "Grading Completed",

  AUTH_TOKEN_VALID: "Auth token valid",

  NO_FILE_FOUND: "No file found, please check request",

  FILE_TYPE_NOT_ACCEPTED: "File type not accepted",

  FILE_CORRUPTED: "File corrupted or file size 0",

  BAD_QUALITY: "Bad quality image. Please try uploading another image",

  USER_REGISTERATION_SUCCESSFUL: "User registered successfully",

  UNSUSPECTED_ERROR: "Unsuspected error occured",

  USERNAME_ALREADY_TAKEN: "Username already taken",

  INCORRECT_PASSWORD: "Incorrect password, please try again",

  SIGN_IN_SUCCESSFUL: "Sign in successful",

  CARD_ID_NOT_FOUND: "Card with the given ID not found",

  CARD_DETAILS: 'Card detials',

  PASSWORD_UPDATED_SUCCESSFULLY: "Password updated successfully",
  VERIFY_OTP: 'OTP Verified',
  OTP_GENERATED: "OTP Sent to your Email",
  OTP_GENERATE_ISSUE: "Issue while generating OTP, Try Again",

  INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED: "Invalid Apple token or token expired",

  FAILED_TO_FETCH_APPLE_PUBLIC_KEYS: "Failed to fetch Apple public keys",

  USER_IDENTIFIER_REQUIRED: "User identifier is a required field",

  USER_IDENTIFIER_DOES_NOT_MATCH_TOKEN: "User identifier does not match token",

  NO_KID_FOUND_IN_HEADER: "No KID found in header",

  APPLE_PUBLIC_KEY_URL: "https://appleid.apple.com/auth/keys",

  NO_KID_FOUND_IN_APPLE_PUBLIC_KEYS:
    "No KID found in Apple provided public keys",

  APPLE_ID_DOES_NOT_MATCH_EMAIL:
    "User Identifier does not match the given email",

  NOT_A_VALID_FILE_TYPE: "Not a valid file type",

  NOT_AUTHORIZED_TO_PERFORM_THE_ACTION: "Not authorized to perform the action",

  DELETED_SUCCESSFULLY: "Resource deleted successfully",

  USER_ID_NOT_FOUND_IN_REQUEST: "User ID not found in req.user",

  PENDING_DELETION_TYPE_NOT_HANDLED:
    "Deletion type not handling by pending deletion",

  NO_PEDNING_CARDS_FOUND_FOR_USER: "No pending cards found for the user",
  NO_CARDS_LEFT_IN_PLAN: "No cards left in plan. Please upgrade your subscription and try again.",
  NO_CARD: 'No Card Found for given Id',
  API_ERROR: 'Not able to fetch grade at this moment. Please try again',

  NO_STRIPE_ID_FOUND_FOR_USER: "No stripe ID found for user: ",

  PENDING_AMOUNT_AND_AMOUNT_DO_NOT_MATCH:
    "Pending amount for cards do not match amount sent by client application",

  PAYMENT_SUCCEEDED: "Payment succeeded",

  PAYMENT_ERRORED: "Payment errored",

  EBAY_CODE_REQUIRED: "eBay code is required",

  USER_ALREADY_SIGNED_UP_WITH_DIFFERENT_METHOD:
    "User has already signed up with a different method",

  SIGNED_OUT_SUCCESSFULLY: "Signed out successfully",

  FORBIDDEN_RESOURCE: "Forbidden resource!",

  INVALID_SIGN_UP_METHOD: "Invalid sign up method for admin",

  NEEDS_TO_BE_INTEGER: "need to be Integer",

  TOO_MANY_REQUESTS: "Too many requests, please try again later",

  STRIPE_CUSTOMER_CREATION_DESC: "Created through DCGS",

  NO_EBAY_TOKEN_FOUND: "No ebay auth token found",

  NO_EBAY_REFRESH_TOKEN_FOUND: "No ebay refresh token found",

  collectionNames: {
    USER_COLLECTION: "User",
    PENDING_DELETION: "Pending_Deletion",
    CARD_COLLECTION: "Card",
    TRANSACTION_COLLECTION: "Transaction",
    TRANSACTION_LOG_COLLECTION: "Transaction_log",
    SCHEDULE_COLLECTION: "Schedule",
    JOB: "jobs", // For Agenda package,
    GLOBAL_REQ_RATE_RECORDS: "global_req_rate_records",
    WRONG_SIGNIN_REQ_RECORDS: "wrong_signin_req_records",
    QUESTIONS_COLLECTION: "Question",
    SUBSCRIPTION_COLLECTION: "Subscription"
  },

  deletionType: {
    USER: "User",
    FILE: "File",
    CARD: "Card",
    DIR: "Directory",
  },

  role: {
    USER: "user",
    ADMIN: "admin",
  },

  cardState: {
    PENDING: "pending", // Pending payment
    SUBMITTED: "submitted",
    PAID: "paid", // Payment made
    GRADED: "graded", // Has been greaded
  },

  signupType: {
    EBAY: "ebay",
    APPLE: "apple",
    IN_APP: "in_app",
  },
  // OS information
  osType: {
    iOS: "ios",
    ANDROID: "android",
    MAC_OS: "mac_os",
    WINDOWS: "windows",
    LINUX: "linux",
  },
  // Image type
  iType: {
    PNG: ".png",
    JPG: ".jpg",
    GIF: ".gif",
    JPEG: ".jpeg",
  },
  // Video type
  vType: {
    THREEGP: ".3gp",
    MPFOUR: ".mp4",
    TS: ".ts",
    WEBM: ".webm",
    MKV: ".mkv",
    MOV: ".mov",
    MFOURV: ".m4v",
  },

  currency: {
    USD: "usd",
    CAD: "cad",
    INR: "inr",
  },

  jobType: {
    INCOMPLETE_CARD_CLEANUP: "Incomplete card cleanup job",
    PENDING_DELETION: "Pending deletion job",
  },
  cronString: {
    INCOMPLETE_CARD_CLEANUP: "* * * * *",
    PENDING_DELETION: "* * * * *",
    DAILY_JOB: "* * * * *",
  },

  transactionStatus: {
    CREATED: "created",
    CANCELED: "canceled",
    SUCCEEDED: "succeeded",
    ERROR: "error",
    REFUNDED: "refunded",
  },

  piStatus: {
    REQ_PM_METHOD: "requires_payment_method",
    REQ_CONFIRMATION: "requires_confirmation",
    REQ_ACTION: "requires_action",
    PROCESSING: "processing",
    REQ_CAPTURE: "requires_capture",
    CANCELED: "canceled",
    SUCCEEDED: "succeeded",
  },

  URLS: {
    ebayoAuthUrl: "https://api.sandbox.ebay.com/identity/v1/oauth2/token",
    ebayGetUserUrl: "https://apiz.sandbox.ebay.com/commerce/identity/v1/user/",
    qrBaseUrl: "qrBaseUrl", // Mapped to config
  },

  ebayAccType: {
    BUSINESS_ACCOUNT: "businessAccount",
    INDIVIDUAL_ACCOUNT: "individualAccount",
  },

  headerNames: {
    X_RATELIMIT_LIMIT: "X-RateLimit-Limit",
    X_RATELIMIT_REMAINING: "X-RateLimit-Remaining",
    RETRY_AFTER: "Retry-After",
    EBAY_ACCESS_TOKEN: "ebay-access-token",
    EBAY_REFRESH_TOKEN: "ebay-refresh-token",
  },

  stripeMessages: {
    SUCCEEDED: "Payment successful ordere has been placed",
    FAILED: "We are sorry, there was an error processing your payment",
    REFUND: "Error encountered, refund has been issued",
    REQ_ACTION: "Payment being processed, requires action on users part",
    PROCESSING:
      "Payment being processed, you will get a notification when completed",
  },

  piEvents: {
    PI_SUCCEEDED: "payment_intent.succeeded",
  },

  gradingQId: {
    SIGNED_CELEB: "signedCeleb",
    CORNER_VALUE: "cornerValue",
    EDGE_VALUE: "edgeValue",
    SURFACE_VALUE: "surfaceValue",
    EYE_APPEAL: "eyeAppeal",
    CENTER_FRONT: "centerFront",
    CENTER_BACK: "centerBack",
    CARD_STAINS: "cardStains",
    CARD_SLEEVING: "cardSleeving",
    PRINTING_DEFECTS: "printingDefects",
  },
  gradeDesc: {
    GEM_MT_10: "GEM-MT 10",
    MINT_9: "MINT 9",
    NEAR_MINT_MINT: "NEAR MINT-MINT",
    NEAR_MINT: "NEAR MINT",
    EXCELLENT_MINT: "EXCELLENT MINT",
    EXCELLENT: "EXCELLENT",
    VERY_GOOD_EXCELLENT: "VERY GOOD-EXCELLENT",
    VERY_GOOD: "VERY GOOD",
    GOOD: "GOOD",
    FAIR: "FAIR",
    POOR: "POOR",
    UNGRADABLE: "UNGRADABLE",
  },
  imageAssetNames: {
    DCGS_LOGO: "dcgs_logo.png",
    INNER_IMAGE_MASK: "inner_image_mask.png",
    OUTER_IMAGE_MASK: "outer_image_mask.png",
    QR_CODE_MASK: "qr_code_mask.png",
    TICK: 'tick.png'
  },

  ebayUrlNames: {
    EBAY_O_AUTH: "ebayoAuthUrl",
    EBAY_GET_USER: "ebayGetUserUrl",
    EBAY_REFRESH_TOKEN: "ebayGetRefreshToken",
  },
  AMOUNT_MISMATCH: 'AMOUNT_MISMATCH'
};
