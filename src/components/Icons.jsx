// src/components/Icons.jsx

export const IconLike = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#6C7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
     width="18" height="18">
      <path d="M14 9V5a2 2 0 0 0-2-2L8 9v11h9a2 2 0 0 0 2-2v-7h-5z" />
      <path d="M2 9h4v11H2z" />
    </svg>
  );
  
  export const IconLaugh = () => (
    <svg viewBox="0 0 80 80" width="20" height="20">
      {/* 背景の丸 */}
      <circle cx="40" cy="40" r="36" fill="#6C7280" />
      {/* “笑”の文字（中央寄せ） */}
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="45"
        fontWeight="900"
        fontFamily="sans-serif"
        fill="#fff"
      >
        笑
      </text>
    </svg>
  );
  
  export const IconComment = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#6C7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
     width="18" height="18">
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    </svg>
  );
  
  export const IconShare = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#6C7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
     width="18" height="18">
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );  