import AuthenticatedRequest from '~/types/AuthenticatedRequest';

export default function (req: AuthenticatedRequest) {
  if (!req.headers['authorization']) {
    return '';
  }
  const Bearertoken = req.headers['authorization'];
  const token = Bearertoken.split(' ')[1];
  return token;
}
