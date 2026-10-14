interface LogoProps {
  size?: number;
}

// Marca: um cruzamento de saúde (+) formado por dois blocos, com um pulso de agenda
// que sai do centro. Usa os tokens de cor do tema para funcionar no claro e no escuro.
export default function Logo({ size = 36 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="ClinicFlow"
      className="logo"
    >
      <defs>
        <linearGradient id="cf-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#cf-grad)" />
      <path
        d="M20 11h8v9h9v8h-9v9h-8v-9h-9v-8h9z"
        fill="#ffffff"
        opacity="0.96"
      />
      <path
        d="M9 36 L16 36 L19 31 L23 40 L27 33 L30 36 L39 36"
        fill="none"
        stroke="#34d399"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="logo-pulso"
      />
    </svg>
  );
}
