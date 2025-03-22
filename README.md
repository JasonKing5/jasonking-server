# JasonKing Server

一个基于 Node.js + Express + MySQL 的轻量级个人网站后端服务器。

## 技术栈

- **运行时**: Node.js
- **Web 框架**: Express.js
- **数据库**: MySQL
- **认证**: JWT (JSON Web Tokens)
- **密码加密**: bcryptjs
- **开发工具**: nodemon（热重载）

## 项目特点

- 轻量级：使用数据库 MySQL
- 安全性：
  - 密码加密存储
  - JWT 认证
  - 基于角色的访问控制（RBAC）
  - 内置 root 用户保护机制
- 开发友好：支持热重载
- RESTful API 设计

## 项目结构

```
jasonking-server/
├── src/
│   ├── app.js              # 应用入口文件
│   ├── config/             # 配置文件
│   │   └── database.js     # 数据库配置
│   ├── controllers/        # 控制器
│   │   └── userController.js
│   ├── middleware/         # 中间件
│   │   └── auth.js        # 认证中间件
│   ├── models/            # 数据模型
│   │   └── user.js       # 用户模型
│   └── routes/           # 路由
│       └── userRoutes.js # 用户路由
├── scripts/              # 脚本文件
│   └── init-db.js       # 数据库初始化脚本
├── .env                # 环境变量配置
├── package.json       # 项目配置和依赖
└── README.md         # 项目文档
```

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- pnpm >= 6.0.0

### 安装

1. 克隆项目
```bash
git clone <repository-url>
cd jasonking-server
```

2. 安装依赖
```bash
pnpm install
```

3. 配置环境变量
复制 `.env-example` 文件为 `.env`，并编辑 `.env` 文件，设置必要的环境变量：
```
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secret-key
...
```

4. 初始化数据库
```bash
pnpm run init-db
```

5. 启动服务器
```bash
# 开发模式（支持热重载）
pnpm run dev

# 生产模式
pnpm start
```

## 数据库设计

### 用户表

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### 交易表

```sql
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
```

## API 文档

### 统一响应格式

所有 API 响应都遵循以下统一格式：

```json
{
    "code": "number",
    "message": "string",
    "data": "any"
}
```

常见状态码：
- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器内部错误

### 认证相关

> baseUrl: http://localhost:4000/api

#### 用户注册
```
POST /api/auth/register

```bash
curl -X POST '<baseUrl>/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "string",
    "password": "string",
    "email": "string"
  }'
```

请求体：
{
  "username": "string",
  "password": "string",
  "email": "string"
}

成功响应：(201 Created)
{
  "code": 201,
  "message": "User registered successfully",
  "data": {
    "id": number,
    "username": "string",
    "email": "string"
  }
}

错误响应：(400 Bad Request)
{
  "code": 400,
  "message": "Username already exists",
  "data": null
}
```

#### 用户登录
```
POST /api/auth/login

```bash
curl -X POST '<baseUrl>/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "string",
    "password": "string"
  }'
```

请求体：
{
  "username": "string",
  "password": "string"
}

成功响应：(200 OK)
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "token": "string",
    "user": {
      "id": number,
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
}

错误响应：(401 Unauthorized)
{
  "code": 401,
  "message": "Invalid credentials",
  "data": null
}
```

### 用户管理（需要认证）

所有认证接口需要在请求头中携带 token：
```bash
Authorization: Bearer <token>
```

#### 获取所有用户（需要管理员权限）
```
GET /api/users

```bash
curl -X GET '<baseUrl>/users' \
  -H 'Authorization: Bearer <token>'
```

成功响应：(200 OK)
{
  "code": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": number,
      "username": "string",
      "email": "string",
      "role": "string",
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}

错误响应：(403 Forbidden)
{
  "code": 403,
  "message": "Unauthorized access",
  "data": null
}
```

#### 更新用户信息（需要管理员权限或本人）
```
PUT /api/users/:id

```bash
curl -X PUT '<baseUrl>/users/2' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "newusername",
    "email": "newemail@example.com",
    "role": "user"
  }'
```

请求体：
{
  "username": "string",
  "email": "string",
  "role": "string"  // 仅管理员可修改
}

成功响应：(200 OK)
{
  "code": 200,
  "message": "User updated successfully",
  "data": null
}

错误响应：(403 Forbidden)
{
  "code": 403,
  "message": "Only admin can modify user role",
  "data": null
}
```

#### 删除用户（需要管理员权限）
```
DELETE /api/users/:id

```bash
curl -X DELETE '<baseUrl>/users/2' \
  -H 'Authorization: Bearer <token>'
```


成功响应：(200 OK)
{
  "code": 200,
  "message": "User deleted successfully",
  "data": null
}

错误响应：(403 Forbidden)
{
  "code": 403,
  "message": "Cannot delete root user",
  "data": null
}
```

### 交易管理（需要认证）

所有交易接口需要在请求头中携带 token：
```
Authorization: Bearer <token>
```

