-- WebAuthn Credentials Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WebAuthnCredentials' AND xtype='U')
BEGIN
  CREATE TABLE [dbo].[WebAuthnCredentials](
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [userId] INT NOT NULL,
    [credentialId] NVARCHAR(200) NOT NULL UNIQUE,
    [publicKey] VARBINARY(MAX) NOT NULL,
    [signCount] INT NOT NULL DEFAULT 0,
    [transports] NVARCHAR(200) NULL,
    [deviceName] NVARCHAR(100) NULL,
    [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [lastUsedAt] DATETIME NULL,
    [isActive] BIT NOT NULL DEFAULT 1
  );
  CREATE INDEX IX_WebAuthnCredentials_User ON [dbo].[WebAuthnCredentials](userId);
END;
GO
