# API Documentation

# API Documentation - examples/sample.py

## Overview

- **Language**: python
- **Lines of Code**: 94
- **Functions**: 5
- **Classes**: 2
- **Cyclomatic Complexity**: 24
- **Maintainability Index**: 42.6/100

## Classes

### `class User`

#### Methods

**`duplicate_validation(data: Any) -> Any`**

**Parameters**:
- `data` (Any)

**Returns**: `Any`

**`another_validation(items: Any) -> Any`**

**Parameters**:
- `items` (Any)

**Returns**: `Any`

**`calculate_discount(price: float) -> float`**

**Parameters**:
- `price` (float)

**Returns**: `float`

**`deeply_nested_function(a: Any, b: Any, c: Any, d: Any) -> Any`**

**Parameters**:
- `a` (Any)
- `b` (Any)
- `c` (Any)
- `d` (Any)

**Returns**: `Any`

**`risky_operation() -> Any`**

**Returns**: `Any`


### `class UserManager`

#### Methods

**`duplicate_validation(data: Any) -> Any`**

**Parameters**:
- `data` (Any)

**Returns**: `Any`

**`another_validation(items: Any) -> Any`**

**Parameters**:
- `items` (Any)

**Returns**: `Any`

**`calculate_discount(price: float) -> float`**

**Parameters**:
- `price` (float)

**Returns**: `float`

**`deeply_nested_function(a: Any, b: Any, c: Any, d: Any) -> Any`**

**Parameters**:
- `a` (Any)
- `b` (Any)
- `c` (Any)
- `d` (Any)

**Returns**: `Any`

**`risky_operation() -> Any`**

**Returns**: `Any`


## Functions

### `duplicate_validation(data: Any) -> Any`

**Parameters**:
- `data` (`Any`)

**Returns**: `Any`

**Example**:
```python
result = duplicate_validation(data=data)
```

### `another_validation(items: Any) -> Any`

**Parameters**:
- `items` (`Any`)

**Returns**: `Any`

**Example**:
```python
result = another_validation(items=items)
```

### `calculate_discount(price: float) -> float`

**Parameters**:
- `price` (`float`)

**Returns**: `float`

**Example**:
```python
result = calculate_discount(price=price)
```

### `deeply_nested_function(a: Any, b: Any, c: Any, d: Any) -> Any`

**Parameters**:
- `a` (`Any`)
- `b` (`Any`)
- `c` (`Any`)
- `d` (`Any`)

**Returns**: `Any`

**Example**:
```python
result = deeply_nested_function(a=a, b=b)
```

### `risky_operation() -> Any`

**Returns**: `Any`

**Example**:
```python
result = risky_operation()
```

## Dependencies

### Imports

- `sys`
- `os`
- `dataclasses`
- `typing`


---

# API Documentation - examples/sample.ts

## Overview

- **Language**: typescript
- **Lines of Code**: 136
- **Functions**: 42
- **Classes**: 1
- **Cyclomatic Complexity**: 27
- **Maintainability Index**: 32.4/100

## Classes

### `class APIService`

#### Methods

**`url() -> void`**

**Returns**: `void`

**`response() -> void`**

**Returns**: `void`

**`processData(data: any) -> any`**

**Parameters**:
- `data` (any)

**Returns**: `any`

**`validateData(x: any) -> boolean`**

**Parameters**:
- `x` (any)

**Returns**: `boolean`

**`transformData(obj: any) -> any`**

**Parameters**:
- `obj` (any)

**Returns**: `any`

**`result() -> any`**

**Returns**: `any`

**`key() -> void`**

**Returns**: `void`

**`fetchUserData(userId: string, includeProfile: boolean, includeSettings: boolean, includePosts: boolean, includeFollowers: boolean, includeFollowing: boolean, format: string) -> Promise<UserData>`**

**Parameters**:
- `userId` (string)
- `includeProfile` (boolean)
- `includeSettings` (boolean)
- `includePosts` (boolean)
- `includeFollowers` (boolean)
- `includeFollowing` (boolean)
- `format` (string)

