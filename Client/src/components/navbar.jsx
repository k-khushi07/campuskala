import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <img src="/logo.png" alt="Campus Kala Logo" className="logo-img" />
        <span>Campus Kala</span>
      </div>

      {/* Search Bar */}
      <div className="navbar-search">
        <input type="text" placeholder="Search..." />
        <button>🔍</button>
      </div>

      {/* Nav Links */}
      <ul className="navbar-links">
        <li><NavLink to="/signup">Sign Up</NavLink></li>
        <li><NavLink to="/services">Services</NavLink></li>
        <li><NavLink to="/products">Products</NavLink></li>
        <li><NavLink to="/business">Business</NavLink></li>
        <li><NavLink to="/queries">Queries</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar;
