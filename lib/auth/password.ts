import bcrypt from "bcrypt";
import { config } from "@/app/config";

const SALT_ROUNDS = config.auth.saltRounds;
export const hashPassword = async (password: string): Promise<string> => {
  const result = bcrypt.hashSync(password, SALT_ROUNDS);
  return result;
};

export const matchPassword = async (password: string, hash: string): Promise<boolean> => {
  const result = bcrypt.compareSync(password, hash);
  return result;
};
