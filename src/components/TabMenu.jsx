// TabMenu.jsx
const tabs = [
  '総合',
  'バカな瞬間',
  'くだらない日常',
  'それな、わかる',
  'ネットの住民たち',
  'この萌え豚どもめ',
  '創作バカたち',
  '今日の飯ログ',
  'これ買いました。',
  '雑談なんでも'
];

export default function TabMenu({ active, onChange }) {
  return (
    <nav className="w-full bg-white sticky top-0 z-30 border-b border-gray-200 backdrop-blur-md">
      <div className="mx-auto max-w-iphone14pro px-3 sm:px-4">
        <ul className="flex gap-4 sm:gap-6 overflow-x-auto py-3 no-scrollbar">
          {tabs.map((t) => {
            const isActive = active === t;
            return (
              <li key={t}>
                <button
                  className={`relative whitespace-nowrap text-sm sm:text-base transition-all ${
                    isActive
                      ? 'text-brand font-semibold after:content-[""] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:rounded-full after:bg-brand'
                      : 'text-gray-600 hover:text-brand/80'
                  } focus:outline-none`}
                  onClick={() => onChange(t)}
                >
                  {t}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}