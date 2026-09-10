# API Documentation

# API Documentation - /home/user/September-Release-/login-website/backend/server.js

## Overview

- **Language**: typescript
- **Lines of Code**: 26
- **Functions**: 11
- **Classes**: 0
- **Cyclomatic Complexity**: 2
- **Maintainability Index**: 93.4/100

## Functions

### `express() -> void`

**Returns**: `void`

**Example**:
```python
result = express()
```

### `cors() -> void`

**Returns**: `void`

**Example**:
```python
result = cors()
```

### `mongoose() -> void`

**Returns**: `void`

**Example**:
```python
result = mongoose()
```

### `authRoutes() -> void`

**Returns**: `void`

**Example**:
```python
result = authRoutes()
```

### `app() -> void`

**Returns**: `void`

**Example**:
```python
result = app()
```

### `PORT() -> void`

**Returns**: `void`

**Example**:
```python
result = PORT()
```

### `require('express': any) -> void`

**Parameters**:
- `'express'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('express'='express')
```

### `require('cors': any) -> void`

**Parameters**:
- `'cors'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('cors'='cors')
```

### `require('mongoose': any) -> void`

**Parameters**:
- `'mongoose'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('mongoose'='mongoose')
```

### `require('./routes/auth': any) -> void`

**Parameters**:
- `'./routes/auth'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('./routes/auth'='./routes/auth')
```

### `express() -> void`

**Returns**: `void`

**Example**:
```python
result = express()
```


---

# API Documentation - /home/user/September-Release-/login-website/backend/middleware/auth.js

## Overview

- **Language**: typescript
- **Lines of Code**: 15
- **Functions**: 8
- **Classes**: 0
- **Cyclomatic Complexity**: 4
- **Maintainability Index**: 90.5/100

## Functions

### `jwt() -> void`

**Returns**: `void`

**Example**:
```python
result = jwt()
```

### `authenticate() -> void`

**Returns**: `void`

**Example**:
```python
result = authenticate()
```

### `token() -> void`

**Returns**: `void`

**Example**:
```python
result = token()
```

### `decoded() -> void`

**Returns**: `void`

**Example**:
```python
result = decoded()
```

### `require('jsonwebtoken': any) -> void`

**Parameters**:
- `'jsonwebtoken'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('jsonwebtoken'='jsonwebtoken')
```

### `if(!token: any) -> void`

