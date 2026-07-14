import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const variants = {
    primary: "bg-primary text-white hover:bg-teal-800",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700"
  };
  return <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${variants[variant]} ${className}`} {...props} />;
}
