module.exports = {

  development: {
    client: "mysql",
    connection: {
      database: "Micropost", // ← ここをMicropostに変更
      user: "root",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10
    },
  },

  staging: {
    client: "mysql",
    connection: {
      database: "Micropost", // ← ここもMicropostに変更
      user: "root",
      password: "password", 
    },
    pool: {
      min: 2,
      max: 10
    },
  },

  production: {
    client: "mysql",
    connection: {
      database: "Micropost", // ← ここもMicropostに変更
      user: "root",
      password: "password", 
    },
    pool: {
      min: 2,
      max: 10
    },
  }

};