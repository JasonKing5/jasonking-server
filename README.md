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
│   │   ├── userController.js   # 用户控制器
│   │   ├── transactionController.js # 交易控制器
│   │   ├── taskController.js   # 任务控制器
│   │   └── habitController.js  # 习惯控制器
│   ├── middleware/         # 中间件
│   │   └── auth.js        # 认证中间件
│   ├── models/            # 数据模型
│   │   ├── user.js       # 用户模型
│   │   ├── transaction.js # 交易模型
│   │   ├── task.js       # 任务模型
│   │   └── habit.js      # 习惯模型
│   └── routes/           # 路由
│       ├── userRoutes.js # 用户路由
│       ├── authRoutes.js # 认证路由
│       ├── transactionRoutes.js # 交易路由
│       ├── taskRoutes.js # 任务路由
│       └── habitRoutes.js # 习惯路由
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

### 任务表

```sql
-- 创建任务表
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATETIME,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  status ENUM('not_started', 'in_progress', 'completed') NOT NULL DEFAULT 'not_started',
  category VARCHAR(50),
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 添加索引以提高查询性能
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

### 习惯表

```sql
CREATE TABLE IF NOT EXISTS habits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency ENUM('daily', 'weekly', 'monthly', 'custom') NOT NULL DEFAULT 'daily',
  frequency_config JSON,
  reminder_time TIME,
  start_date DATE NOT NULL,
  end_date DATE,
  color VARCHAR(20),
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 添加索引以提高查询性能
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_frequency ON habits(frequency);
CREATE INDEX idx_habits_start_date ON habits(start_date);
CREATE INDEX idx_habits_is_active ON habits(is_active);
```

### 习惯日志表

```sql
CREATE TABLE IF NOT EXISTS habit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  habit_id INT NOT NULL,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('completed', 'skipped', 'missed') NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_habit_date (habit_id, date)
);

-- 添加索引以提高查询性能
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(date);
CREATE INDEX idx_habit_logs_status ON habit_logs(status);
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

curl -X POST '<baseUrl>/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "string",
    "password": "string",
    "email": "string"
  }'

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

curl -X POST '<baseUrl>/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "string",
    "password": "string"
  }'

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

curl -X GET '<baseUrl>/users' \
  -H 'Authorization: Bearer <token>'

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

curl -X PUT '<baseUrl>/users/2' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "newusername",
    "email": "newemail@example.com",
    "role": "user"
  }'

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

curl -X DELETE '<baseUrl>/users/2' \
  -H 'Authorization: Bearer <token>'

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

### 3. 任务管理

#### 创建任务

```
POST /api/tasks

curl -X POST '<baseUrl>/tasks' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "完成项目报告",
    "description": "包括市场分析部分",
    "due_date": "2025-04-01T10:00:00Z",
    "priority": "high",
    "category": "工作",
    "tags": ["报告", "市场分析"]
  }'

请求体：
{
  "title": "完成项目报告",         // 必填，任务标题
  "description": "包括市场分析部分",  // 可选，任务描述
  "due_date": "2025-04-01T10:00:00Z", // 可选，截止日期
  "priority": "high",            // 可选，优先级(low/medium/high)，默认medium
  "status": "not_started",       // 可选，状态(not_started/in_progress/completed)，默认not_started
  "category": "工作",            // 可选，任务类别
  "tags": ["报告", "市场分析"]     // 可选，任务标签
}

成功响应：(201 Created)
{
  "code": 201,
  "message": "任务创建成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "完成项目报告",
    "description": "包括市场分析部分",
    "due_date": "2025-04-01T10:00:00Z",
    "priority": "high",
    "status": "not_started",
    "category": "工作",
    "tags": ["报告", "市场分析"]
  }
}
```

#### 获取用户所有任务

```
GET /api/tasks?status=in_progress&priority=high&sort_by=due_date&sort_order=ASC

curl -X GET '<baseUrl>/tasks?status=in_progress&priority=high&sort_by=due_date&sort_order=ASC' \
  -H 'Authorization: Bearer <token>'

支持的过滤参数：
- status: 按状态过滤(not_started/in_progress/completed)
- priority: 按优先级过滤(low/medium/high)
- category: 按类别过滤
- due_date_before: 筛选在指定日期之前到期的任务
- due_date_after: 筛选在指定日期之后到期的任务
- sort_by: 排序字段(如created_at, due_date, priority等)
- sort_order: 排序方向(ASC/DESC)

成功响应：(200 OK)
{
  "code": 200,
  "message": "任务获取成功",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "完成项目报告",
      "description": "包括市场分析部分",
      "due_date": "2025-04-01T10:00:00Z",
      "priority": "high",
      "status": "in_progress",
      "category": "工作",
      "tags": ["报告", "市场分析"],
      "created_at": "2025-03-24T12:00:00Z",
      "updated_at": "2025-03-24T12:00:00Z"
    }
  ]
}
```

