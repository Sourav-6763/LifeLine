import jwt from 'jsonwebtoken';
export const jsonwebTokenCoded = ({data,days}) => {
  const token = jwt.sign({ data }, process.env.JWT_SECRET, {
    expiresIn:days,
  });
   return token;
};
