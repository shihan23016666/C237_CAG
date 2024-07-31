-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 16, 2024 at 05:34 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: ` freedb_c237_calendarapp`
--

USE 'freedb_c237_calendarapp';

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

CREATE TABLE `plans` (
  `planId` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `time` text DEFAULT NULL,
  `plan` varchar(200) DEFAULT NULL,
  `image` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plans`
--

INSERT INTO `plans` (`planId`, `date`, `time`, `plan`, `image`) VALUES
(77, '2024-07-31', '2pm-6pm', 'birthday', 'birthday.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `country`) VALUES
(1, 'hello', '$2b$10$rtpXcAlpqIwbdB/DM1GEtOTPRJa3bqrFVEdNIoL5xDijewBoTFLXy', ''),
(2, '1111', '$2b$10$JOs6etQ5aCUYf/aQBwlVaOgNggpmI6CkJNlqk1W1gg7k7Tow2URYO', ''),
(3, '23016666', '$2b$10$Ws0HG8b0Wm.59s4Vgqoh4el2f/PMLZEsx/oi8udo7akATJR9idPaa', ''),
(4, '222', '$2b$10$Ic2Tx3GtOPJJmlqfO9NcqejOGjS6j7XeUsk4shaUnAfutR10iLXV.', ''),
(5, 's.shiqi_', '$2b$10$Hv6fpSMDiP8bgl/Ya5q4f.mpR/55RTDGu97AuPcvIrcug8UG7mWQ.', ''),
(6, '123456', '$2b$10$XJbHDMiTkeuGFuHkrPkWGedN3LKeuflCNPMNGvyTfPS0iIRiXawti', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`planId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `planId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
