module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define(
      "users",
      {
        field: {
          type: Sequelize.STRING(50),
        },
      },
      { timestamps: false }
    );
    return User;
  };
  