import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-[#4338ca]">CETify</span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-gray-500">
          <Link href="/about" className="hover:text-[#4338ca] transition-colors">About Us</Link>
          <Link href="/faq" className="hover:text-[#4338ca] transition-colors">FAQ</Link>
        </nav>

        <p className="text-sm text-gray-400">
          © 2026 CETify. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