**Returns**: `Promise<UserData>`

**`fetch(url: any) -> void`**

**Parameters**:
- `url` (any)

**Returns**: `void`

**`loadUserWithCallback(userId: string, callback: Function) -> void`**

**Parameters**:
- `userId` (string)
- `callback` (Function)

**Returns**: `void`

**`if(err: any) -> void`**

**Parameters**:
- `err` (any)

**Returns**: `void`

**`callback(err: any) -> void`**

**Parameters**:
- `err` (any)

**Returns**: `void`

**`if(err2: any) -> void`**

**Parameters**:
- `err2` (any)

**Returns**: `void`

**`callback(err2: any) -> void`**

**Parameters**:
- `err2` (any)

**Returns**: `void`

**`callback(null: any, { user: any, perms: any, settings }: any) -> void`**

**Parameters**:
- `null` (any)
- `{ user` (any)
- `perms` (any)
- `settings }` (any)

**Returns**: `void`

**`fetchData(id: string, callback: Function) -> void`**

**Parameters**:
- `id` (string)
- `callback` (Function)

**Returns**: `void`

**`fetchPermissions(id: string, callback: Function) -> void`**

**Parameters**:
- `id` (string)
- `callback` (Function)

**Returns**: `void`

**`fetchSettings(id: string, callback: Function) -> void`**

**Parameters**:
- `id` (string)
- `callback` (Function)

**Returns**: `void`

**`validateUserAccess(user: any) -> boolean`**

**Parameters**:
- `user` (any)

**Returns**: `boolean`

**`if(user !== null && user !== undefined: any) -> void`**

**Parameters**:
- `user !== null && user !== undefined` (any)

**Returns**: `void`

**`if(user.isActive === true: any) -> void`**

**Parameters**:
- `user.isActive === true` (any)

**Returns**: `void`

**`if(user.role === "admin" || user.role === "moderator": any) -> void`**

**Parameters**:
- `user.role === "admin" || user.role === "moderator"` (any)

**Returns**: `void`

**`if(user.permissions && user.permissions.length > 0: any) -> void`**

**Parameters**:
- `user.permissions && user.permissions.length > 0` (any)

**Returns**: `void`

**`if(user.permissions.includes("write": any) -> void`**

**Parameters**:
- `user.permissions.includes("write"` (any)

**Returns**: `void`

**`if(user.lastLoginDate: any) -> void`**

**Parameters**:
- `user.lastLoginDate` (any)

**Returns**: `void`

**`calculateDelay(retryCount: number) -> number`**

**Parameters**:
- `retryCount` (number)

**Returns**: `number`

**`if(retryCount === 0: any) -> void`**

**Parameters**:
- `retryCount === 0` (any)

**Returns**: `void`

**`if(retryCount === 1: any) -> void`**

**Parameters**:
- `retryCount === 1` (any)

**Returns**: `void`

**`if(retryCount === 2: any) -> void`**

**Parameters**:
- `retryCount === 2` (any)

**Returns**: `void`

**`if(retryCount === 3: any) -> void`**

**Parameters**:
- `retryCount === 3` (any)

**Returns**: `void`

**`if(retryCount === 4: any) -> void`**

**Parameters**:
- `retryCount === 4` (any)

**Returns**: `void`

**`handleError1(error: any) -> void`**

**Parameters**:
- `error` (any)

**Returns**: `void`

**`if(error === null: any) -> void`**

**Parameters**:
- `error === null` (any)

**Returns**: `void`

**`if(error === undefined: any) -> void`**

**Parameters**:
- `error === undefined` (any)

**Returns**: `void`

**`handleError2(error: any) -> void`**

**Parameters**:
- `error` (any)

**Returns**: `void`

**`if(error === null: any) -> void`**

**Parameters**:
- `error === null` (any)

**Returns**: `void`

**`if(error === undefined: any) -> void`**

**Parameters**:
- `error === undefined` (any)

**Returns**: `void`

**`processData(data: any) -> any`**

**Parameters**:
- `data` (any)

