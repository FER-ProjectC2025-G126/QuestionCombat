# /api
Root endpoint for the API.
All urls that aren't prefixed with `/api` are considered to be a part of the frontend.

---

## /api/auth
Root endpoint for authentication-related actions.

--- 

### POST /api/auth/login
#### Description
Logs in a user with the provided username and password.
#### Request
- form data (username, password) in the body (url-encoded or JSON)
#### Response
- 403, JSON={ error: "User already logged in!" }, if a user is already logged in, 
- 400, JSON={ error: "Missing request body!" }, if there is no form data in the request body
- 400, JSON={ error: "Missing username!" }, if the username is missing 
- 400, JSON={ error: "Missing password!" }, if the password is missing 
- 401, JSON={ error: "Invalid username!" }, if there is no user with the given username
- 401, JSON={ error: "Invalid password!" }, if the password does not match the stored password for the user 
- 200, logs in the user

---

### POST /api/auth/register
#### Description
Registers a new user with the provided username, password and email.
#### Request
- form data (username, password, email) in the body (url-encoded or JSON)
#### Response
- 403, JSON={ error: "User already logged in!" }, if a user is already logged in,
- 400, JSON={ error: "Missing request body!" }, if there is no form data in the request body
- 400, JSON={ error: "Missing username!" }, if the username is missing
- 400, JSON={ error: "Missing password!" }, if the password is missing
- 400, JSON={ error: "Missing email!" }, if the email is missing
- 400, JSON={ error: "Username too long! (max 32 characters)" }, if the username is too long (more than 32 characters)
- 409, JSON={ error: "Username already taken!" }, if there is already a user with the given username 
- 400, JSON={ error: "Password too short! (min 6 characters)" }, if the password is too short (less than 6 characters)
- 400, JSON={ error: "Password must contain at least one digit!" }, if the password doesn't contain at least one digit
- 400, JSON={ error: "Password must contain at least one ASCII letter!" }, if the password doesn't contain at least one ASCII letter
- 400, JSON={ error: "Invalid email address!" }, if the format of the email address is invalid
- 201, creates a new user (but doesn't automatically log them in)

---

### POST /api/auth/logout
#### Description
Logs out the currently logged-in user.
#### Response
- 200, logs out the user (if a user is logged in, otherwise does nothing)

---

### GET /api/auth/me
#### Description
Returns information about the currently logged-in user.
#### Response
- 200, JSON={ username: "USERNAME", email: "EMAIL" }, if a user is logged in
- 401, JSON={ error: "User not logged in!" }, if a user is not logged in 

---
