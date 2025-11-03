export default function LayoutContainer({ children, className = "" }) {
  return (
    <div className={`w-full h-full ${className}`}>
      {children}
    </div>
  );
}