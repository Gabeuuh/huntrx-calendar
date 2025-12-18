import "./button.css";


export default function SoftButton({
  children = "C'est parti !",
  onClick,
  disabled = false,
  className = "",
  type = "button",
}) {
  return (
    <button
      type={type}
      className={`softBtn ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="softBtn__label">{children}</span>
    </button>
  );
}
