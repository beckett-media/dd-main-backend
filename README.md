# ![Due-Dilly-Backend](https://duedilly.co/static/due_dilly_logo-45efde72067c817b935e754a3a5aacda.png)

> ### Due-Dilly-Mobile repo is the backednd repo for [DueDilly.co](https://duedilly.co).

This repo is the main backend for duedily mobile apps and web apps!

# Getting started

To get the Node server running locally:

- Clone this repo
- `npm install` to install all required dependencies
- Install MongoDB Community Edition ([instructions](https://docs.mongodb.com/manual/installation/#tutorials)) and run it by executing `mongod` (it's not required in case you want to use our atlas database)
- `npm run dev` to start the local server

# Development Instructions and Code Overview
Take the latest pull of the `main` branch and create a new branch using this `main`` branch as the base/parent branch.
The branch name should include the ticket number and precise words which explains the purpose of the branch. For example 34-feature-email-verification.
- Push your code and create a PR on GitHub when you are done with changes/updates. 
- Request someone in the team to review your code and take his approval on the code after proper review.
- Deploy this branch on the staging server and test it again thoroughly with the postman and also ask the mobile or web team to test these changes.   

## Dependencies

- [expressjs](https://github.com/expressjs/express) - The server for handling and routing HTTP requests
- [express-jwt](https://github.com/auth0/express-jwt) - Middleware for validating JWTs for authentication
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - For generating JWTs used by authentication
- [mongoose](https://github.com/Automattic/mongoose) - For modeling and mapping MongoDB data to javascript 
- [mongoose-unique-validator](https://github.com/blakehaswell/mongoose-unique-validator) - For handling unique validation errors in Mongoose. Mongoose only handles validation at the document level, so a unique index across a collection will throw an exception at the driver level. The `mongoose-unique-validator` plugin helps us by formatting the error like a normal mongoose `ValidationError`.
- For full details please see [package.json](package.json) file.
## Application Structure

- `index.js` - The entry point to our application. This file defines our express server and connects it to MongoDB using mongoose. It also requires the routes, DB startup files and other required files which we'll be using in the application.
- `assets/` - This folder contains some assets related to our project.
- `config/` - This folder contains configuration for JWT as well as a central location for configuration/environment variables.
- `controllers/` - This folder contains controllers for routes that are responsible for handling requests and calling appropriate services.
- `grading/` - This folder contains some files related to card grading and API configuration.
- `handler/` - Handler for sending an email.
- `helpers/` - This folder contains helper files.
- `jobs/` - This folder contains files for jobs.
- `middlewares/` - This folder contains files for auth, errors, loggers and validations middlewares.
- `models/` - This folder contains all model/schema files.
- `routes/` - This folder contains the route definitions for our API.
- `s3/` - This folder contains files for the S3 bucket.
- `services/` - This folder contains files for app services.
- `startup/` - This folder contains different files in which we have set up startup files for a running project.
- `test/` - Contains files that have test cases to test the code.
- `utils/` - This folder contains utility files with helper functions.
- `views/` - This folder contains a view file related to eBay.
- `cron-file.txt` - Configiration file for cron jobs.
## Error Handling

In `/middlewares/errorHandler.js`, we define an error-handling middleware for handling all types of errors like Mongoose's `ValidationError`, MongoDB Duplicate error or any other unhandled error. This middleware will respond with a status code and format the response to have [error messages the clients can understand](/utils/errorObjects.js)

## Authentication

Requests are authenticated using the `Authorization` header with a valid JWT. We define different express middleware in `/`middleware` folders that can` be used to authenticate requests. This helps to authenticate requests using `express-jwt` middleware using our application's secret and will return a 401 status code if the request cannot be authenticated. The payload of the JWT can then be accessed from `req.payload` in the endpoint.
