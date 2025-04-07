"use strict";

var sql = require('mssql');

var config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

function initDatabase() {
  var pool, dbResult;
  return regeneratorRuntime.async(function initDatabase$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(sql.connect(config));

        case 3:
          pool = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(pool.request().query("\n      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ProjectTracking')\n      BEGIN\n        CREATE DATABASE ProjectTracking;\n      END\n    "));

        case 6:
          dbResult = _context.sent;
          console.log('資料庫檢查完成'); // 切換到 ProjectTracking 資料庫

          _context.next = 10;
          return regeneratorRuntime.awrap(pool.request().query('USE ProjectTracking'));

        case 10:
          _context.next = 12;
          return regeneratorRuntime.awrap(pool.request().query("\n      -- \u5C08\u6848\u8868\n      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Projects')\n      CREATE TABLE Projects (\n          id INT IDENTITY(1,1) PRIMARY KEY,\n          name NVARCHAR(100) NOT NULL,\n          description NVARCHAR(MAX),\n          status NVARCHAR(20) NOT NULL DEFAULT '\u9032\u884C\u4E2D',\n          startDate DATE NOT NULL,\n          endDate DATE NOT NULL,\n          createdAt DATETIME NOT NULL DEFAULT GETDATE(),\n          updatedAt DATETIME NOT NULL DEFAULT GETDATE()\n      );\n\n      -- \u5718\u968A\u6210\u54E1\u8868\n      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TeamMembers')\n      CREATE TABLE TeamMembers (\n          id INT IDENTITY(1,1) PRIMARY KEY,\n          name NVARCHAR(50) NOT NULL,\n          email NVARCHAR(100) NOT NULL UNIQUE,\n          role NVARCHAR(50) NOT NULL,\n          createdAt DATETIME NOT NULL DEFAULT GETDATE(),\n          updatedAt DATETIME NOT NULL DEFAULT GETDATE()\n      );\n\n      -- \u4EFB\u52D9\u8868\n      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tasks')\n      CREATE TABLE Tasks (\n          id INT IDENTITY(1,1) PRIMARY KEY,\n          title NVARCHAR(200) NOT NULL,\n          description NVARCHAR(MAX),\n          status NVARCHAR(20) NOT NULL DEFAULT '\u5F85\u8655\u7406',\n          priority NVARCHAR(20) NOT NULL DEFAULT '\u4E00\u822C',\n          progress INT NOT NULL DEFAULT 0,\n          projectId INT NOT NULL,\n          assignedTo INT NOT NULL,\n          startDate DATE,\n          endDate DATE,\n          createdAt DATETIME NOT NULL DEFAULT GETDATE(),\n          updatedAt DATETIME NOT NULL DEFAULT GETDATE(),\n          FOREIGN KEY (projectId) REFERENCES Projects(id),\n          FOREIGN KEY (assignedTo) REFERENCES TeamMembers(id)\n      );\n\n      -- \u884C\u4E8B\u66C6\u4E8B\u4EF6\u8868\n      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CalendarEvents')\n      CREATE TABLE CalendarEvents (\n          id INT IDENTITY(1,1) PRIMARY KEY,\n          title NVARCHAR(200) NOT NULL,\n          description NVARCHAR(MAX),\n          startDate DATETIME NOT NULL,\n          endDate DATETIME NOT NULL,\n          type NVARCHAR(50) NOT NULL,\n          projectId INT,\n          taskId INT,\n          createdAt DATETIME NOT NULL DEFAULT GETDATE(),\n          updatedAt DATETIME NOT NULL DEFAULT GETDATE(),\n          FOREIGN KEY (projectId) REFERENCES Projects(id),\n          FOREIGN KEY (taskId) REFERENCES Tasks(id)\n      );\n\n      -- \u901A\u77E5\u8868\n      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')\n      CREATE TABLE Notifications (\n          id INT IDENTITY(1,1) PRIMARY KEY,\n          title NVARCHAR(200) NOT NULL,\n          content NVARCHAR(MAX) NOT NULL,\n          type NVARCHAR(50) NOT NULL,\n          isRead BIT NOT NULL DEFAULT 0,\n          projectId INT,\n          taskId INT,\n          createdAt DATETIME NOT NULL DEFAULT GETDATE(),\n          updatedAt DATETIME NOT NULL DEFAULT GETDATE(),\n          FOREIGN KEY (projectId) REFERENCES Projects(id),\n          FOREIGN KEY (taskId) REFERENCES Tasks(id)\n      );\n\n      -- \u9032\u5EA6\u8FFD\u8E64\u8868\n      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProgressTracking')\n      CREATE TABLE ProgressTracking (\n          id INT IDENTITY(1,1) PRIMARY KEY,\n          projectId INT NOT NULL,\n          taskId INT,\n          date DATE NOT NULL,\n          progress INT NOT NULL,\n          notes NVARCHAR(500),\n          createdAt DATETIME DEFAULT GETDATE(),\n          updatedAt DATETIME DEFAULT GETDATE(),\n          FOREIGN KEY (projectId) REFERENCES Projects(id),\n          FOREIGN KEY (taskId) REFERENCES Tasks(id)\n      );\n\n      -- \u5EFA\u7ACB\u7D22\u5F15\n      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Tasks_ProjectId')\n      CREATE INDEX IX_Tasks_ProjectId ON Tasks(projectId);\n      \n      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Tasks_AssignedTo')\n      CREATE INDEX IX_Tasks_AssignedTo ON Tasks(assignedTo);\n      \n      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CalendarEvents_ProjectId')\n      CREATE INDEX IX_CalendarEvents_ProjectId ON CalendarEvents(projectId);\n      \n      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CalendarEvents_TaskId')\n      CREATE INDEX IX_CalendarEvents_TaskId ON CalendarEvents(taskId);\n      \n      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_ProjectId')\n      CREATE INDEX IX_Notifications_ProjectId ON Notifications(projectId);\n      \n      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_TaskId')\n      CREATE INDEX IX_Notifications_TaskId ON Notifications(taskId);\n      \n      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_IsRead')\n      CREATE INDEX IX_Notifications_IsRead ON Notifications(isRead);\n    "));

        case 12:
          console.log('資料表創建完成'); // 關閉連接

          _context.next = 15;
          return regeneratorRuntime.awrap(sql.close());

        case 15:
          console.log('資料庫初始化完成');
          _context.next = 22;
          break;

        case 18:
          _context.prev = 18;
          _context.t0 = _context["catch"](0);
          console.error('資料庫初始化錯誤:', _context.t0);
          process.exit(1);

        case 22:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 18]]);
}

initDatabase();