CREATE TABLE Projects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    status NVARCHAR(20) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    progress INT DEFAULT 0,
    teamSize INT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Tasks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    projectId INT NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    status NVARCHAR(20) NOT NULL,
    priority NVARCHAR(20) NOT NULL,
    assignedTo INT,
    startDate DATE,
    dueDate DATE,
    progress INT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (projectId) REFERENCES Projects(id)
);

CREATE TABLE TeamMembers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    role NVARCHAR(50) NOT NULL,
    department NVARCHAR(50),
    status NVARCHAR(20) NOT NULL,
    email NVARCHAR(100),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Events (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    type NVARCHAR(20) NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(20) NOT NULL,
    priority NVARCHAR(20) NOT NULL,
    read BIT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE CalendarEvents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    startDate DATETIME NOT NULL,
    endDate DATETIME,
    type NVARCHAR(20) NOT NULL,
    projectId INT,
    taskId INT,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- 創建任務依賴關係表
CREATE TABLE TaskDependencies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    taskId INT NOT NULL,
    dependsOnTaskId INT NOT NULL,
    type NVARCHAR(20) NOT NULL, -- 'start-to-start', 'start-to-finish', 'finish-to-start', 'finish-to-finish'
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (taskId) REFERENCES Tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (dependsOnTaskId) REFERENCES Tasks(id) ON DELETE NO ACTION,
    CONSTRAINT UC_TaskDependency UNIQUE (taskId, dependsOnTaskId)
);

-- 更新通知表結構以支持用戶關聯
ALTER TABLE Notifications
ADD userId INT NULL;

-- 創建索引
CREATE INDEX IX_Tasks_ProjectId ON Tasks(projectId);
CREATE INDEX IX_Tasks_AssignedTo ON Tasks(assignedTo);
CREATE INDEX IX_Events_StartDate ON Events(startDate);
CREATE INDEX IX_Notifications_CreatedAt ON Notifications(createdAt);
CREATE INDEX IX_TaskDependencies_TaskId ON TaskDependencies(taskId);
CREATE INDEX IX_TaskDependencies_DependsOnTaskId ON TaskDependencies(dependsOnTaskId);