import { Link } from 'react-router-dom';
import React from 'react';


const Footer = () => {
    return (
    <footer className="bg-gray-800 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Tutorly</h3>
              <p className="text-sm">Connecting tutors and students for personalized learning experiences since 2024.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Find a Tutor</a></li>
                <li><a href="#" className="hover:text-white">Become a Tutor</a></li>
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Tutorials</a></li>
                <li><a href="#" className="hover:text-white">Study Guides</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm">
                <li>support@tutorly.com</li>
                <li>1-800-TUTORLY</li>
                <li>
                  <div className="flex space-x-3 mt-3">
                    {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                      <a key={social} href="#" className="hover:text-white">
                        {social.charAt(0)}
                      </a>
                    ))}
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
            <p>&copy; 2025 Tutorly. All rights reserved.</p>
          </div>
        </div>
    </footer>
    );
};

export default Footer;