**Returns**: `any`

**`validateData(x: any) -> boolean`**

**Parameters**:
- `x` (any)

**Returns**: `boolean`

**`transformData(obj: any) -> any`**

**Parameters**:
- `obj` (any)

**Returns**: `any`

**`for(const key in obj: any) -> void`**

**Parameters**:
- `const key in obj` (any)

**Returns**: `void`

**`if(obj.hasOwnProperty(key: any) -> void`**

**Parameters**:
- `obj.hasOwnProperty(key` (any)

**Returns**: `void`


## Functions

### `url() -> void`

**Returns**: `void`

**Example**:
```python
result = url()
```

### `response() -> void`

**Returns**: `void`

**Example**:
```python
result = response()
```

### `processData(data: any) -> any`

**Parameters**:
- `data` (`any`)

**Returns**: `any`

**Example**:
```python
result = processData(data=data)
```

### `validateData(x: any) -> boolean`

**Parameters**:
- `x` (`any`)

**Returns**: `boolean`

**Example**:
```python
result = validateData(x=x)
```

### `transformData(obj: any) -> any`

**Parameters**:
- `obj` (`any`)

**Returns**: `any`

**Example**:
```python
result = transformData(obj=obj)
```

### `result() -> any`

**Returns**: `any`

**Example**:
```python
result = result()
```

### `key() -> void`

**Returns**: `void`

**Example**:
```python
result = key()
```

### `fetchUserData(userId: string, includeProfile: boolean, includeSettings: boolean, includePosts: boolean, includeFollowers: boolean, includeFollowing: boolean, format: string) -> Promise<UserData>`

**Parameters**:
- `userId` (`string`)
- `includeProfile` (`boolean`)
- `includeSettings` (`boolean`)
- `includePosts` (`boolean`)
- `includeFollowers` (`boolean`)
- `includeFollowing` (`boolean`)
- `format` (`string`)

**Returns**: `Promise<UserData>`

**Example**:
```python
result = fetchUserData(userId=userId, includeProfile=includeProfile)
```

### `fetch(url: any) -> void`

**Parameters**:
- `url` (`any`)

**Returns**: `void`

**Example**:
```python
result = fetch(url=url)
```

### `loadUserWithCallback(userId: string, callback: Function) -> void`

**Parameters**:
- `userId` (`string`)
- `callback` (`Function`)

**Returns**: `void`

**Example**:
```python
result = loadUserWithCallback(userId=userId, callback=callback)
```

### `if(err: any) -> void`

**Parameters**:
- `err` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(err=err)
```

### `callback(err: any) -> void`

**Parameters**:
- `err` (`any`)

**Returns**: `void`

**Example**:
```python
result = callback(err=err)
```

### `if(err2: any) -> void`

**Parameters**:
- `err2` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(err2=err2)
```

### `callback(err2: any) -> void`

**Parameters**:
- `err2` (`any`)

**Returns**: `void`

**Example**:
```python
result = callback(err2=err2)
```

### `callback(null: any, { user: any, perms: any, settings }: any) -> void`

**Parameters**:
- `null` (`any`)
- `{ user` (`any`)
- `perms` (`any`)
- `settings }` (`any`)

**Returns**: `void`

**Example**:
```python
result = callback(null=null, { user={ user)
```

### `fetchData(id: string, callback: Function) -> void`

**Parameters**:
- `id` (`string`)
- `callback` (`Function`)

**Returns**: `void`

**Example**:
```python
result = fetchData(id=id, callback=callback)
```

### `fetchPermissions(id: string, callback: Function) -> void`

**Parameters**:
- `id` (`string`)
- `callback` (`Function`)

**Returns**: `void`

**Example**:
```python
result = fetchPermissions(id=id, callback=callback)
```

### `fetchSettings(id: string, callback: Function) -> void`

**Parameters**:
- `id` (`string`)
- `callback` (`Function`)

**Returns**: `void`

**Example**:
```python
result = fetchSettings(id=id, callback=callback)
```

### `validateUserAccess(user: any) -> boolean`