#### 获取任务详情

```
GET /api/tasks/:id

curl -X GET '<baseUrl>/tasks/1' \
  -H 'Authorization: Bearer <token>'

成功响应：(200 OK)
{
  "code": 200,
  "message": "任务获取成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "完成项目报告",
    "description": "包括市场分析部分",
    "due_date": "2025-04-01T10:00:00Z",
    "priority": "high",
    "status": "in_progress",
    "category": "工作",
    "tags": ["报告", "市场分析"],
    "created_at": "2025-03-24T12:00:00Z",
    "updated_at": "2025-03-24T12:00:00Z"
  }
}

错误响应：(404 Not Found)
{
  "code": 404,
  "message": "任务不存在或无权访问",
  "data": null
}
```

#### 更新任务

```
PUT /api/tasks/:id

curl -X PUT '<baseUrl>/tasks/1' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "更新后的项目报告",
    "description": "更新后的描述",
    "status": "in_progress",
    "priority": "medium",
    "due_date": "2025-04-10T10:00:00Z"
  }'

请求体：
{
  "title": "更新后的项目报告",       // 可选，更新任务标题
  "description": "更新后的描述",     // 可选，更新任务描述
  "due_date": "2025-04-10T10:00:00Z", // 可选，更新截止日期
  "priority": "medium",           // 可选，更新优先级
  "status": "in_progress",        // 可选，更新状态
  "category": "个人",             // 可选，更新任务类别
  "tags": ["报告", "修订"]         // 可选，更新任务标签
}

成功响应：(200 OK)
{
  "code": 200,
  "message": "任务更新成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "更新后的项目报告",
    "description": "更新后的描述",
    "due_date": "2025-04-10T10:00:00Z",
    "priority": "medium",
    "status": "in_progress",
    "category": "个人",
    "tags": ["报告", "修订"],
    "created_at": "2025-03-24T12:00:00Z",
    "updated_at": "2025-03-24T13:15:22Z"
  }
}

错误响应：(404 Not Found)
{
  "code": 404,
  "message": "任务不存在或无权访问",
  "data": null
}
```

#### 删除任务

```
DELETE /api/tasks/:id

curl -X DELETE '<baseUrl>/tasks/1' \
  -H 'Authorization: Bearer <token>'

成功响应：(200 OK)
{
  "code": 200,
  "message": "任务删除成功",
  "data": null
}

错误响应：(404 Not Found)
{
  "code": 404,
  "message": "任务不存在或无权访问",
  "data": null
}
```

#### 获取任务统计

```
GET /api/tasks/stats/overview

curl -X GET '<baseUrl>/tasks/stats/overview' \
  -H 'Authorization: Bearer <token>'

成功响应：(200 OK)
{
  "code": 200,
  "message": "统计数据获取成功",
  "data": {
    "total": 10,
    "not_started": 3,
    "in_progress": 5,
    "completed": 2,
    "low_priority": 2,
    "medium_priority": 5,
    "high_priority": 3,
    "overdue": 1
  }
}
```

#### 批量更新任务状态

```
PATCH /api/tasks/bulk/status

curl -X PATCH '<baseUrl>/tasks/bulk/status' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "task_ids": [1, 2, 3],
    "status": "completed"
  }'

请求体：
{
  "task_ids": [1, 2, 3],         // 必填，任务ID数组
  "status": "completed"           // 必填，新状态
}

成功响应：(200 OK)
{
  "code": 200,
  "message": "批量更新成功",
  "data": {
    "affected_rows": 3
  }
}
```

### 4. 习惯跟踪

#### 创建习惯

