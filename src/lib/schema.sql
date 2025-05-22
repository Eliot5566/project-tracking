-- 使用者表（User）
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL,
    department NVARCHAR(100),
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- 子任務表（Sub-task）
CREATE TABLE SubTasks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    taskId INT NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    status NVARCHAR(20) NOT NULL DEFAULT '待處理',
    assigneeId INT,
    startDate DATE,
    dueDate DATE,
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (taskId) REFERENCES Tasks(id),
    FOREIGN KEY (assigneeId) REFERENCES Users(id)
);

-- 跨部門協作請求表（Request）
CREATE TABLE Requests (
    id INT IDENTITY(1,1) PRIMARY KEY,
    taskId INT,
    requesterId INT NOT NULL,
    departmentRequested NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    status NVARCHAR(20) NOT NULL DEFAULT 'requested',
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (taskId) REFERENCES Tasks(id),
    FOREIGN KEY (requesterId) REFERENCES Users(id)
);
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
    startDate DATE,　-- 預計開始日期
    endDate DATE, --預計結束日期
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

-- 文件管理表
CREATE TABLE Documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fileName TEXT NOT NULL,
    originalName TEXT NOT NULL,
    fileType TEXT NOT NULL,
    fileSize INTEGER NOT NULL,
    filePath TEXT NOT NULL,
    description TEXT,
    uploadedBy TEXT NOT NULL,
    projectId INTEGER,
    taskId INTEGER,
    isLatestVersion BOOLEAN NOT NULL DEFAULT 1,
    parentDocumentId INTEGER,
    versionNumber INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (projectId) REFERENCES Projects(id),
    FOREIGN KEY (taskId) REFERENCES Tasks(id),
    FOREIGN KEY (parentDocumentId) REFERENCES Documents(id)
);

-- 文件標籤表
CREATE TABLE DocumentTags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    createdAt TEXT NOT NULL
);

-- 文件標籤關聯表
-- 用於將文件與標籤關聯
CREATE TABLE DocumentTagAssociations (
    documentId INTEGER NOT NULL,
    tagId INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    PRIMARY KEY (documentId, tagId),
    FOREIGN KEY (documentId) REFERENCES Documents(id),
    FOREIGN KEY (tagId) REFERENCES DocumentTags(id)
);

-- 文件評論表
-- 用於存儲文件的評論
-- 每個文件可以有多個評論
CREATE TABLE DocumentComments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documentId INTEGER NOT NULL,
    commentedBy TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (documentId) REFERENCES Documents(id)
);

CREATE TABLE Audit (
    id INT IDENTITY(1,1) PRIMARY KEY,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    department NVARCHAR(50) NOT NULL,
    content NVARCHAR(255) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE()
);


-- 建立索引
CREATE INDEX IX_Tasks_ProjectId ON Tasks(projectId);
CREATE INDEX IX_Tasks_AssignedTo ON Tasks(assignedTo);
CREATE INDEX IX_CalendarEvents_ProjectId ON CalendarEvents(projectId);
CREATE INDEX IX_CalendarEvents_TaskId ON CalendarEvents(taskId);
CREATE INDEX IX_Notifications_ProjectId ON Notifications(projectId);
CREATE INDEX IX_Notifications_TaskId ON Notifications(taskId);
CREATE INDEX IX_Notifications_IsRead ON Notifications(isRead);