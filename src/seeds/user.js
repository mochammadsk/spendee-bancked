const User = require('../models/user');
const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  const user = [
    {
      email: 'user@email.com',
      full_name: 'Mochammad Syahrul Kurniawan',
      user_name: 'mochammadsk',
      password: '123123',
    },
  ];

  await User.create(user);
  console.log('Successfully created users');

  mongoose.connection.close();
})();
