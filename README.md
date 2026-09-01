    # 🌆 City-Flow: Smart City IoT Platform

[![ESP32](https://img.shields.io/badge/ESP32-000000?style=for-the-badge&logo=espressif&logoColor=white)](https://www.espressif.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Arduino](https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=arduino&logoColor=white)](https://www.arduino.cc/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/mrayanasif/City-Flow/pulls)

---

## 📌 Overview

**City-Flow** is a complete IoT-based smart city monitoring system. It collects real-time data from multiple sensors using an ESP32, sends it to a FastAPI backend, stores it in Supabase PostgreSQL, and displays it on a beautiful real-time dashboard with 3D animations.

This project demonstrates the power of **ESP32** + **FastAPI** + **Supabase** in building **cost-effective, energy-efficient** smart city infrastructure.

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **💡 Adaptive Lighting** | Automatically turns ON in darkness and OFF in bright light using LDR sensor |
| **🌡️ Environmental Monitoring** | Real-time Temperature & Humidity (DHT11) |
| **📏 Distance Measurement** | HC-SR04 Ultrasonic sensor for proximity detection |
| **🔥 Safety Alerts** | Gas leak detection (MQ2) + Motion detection (PIR) |
| **🔊 Audible Alerts** | Buzzer notifications for gas leaks & motion |
| **🔌 Relay Control** | Street light control via relay module |
| **🖥️ Real-time Dashboard** | Baby pink UI with 3D animated background |
| **📊 Data Visualization** | Live charts with historical data trends |
| **☁️ Cloud Storage** | Supabase PostgreSQL for data persistence |
| **🔄 OTA Updates** | Over-the-Air firmware updates for ESP32 |
| **📝 Data Logging** | SD card logging for offline data storage |
| **🔌 WiFi Manager** | Easy WiFi configuration via captive portal |

---

## 🧩 Hardware Components

| Component | Quantity | Purpose |
|-----------|----------|---------|
| [ESP32 Dev Board](https://www.espressif.com/en/products/socs/esp32) | 1 | Main Microcontroller |
| [LDR Sensor](https://en.wikipedia.org/wiki/Photoresistor) | 1 | Ambient light detection |
| [DHT11 Sensor](https://www.adafruit.com/product/386) | 1 | Temperature & Humidity |
| [HC-SR04 Ultrasonic](https://www.adafruit.com/product/3942) | 1 | Distance measurement |
| [MQ2 Gas Sensor](https://www.adafruit.com/product/257) | 1 | Gas leak detection |
| [PIR Motion Sensor](https://www.adafruit.com/product/189) | 1 | Motion detection |
| [Relay Module](https://www.adafruit.com/product/2935) | 1 | Street light control |
| [16x2 I2C LCD](https://www.adafruit.com/product/399) | 2 | Display sensor data |
| [Passive Buzzer](https://www.adafruit.com/product/1536) | 1 | Audible alerts |
| [SD Card Module](https://www.adafruit.com/product/254) | 1 | Data logging |
| [5V Power Supply 2A](https://www.adafruit.com/product/1995) | 4 | External power source |

---

## 📐 ESP32 GPIO Pin Configuration

| Component | ESP32 GPIO | Function |
|-----------|------------|----------|
| **LCD** | SDA: 21, SCL: 22 | I2C Communication |
| **LDR** | GPIO 34 | Analog Read (ADC1) |
| **Relay** | GPIO 23 | Digital Output |
| **DHT11** | GPIO 15 | Digital Input |
| **HC-SR04** | TRIG: 17, ECHO: 18 | Ultrasonic (ECHO needs voltage divider) |
| **MQ2** | GPIO 2 | Digital Input |
| **PIR** | GPIO 19 | Digital Input |
| **Buzzer** | GPIO 26 | Digital Output |
| **SD Card** | CS: 5, SCK: 18, MOSI: 23, MISO: 19 | SPI Communication |

> **⚠️ Important:** HC-SR04 ECHO pin is **5V** — use a **voltage divider** (1kΩ + 2kΩ) to convert to 3.3V for ESP32.

---


---

## 📦 Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/mrayanasif/City-Flow.git
cd City-Flow
```

### 2. Backend Setup (FastAPI + Supabase)
# a. Create Supabase Table
Create a table sensor_data with columns:
```bash
CREATE TABLE sensor_data (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT NOT NULL,
    ldr_value INT NOT NULL,
    temperature FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    distance_cm FLOAT NOT NULL,
    gas_detected BOOLEAN NOT NULL,
    motion_detected BOOLEAN NOT NULL,
    relay_status BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

# b. Configure .env
```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
```

# c. Install & Run
```bash
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
# Serve via any static server (Live Server / Python HTTP server)
cd frontend
python3 -m http.server 5500
```
Open http://localhost:5500 in browser.

---

### 4. ESP32 Firmware Setup
# a. Install Required Libraries
WiFiManager by tzapu

DHT sensor library by Adafruit

LiquidCrystal I2C by Frank de Brabander

ArduinoJson by Benoit Blanchon

# b. Configure secrets.h
```bash
const char* WIFI_SSID = "your_wifi_ssid";
const char* WIFI_PASSWORD = "your_wifi_password";
const char* SUPABASE_URL = "https://your-project.supabase.co";
const char* SUPABASE_KEY = "your-supabase-service-role-key";
```

# c. Upload to ESP32
Select board: ESP32 Dev Module

Select port

Click Upload

---

🎯 System Workflow
```bash
graph TD
    A[ESP32 Boot] --> B[WiFi Manager Connect]
    B --> C[Initialize Sensors & LCD]
    C --> D[Read LDR Value]
    D --> E{Is LDR > Threshold?}
    E -->|Yes - Dark| F[Turn Relay ON]
    E -->|No - Bright| G[Turn Relay OFF]
    F --> H[Display LCD Data]
    G --> H
    H --> I[Read All Sensors]
    I --> J{Gas or Motion?}
    J -->|Yes| K[Buzzer Alert]
    J -->|No| L[Continue]
    K --> L
    L --> M[Send Data to Supabase]
    M --> N[WebSocket Broadcast to Dashboard]
    N --> O[Dashboard Update]
    O --> D
```
---

🚀 Future Enhancements
□ Mobile App — React Native app for remote monitoring
□ Blynk Integration — Real-time dashboard & mobile notifications
□ AI/ML — Predictive maintenance using historical sensor data
□ LoRaWAN — Long-range communication for remote deployments
□ Solar Power — Solar panel integration for off-grid operation
□ Voice Assistant — Alexa/Google Home integration
□ Email/SMS Alerts — Critical alerts via Twilio/SendGrid

---

⭐ Support
If you found this project helpful, please give it a ⭐ on GitHub!
For questions or suggestions, feel free to open an issue.


