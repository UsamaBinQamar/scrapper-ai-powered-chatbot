import { Bot } from "lucide-react";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div>
      {" "}
      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-8 display flex justify-center items-center">
        <div className="container flex flex-col items-center justify-between space-y-4 px-4 md:flex-row md:space-y-0">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-cyan-400" />
            <span className="font-bold">ChatFlow</span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ChatFlow. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              className="text-sm text-gray-400 hover:text-cyan-400"
              href="#"
            >
              Privacy
            </Link>
            <Link
              className="text-sm text-gray-400 hover:text-cyan-400"
              href="#"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
