/**
 * Options is the type of the connect options
 */
export interface Options {
  useRedisAdapter?: boolean; // if true, use the redis adapter option for the sockets
  redisHost?: string; // redis host (default is localhost)
  redisPort?: number; // redis port (default is 6379)
  secret?: string; // the secret for the authentication middleware
  origin?: string; // optional allow origin
}
