import { ReactNode } from "react";

export default function SectionWrapper({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <section className={`w-full flex justify-center py-20 px-6 md:px-12 ${className}`}>
      <div className="w-full max-w-7xl flex flex-col items-center">
        {children}
      </div>
    </section>
  );
}
