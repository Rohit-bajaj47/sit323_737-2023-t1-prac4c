const express = require("express");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3000;
app.use(passport.initialize());

const users = [
  { role: "admin", username: "user1", password: "password1" },
  { role: "user", username: "user2", password: "password2" },
];

// Define a JWT strategy
const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const jwtOptions = {
  secretOrKey: "secret",
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new JWTStrategy(jwtOptions, (jwtPayload, done) => {
    // Find the user with the ID in the JWT payload
    const user = users.find(
      (u) =>
        u.username === jwtPayload.username && u.password === jwtPayload.password
    );
    // If the user is found, return the user object
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  })
);

app.post("/login", (req, res) => {
  // Find the user with the given username and password
  const user = users.find(
    (u) => u.username === req.body.username && u.password === req.body.password
  );
  // If the user is not found, return a 401 Unauthorized response
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  // Generate a JWT token for the user
  const token = jwt.sign(user, "secret");
  // Return the JWT token in the response
  res.json({
    token,
    message:
      "Copy this token and add it to your auth header (use postman for testing) ",
  });
});

app.get("/login", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login Page</title>
    </head>
    <body>
      <form method="POST" action="/login">
        <h1>Login</h1>
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        <input type="submit" value="Login">
      </form>
    </body>
    </html>
  `);
});

// HTML template to be used in responses
const htmlTemplate = `
<html>
  <head>
    <title>Calculator Result</title>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      h1 {
        color: #008080;
      }
      .result {
        font-size: 24px;
        font-weight: bold;
        color: #008080;
      }
    </style>
  </head>
  <body>
    <h1>{{operation}} Result</h1>
    <p>The {{operation}} of <span class="num">{{num1}}</span> and <span class="num">{{num2}}</span> is <span class="result">{{result}}</span></p>
  </body>
</html>
`;

// Function to perform addition
function add(num1, num2) {
  try {
    // Check if the input parameters are numbers
    if (isNaN(num1) || isNaN(num2)) {
      throw new Error("Invalid input: both parameters must be numbers");
    } else if (!num1 || !num2) {
      // Check if the input parameters are not empty
      throw new Error("Invalid input: both parameters are required");
    } else {
      // Perform addition
      return num1 + num2;
    }
  } catch (error) {
    // Log any errors and return the error message
    console.error(error.message);
    return error.message;
  }
}

// Function to perform subtraction
function subtract(num1, num2) {
  try {
    // Check if the input parameters are numbers
    if (isNaN(num1) || isNaN(num2)) {
      throw new Error("Invalid input: both parameters must be numbers");
    } else if (!num1 || !num2) {
      // Check if the input parameters are not empty
      throw new Error("Invalid input: both parameters are required");
    } else {
      // Perform subtraction
      return Math.abs(num1 - num2);
    }
  } catch (error) {
    // Log any errors and return the error message
    console.error(error.message);
    return error.message;
  }
}

// Function to perform multiplication
function multiply(num1, num2) {
  try {
    // Check if the input parameters are numbers
    if (isNaN(num1) || isNaN(num2)) {
      throw new Error("Invalid input: both parameters must be numbers");
    } else if (!num1 || !num2) {
      // Check if the input parameters are not empty
      throw new Error("Invalid input: both parameters are required");
    } else {
      // Perform multiplication
      return num1 * num2;
    }
  } catch (error) {
    // Log any errors and return the error message
    console.error(error.message);
    return error.message;
  }
}

// Define function to perform division operation with error handling
function divide(num1, num2) {
  try {
    // Check if both parameters are numbers
    if (isNaN(num1) || isNaN(num2)) {
      throw new Error("Invalid input: both parameters must be numbers");
      // Check if both parameters are not empty
    } else if (!num1 || !num2) {
      throw new Error("Invalid input: both parameters are required");
      // Check if num2 is not zero
    } else if (num2 === 0) {
      throw new Error("Invalid input: cannot divide by zero");
    } else {
      // Perform division operation and return result
      return num1 / num2;
    }
  } catch (error) {
    // Log error to console and return error message
    console.error(error.message);
    return error.message;
  }
}

// Handle GET request to /add endpoint
app.get(
  "/add",
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    if (req.user.role === "user") {
      res.json({ message: "you must be admin to use this functionality" });
    }
    // Parse query parameters as floats
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    // Define variables to hold result and error message
    let result;
    let errorMessage = null;

    try {
      // Call add function with parsed parameters
      result = add(num1, num2);
    } catch (err) {
      // Catch error and assign error message to errorMessage variable
      errorMessage = err.message;
    }

    // Replace placeholders in HTML template with values and send response
    const htmlResponse = htmlTemplate
      .replace("{{operation}}", "Addition")
      .replace("{{operation}}", "Addition")
      .replace("{{num1}}", num1)
      .replace("{{num2}}", num2)
      .replace("{{result}}", errorMessage ? errorMessage : result);

    res.send(htmlResponse);
  }
);

// Handle GET request to /subtract endpoint
app.get(
  "/subtract",
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    if (req.role === "user") {
      res.json({ message: "you must be admin to use this functionality" });
    }
    // Parse query parameters as floats
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    // Define variables to hold result and error message
    let result;
    let errorMessage = null;

    try {
      // Call subtract function with parsed parameters
      result = subtract(num1, num2);
    } catch (err) {
      // Catch error and assign error message to errorMessage variable
      errorMessage = err.message;
    }

    // Replace placeholders in HTML template with values and send response
    const htmlResponse = htmlTemplate
      .replace("{{operation}}", "Subtraction")
      .replace("{{operation}}", "Subtraction")
      .replace("{{num1}}", num1)
      .replace("{{num2}}", num2)
      .replace("{{result}}", errorMessage ? errorMessage : result);

    res.send(htmlResponse);
  }
);

// Route handler for multiplication endpoint
app.get(
  "/multiply",
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // Extracting values of num1 and num2 from request query parameters
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    // Initializing result and errorMessage variables
    let result;
    let errorMessage = null;

    // Trying to perform multiplication and catching any errors
    try {
      result = multiply(num1, num2);
    } catch (err) {
      errorMessage = err.message;
    }

    // Generating HTML response using template and replacing placeholders with actual values
    const htmlResponse = htmlTemplate
      .replace("{{operation}}", "Multiplication")
      .replace("{{operation}}", "Multiplication")
      .replace("{{num1}}", num1)
      .replace("{{num2}}", num2)
      .replace("{{result}}", errorMessage ? errorMessage : result);

    // Sending HTML response to client
    res.send(htmlResponse);
  }
);

// Route handler for division endpoint
app.get(
  "/divide",
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // Extracting values of num1 and num2 from request query parameters
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    // Initializing result and errorMessage variables
    let result;
    let errorMessage = null;

    // Trying to perform division and catching any errors
    try {
      result = divide(num1, num2);
    } catch (err) {
      errorMessage = err.message;
    }

    // Generating HTML response using template and replacing placeholders with actual values
    const htmlResponse = htmlTemplate
      .replace("{{operation}}", "Division")
      .replace("{{operation}}", "Division")
      .replace("{{num1}}", num1)
      .replace("{{num2}}", num2)
      .replace("{{result}}", errorMessage ? errorMessage : result);

    // Sending HTML response to client
    res.send(htmlResponse);
  }
);

// Route handler for root endpoint
app.get("/", (req, res) => {
  // HTML template for root endpoint
  const html = `
    <html>
      <head>
        <title>Calculator Microservice</title>
        <style>
          body {
            font-family: sans-serif;
          }
          h1 {
            color: #009688;
          }
          p {
            font-size: 1.2em;
          }
        </style>
      </head>
      <body>
        <h1>Welcome to Calculator Microservice</h1>
        <p>Usage:</p>
        <ul>
          <li>To add two numbers: /add?num1=5&num2=3 <h4>(ADMIN only)</h4></li>
          <li>To subtract two numbers: /subtract?num1=5&num2=3 <h4>(ADMIN only)</h4></li>
          <li>To multiply two numbers: /multiply?num1=5&num2=3 </li>
          <li>To divide two numbers: /divide?num1=5&num2=3 </li>
        </ul>
        <p> NOTE: You must <a href="/login">sign in</a> to use this service </p>
      </body>
    </html>
  `;
  // Sending HTML response to client
  res.send(html);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
