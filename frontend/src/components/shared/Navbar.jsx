import React from "react";
// import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="bg-white">
      <div>
        <h1 className="text-2xl font-bold text-blue-600">
          ROZGAR<span className="text-blue-700">HUB</span>
        </h1>
      </div>
      <div>
        <ul>
          <li>Home</li>
          <li>Jobs</li>
          <li>Browse</li>
            {/* <li><Link>Home</Link></li>
            <li><Link>Jobs</Link></li>
            <li><Link>Browse</Link></li> */}
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
