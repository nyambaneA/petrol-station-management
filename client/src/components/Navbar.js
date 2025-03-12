import { Link } from "react-router-dom";

function Navbar({ token, onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
      <div className="container-fluid">
        {/* Logo and Brand */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src="/ftlogo.png"
            alt="FuelTrack Logo"
            className="me-2"
            style={{ height: "50px" }}
          />
          <div>
            <span className="fw-bold text-white fs-4">FuelTrack</span>
            <p className="mb-0 text-warning" style={{ fontSize: "0.8rem" }}>
              Track fuel levels, sales, and expenses effortlessly.
            </p>
          </div>
        </Link>

        {/* Navbar Toggler for Mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto text-center">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/dashboard">
                Dashboard
              </Link>
            </li>
            {!token ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/register">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                {/* <button
                  className="btn btn-warning text-dark mt-2 mt-lg-0"
                  onClick={onLogout}
                >
                  Logout
                </button> */}
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