**Parameters**:
- `!token` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(!token=!token)
```

### `next() -> void`

**Returns**: `void`

**Example**:
```python
result = next()
```

### `catch(error: any) -> void`

**Parameters**:
- `error` (`any`)

**Returns**: `void`

**Example**:
```python
result = catch(error=error)
```


---

# API Documentation - /home/user/September-Release-/login-website/backend/models/User.js

## Overview

- **Language**: typescript
- **Lines of Code**: 75
- **Functions**: 21
- **Classes**: 0
- **Cyclomatic Complexity**: 8
- **Maintainability Index**: 76.5/100

## Functions

### `mongoose() -> void`

**Returns**: `void`

**Example**:
```python
result = mongoose()
```

### `bcryptjs() -> void`

**Returns**: `void`

**Example**:
```python
result = bcryptjs()
```

### `userSchema() -> void`

**Returns**: `void`

**Example**:
```python
result = userSchema()
```

### `salt() -> void`

**Returns**: `void`

**Example**:
```python
result = salt()
```

### `updates() -> void`

**Returns**: `void`

**Example**:
```python
result = updates()
```

### `maxAttempts() -> void`

**Returns**: `void`

**Example**:
```python
result = maxAttempts()
```

### `lockTime() -> void`

**Returns**: `void`

**Example**:
```python
result = lockTime()
```

### `require('mongoose': any) -> void`

**Parameters**:
- `'mongoose'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('mongoose'='mongoose')
```

### `require('bcryptjs': any) -> void`

**Parameters**:
- `'bcryptjs'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('bcryptjs'='bcryptjs')
```

### `function(next: any) -> void`

**Parameters**:
- `next` (`any`)

**Returns**: `void`

**Example**:
```python
result = function(next=next)
```

### `if(!this.isModified('password': any) -> void`

**Parameters**:
- `!this.isModified('password'` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(!this.isModified('password'=!this.isModified('password')
```

### `next() -> void`

**Returns**: `void`

**Example**:
```python
result = next()
```

### `next() -> void`

**Returns**: `void`

**Example**:
```python
result = next()
```

### `catch(error: any) -> void`

**Parameters**:
- `error` (`any`)

**Returns**: `void`

**Example**:
```python
result = catch(error=error)
```

### `next(error: any) -> void`

**Parameters**:
- `error` (`any`)

**Returns**: `void`

**Example**:
```python
result = next(error=error)
```

### `function(enteredPassword: any) -> void`

**Parameters**:
- `enteredPassword` (`any`)

**Returns**: `void`

**Example**:
```python
result = function(enteredPassword=enteredPassword)
```

### `function() -> void`

**Returns**: `void`

**Example**:
```python
result = function()
```

### `function() -> void`

**Returns**: `void`

**Example**:
```python
result = function()
```

### `if(this.lockUntil && this.lockUntil < Date.now(: any) -> void`

**Parameters**:
- `this.lockUntil && this.lockUntil < Date.now(` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(this.lockUntil && this.lockUntil < Date.now(=this.lockUntil && this.lockUntil < Date.now()
```

### `if(this.loginAttempts + 1 >= maxAttempts && !this.isAccountLocked(: any) -> void`

**Parameters**:
- `this.loginAttempts + 1 >= maxAttempts && !this.isAccountLocked(` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(this.loginAttempts + 1 >= maxAttempts && !this.isAccountLocked(=this.loginAttempts + 1 >= maxAttempts && !this.isAccountLocked()
```

### `function() -> void`

**Returns**: `void`

**Example**:
```python
result = function()
```


---

# API Documentation - /home/user/September-Release-/login-website/backend/routes/auth.js

## Overview

- **Language**: typescript
- **Lines of Code**: 120
- **Functions**: 50
- **Classes**: 0
- **Cyclomatic Complexity**: 18
- **Maintainability Index**: 52.0/100

## Functions

### `express() -> void`

**Returns**: `void`

**Example**:
```python
result = express()
```

### `rateLimit() -> void`

**Returns**: `void`

**Example**:
```python
result = rateLimit()
```

### `jwt() -> void`

**Returns**: `void`

**Example**:
```python
result = jwt()
```

### `User() -> void`

**Returns**: `void`

**Example**:
```python
result = User()
```

### `router() -> void`

**Returns**: `void`

**Example**:
```python
result = router()
```

### `loginLimiter() -> void`

**Returns**: `void`

**Example**:
```python
result = loginLimiter()
```

### `validateRegister() -> void`

**Returns**: `void`

**Example**:
```python
result = validateRegister()
```

### `validateLogin() -> void`

**Returns**: `void`

**Example**:
```python
result = validateLogin()
```

### `generateToken() -> void`

**Returns**: `void`

**Example**:
```python
result = generateToken()
```

### `errors() -> void`

**Returns**: `void`

**Example**:
```python
result = errors()
```

### `existingUser() -> void`

**Returns**: `void`

**Example**:
```python
result = existingUser()
```

### `user() -> void`

**Returns**: `void`

**Example**:
```python
result = user()
```

### `token() -> void`

**Returns**: `void`

**Example**:
```python
result = token()
```

### `errors() -> void`

**Returns**: `void`

**Example**:
```python
result = errors()
```

### `user() -> void`

**Returns**: `void`

**Example**:
```python
result = user()
```

### `isPasswordValid() -> void`

**Returns**: `void`

**Example**:
```python
result = isPasswordValid()
```

### `token() -> void`

**Returns**: `void`

**Example**:
```python
result = token()
```

### `user() -> void`

**Returns**: `void`

**Example**:
```python
result = user()
```

### `require('express': any) -> void`

**Parameters**:
- `'express'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('express'='express')
```

### `require('express-validator': any) -> void`

**Parameters**:
- `'express-validator'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('express-validator'='express-validator')
```

### `require('express-rate-limit': any) -> void`

**Parameters**:
- `'express-rate-limit'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('express-rate-limit'='express-rate-limit')
```

### `require('jsonwebtoken': any) -> void`

**Parameters**:
- `'jsonwebtoken'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('jsonwebtoken'='jsonwebtoken')
```

### `require('../models/User': any) -> void`

**Parameters**:
- `'../models/User'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('../models/User'='../models/User')
```

### `require('../middleware/auth': any) -> void`

**Parameters**:
- `'../middleware/auth'` (`any`)

**Returns**: `void`

**Example**:
```python
result = require('../middleware/auth'='../middleware/auth')
```

### `rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again later'
}: any) -> void`

**Parameters**:
- `{
  windowMs` (`15 * 60 * 1000`)
- `// 15 minutes
  max` (`10`)
- `// Limit each IP to 10 requests per windowMs
  message` (`'Too many login attempts`)
- `please try again later'
}` (`any`)

**Returns**: `void`

**Example**:
```python
result = rateLimit({
  windowMs={
  windowMs, // 15 minutes
  max=// 15 minutes
  max)
```

### `body('username': any) -> void`

**Parameters**:
- `'username'` (`any`)

**Returns**: `void`

**Example**:
```python
result = body('username'='username')
```

### `body('email': any) -> void`

**Parameters**:
- `'email'` (`any`)

**Returns**: `void`

**Example**:
```python
result = body('email'='email')
```

### `body('password': any) -> void`

**Parameters**:
- `'password'` (`any`)

**Returns**: `void`

**Example**:
```python
result = body('password'='password')
```

### `body('email': any) -> void`

**Parameters**:
- `'email'` (`any`)

**Returns**: `void`

**Example**:
```python
result = body('email'='email')
```

### `body('password': any) -> void`

**Parameters**:
- `'password'` (`any`)

**Returns**: `void`

**Example**:
```python
result = body('password'='password')
```

### `async(req: any, res: any) -> void`

**Parameters**:
- `req` (`any`)
- `res` (`any`)

**Returns**: `void`

**Example**:
```python
result = async(req=req, res=res)
```

### `validationResult(req: any) -> void`

**Parameters**:
- `req` (`any`)

**Returns**: `void`

**Example**:
```python
result = validationResult(req=req)
```

### `if(!errors.isEmpty(: any) -> void`

**Parameters**:
- `!errors.isEmpty(` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(!errors.isEmpty(=!errors.isEmpty()
```

### `if(existingUser: any) -> void`

**Parameters**:
- `existingUser` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(existingUser=existingUser)
```

### `User({
      username: any, email: any, password
    }: any) -> void`

**Parameters**:
- `{
      username` (`any`)
- `email` (`any`)
- `password
    }` (`any`)

**Returns**: `void`

**Example**:
```python
result = User({
      username={
      username, email=email)
```

### `generateToken(user._id: any) -> void`

**Parameters**:
- `user._id` (`any`)

**Returns**: `void`

**Example**:
```python
result = generateToken(user._id=user._id)
```

### `catch(error: any) -> void`

**Parameters**:
- `error` (`any`)

**Returns**: `void`

**Example**:
```python
result = catch(error=error)
```

### `async(req: any, res: any) -> void`

**Parameters**:
- `req` (`any`)
- `res` (`any`)

**Returns**: `void`

**Example**:
```python
result = async(req=req, res=res)
```

### `validationResult(req: any) -> void`

**Parameters**:
- `req` (`any`)

**Returns**: `void`

**Example**:
```python
result = validationResult(req=req)
```

### `if(!errors.isEmpty(: any) -> void`

**Parameters**:
- `!errors.isEmpty(` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(!errors.isEmpty(=!errors.isEmpty()
```

### `if(!user: any) -> void`

**Parameters**:
- `!user` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(!user=!user)
```

### `if(user.isAccountLocked(: any) -> void`

**Parameters**:
- `user.isAccountLocked(` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(user.isAccountLocked(=user.isAccountLocked()
```

### `if(!isPasswordValid: any) -> void`

**Parameters**:
- `!isPasswordValid` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(!isPasswordValid=!isPasswordValid)
```

### `generateToken(user._id: any) -> void`

**Parameters**:
- `user._id` (`any`)

**Returns**: `void`

**Example**:
```python
result = generateToken(user._id=user._id)
```

### `catch(error: any) -> void`

**Parameters**:
- `error` (`any`)

**Returns**: `void`

**Example**:
```python
result = catch(error=error)
```

### `async(req: any, res: any) -> void`

**Parameters**:
- `req` (`any`)
- `res` (`any`)

**Returns**: `void`

**Example**:
```python
result = async(req=req, res=res)
```

### `if(!user: any) -> void`

**Parameters**:
- `!user` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(!user=!user)
```

### `catch(error: any) -> void`

**Parameters**:
- `error` (`any`)

**Returns**: `void`

**Example**:
```python
result = catch(error=error)
```

### `route(token invalidation handled on client: any) -> void`

**Parameters**:
- `token invalidation handled on client` (`any`)

**Returns**: `void`

**Example**:
```python
result = route(token invalidation handled on client=token invalidation handled on client)
```

### `async(req: any, res: any) -> void`

**Parameters**:
- `req` (`any`)
- `res` (`any`)

**Returns**: `void`

**Example**:
```python
result = async(req=req, res=res)
```


---

