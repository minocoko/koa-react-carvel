export default class TokenProvider {
  constructor(options) {
    this.secureKey = options.secureKey || 'token';
  }

  updateContext(ctx, context) {
    context.secureKey = ctx.cookies.get(this.secureKey);
  }
}
