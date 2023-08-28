const connectRedis = async (redisClient) => {
  redisClient.on("error", (error) => console.error(`ERROR : ${error}`));

  redisClient.on("connect", () => {
    console.log("Connected to our redis instance!");
  });

  await redisClient.connect();

  console.log("Redis Client Connected:", redisClient.isOpen);
};

module.exports = connectRedis;