**Parameters**:
- `user` (`any`)

**Returns**: `boolean`

**Example**:
```python
result = validateUserAccess(user=user)
```

### `if(user !== null && user !== undefined: any) -> void`

**Parameters**:
- `user !== null && user !== undefined` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(user !== null && user !== undefined=user !== null && user !== undefined)
```

### `if(user.isActive === true: any) -> void`

**Parameters**:
- `user.isActive === true` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(user.isActive === true=user.isActive === true)
```

### `if(user.role === "admin" || user.role === "moderator": any) -> void`

**Parameters**:
- `user.role === "admin" || user.role === "moderator"` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(user.role === "admin" || user.role === "moderator"=user.role === "admin" || user.role === "moderator")
```

### `if(user.permissions && user.permissions.length > 0: any) -> void`

**Parameters**:
- `user.permissions && user.permissions.length > 0` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(user.permissions && user.permissions.length > 0=user.permissions && user.permissions.length > 0)
```

### `if(user.permissions.includes("write": any) -> void`

**Parameters**:
- `user.permissions.includes("write"` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(user.permissions.includes("write"=user.permissions.includes("write")
```

### `if(user.lastLoginDate: any) -> void`

**Parameters**:
- `user.lastLoginDate` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(user.lastLoginDate=user.lastLoginDate)
```

### `calculateDelay(retryCount: number) -> number`

**Parameters**:
- `retryCount` (`number`)

**Returns**: `number`

**Example**:
```python
result = calculateDelay(retryCount=retryCount)
```

### `if(retryCount === 0: any) -> void`

**Parameters**:
- `retryCount === 0` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(retryCount === 0=retryCount === 0)
```

### `if(retryCount === 1: any) -> void`

**Parameters**:
- `retryCount === 1` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(retryCount === 1=retryCount === 1)
```

### `if(retryCount === 2: any) -> void`

**Parameters**:
- `retryCount === 2` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(retryCount === 2=retryCount === 2)
```

### `if(retryCount === 3: any) -> void`

**Parameters**:
- `retryCount === 3` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(retryCount === 3=retryCount === 3)
```

### `if(retryCount === 4: any) -> void`

**Parameters**:
- `retryCount === 4` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(retryCount === 4=retryCount === 4)
```

### `handleError1(error: any) -> void`

**Parameters**:
- `error` (`any`)

**Returns**: `void`

**Example**:
```python
result = handleError1(error=error)
```

### `if(error === null: any) -> void`

**Parameters**:
- `error === null` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(error === null=error === null)
```

### `if(error === undefined: any) -> void`

**Parameters**:
- `error === undefined` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(error === undefined=error === undefined)
```

### `handleError2(error: any) -> void`

**Parameters**:
- `error` (`any`)

**Returns**: `void`

**Example**:
```python
result = handleError2(error=error)
```

### `if(error === null: any) -> void`

**Parameters**:
- `error === null` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(error === null=error === null)
```

### `if(error === undefined: any) -> void`

**Parameters**:
- `error === undefined` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(error === undefined=error === undefined)
```

### `processData(data: any) -> any`

**Parameters**:
- `data` (`any`)

**Returns**: `any`

**Example**:
```python
result = processData(data=data)
```

### `validateData(x: any) -> boolean`

**Parameters**:
- `x` (`any`)

**Returns**: `boolean`

**Example**:
```python
result = validateData(x=x)
```

### `transformData(obj: any) -> any`

**Parameters**:
- `obj` (`any`)

**Returns**: `any`

**Example**:
```python
result = transformData(obj=obj)
```

### `for(const key in obj: any) -> void`

**Parameters**:
- `const key in obj` (`any`)

**Returns**: `void`

**Example**:
```python
result = for(const key in obj=const key in obj)
```

### `if(obj.hasOwnProperty(key: any) -> void`

**Parameters**:
- `obj.hasOwnProperty(key` (`any`)

**Returns**: `void`

**Example**:
```python
result = if(obj.hasOwnProperty(key=obj.hasOwnProperty(key)
```


---

