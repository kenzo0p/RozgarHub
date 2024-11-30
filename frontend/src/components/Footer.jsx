import React from "react";
import { Link } from "react-router-dom";
import {Link as LinkScroll} from "react-scroll"

function Footer()  {
  return (
    <footer className="bg-gray-100 text-gray-600 border border-t">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Footer Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {/* Column 1 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <LinkScroll to="about" className="hover:text-gray-900 cursor-pointer">
                  About Us
                </LinkScroll>
              </li>
              <li>
                <Link to="/careers" className="hover:text-gray-900">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-gray-900">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/help-center" className="hover:text-gray-900">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-gray-900">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Discover</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/jobs" className="hover:text-gray-900">
                  Jobs
                </Link>
              </li>
              <li>
                <Link to="/workers" className="hover:text-gray-900">
                  Skilled Workers
                </Link>
              </li>
              <li>
                <Link to="/employers" className="hover:text-gray-900">
                  Employers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy-policy" className="hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Follow Us</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://www.twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-8"></div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {new Date().getFullYear()} RozgarHub. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <Link to="/privacy-policy" className="mr-4 hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-gray-900">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
