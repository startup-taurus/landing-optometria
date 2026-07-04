# NestJS ValidationPipe Behavior Analysis

## Question: Does @Body(ValidationPipe) without options override global configuration?

### Answer: YES, it effectively overrides

In NestJS when you use @Body(ValidationPipe):
1. A NEW instance of ValidationPipe is created WITHOUT any options
2. This instance gets default options: whitelist=false, forbidNonWhitelisted=false
3. The global pipe STILL applies, but...
4. When BOTH pipes validate the same input, the LOCAL pipe (more specific) can override behavior
5. However, in NestJS 11, pipes compose sequentially

### Critical Point:
According to NestJS pipe execution order:
- Global pipes run FIRST
- Then parameter/handler level pipes run
- They are NOT merged; they are separate validation passes

So with:
- Global: whitelist=true, forbidNonWhitelisted=true
- Local @Body(ValidationPipe): defaults (whitelist=false, forbidNonWhitelisted=false)

BOTH pipes will validate, but:
1. Global pipe will validate with whitelist=true
2. Local pipe will validate with whitelist=false
3. If global validation fails, request is rejected
4. If global passes but has extra fields, local pipe won't reject them (since forbidNonWhitelisted=false locally)

BUT WAIT - the global pipe runs BEFORE the local one!
So the global pipe WILL reject extra fields with 400 Bad Request before the local pipe even runs.

### Therefore:
The hallazgo is TECHNICALLY INCORRECT if both pipes are actually running.
The global pipe WILL still validate and reject extra fields.

However, the hallazgo is making a point about CONFIG CLARITY and INTENT:
- Why explicitly pass ValidationPipe to @Body if it's already global?
- It creates confusion about which pipe is doing what
- It's redundant
