CREATE TABLE Participantes (
    Id INT IDENTITY PRIMARY KEY,
    Nome NVARCHAR(100) NOT NULL,
    Telefone NVARCHAR(20) NOT NULL,
    DataCadastro DATETIME DEFAULT GETDATE()
);

ALTER TABLE Participantes
ADD CONSTRAINT UQ_Telefone UNIQUE (Telefone);


CREATE TABLE Sorteios (
    Id INT IDENTITY PRIMARY KEY,
    ParticipanteId INT NOT NULL,
    DataSorteio DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ParticipanteId) REFERENCES Participantes(Id)
);
