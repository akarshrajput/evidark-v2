import { Creepster } from "next/font/google";
import Link from "next/link";
import React from "react";
import { Skull, Eye } from "lucide-react";

const creepster = Creepster({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-creepster",
});

const Logo = () => {
  return (
    <Link href="/" className="group">
      <div className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
        <div className="relative">
          <Skull className="w-8 h-8 text-primary group-hover:text-destructive transition-colors duration-300" />
          <Eye className="w-3 h-3 text-foreground absolute top-2 left-2.5 group-hover:text-primary transition-colors duration-300" />
        </div>
        <div
          className={`${creepster.className} text-2xl tracking-wider text-primary`}
          style={{ textShadow: "0 0 20px rgba(220, 38, 38, 0.3)" }}
        >
          EviDark
        </div>
      </div>
    </Link>
  );
};

export default Logo;
