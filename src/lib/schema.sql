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
-- 每當任務需要跨部門協作時，相關人員可以提交一個請求，描述需要協作的內容和目標部門。
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
-- 每個任務都屬於一個專案，並且可以指派給一個團隊成員。任務有標題、描述、狀態、優先級、進度等屬性。
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
-- 通知可以是系統自動生成的（如任務狀態變更、截止日期提醒等），也可以是用戶手動創建的（如跨部門協作請求的回覆）。
-- 每條通知都包含標題、內容、類型（如提醒、警告、信息等）、是否已讀等屬性。
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

CREATE TABLE WorkLogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    date DATE NOT NULL,
    task NVARCHAR(200) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    hours DECIMAL(5,2) NOT NULL, -- 關鍵：可存 0.5、3.5 等小數
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- 建立索引
CREATE INDEX IX_Tasks_ProjectId ON Tasks(projectId);
CREATE INDEX IX_Tasks_AssignedTo ON Tasks(assignedTo);
CREATE INDEX IX_CalendarEvents_ProjectId ON CalendarEvents(projectId);
CREATE INDEX IX_CalendarEvents_TaskId ON CalendarEvents(taskId);
CREATE INDEX IX_Notifications_ProjectId ON Notifications(projectId);
CREATE INDEX IX_Notifications_TaskId ON Notifications(taskId);
CREATE INDEX IX_Notifications_IsRead ON Notifications(isRead);