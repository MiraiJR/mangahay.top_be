import * as bcrypt from 'bcrypt';

export const SALT_HASH_PWD = bcrypt.genSalt(10);
