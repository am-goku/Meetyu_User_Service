# MeetYu User Service

This is the User Service microservice for the MeetYu social media application. It handles user authentication, user data management, and post-related functionalities such as saving and liking posts.

## Technologies Used

- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)
- JWT (JSON Web Tokens) for authentication
- Nodemailer for email notifications
- Bcrypt for password hashing
- Crypto for additional security measures
- NPM for package management

## Common Headers

- `Authorization`: Bearer token for user authentication
- `X-Device-ID`: Unique identifier for the device making the request

## Installation

To set up the project locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd meetyu-user-service
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:

   ```plaintext
   MONGODB_URI=mongodb://127.0.0.1:27017/meetyu_user

   PORT=8001

   # SMTP server
   SMTP_HOST=smtp.example.com
   SMTP_PORT=123
   SMTP_SSL=false

   # SMTP Auth
   SMTP_USER=user@example.com
   SMTP_PASS=xxx xxx xxx xxxx
   SMTP_FROM_EMAIL=user@example.com

   # Json Web Token
   JWT_ACCESS_SECRET=3a8bb9f29c7a15683fb71548464eaa8b10284372051f2d1c06f1648a84ca438e
   JWT_REFRESH_SECRET=3a8bb9f29c7a15683fb71548464eaa8b10284372051f2d1c06f1648a84ca438e
   ```

## Running the Service

To start the service, use the following command:

- For development:

  ```bash
  npm run dev
  ```

- For production (after building the project):

  ```bash
  npm run build
  npm start
  ```

## Testing

To run the tests for this service, use:

```bash
npm run test
```

## Features

- **User Authentication**: Sign up, login, and manage user sessions using JWT.
- **User Data Management**: Create, read, update, and delete user profiles.
- **Post Management**: Save and like posts associated with users.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for discussion.

## Contact

For inquiries, please reach out to the project maintainer at user@example.com.
```

### Notes:
- Replace `<repository-url>` with the actual URL of your repository.
- Ensure that the SMTP server and JWT secrets in the `.env` sample are appropriately configured for your application.
- Modify the license section as necessary depending on your project’s licensing needs.