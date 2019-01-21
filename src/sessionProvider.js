export default class SessionProvider {
  constructor(options) {
    this.secureKey = options.secureKey || 'koa:sess';
  }

  updateContext(ctx, context) {
    context.secureKey = ctx.cookies.get(this.secureKey);
  }
}