```
POST /api/habits

curl -X POST '<baseUrl>/habits' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "每日阅读",
    "description": "每天阅读30分钟",
    "frequency": "daily",
    "reminder_time": "20:00:00",
    "start_date": "2025-03-24",
    "color": "#4287f5",
    "icon": "book"
  }'

请求体：
{
  "name": "string",             // 必填，习惯名称
  "description": "string",      // 可选，习惯描述
  "frequency": "string",        // 可选，频率（daily/weekly/monthly/custom，默认daily）
  "frequency_config": object,   // 可选，自定义频率配置（JSON格式）
  "reminder_time": "string",    // 可选，提醒时间（HH:MM:SS）
  "start_date": "string",       // 可选，开始日期（YYYY-MM-DD，默认当天）
  "end_date": "string",         // 可选，结束日期（YYYY-MM-DD）
  "color": "string",            // 可选，颜色代码
  "icon": "string",             // 可选，图标名称
  "is_active": boolean          // 可选，是否激活（默认true）
}

成功响应：(201 Created)
{
  "code": 201,
  "message": "习惯创建成功",
  "data": {
    "id": number,
    "user_id": number,
    "name": "string",
    "description": "string",
    "frequency": "string",
    "frequency_config": object,
    "reminder_time": "string",
    "start_date": "string",
    "end_date": "string",
    "color": "string",
    "icon": "string",
    "is_active": boolean,
    "created_at": "string",
    "updated_at": "string"
  }
}

错误响应：(400 Bad Request)
{
  "code": 400,
  "message": "习惯名称不能为空",
  "data": null
}
```

#### 获取习惯列表

```
GET /api/habits

curl -X GET '<baseUrl>/habits?frequency=daily&is_active=true' \
  -H 'Authorization: Bearer <token>'

查询参数：
- frequency: 频率过滤（daily/weekly/monthly/custom）
- is_active: 是否激活过滤（true/false）
- start_date_after: 开始日期过滤（大于等于指定日期）
- start_date_before: 开始日期过滤（小于等于指定日期）
- sort_by: 排序字段（默认created_at）
- sort_order: 排序方向（ASC/DESC，默认DESC）

成功响应：(200 OK)
{
  "code": 200,
  "message": "获取习惯列表成功",
  "data": [
    {
      "id": number,
      "user_id": number,
      "name": "string",
      "description": "string",
      "frequency": "string",
      "frequency_config": object,
      "reminder_time": "string",
      "start_date": "string",
      "end_date": "string",
      "color": "string",
      "icon": "string",
      "is_active": boolean,
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}
```

#### 获取习惯详情

```
GET /api/habits/:id

curl -X GET '<baseUrl>/habits/1' \
  -H 'Authorization: Bearer <token>'

成功响应：(200 OK)
{
  "code": 200,
  "message": "获取习惯详情成功",
  "data": {
    "id": number,
    "user_id": number,
    "name": "string",
    "description": "string",
    "frequency": "string",
    "frequency_config": object,
    "reminder_time": "string",
    "start_date": "string",
    "end_date": "string",
    "color": "string",
    "icon": "string",
    "is_active": boolean,
    "created_at": "string",
    "updated_at": "string"
  }
}

错误响应：(404 Not Found)
{
  "code": 404,
  "message": "未找到该习惯",
  "data": null
}
```

#### 更新习惯

```
PUT /api/habits/:id

curl -X PUT '<baseUrl>/habits/1' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "每日阅读更新",
    "description": "每天阅读45分钟",
    "reminder_time": "19:30:00"
  }'

请求体：
{
  "name": "string",             // 可选
  "description": "string",      // 可选
  "frequency": "string",        // 可选
  "frequency_config": object,   // 可选
  "reminder_time": "string",    // 可选
  "start_date": "string",       // 可选
  "end_date": "string",         // 可选
  "color": "string",            // 可选
  "icon": "string",             // 可选
  "is_active": boolean          // 可选
}

成功响应：(200 OK)
{
  "code": 200,
  "message": "习惯更新成功",
  "data": {
    "id": number,
    "user_id": number,
    "name": "string",
    "description": "string",
    "frequency": "string",
    "frequency_config": object,
    "reminder_time": "string",
    "start_date": "string",
    "end_date": "string",
    "color": "string",
    "icon": "string",
    "is_active": boolean,
    "created_at": "string",
    "updated_at": "string"
  }
}

错误响应：(404 Not Found)
{
  "code": 404,
  "message": "未找到该习惯",
  "data": null
}
```

#### 删除习惯

