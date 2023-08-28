import './App.css';
import Home from './pages/Home';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/home" element={<Home/>} />
        <Route exact path="/*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;
