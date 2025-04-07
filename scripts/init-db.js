const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function initDatabase() {
  try {
    // 連接 SQL Server
    const pool = await sql.connect(config);
    
    // 檢查資料庫是否存在
    const dbResult = await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ProjectTracking')
      BEGIN
        CREATE DATABASE ProjectTracking;
      END
    `);
    
    console.log('資料庫檢查完成');
    
    // 切換到 ProjectTracking 資料庫
    await pool.request().query('USE ProjectTracking');
    
    // 創建表結構
    await pool.request().query(`
      -- 專案表
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Projects')
      CREATE TABLE Projects (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(100) NOT NULL,
          description NVARCHAR(MAX),
          status NVARCHAR(20) NOT NULL DEFAULT '進行中',
          startDate DATE NOT NULL,
          endDate DATE NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT GETDATE(),
          updatedAt DATETIME NOT NULL DEFAULT GETDATE()
      );

      -- 團隊成員表
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TeamMembers')
      CREATE TABLE TeamMembers (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(50) NOT NULL,
          email NVARCHAR(100) NOT NULL UNIQUE,
          role NVARCHAR(50) NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT GETDATE(),
          updatedAt DATETIME NOT NULL DEFAULT GETDATE()
      );

      -- 任務表
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tasks')
      CREATE TABLE Tasks (
          id INT IDENTITY(1,1) PRIMARY KEY,
          title NVARCHAR(200) NOT NULL,
          description NVARCHAR(MAX),
          status NVARCHAR(20) NOT NULL DEFAULT '待處理',
          priority NVARCHAR(20) NOT NULL DEFAULT '一般',
          progress INT NOT NULL DEFAULT 0,
          projectId INT NOT NULL,
          assignedTo INT NOT NULL,
          startDate DATE,
          endDate DATE,
          createdAt DATETIME NOT NULL DEFAULT GETDATE(),
          updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
          FOREIGN KEY (projectId) REFERENCES Projects(id),
          FOREIGN KEY (assignedTo) REFERENCES TeamMembers(id)
      );

      -- 行事曆事件表
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CalendarEvents')
      CREATE TABLE CalendarEvents (
          id INT IDENTITY(1,1) PRIMARY KEY,
          title NVARCHAR(200) NOT NULL,
          description NVARCHAR(MAX),
          startDate DATETIME NOT NULL,
          endDate DATETIME NOT NULL,
          type NVARCHAR(50) NOT NULL,
          projectId INT,
          taskId INT,
          createdAt DATETIME NOT NULL DEFAULT GETDATE(),
          updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
          FOREIGN KEY (projectId) REFERENCES Projects(id),
          FOREIGN KEY (taskId) REFERENCES Tasks(id)
      );

      -- 通知表
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
      CREATE TABLE Notifications (
          id INT IDENTITY(1,1) PRIMARY KEY,
          title NVARCHAR(200) NOT NULL,
          content NVARCHAR(MAX) NOT NULL,
          type NVARCHAR(50) NOT NULL,
          isRead BIT NOT NULL DEFAULT 0,
          projectId INT,
          taskId INT,
          createdAt DATETIME NOT NULL DEFAULT GETDATE(),
          updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
          FOREIGN KEY (projectId) REFERENCES Projects(id),
          FOREIGN KEY (taskId) REFERENCES Tasks(id)
      );

      -- 進度追蹤表
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProgressTracking')
      CREATE TABLE ProgressTracking (
          id INT IDENTITY(1,1) PRIMARY KEY,
          projectId INT NOT NULL,
          taskId INT,
          date DATE NOT NULL,
          progress INT NOT NULL,
          notes NVARCHAR(500),
          createdAt DATETIME DEFAULT GETDATE(),
          updatedAt DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (projectId) REFERENCES Projects(id),
          FOREIGN KEY (taskId) REFERENCES Tasks(id)
      );

      -- 建立索引
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Tasks_ProjectId')
      CREATE INDEX IX_Tasks_ProjectId ON Tasks(projectId);
      
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Tasks_AssignedTo')
      CREATE INDEX IX_Tasks_AssignedTo ON Tasks(assignedTo);
      
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CalendarEvents_ProjectId')
      CREATE INDEX IX_CalendarEvents_ProjectId ON CalendarEvents(projectId);
      
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CalendarEvents_TaskId')
      CREATE INDEX IX_CalendarEvents_TaskId ON CalendarEvents(taskId);
      
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_ProjectId')
      CREATE INDEX IX_Notifications_ProjectId ON Notifications(projectId);
      
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_TaskId')
      CREATE INDEX IX_Notifications_TaskId ON Notifications(taskId);
      
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_IsRead')
      CREATE INDEX IX_Notifications_IsRead ON Notifications(isRead);
    `);
    
    console.log('資料表創建完成');
    
    // 關閉連接
    await sql.close();
    
    console.log('資料庫初始化完成');
  } catch (error) {
    console.error('資料庫初始化錯誤:', error);
    process.exit(1);
  }
}

initDatabase(); 