```
DELETE /api/habits/:id

curl -X DELETE '<baseUrl>/habits/1' \
  -H 'Authorization: Bearer <token>'

成功响应：(200 OK)
{
  "code": 200,
  "message": "习惯删除成功",
  "data": null
}

错误响应：(404 Not Found)
{
  "code": 404,
  "message": "未找到该习惯",
  "data": null
}
```

#### 记录习惯完成情况

```
POST /api/habits/:id/logs

curl -X POST '<baseUrl>/habits/1/logs' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "date": "2025-03-24",
    "status": "completed",
    "notes": "完成了45分钟阅读"
  }'

请求体：
{
  "date": "string",       // 可选，日期（YYYY-MM-DD，默认当天）
  "status": "string",     // 可选，状态（completed/skipped/missed，默认completed）
  "notes": "string"       // 可选，备注
}

成功响应：(201 Created)
{
  "code": 201,
  "message": "习惯记录成功",
  "data": {
    "id": number,
    "habit_id": number,
    "user_id": number,
    "date": "string",
    "status": "string",
    "notes": "string"
  }
}

错误响应：(404 Not Found)
{
  "code": 404,
  "message": "未找到该习惯",
  "data": null
}
```

#### 获取习惯日志

```
GET /api/habits/:id/logs

curl -X GET '<baseUrl>/habits/1/logs?status=completed&date_after=2025-03-01' \
  -H 'Authorization: Bearer <token>'

查询参数：
- status: 状态过滤（completed/skipped/missed）
- date_after: 日期过滤（大于等于指定日期）
- date_before: 日期过滤（小于等于指定日期）
- sort_by: 排序字段（默认date）
- sort_order: 排序方向（ASC/DESC，默认DESC）

成功响应：(200 OK)
{
  "code": 200,
  "message": "获取习惯日志成功",
  "data": [
    {
      "id": number,
      "habit_id": number,
      "user_id": number,
      "date": "string",
      "status": "string",
      "notes": "string",
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}
```

#### 获取所有习惯日志

```
GET /api/habits/logs/all

curl -X GET '<baseUrl>/habits/logs/all?date_after=2025-03-01&habit_id=1' \
  -H 'Authorization: Bearer <token>'

查询参数：
- status: 状态过滤（completed/skipped/missed）
- date_after: 日期过滤（大于等于指定日期）
- date_before: 日期过滤（小于等于指定日期）
- habit_id: 习惯ID过滤
- sort_by: 排序字段（默认date）
- sort_order: 排序方向（ASC/DESC，默认DESC）

成功响应：(200 OK)
{
  "code": 200,
  "message": "获取所有习惯日志成功",
  "data": [
    {
      "id": number,
      "habit_id": number,
      "user_id": number,
      "date": "string",
      "status": "string",
      "notes": "string",
      "created_at": "string",
      "updated_at": "string",
      "habit_name": "string",
      "frequency": "string"
    }
  ]
}
```

#### 获取习惯统计数据

```
GET /api/habits/stats/summary

curl -X GET '<baseUrl>/habits/stats/summary?date_after=2025-03-01&date_before=2025-03-31' \
  -H 'Authorization: Bearer <token>'

查询参数：
- date_after: 日期过滤（大于等于指定日期）
- date_before: 日期过滤（小于等于指定日期）

成功响应：(200 OK)
{
  "code": 200,
  "message": "获取习惯统计成功",
  "data": {
    "overall": {
      "total_habits": number,
      "total_logs": number,
      "completed_count": number,
      "skipped_count": number,
      "missed_count": number
    },
    "by_frequency": [
      {
        "frequency": "string",
        "habits_count": number,
        "completed_count": number
      }
    ],
    "by_date": [
      {
        "date": "string",
        "total_logs": number,
        "completed_count": number
      }
    ]
  }
}
```

#### 删除习惯日志

```
DELETE /api/habits/logs/:logId

curl -X DELETE '<baseUrl>/habits/logs/1' \
  -H 'Authorization: Bearer <token>'

成功响应：(200 OK)
{
  "code": 200,
  "message": "习惯日志删除成功",
  "data": null
}

错误响应：(404 Not Found)
{
  "code": 404,
  "message": "日志不存在或无权删除",
  "data": null
}
```

## 使用示例

### 1. 初始化后的默认管理员账户
```bash
username: root
password: 123456
```

### 2. 登录示例
```bash
curl -X POST <baseUrl>/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"root","password":"123456"}'

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
