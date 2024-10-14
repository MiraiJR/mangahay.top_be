import * as bcrypt from 'bcrypt';

export const hashPassword = async (rawPassword: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(rawPassword, salt);
};

export const isMatchedPassword = async (
  rawPassword: string,
  passwordInDb: string,
): Promise<boolean> => {
  return bcrypt.compare(rawPassword, passwordInDb);
};
