export default class TokenProvider {
  constructor(options) {
    this.secureKey = options.secureKey || 'token';
  }

  updateContext(ctx, context) {
    /* eslint-disable-next-line */
    context.secureKey = ctx.cookies.get(this.secureKey);
  }
}
