module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
  eth: {
    web3: {
      url: process.env.ETH_WEB3_URL || 'http://localhost:8545',
      address: process.env.ETH_WEB3_ADDRESS || null
    }
  }
};
