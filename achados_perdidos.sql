-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: achados_perdidos
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `itens`
--

DROP TABLE IF EXISTS `itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens` (
  `id_item` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `local` varchar(150) NOT NULL,
  `data_encontro` date NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `descricao` text,
  `imagem` varchar(255) DEFAULT NULL,
  `status` enum('perdido','encontrado') DEFAULT 'perdido',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_item`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `itens_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens`
--

LOCK TABLES `itens` WRITE;
/*!40000 ALTER TABLE `itens` DISABLE KEYS */;
INSERT INTO `itens` VALUES (22,4,'Garrafa Stanley Azul','Laboratório','2025-03-15','Utensílios','Garrafa térmica azul fosca, com arranhado na base.',NULL,'perdido','2025-08-24 16:49:12'),(23,4,'Mochila preta Adidas','Biblioteca','2025-03-12','Bolsas e Mochilas','Mochila média, com zíper quebrado no bolso frontal.',NULL,'perdido','2025-08-24 16:49:12'),(24,4,'Celular Samsung Galaxy A12','Sala 201','2025-03-18','Dispositivo eletrônico','Celular com capinha transparente e película rachada.',NULL,'encontrado','2025-08-24 16:49:12'),(25,4,'Chave de carro Fiat','Corredor 01','2025-03-20','Chaves','Chave simples com chaveiro vermelho de borracha.',NULL,'perdido','2025-08-24 16:49:12'),(26,4,'Blusa de moletom cinza','Sala 202','2025-03-10','Roupas e calçados','Moletom cinza sem capuz, tamanho M.',NULL,'perdido','2025-08-24 16:49:12'),(27,4,'Carteira marrom de couro','Corredor 02','2025-03-14','Documentos','Carteira contendo alguns cartões e documentos pessoais.',NULL,'perdido','2025-08-24 16:49:12'),(28,4,'Óculos de grau preto','Biblioteca','2025-03-11','Acessórios','Armação retangular preta, lentes com arranhados.',NULL,'encontrado','2025-08-24 16:49:12'),(29,4,'Estojo escolar azul','Sala 202','2025-03-19','Material escolar','Estojo com canetas coloridas e corretivo dentro.',NULL,'perdido','2025-08-24 16:49:12'),(30,4,'Fone de ouvido Bluetooth JBL','Laboratório','2025-03-16','Dispositivo eletrônico','Fone preto sem a case de carregamento.',NULL,'perdido','2025-08-24 16:49:12'),(31,4,'Guarda-chuva vermelho','Corredor 02','2025-03-13','Outros','Guarda-chuva grande vermelho com detalhe preto no cabo.',NULL,'encontrado','2025-08-24 16:49:12');
/*!40000 ALTER TABLE `itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `id_admin` int NOT NULL,
  `id_requisicao` int NOT NULL,
  `acao` enum('aprovado','reprovado') NOT NULL,
  `data_acao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `id_admin` (`id_admin`),
  KEY `id_requisicao` (`id_requisicao`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`id_admin`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `logs_ibfk_2` FOREIGN KEY (`id_requisicao`) REFERENCES `requisicoes` (`id_requisicao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requisicoes`
--

DROP TABLE IF EXISTS `requisicoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requisicoes` (
  `id_requisicao` int NOT NULL AUTO_INCREMENT,
  `id_item` int DEFAULT NULL,
  `id_usuario` int NOT NULL,
  `descricao` text,
  `imagem` varchar(255) DEFAULT NULL,
  `status` enum('pendente','aprovado','reprovado') DEFAULT 'pendente',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_requisicao`),
  KEY `id_usuario` (`id_usuario`),
  KEY `requisicoes_ibfk_1` (`id_item`),
  CONSTRAINT `requisicoes_ibfk_1` FOREIGN KEY (`id_item`) REFERENCES `itens` (`id_item`) ON DELETE CASCADE,
  CONSTRAINT `requisicoes_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requisicoes`
--

LOCK TABLES `requisicoes` WRITE;
/*!40000 ALTER TABLE `requisicoes` DISABLE KEYS */;
INSERT INTO `requisicoes` VALUES (1,22,1,'É uma garrafa térmica Stanley azul fosca, de tamanho médio (capacidade aproximada de 1 litro). A cor é azul escuro, sem brilho, e na base tem um arranhado visível, como se tivesse raspado no chão ou em alguma superfície áspera. A tampa é rosqueável e também funciona como copo. O corpo é cilíndrico e robusto, típico da marca Stanley, com o nome em relevo na lateral.',NULL,'pendente','2025-08-24 20:12:21'),(2,30,1,'é meu fone, c achou ele no lixo do laboratorio',NULL,'pendente','2025-08-25 02:09:15');
/*!40000 ALTER TABLE `requisicoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `ra` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo_usuario` enum('admin','usuario') DEFAULT 'usuario',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `imagem` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `ra` (`ra`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Kayller','0001066908','0001066908@senaimgaluno.com.br','33997029951','1234','usuario','2025-08-24 13:35:39','/uploads/profile-1.jpg'),(4,'Professor','01213432423','01213432423@senaimgdocente.com.br','33923029951','1234','admin','2025-08-24 16:29:16',NULL),(5,'Kayller','0001323432124','0001323432124@senaimgaluno.com.br','33923029951','1234','usuario','2025-08-24 21:04:26',NULL),(6,'jons','00010735632','00010735632@senaimgaluno.com.br','33923029951','23123','usuario','2025-08-25 16:02:35','/uploads/profile-6.jpg');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-25 16:38:35
