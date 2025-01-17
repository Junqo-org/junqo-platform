import 'dotenv/config';

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
};
export const bcryptConstants = {
  saltOrRounds: 10,
};
