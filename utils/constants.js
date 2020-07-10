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

  INTERNAL_SERVER_ERROR: "Internal server error",

  INVALID_OR_TOKEN_EXPIRED: "Auth token invalid or expired",

  REFRESH_TOKEN_INVALID_OR_EXPIRED: "Refresh token invalid or expired",

  APP_TOKEN_INVALID_OR_EXPIRED: "App token invalid or expired",

  REQUEST_VALIDATION_FAILED: "Request validation failed",

  USER_EMAIL_ALREADY_EXISTS: "User with the given email already exists",

  USER_EMAIL_NOT_FOUND: "User with the given email not found",

  USER_ID_DOEST_NOT_EXISTS: "User with the given ID does not exists",

  NO_AUTH_TOKEN_FOUND: "No auth token found",

  NO_REFRESH_TOKEN_FOUND: "No refresh token found",

  NO_REFRESH_TOKEN_FOUND_FOR_USER:
    "No refresh token found for the user, please login again",

  FETCH_SUCESSFUL: "Fetch successful",

  UPDATE_SUCCESSFUL: "Update successful",

  AUTH_TOKEN_VALID: "Auth token valid",

  NO_FILE_FOUND: "No file found, please check request",

  FILE_TYPE_NOT_ACCEPTED: "File type not accepted",

  FILE_CORRUPTED: "File corrupted or file size 0",

  USER_REGISTERATION_SUCCESSFUL: "User registered successfully",

  UNSUSPECTED_ERROR: "Unsuspected error occured",

  USERNAME_ALREADY_TAKEN: "Username already taken",

  INCORRECT_PASSWORD: "Incorrect password, please try again",

  SIGN_IN_SUCCESSFUL: "Sign in successful",

  CARD_ID_NOT_FOUND: "Card with the given ID not found",

  PASSWORD_UPDATED_SUCCESSFULLY: "Password updated successfully",

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

  collectionNames: {
    USER_COLLECTION: "User",
    PENDING_DELETION: "PendingDeletion",
    CARD_COLLECTION: "Card",
  },

  deletionType: {
    USER: "User",
    FILE: "File",
    CARD: "Card",
  },

  role: {
    USER: "user",
    ADMIN: "admin",
  },

  cardState: {
    PENDING: "pending",
    SUBMITTED: "submitted",
    GRADED: "graded",
  },

  signUpType: {
    EBAY: "ebay",
    APPLE: "apple",
    MOBILE_APP: "mobile app",
  },
};
