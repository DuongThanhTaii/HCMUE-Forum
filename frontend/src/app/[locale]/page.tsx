import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export default function Home() {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header with toggles */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-foreground text-4xl font-bold">🎓 UniHub - Mạng xã hội sinh viên</h1>
            <p className="text-muted-foreground text-lg">
              Test màu sắc custom: Cerulean Blue #124874 & Jasper Red #CF373D
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        {/* Color Palette */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Bảng màu UniHub</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Primary - Cerulean Blue */}
            <div className="space-y-2 rounded-lg border p-4">
              <div className="bg-primary h-24 rounded-lg" />
              <h3 className="font-semibold">Primary (Cerulean Blue)</h3>
              <p className="text-muted-foreground text-sm">#124874</p>
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg px-4 py-2 transition-colors">
                Primary Button
              </button>
            </div>

            {/* Accent - Jasper Red */}
            <div className="space-y-2 rounded-lg border p-4">
              <div className="bg-accent h-24 rounded-lg" />
              <h3 className="font-semibold">Accent (Jasper Red)</h3>
              <p className="text-muted-foreground text-sm">#CF373D</p>
              <button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full rounded-lg px-4 py-2 transition-colors">
                Accent Button
              </button>
            </div>

            {/* Secondary */}
            <div className="space-y-2 rounded-lg border p-4">
              <div className="bg-secondary h-24 rounded-lg" />
              <h3 className="font-semibold">Secondary</h3>
              <p className="text-muted-foreground text-sm">Neutral gray</p>
              <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 w-full rounded-lg px-4 py-2 transition-colors">
                Secondary Button
              </button>
            </div>
          </div>
        </section>

        {/* Sample Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Sample Components</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Card 1 */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="text-card-foreground mb-2 text-xl font-semibold">Diễn đàn</h3>
              <p className="text-muted-foreground mb-4">
                Tham gia thảo luận với cộng đồng sinh viên
              </p>
              <div className="flex gap-2">
                <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm">
                  Xem bài viết
                </button>
                <button className="rounded-lg border px-4 py-2 text-sm">Tạo bài mới</button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="text-card-foreground mb-2 text-xl font-semibold">Việc làm</h3>
              <p className="text-muted-foreground mb-4">Tìm kiếm cơ hội việc làm phù hợp</p>
              <div className="flex gap-2">
                <button className="bg-accent text-accent-foreground rounded-lg px-4 py-2 text-sm">
                  Tìm việc
                </button>
                <button className="rounded-lg border px-4 py-2 text-sm">Việc đã lưu</button>
              </div>
            </div>
          </div>
        </section>

        {/* Link to components showcase */}
        <section className="bg-primary/10 rounded-lg border border-primary/20 p-6">
          <h3 className="text-primary mb-2 text-lg font-semibold">
            📦 Component Library
          </h3>
          <p className="text-muted-foreground mb-4">
            Check out our comprehensive component showcase with all Shadcn UI components
          </p>
          <Link 
            href="/components" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex rounded-lg px-6 py-3 transition-colors"
          >
            View Component Library →
          </Link>
        </section>

        {/* Status */}
        <section className="bg-primary/5 rounded-lg border p-6">
          <h3 className="text-primary mb-2 text-lg font-semibold">
            ✅ TASK-101 & TASK-102 - HOÀN THÀNH
          </h3>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>✓ Next.js 15 với App Router</li>
            <li>✓ TypeScript strict mode</li>
            <li>✓ Tailwind CSS v4</li>
            <li>✓ Custom colors: Cerulean #124874 & Jasper #CF373D</li>
            <li>✓ Shadcn UI components (8 components)</li>
            <li>✓ Dark mode with ThemeProvider</li>
            <li>✓ Dependencies: TanStack Query, Zustand, Axios, SignalR</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
