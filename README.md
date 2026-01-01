# Currency Conversion Web App

A full-stack currency conversion application with real-time exchange rates.

## 🚀 Tech Stack

### Backend
- **Kotlin** with Spring Boot
- **Gradle** for build management
- **FreeCurrencyAPI** for real-time exchange rates
- Caching enabled for optimized API calls

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Vanilla CSS** with premium design (glassmorphism, gradients, animations)
- Fully responsive design

## 📋 Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** (for frontend)

## 🛠️ Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the Spring Boot application:
   ```bash
   ./gradlew bootRun
   ```

   The backend will start on **http://localhost:8080**

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on **http://localhost:5173**

## 🎯 Usage

1. **Start the backend server** first (it must be running on port 8080)
2. **Start the frontend server** (it will run on port 5173)
3. Open your browser and navigate to **http://localhost:5173**
4. Enter an amount and select currencies to convert
5. Click the swap button to reverse the conversion direction
6. View real-time conversion results with exchange rates

## 🌟 Features

- 🎨 **Futuristic UI Design** with cyberpunk-inspired aesthetics
- 🌓 **Dark/Light Mode Toggle** - Switch between themes with smooth transitions
- ✨ **Advanced Animations** - Floating particles, rotating borders, and smooth transitions
- 💫 **Neon Effects** - Glowing borders and pulsing elements
- 🔄 **Real-time Currency Conversion** with live exchange rates
- 💱 **150+ Currencies** supported
- 📱 **Fully Responsive** - Works beautifully on all devices
- ⚡ **Fast Performance** with backend caching
- 🔒 **Secure API Key** stored only in backend
- 🎭 **Interactive Elements** with hover effects and micro-animations
- 🌐 **Animated Grid Background** with floating particles
- 💎 **Glassmorphism Effects** with backdrop blur

## 📡 API Endpoints

### GET `/api/currencies`
Fetches all available currencies with their exchange rates.

**Response:**
```json
{
  "currencies": {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    ...
  }
}
```

### POST `/api/convert`
Converts an amount from one currency to another.

**Request:**
```json
{
  "from": "USD",
  "to": "EUR",
  "amount": 100
}
```

**Response:**
```json
{
  "from": "USD",
  "to": "EUR",
  "amount": 100,
  "convertedAmount": 92.0,
  "rate": 0.92
}
```

## 🎨 UI Features

### Minimal & Clean Design
- **Modern Typography** - Uses clean sans-serif fonts for better readability.
- **Distraction-Free Interface** - Removed excess animations and particles.
- **Adaptive Theme** - Automatically switches between a professional light mode and a sleek dark mode.

### Dark Mode
- **Slate Gray Background** suitable for low-light environments.
- **High Contrast Text** for readability.
- **Soft Blue Accents** for focus states.

### Light Mode
- **Clean White/Gray Background** for a professional look.
- **Royal Blue Accents** for clarity.
- **Subtle Shadows** for depth without clutter.

### Interactive Elements
- **Theme Toggle Button** - Smooth rotation animation when switching modes
- **Animated Borders** - Rotating gradient borders on hover
- **Swap Button** - 180° rotation with glow effect
- **Input Fields** - Glowing borders on focus
- **Loading Spinner** - Triple-ring animated loader
- **Result Display** - Count-up animation with gradient numbers
- **Blinking Rate Indicator** - Live status indicator
- **Floating Particles** - Continuous upward animation

## 🔧 Configuration

### Backend Configuration
Edit `backend/src/main/resources/application.properties`:
```properties
server.port=8080
spring.cache.cache-names=currencyRates
spring.cache.caffeine.spec=expireAfterWrite=1h
```

### Frontend Configuration
The frontend connects to the backend at `http://localhost:8080/api`. To change this, edit the `API_BASE_URL` constant in `frontend/src/App.tsx`.

## 📝 Notes

- Currency rates are cached for 1 hour to minimize API calls
- The API key is securely stored in the backend service
- The frontend never directly accesses the FreeCurrencyAPI
- All currency conversions go through the backend proxy

## 🚀 Production Build

### Backend
```bash
cd backend
./gradlew build
java -jar build/libs/currency-backend-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 📄 License

This project is created for demonstration purposes.

---

**Enjoy converting currencies with style! 💱✨**