#### 创建交易记录
```
POST /api/transactions

curl -X POST '<baseUrl>/transactions' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 100.50,
    "type": "expense",
    "category": "food",
    "description": "Lunch at restaurant",
    "date": "2025-02-21T10:00:00Z"
  }'

# Example Response:
{
  "code": 201,
  "message": "Transaction created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "amount": 100.50,
    "type": "expense",
    "category": "food",
    "description": "Lunch at restaurant",
    "date": "2025-02-21T10:00:00Z",
    "created_at": "2025-02-21T11:13:22Z"
  }
}

请求体：
{
  "amount": number,      // 交易金额
  "type": "string",      // 交易类型
  "category": "string",  // 交易类别
  "description": "string", // 交易描述（可选）
  "date": "string"       // 交易日期（可选，默认为当前时间）
}

成功响应：(201 Created)
{
  "code": 201,
  "message": "Transaction created successfully",
  "data": {
    "id": number,
    "user_id": number,
    "amount": number,
    "type": "string",
    "category": "string",
    "description": "string",
    "date": "string",
    "created_at": "string"
  }
}
```

#### 获取用户所有交易记录
```
GET /api/transactions

curl -X GET '<baseUrl>/transactions' \
  -H 'Authorization: Bearer <token>'

# Example Response:
{
  "code": 200,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "amount": 100.50,
      "type": "expense",
      "category": "food",
      "description": "Lunch at restaurant",
      "date": "2025-02-21T10:00:00Z",
      "created_at": "2025-02-21T11:13:22Z"
    }
  ]
}

成功响应：(200 OK)
{
  "code": 200,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": number,
      "user_id": number,
      "amount": number,
      "type": "string",
      "category": "string",
      "description": "string",
      "date": "string",
      "created_at": "string"
    }
  ]
}
```

#### 获取特定交易记录
```
GET /api/transactions/:id

curl -X GET '<baseUrl>/transactions/1' \
  -H 'Authorization: Bearer <token>'

# Example Response:
{
  "code": 200,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "amount": 100.50,
    "type": "expense",
    "category": "food",
    "description": "Lunch at restaurant",
    "date": "2025-02-21T10:00:00Z",
    "created_at": "2025-02-21T11:13:22Z"
  }
}

成功响应：(200 OK)
{
  "code": 200,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": number,
    "user_id": number,
    "amount": number,
    "type": "string",
    "category": "string",
    "description": "string",
    "date": "string",
    "created_at": "string"
  }
}

错误响应：(404 Not Found)
{
  "code": 404,
  "message": "Transaction not found",
  "data": null
}
```

#### 更新交易记录
```
PUT /api/transactions/:id

curl -X PUT '<baseUrl>/transactions/1' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 120.00,
    "description": "Updated lunch expense"
  }'

# Example Response:
{
  "code": 200,
  "message": "Transaction updated successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "amount": 120.00,
    "type": "expense",
    "category": "food",
    "description": "Updated lunch expense",
    "date": "2025-02-21T10:00:00Z",
    "created_at": "2025-02-21T11:13:22Z"
  }
}

请求体：
{
  "amount": number,      // 可选
  "type": "string",      // 可选
  "category": "string",  // 可选
  "description": "string", // 可选
  "date": "string"       // 可选
}

成功响应：(200 OK)
{
  "code": 200,
  "message": "Transaction updated successfully",
  "data": {
    "id": number,
    "user_id": number,
    "amount": number,
    "type": "string",
    "category": "string",
    "description": "string",
    "date": "string",
    "created_at": "string"
  }
}

错误响应：(403 Forbidden)
{
  "code": 403,
  "message": "Unauthorized",
  "data": null
}
```

#### 删除交易记录
```
DELETE /api/transactions/:id

curl -X DELETE '<baseUrl>/transactions/1' \
  -H 'Authorization: Bearer <token>'

# Example Response:
{
  "code": 200,
  "message": "Transaction deleted successfully",
  "data": null
}

成功响应：(200 OK)
{
  "code": 200,
  "message": "Transaction deleted successfully",
  "data": null
}

错误响应：(404 Not Found)
{
  "code": 404,
  "message": "Transaction not found",
  "data": null
}
```

## 使用示例

### 1. 初始化后的默认管理员账户
```bash
username: root
password: root123
```

### 2. 登录示例
```bash
curl -X POST <baseUrl>/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"root","password":"root123"}'

# 成功响应示例：
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "root",
      "email": "root@example.com",
      "role": "admin"
    }
  }
}
```

### 3. 使用 token 访问受保护的 API

```bash
# 获取用户列表
curl -X GET <baseUrl>/users \
  -H "Authorization: Bearer <token>"

# 成功响应示例：
{
  "code": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "username": "root",
      "email": "root@example.com",
      "role": "admin",
      "created_at": "2025-02-17T11:00:00.000Z",
      "updated_at": "2025-02-17T11:00:00.000Z"
    }
  ]
}

# 更新用户信息
curl -X PUT <baseUrl>/users/2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"jason","email":"jason.new@example.com"}'

# 成功响应示例：
{
  "code": 200,
  "message": "User updated successfully",
  "data": null
}
```

## 安全特性

1. 密码安全
  - 使用 bcryptjs 进行密码加密
  - 数据库中只存储密码哈希

2. 认证安全
  - 使用 JWT 进行身份验证
  - token 24小时过期机制
  - 请求头 Bearer token 认证

3. 授权控制
  - 基于角色的访问控制（RBAC）
  - 管理员特权操作保护
  - root 用户删除保护

4. 数据安全
  - 用户名唯一性检查
  - 邮箱格式验证
  - SQL 注入防护

## 开发建议

1. 在生产环境中，请务必：
  - 修改 JWT_SECRET
  - 设置强密码策略
  - 配置适当的 CORS 策略
  - 启用 HTTPS

2. 开发时可以使用 Postman 或类似工具测试 API

## License

MIT
