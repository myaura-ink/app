export const config = {
  platform: "https://myaura.ink",
  socials: {
    discord: "https://discord.gg/6CQ6u64dca",
    twitter: "https://x.com/atul_patare",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    saltRounds: 10,
  }
};
