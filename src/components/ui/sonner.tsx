import { Toaster as Sonner, ToasterProps } from "sonner";

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#13151B]/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:px-4 group-[.toaster]:py-3.5",
          description: "group-[.toast]:text-slate-400 text-xs",
          actionButton:
            "group-[.toast]:bg-purple-600 group-[.toast]:text-white group-[.toast]:rounded-xl text-xs font-medium",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-slate-300 group-[.toast]:rounded-xl text-xs",
          closeButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white/70 hover:group-[.toast]:text-white group-[.toast]:border-white/10",
        },
      }}
      {...props}
    />
  );
};

export default Toaster;
