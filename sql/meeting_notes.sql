-- MeetingNotes 會議紀錄表 (需手動在 MSSQL 執行一次)
IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='MeetingNotes' AND xtype='U')
BEGIN
  CREATE TABLE MeetingNotes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    meetingDate DATE NOT NULL,
    title NVARCHAR(200) NOT NULL,
    summary NVARCHAR(MAX) NULL,
    unitAResponsibility NVARCHAR(500) NULL,
    unitADueDate DATE NULL,
    unitAStatus NVARCHAR(50) NULL,
    unitBResponsibility NVARCHAR(500) NULL,
    unitBDueDate DATE NULL,
    unitBStatus NVARCHAR(50) NULL,
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE()
  );
  CREATE INDEX IX_MeetingNotes_Date ON MeetingNotes(meetingDate);
END;
