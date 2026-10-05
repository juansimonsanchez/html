-- =============================================================================
-- ESQUEMA Y DATOS COMPLETOS: BASE DE DATOS LIGA BALONCESTO
-- =============================================================================

DROP DATABASE IF EXISTS `liga`;
CREATE DATABASE `liga` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
USE `liga`;

-- -----------------------------------------------------------------------------
-- 1. TABLA: equipos
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `equipos`;
CREATE TABLE `equipos` (
  `id_equipo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `ciudad` VARCHAR(50) NOT NULL,
  `web` VARCHAR(255) DEFAULT 'sin web oficial',
  PRIMARY KEY (`id_equipo`),
  UNIQUE KEY `uq_equipos_nombre` (`nombre`)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 2. TABLA: arbitros
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `arbitros`;
CREATE TABLE `arbitros` (
  `id_arbitro` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_arbitro`)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 3. TABLA: jugadores
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `jugadores`;
CREATE TABLE `jugadores` (
  `id_jugador` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(40) NOT NULL,
  `apellido` VARCHAR(40) NOT NULL,
  `puesto` ENUM('Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot') DEFAULT NULL,
  `id_capitan` INT UNSIGNED DEFAULT NULL,
  `fecha_alta` DATE DEFAULT NULL,
  `salario` INT UNSIGNED DEFAULT NULL,
  `id_equipo` INT UNSIGNED DEFAULT NULL,
  `altura` DECIMAL(3,2) DEFAULT NULL,
  PRIMARY KEY (`id_jugador`),
  KEY `idx_jugadores_equipo` (`id_equipo`),
  KEY `idx_jugadores_capitan` (`id_capitan`),
  CONSTRAINT `fk_jugadores_equipo` FOREIGN KEY (`id_equipo`) 
    REFERENCES `equipos` (`id_equipo`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_jugadores_capitan` FOREIGN KEY (`id_capitan`) 
    REFERENCES `jugadores` (`id_jugador`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4. TABLA: partidos
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `partidos`;
CREATE TABLE `partidos` (
  `id_partido` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `elocal` INT UNSIGNED NOT NULL,
  `evisitante` INT UNSIGNED NOT NULL,
  `puntos_local` SMALLINT UNSIGNED DEFAULT NULL,
  `puntos_visitante` SMALLINT UNSIGNED DEFAULT NULL,
  `fecha` DATE DEFAULT NULL,
  `id_arbitro` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id_partido`),
  KEY `idx_partidos_local` (`elocal`),
  KEY `idx_partidos_visitante` (`evisitante`),
  KEY `idx_partidos_arbitro` (`id_arbitro`),
  CONSTRAINT `chk_equipos_distintos` CHECK (`elocal` <> `evisitante`),
  CONSTRAINT `fk_partidos_local` FOREIGN KEY (`elocal`) 
    REFERENCES `equipos` (`id_equipo`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_partidos_visitante` FOREIGN KEY (`evisitante`) 
    REFERENCES `equipos` (`id_equipo`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_partidos_arbitro` FOREIGN KEY (`id_arbitro`) 
    REFERENCES `arbitros` (`id_arbitro`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. TABLA: estadisticas_jugador
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `estadisticas_jugador`;
CREATE TABLE `estadisticas_jugador` (
  `id_partido` INT UNSIGNED NOT NULL,
  `id_jugador` INT UNSIGNED NOT NULL,
  `minutos` TINYINT UNSIGNED DEFAULT 0,
  `puntos` SMALLINT UNSIGNED DEFAULT 0,
  `rebotes` SMALLINT UNSIGNED DEFAULT 0,
  `asistencias` SMALLINT UNSIGNED DEFAULT 0,
  `faltas` TINYINT UNSIGNED DEFAULT 0,
  PRIMARY KEY (`id_partido`, `id_jugador`),
  KEY `idx_est_jugador` (`id_jugador`),
  CONSTRAINT `chk_faltas` CHECK (`faltas` <= 5),
  CONSTRAINT `fk_est_partido` FOREIGN KEY (`id_partido`) 
    REFERENCES `partidos` (`id_partido`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_est_jugador` FOREIGN KEY (`id_jugador`) 
    REFERENCES `jugadores` (`id_jugador`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- INSERCIÓN DE DATOS
-- =============================================================================

-- -----------------------------------------------------
-- DML: Equipos
-- -----------------------------------------------------
INSERT INTO `equipos` (`id_equipo`, `nombre`, `ciudad`, `web`) VALUES
(1, 'Regal Barcelona', 'Barcelona', 'http://www.fcbarcelona.com/web/index_idiomes.html'),
(2, 'Real Madrid', 'Madrid', 'http://www.realmadrid.com/cs/Satellite/es/1193040472450/SubhomeEquipo/Baloncesto.htm'),
(3, 'P.E. Valencia', 'Valencia', 'http://www.valenciabasket.com/'),
(4, 'Caja Laboral', 'Vitoria', 'http://www.baskonia.com/prehomes/prehomes.asp?id_prehome=69'),
(5, 'Gran Canaria', 'Las Palmas', 'http://www.acb.com/club.php?id=CLA'),
(6, 'CAI Zaragoza', 'Zaragoza', 'http://basketzaragoza.net/');

-- -----------------------------------------------------
-- DML: Árbitros
-- -----------------------------------------------------
INSERT INTO `arbitros` (`id_arbitro`, `nombre`) VALUES
(1, 'Árbitro 1'),
(2, 'Árbitro 2'),
(3, 'Árbitro 3'),
(4, 'Árbitro 4'),
(5, 'Árbitro 5'),
(6, 'Árbitro 6'),
(7, 'Árbitro 7'),
(8, 'Daniel Hierrezuelo'),
(9, 'Emilio Pérez Pizarro'),
(10, 'Antonio Conde');

-- -----------------------------------------------------
-- DML: Jugadores
-- Nota: id_capitan se inserta directamente respetando que el capitán
-- exista o sea el propio jugador (como en el caso de Navarro, Reyes, etc.)
-- -----------------------------------------------------
INSERT INTO `jugadores` (`id_jugador`, `nombre`, `apellido`, `puesto`, `id_capitan`, `fecha_alta`, `salario`, `id_equipo`, `altura`) VALUES
-- Plantilla original depurada
(1, 'Juan Carlos', 'Navarro', 'Escolta', 1, '2010-01-10', 130000, 1, 1.96),
(2, 'Felipe', 'Reyes', 'Pívot', 2, '2009-02-20', 132000, 2, 2.04),
(3, 'Víctor', 'Claver', 'Alero', 3, '2009-03-08', 99000, 3, 2.08),
(4, 'Rafa', 'Martínez', 'Ala-Pívot', 4, '2010-11-11', 51000, 3, 1.91),
(5, 'Fernando', 'San Emeterio', 'Alero', 6, '2008-09-22', 60000, 4, 1.99),
(6, 'Mirza', 'Teletovic', 'Pívot', 6, '2010-05-13', 77000, 4, 2.06),
(7, 'Sergio', 'Llull', 'Escolta', 2, '2011-10-29', 100000, 2, 1.90),
(8, 'Víctor', 'Sada', 'Base', 1, '2012-01-01', 80000, 1, 1.92),
(9, 'Carlos', 'Suárez', 'Alero', 2, '2011-02-19', 66000, 2, 2.03),
(10, 'Xavi', 'Rey', 'Pívot', 14, '2008-10-12', 104500, 5, 2.09),
(11, 'Carlos', 'Cabezas', 'Base', 13, '2012-01-21', 105000, 6, 1.86),
(12, 'Pablo', 'Aguilar', 'Alero', 13, '2011-06-14', 51700, 6, 2.03),
(13, 'Rafa', 'Hettsheimeir', 'Pívot', 13, '2008-04-15', 58300, 6, 2.08),
(14, 'Sitapha', 'Savané', 'Pívot', 14, '2011-07-27', 66000, 5, 2.01),
-- Ampliación de plantillas
(15, 'Erazem', 'Lorbek', 'Ala-Pívot', 1, '2009-08-18', 115000, 1, 2.08),
(16, 'Pete', 'Mickeal', 'Alero', 1, '2009-06-29', 110000, 1, 1.99),
(17, 'Marcelinho', 'Huertas', 'Base', 1, '2011-08-09', 95000, 1, 1.91),
(18, 'Rudy', 'Fernández', 'Alero', 2, '2011-09-20', 140000, 2, 1.96),
(19, 'Nikola', 'Mirotic', 'Ala-Pívot', 2, '2008-07-15', 75000, 2, 2.08),
(20, 'Ante', 'Tomic', 'Pívot', 2, '2010-01-18', 85000, 2, 2.17),
(21, 'Nando', 'De Colo', 'Base', 3, '2009-07-13', 90000, 3, 1.96),
(22, 'Serhiy', 'Lishchuk', 'Pívot', 3, '2009-09-17', 72000, 3, 2.10),
(23, 'Florent', 'Piétrus', 'Ala-Pívot', 3, '2010-08-02', 68000, 3, 2.02),
(24, 'Pablo', 'Prigioni', 'Base', 6, '2011-08-25', 92000, 4, 1.91),
(25, 'Brad', 'Oleson', 'Escolta', 6, '2009-08-12', 78000, 4, 1.91),
(26, 'Milko', 'Bjelica', 'Ala-Pívot', 6, '2011-07-29', 64000, 4, 2.07),
(27, 'Javier', 'Beirán', 'Alero', 14, '2010-07-20', 50000, 5, 2.00),
(28, 'Spencer', 'Nelson', 'Ala-Pívot', 14, '2010-08-14', 62000, 5, 2.03),
(29, 'Tomás', 'Bellas', 'Base', 14, '2009-07-01', 54000, 5, 1.85),
(30, 'Sam', 'Van Rossom', 'Base', 13, '2010-07-05', 61000, 6, 1.88),
(31, 'Chad', 'Toppert', 'Alero', 13, '2010-08-22', 48000, 6, 2.01),
(32, 'Robert', 'Archibald', 'Pívot', 13, '2011-07-09', 59000, 6, 2.12);

-- -----------------------------------------------------
-- DML: Partidos
-- -----------------------------------------------------
INSERT INTO `partidos` (`id_partido`, `elocal`, `evisitante`, `puntos_local`, `puntos_visitante`, `fecha`, `id_arbitro`) VALUES
(1, 1, 2, 100, 100, '2011-10-10', 4),
(2, 2, 3, 90, 91, '2011-11-17', 5),
(3, 3, 4, 88, 77, '2011-11-23', 6),
(4, 1, 6, 66, 78, '2011-11-30', 6),
(5, 2, 4, 90,