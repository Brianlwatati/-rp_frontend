export function AccessBadge() {
  return (
    <div className="relative w-full max-w-sm animate-badge-rise">
      <svg
        viewBox="0 0 360 220"
        className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
        role="img"
        aria-label="Sample access badge issued by IAS"
      >
        <defs>
          <linearGradient id="badgeFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#16202B" />
            <stop offset="100%" stopColor="#0F161F" />
          </linearGradient>
        </defs>

        {/* card body */}
        <rect x="0.5" y="0.5" width="359" height="219" rx="18" fill="url(#badgeFace)" stroke="#2A3743" />

        {/* perforation strip */}
        <line x1="0" y1="46" x2="360" y2="46" stroke="#2A3743" strokeWidth="1.5" strokeDasharray="3 5" />
        <circle cx="0" cy="46" r="7" fill="#0A0E14" />
        <circle cx="360" cy="46" r="7" fill="#0A0E14" />

        {/* header */}
        <text x="24" y="30" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" fill="#7C8B99">
          ISSUED CREDENTIAL
        </text>
        <circle cx="332" cy="26" r="5" className="animate-punch" fill="#4ADE9C" />

        {/* identity block */}
        <rect x="24" y="66" width="54" height="54" rx="10" fill="#1C2632" stroke="#2A3743" />
        <circle cx="51" cy="86" r="10" fill="#3FD6E0" fillOpacity="0.25" stroke="#3FD6E0" />
        <path d="M39 108c3-8 8-11 12-11s9 3 12 11" stroke="#3FD6E0" strokeWidth="1.6" fill="none" strokeLinecap="round" />

        <text x="92" y="82" fontFamily="var(--font-display)" fontSize="16" fontWeight="600" fill="#E9EEF3">
          B. Otieno
        </text>
        <text x="92" y="100" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5" fill="#7C8B99">
          ROLE · OPERATOR
        </text>
        <text x="92" y="114" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5" fill="#7C8B99">
          TENANT · ACME-ERP
        </text>

        {/* scope chips */}
        <rect x="24" y="134" width="72" height="20" rx="10" fill="#1C2632" stroke="#2A3743" />
        <text x="34" y="147" fontFamily="var(--font-mono)" fontSize="9" fill="#B7C2CC">
          inventory:*
        </text>
        <rect x="104" y="134" width="64" height="20" rx="10" fill="#1C2632" stroke="#2A3743" />
        <text x="114" y="147" fontFamily="var(--font-mono)" fontSize="9" fill="#B7C2CC">
          orders:rw
        </text>
        <rect x="176" y="134" width="60" height="20" rx="10" fill="#1C2632" stroke="#2A3743" />
        <text x="186" y="147" fontFamily="var(--font-mono)" fontSize="9" fill="#B7C2CC">
          hr:read
        </text>

        {/* footer / barcode-esque id */}
        <text x="24" y="182" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1" fill="#7C8B99">
          SESSION 4F2C-9A11-77E0
        </text>
        <g fill="#2A3743">
          {Array.from({ length: 28 }).map((_, i) => (
            <rect key={i} x={24 + i * 11} y={192} width={i % 3 === 0 ? 2 : 1} height="16" />
          ))}
        </g>
      </svg>
    </div>
  );
}
