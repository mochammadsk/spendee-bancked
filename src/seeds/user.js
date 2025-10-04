const User = require('../models/user');
const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  const user = [
    {
      user_name: process.env.USER_NAME_1,
      name: process.env.NAME_1,
      password: process.env.PASSWORD_1,
    },
    {
      user_name: process.env.USER_NAME_2,
      name: process.env.NAME_2,
      password: process.env.PASSWORD_2,
    },
  ];

  await User.create(user);
  console.log('Successfully created users');

  mongoose.connection.close();
})();
