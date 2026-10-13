export const config = {
  platform: "https://myaura.ink",
  socials: {
    discord: "https://discord.gg/x6gquucrXP",
    twitter: "https://x.com/atul_patare",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    saltRounds: 10,
  },
};
