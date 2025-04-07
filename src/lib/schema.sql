-- 專案表
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
CREATE TABLE TeamMembers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    role NVARCHAR(50) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- 任務表
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
CREATE INDEX IX_Tasks_ProjectId ON Tasks(projectId);
CREATE INDEX IX_Tasks_AssignedTo ON Tasks(assignedTo);
CREATE INDEX IX_CalendarEvents_ProjectId ON CalendarEvents(projectId);
CREATE INDEX IX_CalendarEvents_TaskId ON CalendarEvents(taskId);
CREATE INDEX IX_Notifications_ProjectId ON Notifications(projectId);
CREATE INDEX IX_Notifications_TaskId ON Notifications(taskId);
CREATE INDEX IX_Notifications_IsRead ON Notifications(isRead); 