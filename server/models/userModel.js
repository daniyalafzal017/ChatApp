// src/models/userModel.js
const { prisma } = require("../prismaClient/client");

// Create a new user
const createUser = async (username, email, password) => {
  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
      },
    });
    return user;
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
};

// Get a user by email
const getUserByEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    throw new Error("Error fetching user: " + error.message);
  }
};

// Get all users
const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    return users;
  } catch (error) {
    throw new Error("Error fetching users: " + error.message);
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getAllUsers,
};
