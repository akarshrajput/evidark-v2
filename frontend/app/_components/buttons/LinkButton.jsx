import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const LinkButton = ({ children, href = "#" }) => {
  return (
    <Link
      href={href}
      className="bg-neutral-300  rounded-xs p-1.5 px-3 cursor-pointer font-medium"
    >
      {children}
    </Link>
  );
};

export default LinkButton;
