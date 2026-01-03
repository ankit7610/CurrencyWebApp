# Currency Conversion Web App

A full-stack currency conversion application with real-time exchange rates and a professional, clean UI.

## 🚀 Tech Stack

### Backend
- **Kotlin** with Spring Boot 3.2.0
- **Gradle** for build management
- **FreeCurrencyAPI** for real-time exchange rates
- **Caffeine Cache** for optimized API calls (1-hour cache)
- **Spring Web** with CORS support

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Vanilla CSS** with modern, professional design
- **Inter Font** from Google Fonts
- Fully responsive design

## 📋 Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** (for frontend)
- **Git** for version control

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

- 🎨 **Professional Light Theme** - Clean, modern design with soft gradients
- 💼 **Business-Ready UI** - Polished interface suitable for professional use
- 🔄 **Real-time Currency Conversion** with live exchange rates
- 💱 **150+ Currencies** supported
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile
- ⚡ **Fast Performance** with backend caching (1-hour cache duration)
- 🔒 **Secure API Key** stored only in backend
- 🎯 **Type-Safe** - Full TypeScript implementation in frontend
- 🧩 **Component-Based Architecture** - Modular React components
- ✨ **Smooth Interactions** - Subtle hover effects and transitions
- 🌐 **Modern Typography** - Inter font for excellent readability
- 💎 **Clean Design System** - Consistent colors, spacing, and shadows

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

## 🎨 UI Design

### Professional Light Theme
The application features a clean, modern design optimized for professional use:

- **Soft Gradient Background** - Subtle gradient from light slate to light indigo
- **Modern Typography** - Inter font family for excellent readability
- **Consistent Color Palette** - Blue accent colors (#3b82f6) with slate grays
- **Generous Spacing** - Ample padding and margins for a spacious feel
- **Subtle Shadows** - Layered shadows for depth without distraction

### Design System
- **CSS Variables** - Centralized color and spacing tokens
- **Responsive Breakpoints** - Mobile-first responsive design
- **Focus States** - Blue glow effect on input focus for accessibility
- **Hover Effects** - Smooth transitions on interactive elements

### Interactive Elements
- **Swap Button** - Smooth 180° rotation animation on hover
- **Input Fields** - Enhanced borders with focus glow effect
- **Custom Dropdowns** - Styled select elements with custom arrows
- **Result Display** - Gradient background with prominent typography
- **Loading States** - Clean loading indicators
- **Error Messages** - Clear, user-friendly error displays

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

## 📁 Project Structure

```
CurrencyWebApp/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── kotlin/com/currency/
│   │   │   │   ├── controller/      # REST API controllers
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── model/           # Data models
│   │   │   │   └── config/          # Configuration classes
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # Unit and integration tests
│   ├── build.gradle.kts
│   └── gradlew
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── Header.tsx
│   │   │   ├── CurrencyInput.tsx
│   │   │   ├── CurrencySelect.tsx
│   │   │   ├── SwapButton.tsx
│   │   │   └── ConversionResult.tsx
│   │   ├── services/                # API and cache services
│   │   ├── App.tsx                  # Main application
│   │   ├── App.css                  # Application styles
│   │   └── index.css                # Global styles
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🧪 Testing

### Backend Tests
Run backend tests with:
```bash
cd backend
./gradlew test
```

The backend includes:
- Unit tests for service layer
- Integration tests for controllers
- Mock tests using MockK

### Frontend Tests
Run frontend tests with:
```bash
cd frontend
npm test
```

## 📝 Notes

- **Caching**: Currency rates are cached for 1 hour to minimize API calls and improve performance
- **Security**: The API key is securely stored in the backend service only
- **Privacy**: The frontend never directly accesses the FreeCurrencyAPI
- **Architecture**: All currency conversions go through the backend proxy
- **CORS**: Backend is configured to accept requests from `http://localhost:5173`
- **Type Safety**: Full TypeScript implementation ensures type safety across the frontend
- **Component Architecture**: Modular React components for maintainability

## 🚀 Production Build

### Backend
Build and run the backend in production:
```bash
cd backend
./gradlew clean build
java -jar build/libs/currency-backend-0.0.1-SNAPSHOT.jar
```

### Frontend
Build and serve the frontend for production:
```bash
cd frontend
npm run build
npm run preview
```

The production build will be created in `frontend/dist/` and can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is created for demonstration purposes.

---

**Built with ❤️ using Kotlin, Spring Boot, React, and TypeScript**

**Enjoy converting currencies with a professional touch! 💱✨**

