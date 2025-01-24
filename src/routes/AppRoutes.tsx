import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../App';
import History from '../pages/History';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;